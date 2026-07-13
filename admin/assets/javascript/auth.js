//Ambol Base URL di localstorage
const BASE_URL = localStorage.getItem('base_url_api');

// Toggle password visibility
function togglePassword() {
  const input = document.getElementById('password');
  const icon = document.getElementById('eye-icon');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
}

// Toast helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'show' + (type === 'error' ? ' error' : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = '';
  }, 3200);
}

// Login form submit
document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit');
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  const role = 'admin';

  if (!email || !pass) {
    showToast('Email dan password harus diisi.', 'error');
    return;
  }

  btn.textContent = 'Masuk…';
  btn.disabled = true;

  try {
    const res = await fetch(BASE_URL + '/auth/login-admin', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email: email, password: pass, role: role }),
    });

    const data = await res.json();

    if (data.code === 200) {
      showToast('Login berhasil! Mengalihkan…');
      setTimeout(() => {
        window.location.href = '/';
      }, 900);
    } else {
      showToast(data.message || 'Login gagal. Periksa kembali kredensial Anda.', 'error');
      btn.textContent = 'Masuk';
      btn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    showToast('Gagal terhubung ke server.', 'error');
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
});
