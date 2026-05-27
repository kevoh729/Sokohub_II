// Toggle between Sign In and Sign Up forms
document.getElementById('signin-btn').addEventListener('click', () => {
  document.getElementById('signin-form').classList.add('active');
  document.getElementById('signup-form').classList.remove('active');
  document.getElementById('signin-btn').classList.add('active');
  document.getElementById('signup-btn').classList.remove('active');
});

document.getElementById('signup-btn').addEventListener('click', () => {
  document.getElementById('signup-form').classList.add('active');
  document.getElementById('signin-form').classList.remove('active');
  document.getElementById('signup-btn').classList.add('active');
  document.getElementById('signin-btn').classList.remove('active');
});

// Sign In form submission
document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  const messageDiv = document.getElementById('signin-message');

  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = 'Sign in successful! Redirecting...';
      messageDiv.classList.add('success');
      messageDiv.classList.remove('error');
      
      // Store user info in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', data.name);

      // Redirect to sellers profile after 1 second
      setTimeout(() => {
        window.location.href = '/sellersprofile';
      }, 1000);
    } else {
      messageDiv.textContent = data.error || 'Sign in failed';
      messageDiv.classList.add('error');
      messageDiv.classList.remove('success');
    }
  } catch (error) {
    messageDiv.textContent = 'Error: ' + error.message;
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
  }
});

// Sign Up form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const messageDiv = document.getElementById('signup-message');

  // Validate passwords match
  if (password !== confirmPassword) {
    messageDiv.textContent = 'Passwords do not match';
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
    return;
  }

  // Validate password length
  if (password.length < 6) {
    messageDiv.textContent = 'Password must be at least 6 characters';
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = 'Sign up successful! Redirecting to profile...';
      messageDiv.classList.add('success');
      messageDiv.classList.remove('error');

      // Store user info in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);

      // Redirect to sellers profile after 1 second
      setTimeout(() => {
        window.location.href = '/sellersprofile';
      }, 1000);
    } else {
      messageDiv.textContent = data.error || 'Sign up failed';
      messageDiv.classList.add('error');
      messageDiv.classList.remove('success');
    }
  } catch (error) {
    messageDiv.textContent = 'Error: ' + error.message;
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
  }
});
