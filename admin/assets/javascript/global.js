// Global Theme Logic
function applyTheme(theme) {
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIconLo = document.getElementById('theme-icon-sun-lo');
  const moonIconLo = document.getElementById('theme-icon-moon-lo');
  const themeSwitchHandle = document.querySelector('.theme-switch-handle');
  const themeSwitchTrack = document.querySelector('.theme-switch-track');

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
    if (sunIconLo) sunIconLo.style.display = 'none';
    if (moonIconLo) moonIconLo.style.display = 'block';
    if (themeSwitchHandle) themeSwitchHandle.style.transform = 'translateX(14px)';
    if (themeSwitchTrack) themeSwitchTrack.style.background = 'var(--green)';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
    if (sunIconLo) sunIconLo.style.display = 'block';
    if (moonIconLo) moonIconLo.style.display = 'none';
    if (themeSwitchHandle) themeSwitchHandle.style.transform = 'translateX(0)';
    if (themeSwitchTrack) themeSwitchTrack.style.background = 'var(--gray-300)';
  }
}

// Check saved theme and apply before page load if possible
(function () {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTheme =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }

  const themeToggleLo = document.getElementById('theme-toggle-loggedout');
  if (themeToggleLo) {
    themeToggleLo.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTheme =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }
});

// NOTIFICATION
function showNotification(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400); // Wait for transition
  }, 3000);
}

// UpdateUI
function updateUI(userData) {
  const loginBar = document.getElementById('auth-masuk-btn');
  const registerBar = document.getElementById('auth-daftar-btn');
  const logoutBar = document.getElementById('auth-logout-btn');
  const profileChipWrapper = document.getElementById('profile-chip-wrapper');
  const profileChip = document.getElementById('nav-profile-chip');
  const profileAvatar = document.getElementById('nav-profile-avatar');
  const profileName = document.getElementById('nav-profile-name');
  const themeToggleLo = document.getElementById('theme-toggle-loggedout');

  if (registerBar) registerBar.style.display = 'none';
  if (userData) {
    if (logoutBar) logoutBar.style.display = 'block';
  } else {
    if (logoutBar) logoutBar.style.display = 'none';
  }

  if (userData) {
    const username = userData;

    // Hide masuk button, show profile chip
    if (loginBar) loginBar.style.display = 'none';

    // Hide logged-out theme toggle
    if (themeToggleLo) themeToggleLo.style.display = 'none';

    // Show profile chip wrapper + chip with avatar + username
    if (profileChipWrapper) profileChipWrapper.style.display = '';
    if (profileChip) {
      const initial = username.charAt(0).toUpperCase();
      if (profileAvatar) profileAvatar.textContent = initial;
      if (profileName) profileName.textContent = username;
      profileChip.classList.add('visible');
    }
  } else {
    // Show masuk button, hide profile chip
    if (loginBar) {
      loginBar.style.display = '';
      loginBar.style.cursor = 'pointer';
      loginBar.style.pointerEvents = 'auto';
    }
    if (registerBar) registerBar.style.display = '';

    // Show logged-out theme toggle
    if (themeToggleLo) themeToggleLo.style.display = 'inline-flex';

    // Hide profile chip wrapper
    if (profileChipWrapper) profileChipWrapper.style.display = 'none';
    if (profileChip) {
      profileChip.classList.remove('visible');
    }
  }
}

// Confirm Modal function
function showConfirmModal(message, title = 'Konfirmasi') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-overlay');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');

    if (!overlay) return resolve(confirm(message));

    titleEl.textContent = title;
    messageEl.textContent = message;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    function cleanup() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onOk);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    function onOk() {
      cleanup();
      resolve(true);
    }

    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onOk);
  });
}

// Check session saat halaman pertama kali dimuat
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const response = await fetch(baseUrl + '/auth/check_session_admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
    });

    const data = await response.json();
    if (data.status === 401 || data.message === 'Unauthorized') {
      localStorage.removeItem('admin_username');
      updateUI(null);
      showNotification('Session Berakhir, Silahkan Login Kembali', 'error');
      // Redirect to login page if we are in dashboard
      if (window.location.pathname === '/dashboard') {
        window.location.href = '/';
      }
    } else if (data.code === 200 && data.status === 'success') {
      let saveUsername = localStorage.getItem('admin_username');
      if (saveUsername) {
        try {
          saveUsername = JSON.parse(saveUsername);
          let fixUsername = saveUsername.username;
          if (fixUsername) {
            updateUI(fixUsername);
          }
        } catch (e) {
          console.error(e);
        }
      } else if (data.user && data.user.username) {
        localStorage.setItem('admin_username', JSON.stringify(data.user));
        updateUI(data.user.username);
      }
    }
  } catch (error) {
    console.error('Error checking session:', error);
    updateUI(null);
    if (window.location.pathname === '/dashboard') {
      window.location.href = '/';
    }
  }
});

// Cek session saat halaman pertama kali dimuat
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const response = await fetch(baseUrl + '/auth/check_session_admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
    });

    const data = await response.json();
    if (data.message === 'Unauthorized') {
      // Hapus semua data di localstorage bp_cart, bp_username, bp_notifications, bp_pending_order_id
      // localStorage.removeItem('bp_cart');
      // localStorage.removeItem('admin_username');
      // localStorage.removeItem('bp_notifications');
      // localStorage.removeItem('bp_pending_order_id');
      // updateUI(null);

      //tampilkan notifikasi pemberitahuan
      // showNotification('Session Berakhir, Silahkan Login Kembali', 'error');
      //redirect ke halaman login
      window.location.href = '/login';
    } else if (data.message === 'forbbiden') {
      showNotification('Anda tidak memiliki akses untuk mengakses halaman ini', 'error');
      localStorage.removeItem('admin_username');
      updateUI(null);
      window.location.href = '/login';
    } else if (data.code === 200 && data.status === 'success') {
      // Session Valid arahkan ke dashboard
      //Cek hlaman saat ini
      if (window.location.pathname === '/') {
        //Berhenti jika halaman adalah halaman dashboard
        return;
      }
      // Session valid, tampilkan auth panel
      let saveUsername = localStorage.getItem('admin_username');
      if (saveUsername) {
        try {
          saveUsername = JSON.parse(saveUsername);
          let fixUsername = saveUsername.username;
          if (fixUsername) {
            updateUI(fixUsername);
          }
        } catch (e) {
          console.error('Error parsing admin_username:', e);
        }
      } else if (data.user && data.user.username) {
        localStorage.setItem('admin_username', JSON.stringify(data.user));
        updateUI(data.user.username);
      }
    }
  } catch (error) {
    console.error('Error checking session:', error);
    // Jika ada error, tampilkan auth panel
    updateUI(null);
  }
});

// Logout
async function logout() {
  const isConfirmed = await showConfirmModal('Apakah Anda yakin ingin logout?');
  if (!isConfirmed) return;

  if (!localStorage.getItem('admin_username')) {
    showNotification('Anda belum login', 'error');
    return;
  }

  const baseUrl = localStorage.getItem('base_url_api');
  fetch(baseUrl + '/auth/logout-admin', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        localStorage.removeItem('admin_username');
        showNotification(data.message, 'success');
        updateUI(null);
        window.location.href = '/';
      } else {
        showNotification(data.message, 'error');
      }
    })
    .catch((error) => console.error('Gagal logout:', error));
}
