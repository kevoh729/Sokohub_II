const categoryProducts = [
    { name: 'Laptop', price: 'from KES 35,000', emoji: '💻', category: 'Laptops', description: 'High performance laptop.', images: ['sokohub.jpg','sokohub1.jpg','sokohub.jpg','sokohub1.jpg'] },
    { name: 'Used Laptop', price: 'from KES 15,000', emoji: '💻', category: 'Used Laptops', description: 'Affordable used laptop.', images: ['sokohub1.jpg','sokohub.jpg','sokohub1.jpg','sokohub.jpg'] },
    { name: 'Keyboard', price: 'from KES 1,500', emoji: '⌨️', category: 'Keyboards & Mice' },
    { name: 'Mouse', price: 'from KES 800', emoji: '🖱️', category: 'Keyboards & Mice' },
    { name: 'External HDD', price: 'from KES 4,500', emoji: '💾', category: 'External HDD & SSD' },
    { name: 'External SSD', price: 'from KES 6,000', emoji: '💾', category: 'External HDD & SSD' },
    { name: 'USB Flash Drive', price: 'from KES 500', emoji: '💽', category: 'USB Flash Drives' },
    { name: 'Smartphone', price: 'from KES 12,000', emoji: '📱', category: 'Mobile Devices' },
    { name: 'Feature Phone', price: 'from KES 2,000', emoji: '☎️', category: 'Mobile Devices' },
    { name: 'Smartwatch', price: 'from KES 3,000', emoji: '⌚', category: 'Smartwatches' },
    { name: 'Powerbank', price: 'from KES 1,200', emoji: '🔋', category: 'Powerbanks' },
    { name: 'Charger', price: 'from KES 800', emoji: '🔌', category: 'Chargers' },
    { name: 'Phone Stand', price: 'from KES 500', emoji: '📱', category: 'Phone & Laptop Stands' },
    { name: 'Laptop Stand', price: 'from KES 1,500', emoji: '💻', category: 'Phone & Laptop Stands' },
    { name: 'Earbuds', price: 'from KES 1,000', emoji: '🎧', category: 'Earbuds' },
    { name: 'Headphones', price: 'from KES 2,500', emoji: '🎧', category: 'Headphones' },
    { name: 'Bluetooth Speaker', price: 'from KES 1,500', emoji: '🔊', category: 'Bluetooth Speakers' },
    { name: 'Microphone', price: 'from KES 2,000', emoji: '🎤', category: 'Microphones' },
    { name: 'TV', price: 'from KES 20,000', emoji: '📺', category: 'TVs' },
    { name: 'Desk Lamp', price: 'from KES 1,000', emoji: '💡', category: 'Desk Lamps' },
    { name: 'Fan', price: 'from KES 2,500', emoji: '🌀', category: 'Fans' },
    { name: 'Extension Cable', price: 'from KES 600', emoji: '🔌', category: 'Extension Cables' },
    { name: 'Router', price: 'from KES 3,000', emoji: '🌐', category: 'Routers/WiFi Devices' },
    { name: 'SD Card', price: 'from KES 400', emoji: '🎴', category: 'SD Cards' }
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
