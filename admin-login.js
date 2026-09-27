(() => {
  const form = document.getElementById('admin-login-form');
  const feedback = document.getElementById('login-feedback');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const credentials = Object.fromEntries(new FormData(form).entries());
    feedback.textContent = '';
    button.disabled = true;
    button.textContent = 'Signing in…';
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      window.location.replace(result.redirect || '/admin');
    } catch (error) {
      feedback.textContent = error.message || 'Unable to reach the sign-in service.';
      button.disabled = false;
      button.innerHTML = 'Sign in <span>↗</span>';
    }
  });
})();
