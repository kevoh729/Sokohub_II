// Check if user is logged in
function checkAuth() {
  const email = localStorage.getItem('userEmail');
  if (!email) {
    window.location.href = '/';
    return null;
  }
  return email;
}

const userEmail = checkAuth();
const userName = localStorage.getItem('userName');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

// Display seller name
document.getElementById('seller-name').textContent = `Welcome, ${userName}`;

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = '/';
});

// Load products on page load
loadProducts();

// Add product form submission
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const productName = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const price = document.getElementById('product-price').value;
  const imageFile = document.getElementById('product-image').files[0];
  const messageDiv = document.getElementById('form-message');

  try {
    let imageUrl = null;

    // Upload image through the backend if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Image upload failed');
        }

        imageUrl = uploadData.imageUrl;
      } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.classList.add('error');
        messageDiv.classList.remove('success');
        return;
      }
    }

    // Add product to backend
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        productName,
        description,
        price,
        imageUrl
      })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = 'Product added successfully!';
      messageDiv.classList.add('success');
      messageDiv.classList.remove('error');

      // Clear form
      document.getElementById('product-form').reset();

      // Reload products
      setTimeout(() => {
        loadProducts();
        messageDiv.textContent = '';
        messageDiv.classList.remove('success', 'error');
      }, 1000);
    } else {
      messageDiv.textContent = data.error || 'Failed to add product';
      messageDiv.classList.add('error');
      messageDiv.classList.remove('success');
    }
  } catch (error) {
    messageDiv.textContent = 'Error: ' + error.message;
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
  }
});

// Load user products
async function loadProducts() {
  try {
    const response = await fetch(`/api/products/${userEmail}`);
    const data = await response.json();
    const productsList = document.getElementById('products-list');

    if (data.products.length === 0) {
      productsList.innerHTML = '<div class="empty-message">No products added yet. Add your first product above!</div>';
      return;
    }

    productsList.innerHTML = data.products.map(product => `
      <div class="product-card">
        <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.productName)}" class="product-image">
        <div class="product-info">
          <div class="product-name">${escapeHtml(product.productName)}</div>
          <div class="product-description">${escapeHtml(product.description)}</div>
          <div class="product-price">KES ${parseFloat(product.price).toFixed(2)}</div>
          <div class="product-actions">
            <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Delete product
async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const response = await fetch(`/api/products/${userEmail}/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  }
}
