 const products = [
            { name: 'Wireless Earbuds', price: 'Ksh 2,500', emoji: '🎧', description: 'Comfortable true wireless earbuds with long battery life.', images: ['sokohub1.jpg','sokohub.jpg'] },
            { name: 'Smart Watch', price: 'Ksh 5,999', emoji: '⌚', description: 'Smart watch with heart-rate monitoring and notifications.', images: ['sokohub1.jpg'] },
            { name: 'Phone Case', price: 'Ksh 800', emoji: '📱', description: 'Durable phone case to protect your device.', images: ['sokohub.jpg'] },
            { name: 'Sneakers', price: 'Ksh 4,200', emoji: '👟', description: 'Stylish and comfortable sneakers for everyday wear.', images: ['sokohub1.jpg'] },
            { name: 'Perfume Set', price: 'Ksh 3,500', emoji: '💐', description: 'Fragrant perfume set perfect for gifting.', images: ['sokohub.jpg'] },
            { name: 'Handbag', price: 'Ksh 6,500', emoji: '👜', description: 'Spacious handbag made from quality materials.', images: ['sokohub1.jpg'] },
            { name: 'Sunglasses', price: 'Ksh 2,800', emoji: '😎', description: 'UV protection sunglasses with modern frame.', images: ['sokohub.jpg'] },
            { name: 'Beanie', price: 'Ksh 1,200', emoji: '🧢', description: 'Cozy beanie to keep you warm.', images: ['sokohub1.jpg'] }
        ];

        // Render products
        function openProduct(prod) {
            const params = new URLSearchParams();
            params.set('name', prod.name);
            params.set('price', prod.price);
            params.set('desc', prod.description || '');
            params.set('images', (prod.images || []).join(','));
            window.location.href = `product.html?${params.toString()}`;
        }

        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = products.map((prod) => `
                <div class="product-card" onclick='openProduct(${JSON.stringify(prod)})'>
                    <div class="product-image">${prod.emoji}</div>
                    <div class="product-info">
                        <div class="product-name">${prod.name}</div>
                        <div class="product-price">${prod.price}</div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${prod.name.replace(/'/g, "\\'")}', '${prod.price}', '${prod.emoji}')">Add to Cart</button>
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
        function handleSearch() {
            const query = document.getElementById('searchInput').value;
            if (query.trim()) {
                alert('🔍 Searching for: ' + query);
            }
        }

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