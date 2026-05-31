let products = [];

// API Base URL - Change this to your Railway URL when hosting
const API_BASE = 'https://sokohubii-production.up.railway.app'; 

// Helper for API calls
async function apiCall(endpoint, options = {}) {
    const url = API_BASE + endpoint;
    return fetch(url, options);
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function formatSellerProduct(product) {
    const price = Number(product.price || 0);
    let images = ['sokohub.jpg'];
    if (product.image_url) {
        try {
            images = JSON.parse(product.image_url);
            if (!Array.isArray(images)) images = [product.image_url];
        } catch {
            images = [product.image_url];
        }
    }
    return {
        name: product.name,
        price: `Ksh ${price.toLocaleString('en-KE')}`,
        emoji: '📦',
        description: product.description || '',
        images: images,
        whatsapp: product.whatsapp || ''
    };
}

async function loadSellerProducts() {
    try {
        const response = await apiCall('/api/products');
        if (response.ok) {
            const data = await response.json();
            products = (data || []).map(formatSellerProduct);
            renderProducts();
        } else if (response.status === 401) {
            showToast('Please sign in to see products');
        } else {
            const grid = document.getElementById('productsGrid');
            if (grid) grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Unable to load products. Please refresh the page.</p>';
        }
    } catch (error) {
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">No internet connection. Please check your network.</p>';
    }
}

function openProduct(prod) {
    const params = new URLSearchParams();
    params.set('name', prod.name);
    params.set('price', prod.price);
    params.set('desc', prod.description || '');
    params.set('images', (prod.images || []).join(','));
    if (prod.whatsapp) params.set('whatsapp', prod.whatsapp);
    window.location.href = `product.html?${params.toString()}`;
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">No products available. Check back later!</p>';
        return;
    }
    grid.innerHTML = products.map((prod, index) => `
        <div class="product-card" data-product-index="${index}">
            <div class="product-image">
                ${prod.images && prod.images[0] ? `<img src="${escapeHtml(prod.images[0])}" alt="${escapeHtml(prod.name)}" onerror="this.parentElement.innerHTML='${escapeHtml(prod.emoji || '📦')}'">` : escapeHtml(prod.emoji || '📦')}
            </div>
            <div class="product-info">
                <div class="product-name">${escapeHtml(prod.name)}</div>
                <div class="product-price">${escapeHtml(prod.price)}</div>
                <button class="add-to-cart-btn" data-cart-index="${index}">Add to Cart</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('click', () => {
            openProduct(products[Number(card.dataset.productIndex)]);
        });
    });

    grid.querySelectorAll('.add-to-cart-btn').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const product = products[Number(button.dataset.cartIndex)];
            addToCart(product.name, product.price, product.emoji || '📦', product);
        });
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#16803a;color:white;padding:14px 24px;border-radius:8px;font-weight:600;z-index:9999;animation:slideIn 0.3s ease,fadeOut 0.3s ease 2.7s forwards;box-shadow:0 4px 15px rgba(0,0,0,0.2)';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function addToCart(productName, price, emoji, product) {
    try {
        let cart = JSON.parse(localStorage.getItem('sokohubCart')) || [];
        if (!Array.isArray(cart)) cart = [];
        
        const existing = cart.find(item => item.name === productName);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            const itemData = {
                name: productName,
                price: price,
                emoji: emoji,
                images: product?.images || ['sokohub.jpg'],
                description: product?.description || '',
                whatsapp: product?.whatsapp || '',
                category: product?.category || '',
                quantity: 1
            };
            cart.push(itemData);
        }
        localStorage.setItem('sokohubCart', JSON.stringify(cart));
        showToast('Added to cart!');
        updateCartCount();
    } catch (e) {
        showToast('Failed to add to cart');
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('sokohubCart')) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count > 0 ? `(${count})` : '';
}

function goToCart() { window.location.href = 'cart.html'; }


// Search functionality
function handleSearch() {
    const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    cards.forEach((card) => {
        const prod = products[Number(card.dataset.productIndex)];
        if (!prod) return;
        
        const nameMatch = prod.name.toLowerCase().includes(query);
        const descMatch = (prod.description || '').toLowerCase().includes(query);
        const categoryMatch = (prod.category || '').toLowerCase().includes(query);
        
        card.style.display = (nameMatch || descMatch || categoryMatch) ? '' : 'none';
        if (nameMatch || descMatch || categoryMatch) visibleCount++;
    });
    
    // Show no results message
    let noResults = document.getElementById('noResults');
    if (visibleCount === 0 && query) {
        if (!noResults) {
            noResults = document.createElement('p');
            noResults.id = 'noResults';
            noResults.style.cssText = 'text-align:center;padding:40px;color:#888;';
            noResults.textContent = 'No products found for "' + query + '"';
            document.getElementById('productsGrid')?.appendChild(noResults);
        } else {
            noResults.textContent = 'No products found for "' + query + '"';
            noResults.style.display = '';
        }
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

// Search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
        // Live search
        searchInput.addEventListener('input', () => handleSearch());
    }
});

function shopNow() { document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth' }); }

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    loadSellerProducts();
});
