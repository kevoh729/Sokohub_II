const categoryProducts = [
    { name: 'Bed', price: 'Ksh 15,000', emoji: '🛏️', category: 'Beds', description: 'Sturdy bed frame', images: ['sokohub.jpg','sokohub1.jpg','sokohub.jpg','sokohub1.jpg'] },
    { name: 'Mattress', price: 'Ksh 8,000', emoji: '🛌', category: 'Mattresses' },
    { name: 'Chair', price: 'Ksh 2,500', emoji: '🪑', category: 'Chairs' },
    { name: 'Desk', price: 'Ksh 5,000', emoji: '🖥️', category: 'Desks' },
    { name: 'Shelf', price: 'Ksh 3,500', emoji: '📚', category: 'Shelves' },
    { name: 'Curtains', price: 'Ksh 1,500', emoji: '🪟', category: 'Curtains' }
];

// Render products
function renderProducts(category = 'All') {
    const grid = document.getElementById('productsGrid');
    const filteredProducts = category === 'All' ? categoryProducts : categoryProducts.filter(p => p.category === category);
    
    grid.innerHTML = filteredProducts.map((prod) => `
        <div class="product-card" onclick='openProduct(${JSON.stringify(prod)})'>
            <div class="product-image">${prod.emoji}</div>
            <div class="product-info">
                <div class="product-name">${prod.name}</div>
                <div class="product-price">${prod.price}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${prod.name.replace(/'/g, "\\'")}, '${prod.price}', '${prod.emoji}')">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Filter categories
function filterCategory(element) {
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');
    renderProducts(element.textContent);
}

// Bottom nav
function switchNav(element, page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
    console.log('Navigating to: ' + page);
}

// Actions
function addToCart(productName, price = 'Ksh 0', emoji = '📦') {
    let cart = JSON.parse(localStorage.getItem('sokohubCart')) || [];
    
    // Check if item already exists
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({ name: productName, price: price, emoji: emoji, quantity: 1 });
    }
    
    localStorage.setItem('sokohubCart', JSON.stringify(cart));
    alert('✅ ' + productName + ' added to cart!');
    window.location.href = 'cart.html';
}

function goToCart() {
    window.location.href = 'cart.html';
}

function shopNow() {
    document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});
