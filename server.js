require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
// CORS configuration - allow Netlify and Railway domains
app.use(cors({
    origin: [
        'https://sokohubii-production.up.railway.app',
        'https://s0k0hub.netlify.app',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected');
    release();
  }
});

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const emailVerified = payload.email_verified;
    
    if (!emailVerified) {
      return res.status(401).json({ error: 'Email not verified by Google' });
    }
    
    const result = await pool.query(
      'SELECT id, name, whatsapp FROM sellers WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );
    
    if (result.rows.length > 0) {
      const seller = result.rows[0];
      const sessionToken = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO sessions (seller_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
        [seller.id, sessionToken]
      );
      await pool.query('UPDATE sellers SET last_login = NOW() WHERE id = $1', [seller.id]);
      res.json({ success: true, token: sessionToken, sellerId: seller.id, name: seller.name, email });
    } else {
      const tempToken = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO temp_google_users (token, google_id, email, name, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL \'1 hour\')',
        [tempToken, googleId, email, name]
      );
      res.json({ needsSignup: true, tempToken, email, name });
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google token: ' + err.message });
  }
});

app.post('/api/auth/complete-signup', async (req, res) => {
  const { tempToken, name, whatsapp } = req.body;
  try {
    const tempResult = await pool.query(
      'SELECT google_id, email FROM temp_google_users WHERE token = $1 AND expires_at > NOW()',
      [tempToken]
    );
    if (tempResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const { google_id, email } = tempResult.rows[0];
    const sellerResult = await pool.query(
      'INSERT INTO sellers (google_id, email, name, whatsapp, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [google_id, email, name, whatsapp]
    );
    const sellerId = sellerResult.rows[0].id;
    await pool.query('DELETE FROM temp_google_users WHERE token = $1', [tempToken]);
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await pool.query(
      'INSERT INTO sessions (seller_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
      [sellerId, sessionToken]
    );
    res.json({ success: true, token: sessionToken, sellerId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const result = await pool.query(
      'SELECT seller_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.sellerId = result.rows[0].seller_id;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Token verification failed' });
  }
}

app.get('/api/me', verifyToken, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, name, whatsapp, created_at FROM sellers WHERE id = $1',
    [req.sellerId]
  );
  res.json(result.rows[0]);
});

app.post('/api/logout', verifyToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  res.json({ success: true });
});

app.post('/api/products', verifyToken, async (req, res) => {
  let { name, price, category, description, image_url, image_urls } = req.body;
    // Sanitize inputs
    name = sanitizeInput(name);
    category = sanitizeInput(category);
    description = sanitizeInput(description);
    price = Number(price) || 0;
  try {
    // Handle multiple images - store as JSON string
    let finalImageUrl = null;
    if (image_urls) {
      try {
        const urlsArray = JSON.parse(image_urls);
        finalImageUrl = JSON.stringify(urlsArray); // Store all URLs as JSON
      } catch (e) {
        finalImageUrl = image_url;
      }
    } else {
      finalImageUrl = image_url;
    }
    const result = await pool.query(
      'INSERT INTO products (seller_id, name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.sellerId, name, price, category, description, finalImageUrl]
    );
    res.json({ success: true, productId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT p.*, s.name as seller_name, s.whatsapp FROM products p JOIN sellers s ON p.seller_id = s.id WHERE p.is_active = true';
    let params = [];
    if (category && category !== 'all') {
      query += ' AND p.category = $1';
      params.push(category);
    }
    query += ' ORDER BY p.created_at DESC LIMIT 100';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.get('/api/my-products', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2',
      [req.params.id, req.sellerId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'campusmarket/products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    const result = await uploadPromise;
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Image upload failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/login', '/login.html', '/seller-login'], (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get(['/dashboard', '/server_dashboard.html', '/sellersprofile'], (req, res) => {
  res.sendFile(path.join(__dirname, 'j.html'));
});

app.get('/complete-signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'complete-signup.html'));
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});

// Upload multiple images
app.post('/api/upload-multiple', upload.array('images', 5), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }
    try {
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'campusmarket/products' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });
        const imageUrls = await Promise.all(uploadPromises);
        res.json({ imageUrls });
    } catch (error) {
        res.status(500).json({ error: 'Image upload failed' });
    }
});

// ============ EMAIL/PASSWORD AUTH ============

// Hash password using crypto


// Input sanitization
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>"'\\]/g, '');
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (basic)
function isValidPhone(phone) {
    if (!phone) return true; // Optional
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

function sanitizeAll(obj, fields) {
    const sanitized = {};
    for (const key of fields) {
        if (obj[key] !== undefined) {
            sanitized[key] = sanitizeInput(obj[key]);
        }
    }
    return sanitized;
}

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

function hashPassword(password) {
    return crypto.createHash('sha256', process.env.SESSION_SECRET || 'default-secret').update(password).digest('hex');
}

// Register with email/password
app.post('/api/auth/register', async (req, res) => {
    let { email, password, name, whatsapp } = req.body;
    email = sanitizeInput(email);
    name = sanitizeInput(name);
    if (whatsapp) whatsapp = sanitizeInput(whatsapp);
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    if (!isValidPhone(whatsapp)) {
        return res.status(400).json({ error: 'Please enter a valid WhatsApp number (e.g., +254712345678)' });
    }
    
    try {
        // Check if email exists
        const existing = await pool.query('SELECT id FROM sellers WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = hashPassword(password);
        const result = await pool.query(
            'INSERT INTO sellers (email, password, name, whatsapp, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, whatsapp',
            [email, hashedPassword, name, whatsapp || null]
        );
        
        const seller = result.rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        
        res.json({
            success: true,
            token,
            sellerId: seller.id,
            email: seller.email,
            name: seller.name,
            whatsapp: seller.whatsapp
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login with email/password
app.post('/api/auth/login', async (req, res) => {
    let { email, password } = req.body;
    email = sanitizeInput(email);
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const hashedPassword = hashPassword(password);
        const result = await pool.query(
            'SELECT id, email, name, whatsapp, password FROM sellers WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const seller = result.rows[0];
        
        if (seller.password !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        
        res.json({
            success: true,
            token,
            sellerId: seller.id,
            email: seller.email,
            name: seller.name,
            whatsapp: seller.whatsapp
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Update seller profile
app.put('/api/auth/profile', verifyToken, async (req, res) => {
    const { name, whatsapp } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE sellers SET name = COALESCE($1, name), whatsapp = COALESCE($2, whatsapp) WHERE id = $3 RETURNING id, email, name, whatsapp',
            [name, whatsapp, req.sellerId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        
        res.json({ success: true, seller: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Change password
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    try {
        const seller = await pool.query('SELECT password FROM sellers WHERE id = $1', [req.sellerId]);
        
        if (seller.rows[0].password !== hashPassword(currentPassword)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        await pool.query('UPDATE sellers SET password = $1 WHERE id = $2', [hashPassword(newPassword), req.sellerId]);
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Password change failed' });
    }
});

// Delete seller account (cascade via foreign keys)
app.delete('/api/auth/account', verifyToken, async (req, res) => {
    const sellerId = req.sellerId;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM products WHERE seller_id = $1', [sellerId]);
        await client.query('DELETE FROM sessions WHERE seller_id = $1', [sellerId]);
        await client.query('DELETE FROM sellers WHERE id = $1', [sellerId]);
        await client.query('COMMIT');
        res.json({ success: true, message: 'Account deleted' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to delete account: ' + err.message });
    } finally {
        client.release();
    }
});

// Add password column if it doesn't exist (run once)
pool.query(`ALTER TABLE sellers ADD COLUMN IF NOT EXISTS password VARCHAR(255)`)
  .then(() => console.log('Password column ready'))
  .catch(() => console.log('Password column may already exist'));

// ============ PRODUCT CRUD ============

// Get seller's products
app.get('/api/my-products', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Update product
app.put('/api/products/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, image_url } = req.body;
  
  try {
    // Check ownership
    const check = await pool.query('SELECT seller_id FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (check.rows[0].seller_id !== req.sellerId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), category = COALESCE($3, category), description = COALESCE($4, description), image_url = COALESCE($5, image_url) WHERE id = $6 RETURNING *',
      [name, price, category, description, image_url, id]
    );
    
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check ownership
    const check = await pool.query('SELECT seller_id FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (check.rows[0].seller_id !== req.sellerId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Toggle product active status
app.patch('/api/products/:id/toggle', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const check = await pool.query('SELECT seller_id, is_active FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (check.rows[0].seller_id !== req.sellerId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const newStatus = !check.rows[0].is_active;
    await pool.query('UPDATE products SET is_active = $1 WHERE id = $2', [newStatus, id]);
    res.json({ success: true, is_active: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle product' });
  }
});

// ============ INTEREST TRACKING ============
// Track when someone clicks WhatsApp on a product
app.post('/api/track-interest', async (req, res) => {
    const { productId, sellerId, productName, buyerInfo } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO interests (product_id, seller_id, product_name, buyer_info, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [productId || null, sellerId || null, productName || '', buyerInfo || '', req.ip]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});



// ============ INTEREST TRACKING ============
app.post('/api/track-interest', async (req, res) => {
    const { productId, sellerId, productName, buyerInfo } = req.body;
    try {
        await pool.query(
            'INSERT INTO interests (product_id, seller_id, product_name, buyer_info, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [productId || null, sellerId || null, productName || '', buyerInfo || '', req.ip]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

app.get('/api/notifications', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM interests WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.sellerId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});

pool.query(`CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    seller_id INTEGER,
    product_name VARCHAR(255),
    buyer_info TEXT,
    ip_address VARCHAR(45),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
})`).catch(() => {});

// ============ INTEREST TRACKING ============
app.post('/api/track-interest', async (req, res) => {
    const { productId, sellerId, productName, buyerInfo } = req.body;
    try {
        await pool.query(
            'INSERT INTO interests (product_id, seller_id, product_name, buyer_info, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [productId || null, sellerId || null, productName || '', buyerInfo || '', req.ip]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

app.get('/api/notifications', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM interests WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.sellerId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});

pool.query(`CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    seller_id INTEGER,
    product_name VARCHAR(255),
    buyer_info TEXT,
    ip_address VARCHAR(45),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
})`).catch(() => {});

// ============ ADMIN NOTIFICATIONS ============
// Site owner gets notified of ALL WhatsApp clicks

app.post('/api/track-interest', async (req, res) => {
    const { productName, productId, sellerId } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO admin_notifications (product_name, product_id, seller_id, created_at) VALUES ($1, $2, $3, NOW())',
            [productName || '', productId || null, sellerId || null]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

// Get ALL notifications (admin only) - requires admin email from env
app.get('/api/admin/notifications', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET || 'sokohub-admin-2024';
    
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    try {
        const result = await pool.query(
            'SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});

// Create admin_notifications table
pool.query(`CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    product_id INTEGER,
    seller_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
})`).catch(() => {});

// ============ ADMIN NOTIFICATIONS ============
app.post('/api/track-interest', async (req, res) => {
    const { productName, productId, sellerId } = req.body;
    try {
        await pool.query(
            'INSERT INTO admin_notifications (product_name, product_id, seller_id, created_at) VALUES ($1, $2, $3, NOW())',
            [productName || '', productId || null, sellerId || null]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

app.get('/api/admin/notifications', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET || 'sokohub-admin-2024';
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});

pool.query(`CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    product_id INTEGER,
    seller_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
})`).catch(() => {});

// ============ ANALYTICS TRACKING ============
app.post('/api/track', async (req, res) => {
    const { type, data } = req.body;
    try {
        await pool.query(
            'INSERT INTO analytics (event_type, event_data, ip_address, created_at) VALUES ($1, $2, $3, NOW())',
            [type || 'unknown', JSON.stringify(data || {}), req.ip]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

app.get('/api/admin/analytics', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET || 'sokohub-admin-2024';
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const result = await pool.query(
            'SELECT event_type, COUNT(*) as count FROM analytics GROUP BY event_type ORDER BY count DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

app.get('/api/admin/all-analytics', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET || 'sokohub-admin-2024';
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM analytics ORDER BY created_at DESC LIMIT 200'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

pool.query(`CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    event_data TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
})`).catch(() => {});

// ============ ANALYTICS TRACKING ============
app.post('/api/track', async (req, res) => {
    const { type, data } = req.body;
    try {
        await pool.query(
            'INSERT INTO analytics (event_type, event_data, ip_address, created_at) VALUES ($1, $2, $3, NOW())',
            [type || 'unknown', JSON.stringify(data || {}), req.ip]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

app.get('/api/admin/analytics', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET || 'sokohub-admin-2024';
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const result = await pool.query(
            'SELECT event_type, COUNT(*) as count FROM analytics GROUP BY event_type ORDER BY count DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

app.get('/api/admin/all-analytics', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET || 'sokohub-admin-2024';
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM analytics ORDER BY created_at DESC LIMIT 200'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

pool.query(`CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    event_data TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
})`).catch(() => {});
