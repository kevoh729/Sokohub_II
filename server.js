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

// ============= MIDDLEWARE =============
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Serve files from `public/` first (assets intended for public access)
app.use(express.static(path.join(__dirname, 'public')));

// Also serve static files from the repository root so pages that reference
// top-level assets (sokohub.css, sokohub.js, images, etc.) work as expected.
// This keeps the current file layout working without moving files.
app.use(express.static(path.join(__dirname)));

// ============= DATABASE CONNECTION (PostgreSQL - Neon) =============
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected');
    release();
  }
});

// ============= GOOGLE AUTH =============
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============= CLOUDINARY =============
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============= GOOGLE SIGN-IN ENDPOINT =============
app.post('/api/auth/google', async (req, res) => {
  console.log('📥 Google auth request received');
  const { token } = req.body;
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(400).json({ error: 'No token provided' });
  }
  
  try {
    // VERIFY WITH GOOGLE - THIS IS THE CRITICAL PART
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
    
    console.log(`✅ Google verified: ${email}`);
    
    // Check if seller exists
    const result = await pool.query(
      `SELECT id, name, whatsapp FROM sellers WHERE google_id = $1 OR email = $2`,
      [googleId, email]
    );
    
    if (result.rows.length > 0) {
      // Existing user
      const seller = result.rows[0];
      const sessionToken = crypto.randomBytes(32).toString('hex');
      
      await pool.query(
        `INSERT INTO sessions (seller_id, token, expires_at) 
         VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
        [seller.id, sessionToken]
      );
      
      await pool.query(
        `UPDATE sellers SET last_login = NOW() WHERE id = $1`,
        [seller.id]
      );
      
      console.log(`✅ Existing user logged in: ${email}`);
      res.json({ 
        success: true, 
        token: sessionToken, 
        sellerId: seller.id, 
        name: seller.name 
      });
    } else {
      // New user - store temporarily
      const tempToken = crypto.randomBytes(32).toString('hex');
      
      await pool.query(
        `INSERT INTO temp_google_users (token, google_id, email, name, expires_at) 
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 hour')`,
        [tempToken, googleId, email, name]
      );
      
      console.log(`✅ New user needs signup: ${email}`);
      res.json({ 
        needsSignup: true, 
        tempToken, 
        email, 
        name 
      });
    }
  } catch (err) {
    console.error('❌ Google verification failed:', err.message);
    res.status(401).json({ error: 'Invalid Google token: ' + err.message });
  }
});

// ============= COMPLETE SIGNUP (First time Google users) =============
app.post('/api/auth/complete-signup', async (req, res) => {
  console.log('📥 Complete signup request');
  const { tempToken, name, whatsapp } = req.body;
  
  try {
    const tempResult = await pool.query(
      `SELECT google_id, email FROM temp_google_users 
       WHERE token = $1 AND expires_at > NOW()`,
      [tempToken]
    );
    
    if (tempResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const { google_id, email } = tempResult.rows[0];
    
    const sellerResult = await pool.query(
      `INSERT INTO sellers (google_id, email, name, whatsapp, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id`,
      [google_id, email, name, whatsapp]
    );
    
    const sellerId = sellerResult.rows[0].id;
    
    await pool.query(`DELETE FROM temp_google_users WHERE token = $1`, [tempToken]);
    
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO sessions (seller_id, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [sellerId, sessionToken]
    );
    
    console.log(`✅ New user created: ${email}`);
    res.json({ success: true, token: sessionToken, sellerId });
  } catch (err) {
    console.error('❌ Complete signup error:', err.message);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ============= VERIFY TOKEN MIDDLEWARE =============
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const result = await pool.query(
      `SELECT seller_id FROM sessions 
       WHERE token = $1 AND expires_at > NOW()`,
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

// ============= GET CURRENT USER =============
app.get('/api/me', verifyToken, async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, name, whatsapp, created_at FROM sellers WHERE id = $1`,
    [req.sellerId]
  );
  res.json(result.rows[0]);
});

// ============= LOGOUT =============
app.post('/api/logout', verifyToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
  res.json({ success: true });
});

// ============= PRODUCT ENDPOINTS =============

// Add product
app.post('/api/products', verifyToken, async (req, res) => {
  const { name, price, category, description, image_url } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO products (seller_id, name, price, category, description, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [req.sellerId, name, price, category, description, image_url || null]
    );
    
    res.json({ success: true, productId: result.rows[0].id });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get all products (public)
app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  
  try {
    let query = `
      SELECT p.*, s.name as seller_name, s.whatsapp 
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.is_active = true
    `;
    let params = [];
    
    if (category && category !== 'all') {
      query += ` AND p.category = $1`;
      params.push(category);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT 100`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Get seller's products
app.get('/api/my-products', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC`,
      [req.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Delete product
app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM products WHERE id = $1 AND seller_id = $2`,
      [req.params.id, req.sellerId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============= IMAGE UPLOAD =============
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
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============= SERVE FRONTEND =============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/login', '/login.html', '/goin.html', '/seller-login'], (req, res) => {
  res.sendFile(path.join(__dirname, 'goin.html'));
});

app.get(['/dashboard', '/server_dashboard.html', '/sellersprofile'], (req, res) => {
  res.sendFile(path.join(__dirname, 'j.html'));
});

app.get('/complete-signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'complete-signup.html'));
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});