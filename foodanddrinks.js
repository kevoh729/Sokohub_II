let products = [];
const API_BASE = '';

async function loadProducts() {
    try {
        const response = await fetch(API_BASE + '/api/products?category=Food+%26+Drinks');
        if (response.ok) {
            const data = await response.json();
            products = data.map(p => ({
                name: p.name,
                price: 'Ksh ' + Number(p.price || 0).toLocaleString(),
                emoji: '📦',
                description: p.description || '',
                images: (() => {
                    if (p.image_url) {
                        try { const imgs = JSON.parse(p.image_url); if (Array.isArray(imgs)) return imgs; }
                        catch { return [p.image_url]; }
                    }
                    return ['sokohub.jpg'];
                })(),
                whatsapp: p.whatsapp || '',
                category: p.category || 'Food & Drinks'
            }));
            renderProducts();
        }
    } catch (e) {
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Failed to load products</p>';
    }
}

function openProduct(prod) {
    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product_view', data: { productName: prod.name } })
    }).catch(() => {});
    
    const params = new URLSearchParams();
    params.set('name', prod.name);
    params.set('price', prod.price);
    params.set('desc', prod.description || '');
    params.set('images', (prod.images || []).join(','));
    params.set('category', prod.category || 'Food & Drinks');
    if (prod.whatsapp) params.set('whatsapp', prod.whatsapp);
    window.location.href = 'product.html?' + params.toString();
}

function addToCart(productName, price, emoji, product) {
    let cart = JSON.parse(localStorage.getItem('sokohubCart')) || [];
    const existing = cart.find(i => i.name === productName);
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
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('sokohubCart')) || [];
    const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count > 0 ? count : '';
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#16803a;color:white;padding:12px 20px;border-radius:8px;font-weight:600;z-index:9999';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">No Food & Drinks products available</p>';
        return;
    }
    grid.innerHTML = products.map((p, i) => `
        <div class="product-card" onclick="openProduct(products[${i}])">
            <div class="product-image">
                <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" onerror="this.parentElement.innerHTML='📦'">
            </div>
            <div class="product-info">
                <div class="product-name">${escapeHtml(p.name)}</div>
                <div class="product-price">${escapeHtml(p.price)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart('${escapeHtml(p.name)}','${escapeHtml(p.price)}','${escapeHtml(p.emoji)}',products[${i}])">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});
