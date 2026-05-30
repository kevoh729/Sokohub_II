let categoryProducts = [];

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#16803a;color:white;padding:14px 24px;border-radius:8px;font-weight:600;z-index:9999;animation:slideIn 0.3s ease,fadeOut 0.3s ease 2.7s forwards;box-shadow:0 4px 15px rgba(0,0,0,0.2)';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function loadFashionProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const data = await response.json();
            categoryProducts = (data || []).map(p => ({
                name: p.name,
                price: 'Ksh ' + Number(p.price || 0).toLocaleString('en-KE'),
                emoji: '📦',
                category: p.category || 'Fashion',
                subcategory: p.category || 'Fashion'
            }));
        }
    } catch (error) {
        console.log('No products available');
    }
    renderProducts();
}

function renderProducts(category = 'All') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const filtered = category === 'All' ? categoryProducts : categoryProducts.filter(p => p.category === category || p.subcategory === category);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">No products available in this category.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map((prod, i) => `
        <div class="product-card" data-product-index="${i}">
            <div class="product-image">${prod.emoji}</div>
            <div class="product-info">
                <div class="product-name">${prod.name}</div>
                <div class="product-price">${prod.price}</div>
                <button class="add-to-cart-btn" data-cart-index="${i}">Add to Cart</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = categoryProducts[Number(btn.dataset.cartIndex)];
            addToCart(product.name, product.price, product.emoji);
        });
    });
}

function filterCategory(element) {
    document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
    element.classList.add('active');
    renderProducts(element.textContent);
}

function addToCart(productName, price, emoji) {
    let cart = JSON.parse(localStorage.getItem('sokohubCart')) || [];
    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ name: productName, price: price, emoji: emoji, quantity: 1 });
    }
    localStorage.setItem('sokohubCart', JSON.stringify(cart));
    showToast('Added to cart!');
}

function shopNow() {
    document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    loadFashionProducts();
});
