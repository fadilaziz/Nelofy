//Global Theme Logic
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
(function() {
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
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }

  const themeToggleLo = document.getElementById('theme-toggle-loggedout');
  if (themeToggleLo) {
    themeToggleLo.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }
});

//Register Function
function register() {
    //Fetch Register
    const fullname = document.getElementById("reg-fullname").value;
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-pass").value;
    const phone = document.getElementById("reg-phone").value;
    const btnRegister = document.getElementById("btn-register");

    btnRegister.innerHTML = "Loading...";
    btnRegister.disabled = true;

    //validasi
    if (fullname === "" || username === "" || email === "" || password === "" || phone === "") {
        showNotification("Semua inputan harus diisi", 'error');
        btnRegister.innerHTML = "Registrasi";
        btnRegister.disabled = false;
        return;
    }

    //validasi password
    if (password.length < 8) {
        showNotification("Password harus minimal 8 karakter", 'error');
        btnRegister.innerHTML = "Registrasi";
        btnRegister.disabled = false;
        return;
    }

    //Validasi Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification("Email tidak valid", 'error');
        btnRegister.innerHTML = "Registrasi";
        btnRegister.disabled = false;
        return;
    }

    //Validasi Phone
    const phoneRegex = /^[0-9]{8,}$/;
    if (!phoneRegex.test(phone)) {
        showNotification("Nomor telepon tidak valid", 'error');
        btnRegister.innerHTML = "Registrasi";
        btnRegister.disabled = false;
        return;
    }

    //Capture payload
    const data = {
        full_name: fullname,
        username: username,
        user_email: email,
        user_pass: password,
        user_phone: phone
    };

    //Ambil base url 
    const baseUrl = localStorage.getItem("base_url_api");

    fetch(baseUrl + "/register", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                console.log("Respons Data", data);
                authModal.closeAuthModal();
                showNotification(data.message, 'success');
                updateUI(data.user.username);
                get_products();

                //Simpan data user ke local storage
                localStorage.setItem("bp_username", JSON.stringify(data.user));

                //Mengembalikan nilai button
                btnRegister.innerHTML = "Registrasi";
                btnRegister.disabled = false;
            } else {
                showNotification(data.message, 'error');
                //Mengembalikan nilai button
                btnRegister.innerHTML = "Registrasi";
                btnRegister.disabled = false;
            }
        })
    // .catch(error => console.error('Gagal register:', error));

    //Kosongkan inputan
    document.getElementById("reg-fullname").value = "";
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-pass").value = "";
    document.getElementById("reg-phone").value = "";
}

//Login Function
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;
    const btnLogin = document.getElementById("btn-login");

    btnLogin.innerHTML = "Loading...";
    btnLogin.disabled = true;

    //validasi
    if (email === "" || password === "") {
        showNotification("Semua inputan harus diisi", 'error');
        btnLogin.innerHTML = "Masuk";
        btnLogin.disabled = false;
        return;
    }

    //Capture payload
    const data = {
        user_email: email,
        user_pass: password
    };

    //Ambil base url 
    const baseUrl = localStorage.getItem("base_url_api");

    //Fetch data User info
    fetch(baseUrl + "/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                console.log(data.user);
                authModal.closeAuthModal();
                showNotification(data.message, 'success');
                updateUI(data.user.username);
                get_products();

                //Simpan data user ke local storage
                localStorage.setItem("bp_username", JSON.stringify(data.user));

                //Mengembalikan Nilai button
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;

            } else {
                showNotification(data.message, 'error');
                //Mengembalikan Nilai button
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
            }
        })
        .catch(error => console.error('Gagal login:', error));

    //Kosongkan inputan
    document.getElementById("login-email").value = "";
    document.getElementById("login-pass").value = "";
}

//UpdateUI
function updateUI(userData) {
    const loginBar = document.getElementById("auth-masuk-btn");
    const registerBar = document.getElementById("auth-daftar-btn");
    const logoutBar = document.getElementById("auth-logout-btn");
    const profileChipWrapper = document.getElementById("profile-chip-wrapper");
    const profileChip = document.getElementById("nav-profile-chip");
    const profileAvatar = document.getElementById("nav-profile-avatar");
    const profileName = document.getElementById("nav-profile-name");
    const themeToggleLo = document.getElementById("theme-toggle-loggedout");

    if (registerBar) registerBar.style.display = "none";
    if (userData) {
        if (logoutBar) logoutBar.style.display = "block";
    } else {
        if (logoutBar) logoutBar.style.display = "none";
    }

    if (userData) {
        const username = userData;

        // Hide masuk button, show profile chip
        if (loginBar) loginBar.style.display = "none";

        // Hide logged-out theme toggle
        if (themeToggleLo) themeToggleLo.style.display = "none";

        // Show profile chip wrapper + chip with avatar + username
        if (profileChipWrapper) profileChipWrapper.style.display = "";
        if (profileChip) {
            const initial = username.charAt(0).toUpperCase();
            if (profileAvatar) profileAvatar.textContent = initial;
            if (profileName) profileName.textContent = username;
            profileChip.classList.add("visible");
        }
    } else {
        // Show masuk button, hide profile chip
        if (loginBar) {
            loginBar.style.display = "";
            loginBar.style.cursor = "pointer";
            loginBar.style.pointerEvents = "auto";
        }
        if (registerBar) registerBar.style.display = "";

        // Show logged-out theme toggle
        if (themeToggleLo) themeToggleLo.style.display = "inline-flex";

        // Hide profile chip wrapper
        if (profileChipWrapper) profileChipWrapper.style.display = "none";
        if (profileChip) {
            profileChip.classList.remove("visible");
        }
    }
}

// Cek session saat halaman pertama kali dimuat
window.addEventListener('DOMContentLoaded', async () => {
      try {
        const baseUrl = localStorage.getItem("base_url_api");
        const response = await fetch(baseUrl + '/check_session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log("data", data);
        if (data.message === 'Unauthorized') {
          // Hapus semua data di localstorage bp_cart, bp_username, bp_notifications, bp_pending_order_id
          localStorage.removeItem('bp_cart');
          localStorage.removeItem('bp_username');
          localStorage.removeItem('bp_notifications');
          localStorage.removeItem('bp_pending_order_id');
          updateUI(null);

          //tampilkan notifikasi pemberitahuan 
          showNotification("Session Berakhir, Silahkan Login Kembali", 'error');
        } else if (data.code === 200 && data.status === 'success') {
          // Session valid, tampilkan auth panel
          let saveUsername = localStorage.getItem("bp_username");
          if (saveUsername) {
            try {
                saveUsername = JSON.parse(saveUsername);
                let fixUsername = saveUsername.username;
                if (fixUsername) {
                    updateUI(fixUsername);
                }
            } catch (e) {
                console.error('Error parsing bp_username:', e);
            }
        }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Jika ada error, tampilkan auth panel
        updateUI(null);
      }
    });

    let saveUsername = localStorage.getItem("bp_username");
if (saveUsername) {
    try {
        saveUsername = JSON.parse(saveUsername);
        let fixUsername = saveUsername.username;
        if (fixUsername) {
            updateUI(fixUsername);
        }
    } catch (e) {
        console.error('Error parsing bp_username:', e);
    }
}
