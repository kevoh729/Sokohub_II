const categoryProducts = [
    { name: 'Notebooks', price: 'from KES 150', emoji: '📓', category: 'Stationery', description: 'College-ruled notebooks', images: ['sokohub.jpg','sokohub1.jpg','sokohub.jpg','sokohub1.jpg'] },
    { name: 'Highlighters', price: 'from KES 80', emoji: '🖍️', category: 'Stationery' },
    { name: 'Erasers', price: 'from KES 30', emoji: '🧹', category: 'Stationery' },
    { name: 'Engineering Rulers', price: 'from KES 120', emoji: '📏', category: 'Stationery' },
    { name: 'Calculators', price: 'from KES 500', emoji: '🧮', category: 'Stationery' },
    { name: 'Sticky Notes', price: 'from KES 50', emoji: '📝', category: 'Stationery' },
    { name: 'Files & Folders', price: 'from KES 100', emoji: '📁', category: 'Stationery' },
    { name: 'Whiteboards', price: 'from KES 350', emoji: '🖐️', category: 'Stationery' },
    { name: 'Lab Coats', price: 'from KES 800', emoji: '🥼', category: 'Stationery' },
    { name: 'Books', price: 'from KES 200', emoji: '📚', category: 'Books' },
    { name: 'Stationery Sets', price: 'from KES 300', emoji: '✏️', category: 'Stationery' },
    { name: 'Writing Pens', price: 'from KES 50', emoji: '🖊️', category: 'Stationery' }
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
