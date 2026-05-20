const categoryProducts = [
    { name: 'Single Room', price: 'Ksh 3,000 /month', emoji: '🏠', category: 'Single Room', description: 'Cozy single room available for rent.', images: ['sokohub.jpg','sokohub1.jpg','sokohub.jpg','sokohub1.jpg'] },
    { name: 'Bedsitter', price: 'Ksh 5,000 /month', emoji: '🛏️', category: 'Bedsitter' },
    { name: '1 Bedroom', price: 'Ksh 8,000 /month', emoji: '🏢', category: '1 Bedroom' },
    { name: 'Hostel Bed', price: 'Ksh 2,500 /month', emoji: '🛏️', category: 'Hostels' }
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
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${prod.name.replace(/'/g, "\\'")}, '${prod.price}', '${prod.emoji}')">Book Now</button>
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

function toggleNotifications() {
    alert('🔔 You have 3 new notifications');
}

function shopNow() {
    document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});
