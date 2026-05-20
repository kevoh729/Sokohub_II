const categoryProducts = [
    // Clothing items
    { name: 'Men T-Shirt', price: 'Ksh 1,200', emoji: '👕', category: 'Clothing', subcategory: 'T-Shirts', description: 'Comfortable cotton t-shirt', images: ['sokohub.jpg','sokohub1.jpg','sokohub.jpg','sokohub1.jpg'] },
    { name: 'Women Hoodie', price: 'Ksh 2,500', emoji: '🧥', category: 'Clothing', subcategory: 'Hoodies' },
    { name: 'Sweater', price: 'Ksh 3,000', emoji: '🧶', category: 'Clothing', subcategory: 'Sweaters' },
    { name: 'Jeans', price: 'Ksh 2,800', emoji: '👖', category: 'Clothing', subcategory: 'Jeans' },
    { name: 'Trousers', price: 'Ksh 2,200', emoji: '👖', category: 'Clothing', subcategory: 'Trousers' },
    { name: 'Shorts', price: 'Ksh 1,500', emoji: '🩳', category: 'Clothing', subcategory: 'Shorts' },
    { name: 'Dress', price: 'Ksh 3,500', emoji: '👗', category: 'Clothing', subcategory: 'Dresses' },
    { name: 'Skirt', price: 'Ksh 2,000', emoji: '👗', category: 'Clothing', subcategory: 'Skirts' },
    { name: 'Jacket', price: 'Ksh 4,500', emoji: '🧥', category: 'Clothing', subcategory: 'Jackets' },
    
    // Footwear items
    { name: 'Sneakers', price: 'Ksh 5,000', emoji: '👟', category: 'Footwear', subcategory: 'Sneakers' },
    { name: 'Casual Shoes', price: 'Ksh 3,800', emoji: '👞', category: 'Footwear', subcategory: 'Casual Shoes' },
    { name: 'Formal Shoes', price: 'Ksh 4,200', emoji: '👞', category: 'Footwear', subcategory: 'Formal Shoes' },
    { name: 'Sandals', price: 'Ksh 1,800', emoji: '👡', category: 'Footwear', subcategory: 'Sandals' },
    { name: 'Slippers', price: 'Ksh 1,200', emoji: '🩴', category: 'Footwear', subcategory: 'Slippers' },
    { name: 'Sport Shoes', price: 'Ksh 4,500', emoji: '👟', category: 'Footwear', subcategory: 'Sport Shoes' },
    { name: 'Boots', price: 'Ksh 6,000', emoji: '👢', category: 'Footwear', subcategory: 'Boots' },
    
    // Bags items
    { name: 'Backpack', price: 'Ksh 2,500', emoji: '🎒', category: 'Bags & Carry', subcategory: 'Backpacks' },
    { name: 'Laptop Bag', price: 'Ksh 3,000', emoji: '💼', category: 'Bags & Carry', subcategory: 'Laptop Bags' },
    { name: 'Tote Bag', price: 'Ksh 1,800', emoji: '👜', category: 'Bags & Carry', subcategory: 'Tote Bags' },
    { name: 'Handbag', price: 'Ksh 4,500', emoji: '👜', category: 'Bags & Carry', subcategory: 'Handbags' },
    { name: 'Gym Bag', price: 'Ksh 2,800', emoji: '🎒', category: 'Bags & Carry', subcategory: 'Gym Bags' },
    { name: 'Travel Bag', price: 'Ksh 5,500', emoji: '🧳', category: 'Bags & Carry', subcategory: 'Travel Bags' },
    
    // Accessories items
    { name: 'Cap', price: 'Ksh 800', emoji: '🧢', category: 'Accessories', subcategory: 'Caps & Hats' },
    { name: 'Sunglasses', price: 'Ksh 2,800', emoji: '😎', category: 'Accessories', subcategory: 'Sunglasses' },
    { name: 'Belt', price: 'Ksh 1,200', emoji: '👔', category: 'Accessories', subcategory: 'Belts' },
    { name: 'Jewelry', price: 'Ksh 3,500', emoji: '💍', category: 'Accessories', subcategory: 'Jewelry' },
    { name: 'Bracelet', price: 'Ksh 1,500', emoji: '📿', category: 'Accessories', subcategory: 'Bracelets' },
    { name: 'Chain', price: 'Ksh 2,000', emoji: '🔗', category: 'Accessories', subcategory: 'Chains' },

    // Personal Care
    { name: 'Makeup Kit', price: 'Ksh 4,000', emoji: '💄', category: 'Personal Care', subcategory: 'Makeup' },
    { name: 'Skincare', price: 'Ksh 3,000', emoji: '🧴', category: 'Personal Care', subcategory: 'Skincare' },
    { name: 'Perfume', price: 'Ksh 5,000', emoji: '🧴', category: 'Personal Care', subcategory: 'Perfumes' },
    { name: 'Hair Product', price: 'Ksh 2,000', emoji: '🧴', category: 'Personal Care', subcategory: 'Hair Products' },
    { name: 'Nail Kit', price: 'Ksh 1,500', emoji: '💅', category: 'Personal Care', subcategory: 'Nail Kits' },
    { name: 'Grooming Kit', price: 'Ksh 3,500', emoji: '🪒', category: 'Personal Care', subcategory: 'Grooming Kits' },

    // Occasion Wear
    { name: 'Party Outfit', price: 'Ksh 6,000', emoji: '👗', category: 'Occasion Wear', subcategory: 'Party Outfits' },
    { name: 'Graduation Outfit', price: 'Ksh 7,000', emoji: '🎓', category: 'Occasion Wear', subcategory: 'Graduation Outfits' }
];

// Render products
function renderProducts(category = 'All') {
    const grid = document.getElementById('productsGrid');
    const filteredProducts = category === 'All'
        ? categoryProducts
        : categoryProducts.filter(p => p.category === category || p.subcategory === category);
    
    grid.innerHTML = filteredProducts.map((prod) => `
        <div class="product-card" onclick='openProduct(${JSON.stringify(prod)})'>
            <div class="product-image">${prod.emoji}</div>
            <div class="product-info">
                <div class="product-name">${prod.name}</div>
                <div class="product-price">${prod.price}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${prod.name.replace(/'/g, "\\'")}, '${prod.price}', '${prod.emoji}')">Add to Cart</button>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${prod.name}')">Add to Cart</button>
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
