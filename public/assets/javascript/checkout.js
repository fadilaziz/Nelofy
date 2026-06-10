(function initNavbarChip() {
  try {
    const raw = localStorage.getItem('bp_username');
    if (!raw) return;
    const user = JSON.parse(raw);
    const username = user.username || '';
    if (!username) return;

    const avatar = document.getElementById('navbar-profile-avatar');
    const name = document.getElementById('navbar-profile-name');
    if (avatar) avatar.textContent = username.charAt(0).toUpperCase();
    if (name) name.textContent = username;
  } catch (e) {}
})();

const CART_KEY = 'bp_cart';
let subtotal = 0;
let finalGrandTotal = 0;

// UI Helpers
function showNotification(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function loadCustomerData() {
  //fetch data user saat ini
  const baseUrl = localStorage.getItem('base_url_api');
  fetch(baseUrl + '/users/get_current_user', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        const customerInfo = document.getElementById('customer-info');
        console.log('customerInfo', customerInfo);

        //Menampilkan informasi pembeli
        customerInfo.innerHTML = `
          <div class="customer-info-box">
            <div class="customer-avatar">${data.data.full_name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}</div>
            <div class="customer-info-details">
              <div class="customer-info-name" id="customer-name-box">
                ${data.data.full_name}
                <span class="verified-icon"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>
              </div>
              <div class="customer-info-row" id="customer-email-box">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                ${data.data.email}
              </div>
              <div class="customer-info-row" id="customer-phone-box">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                ${data.data.phone}
              </div>
            </div>
          </div>
          `;
        //Jika belum login
      } else {
        showNotification('Silahkan Login Terlebih Dahulu', 'error');
        showInlineLogin();
      }
    })
    .catch((error) => {
      console.error('Gagal checkout:', error);
      showNotification('Gagal checkout', 'error');
    });
}

function showInlineLogin() {
  const customerInfo = document.getElementById('customer-info');
  if (!customerInfo) return;
  customerInfo.innerHTML = `
    <div class="auth-panel-inline" id="login-panel">
      <div class="auth-header-illust">
        <div class="lock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <h3>Masuk Akun</h3>
        <p>Login untuk melanjutkan checkout</p>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></span>
        <input type="email" class="auth-input" id="login-email" placeholder="Alamat email" required>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
        <input type="password" class="auth-input" id="login-pass" placeholder="Password" required>
      </div>
      <button class="auth-submit-btn" id="btn-login" onclick="login()">Masuk</button>
      <div class="auth-switch">
        Belum punya akun? <a href="#" onclick="event.preventDefault(); showInlineRegister();">Daftar sekarang</a>
      </div>
    </div>
  `;
}

function showInlineRegister() {
  const customerInfo = document.getElementById('customer-info');
  if (!customerInfo) return;
  customerInfo.innerHTML = `
    <div class="auth-panel-inline" id="register-panel">
      <div class="auth-header-illust">
        <div class="lock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </div>
        <h3>Daftar Akun</h3>
        <p>Silakan lengkapi data untuk membuat akun</p>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
        <input type="text" class="auth-input" id="reg-fullname" placeholder="Nama Lengkap" required>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
        <input type="text" class="auth-input" id="reg-username" placeholder="Username" required>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></span>
        <input type="email" class="auth-input" id="reg-email" placeholder="Alamat email" required>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
        <input type="password" class="auth-input" id="reg-pass" placeholder="Password (Min. 8 Karakter)" required>
      </div>
      <div class="auth-input-wrap">
        <span class="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></span>
        <input type="tel" class="auth-input" id="reg-phone" placeholder="Nomor Telepon" required>
      </div>
      <button class="auth-submit-btn" id="btn-register" onclick="register()">Daftar</button>
      <div class="auth-switch">
        Sudah punya akun? <a href="#" onclick="event.preventDefault(); showInlineLogin();">Masuk sekarang</a>
      </div>
    </div>
  `;
}

function register() {
  const fullname = document.getElementById('reg-fullname').value;
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;
  const phone = document.getElementById('reg-phone').value;
  const btnRegister = document.getElementById('btn-register');

  btnRegister.innerHTML = 'Loading...';
  btnRegister.disabled = true;

  if (fullname === '' || username === '' || email === '' || password === '' || phone === '') {
    showNotification('Semua inputan harus diisi', 'error');
    btnRegister.innerHTML = 'Daftar';
    btnRegister.disabled = false;
    return;
  }

  if (password.length < 8) {
    showNotification('Password harus minimal 8 karakter', 'error');
    btnRegister.innerHTML = 'Daftar';
    btnRegister.disabled = false;
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Email tidak valid', 'error');
    btnRegister.innerHTML = 'Daftar';
    btnRegister.disabled = false;
    return;
  }

  const phoneRegex = /^[0-9]{8,}$/;
  if (!phoneRegex.test(phone)) {
    showNotification('Nomor telepon tidak valid', 'error');
    btnRegister.innerHTML = 'Daftar';
    btnRegister.disabled = false;
    return;
  }

  const data = {
    full_name: fullname,
    username: username,
    email: email,
    password: password,
    phone: phone,
  };

  const baseUrl = localStorage.getItem('base_url_api');

  fetch(baseUrl + '/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        showNotification(data.message, 'success');
        localStorage.setItem('bp_username', JSON.stringify(data.user));
        btnRegister.innerHTML = 'Daftar';
        btnRegister.disabled = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showNotification(data.message, 'error');
        btnRegister.innerHTML = 'Daftar';
        btnRegister.disabled = false;
      }
    })
    .catch((error) => {
      console.error('Gagal register:', error);
      btnRegister.innerHTML = 'Daftar';
      btnRegister.disabled = false;
    });
}


//login
function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;
  const btnLogin = document.getElementById('btn-login');

  btnLogin.innerHTML = 'Loading...';
  btnLogin.disabled = true;

  //validasi
  if (email === '' || password === '') {
    showNotification('Semua inputan harus diisi', 'error');
    btnLogin.innerHTML = 'Masuk';
    btnLogin.disabled = false;
    return;
  }

  //Capture payload
  const data = {
    email: email,
    password: password,
  };

  //Ambil base url
  const baseUrl = localStorage.getItem('base_url_api');

  //Fetch data User info
  fetch(baseUrl + '/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        showNotification('Login Berhasil', (type = 'success'));
        window.location.reload();
        // loadCustomerData();
        //Simpan data user ke local storage
        localStorage.setItem('bp_username', JSON.stringify(data.user));

        //Mengembalikan Nilai button
        btnLogin.innerHTML = 'Masuk';
        btnLogin.disabled = false;
      } else {
        showNotification(data.message, 'error');
        //Mengembalikan Nilai button
        btnLogin.innerHTML = 'Masuk';
        btnLogin.disabled = false;
      }
    })
    .catch((error) => console.error('Gagal login:', error));

  //Kosongkan inputan
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value = '';
}

function renderCheckoutItems() {
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const container = document.getElementById('summary-items');

  if (cart.length === 0) {
    container.innerHTML = `<p style="font-size:13px; color:var(--gray-500); text-align:center;">Keranjang kosong.</p>`;
    calculateTotals(0);
    return;
  }

  container.innerHTML = '';
  let tempSubtotal = 0;

  cart.forEach((item) => {
    const itemTotal = Number(item.price) * item.qty;
    tempSubtotal += itemTotal;
    container.innerHTML += `
          <div class="summary-item">
            <img class="summary-item-img" src="${item.image || 'https://placehold.co/64x48?text=No+Img'}" alt="img">
            <div class="summary-item-details">
              <div class="summary-item-name">${item.product_name}</div>
              <div style="font-size: 11px; color: var(--gray-500); margin-bottom: 4px;">Qty: ${item.qty}</div>
              <div class="summary-item-price">Rp ${itemTotal.toLocaleString('id-ID')}</div>
            </div>
          </div>
        `;
  });
  calculateTotals(tempSubtotal);
}
renderCheckoutItems();

// ══════════════════════════════════════════
// UPSELL — Fetch & Render Recommended Products
// ══════════════════════════════════════════
function getCartProductIds() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return cart.map((item) => String(item.id));
  } catch (e) {
    return [];
  }
}

function isInCart(productId) {
  return getCartProductIds().includes(String(productId));
}

function upsellAddToCart(product) {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const exists = cart.find((i) => String(i.id) === String(product.id));
    if (exists) {
      showNotification(`${product.product_name} sudah ada di keranjang`, 'error');
      return;
    }
    cart.push({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      qty: 1,
      image: product.image || null,
    });
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    showNotification(`✓ ${product.product_name} ditambahkan ke keranjang!`);
    // Update card UI
    const card = document.querySelector(`[data-upsell-id="${product.id}"]`);
    if (card) {
      const btn = card.querySelector('.btn-beli');
      if (btn) {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Di Keranjang</span>`;
        btn.classList.add('in-cart');
        btn.onclick = null;
      }
    }
    // Refresh cart summary
    renderCheckoutItems();
  } catch (e) {
    showNotification('Gagal menambahkan produk', 'error');
  }
}

function renderUpsellCard(product) {
  const inCart = isInCart(product.id);
  const price = Number(product.price);
  const hasImg = product.image && product.image.trim() !== '';

  return `
        <div class="product-card" data-upsell-id="${product.id}" style="opacity:1; animation:none;">
          <div class="card-img-wrap">
            <img src="${hasImg ? product.image : ''}" alt="${product.product_name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="card-img-placeholder" style="${hasImg ? 'display:none;' : 'display:flex;'}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
          </div>
          <div class="card-body">
            <div class="card-name">${product.product_name}</div>
            <div class="card-subtitle">${product.description || ''}</div>
            <div class="card-color">${product.type || ''}</div>
            <div class="card-price-row">
              <span class="card-price">Rp ${price.toLocaleString('id-ID')}</span>
            </div>
            <div class="card-actions">
              <button
                class="btn-beli ${inCart ? 'in-cart' : ''}"
                ${inCart ? '' : `onclick="upsellAddToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})"`}>
                ${
                  inCart
                    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Di Keranjang</span>`
                    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg><span>Tambahkan</span>`
                }
              </button>
              <button class="btn-keranjang" title="Tambah ke keranjang" ${inCart ? 'disabled' : `onclick="upsellAddToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})"`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
}

async function loadUpsellProducts() {
  const skeleton = document.getElementById('upsell-skeleton');
  const grid = document.getElementById('upsell-grid');
  const panel = document.getElementById('upsell-panel');

  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const cartIds = cart.map((i) => i.id);

    const res = await fetch(baseUrl + '/get_products', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    const data = await res.json();

    if (!data || !data.data || data.data.length === 0) {
      panel.style.display = 'none';
      return;
    }

    // Filter produk yang belum ada di keranjang, max 4
    const recommendations = data.data
      .filter((p) => !cartIds.includes(String(p.id)) && !cartIds.includes(p.id))
      .slice(0, 4);

    if (recommendations.length === 0) {
      panel.style.display = 'none';
      return;
    }

    grid.innerHTML = recommendations.map(renderUpsellCard).join('');

    // Fade in
    skeleton.style.display = 'none';
    grid.style.display = 'grid';
  } catch (err) {
    console.warn('Upsell load error:', err);
    // Sembunyikan panel jika gagal
    if (panel) panel.style.display = 'none';
  }
}

function calculateTotals(newSubtotal) {
  subtotal = newSubtotal;

  const discountRow = document.getElementById('discount-row');
  const discountVal = document.getElementById('discount-val');

  let discountAmount = 0;
  const isDiscountApplied = window.appliedDiscountPercent || 0;
  if (isDiscountApplied > 0) {
    discountAmount = subtotal * (isDiscountApplied / 100);
    discountVal.textContent = `- Rp ${discountAmount.toLocaleString('id-ID')}`;
    discountRow.classList.add('show');
  } else {
    discountRow.classList.remove('show');
  }

  finalGrandTotal = subtotal - discountAmount;
  document.getElementById('subtotal-val').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
  document.getElementById('grand-total-val').textContent =
    `Rp ${finalGrandTotal.toLocaleString('id-ID')}`;
}

function applyVoucher() {
  const code = document.getElementById('voucher-input').value.trim().toUpperCase();
  if (!code) return;
  if (subtotal === 0) return showNotification('Keranjang Anda kosong', 'error');

  const validVouchers = { DISKON20: 20, PROMO50: 50 };
  if (validVouchers[code]) {
    window.appliedDiscountPercent = validVouchers[code];
    calculateTotals(subtotal);
    showNotification(`Voucher ${code} dipakai! (Diskon ${validVouchers[code]}%)`);
  } else {
    showNotification('Kode voucher invalid', 'error');
    window.appliedDiscountPercent = 0;
    calculateTotals(subtotal);
  }
}

// Toggle Payment Accordion
function toggleAccordion(id) {
  document.querySelectorAll('.payment-group').forEach((g) => {
    if (g.querySelector('.payment-group-content').id === id) {
      g.classList.toggle('active');
    } else {
      g.classList.remove('active');
    }
  });
}

// Handle Selection State
function selectPayment() {
  document.querySelectorAll('input[name="pay_opt"]').forEach((r) => {
    if (r.checked) r.parentElement.classList.add('selected');
    else r.parentElement.classList.remove('selected');
  });
  // Aktifkan button bayar jika cart ga nol
  if (subtotal > 0) {
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('submit-btn').textContent = 'Lanjut Pembayaran';
  }
}

// Submit Action => Generates pending invoice and redirects
function checkoutToPayment() {
  const selectedEl = document.querySelector('input[name="pay_opt"]:checked');
  if (!selectedEl) {
    showNotification('Pilih metode pembayaran terlebih dahulu', 'error');
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Melakukan Checkout...';
  btn.style.pointerEvents = 'none';

  const selectedOpt = JSON.parse(selectedEl.value);

  // Calculate Expiration: e.g. 24 Hours from now
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // const userInfo = JSON.parse(localStorage.getItem("bp_user_info"));
  const productCart = JSON.parse(localStorage.getItem('bp_cart'));
  const [{ id, name, price, qty }] = productCart;

  //Ambil kode Voucher
  const voucherCode = document.getElementById('voucher-input').value.trim().toUpperCase();

  const payload = {
    payment_method: selectedOpt.name,
    voucher_code: voucherCode,
    product_id: id,
    qty: qty,
  };

  console.log(payload);

  //Ambil base url
  const baseUrl = localStorage.getItem('base_url_api');

  //Hit api checkout
  fetch(baseUrl + '/checkout/create_checkout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        console.log('Respons Data', data);
        showNotification('Checkout Berhasil', (type = 'success'));

        // Simpan order_id untuk payment page
        localStorage.setItem('bp_pending_order_id', data.data.no_invoice);

        // Simpan notifikasi pembayaran pending
        const invId = data.data.no_invoice;
        const pendingNotifs = JSON.parse(localStorage.getItem('bp_notifications') || '[]');
        const notifId = `pending_${invId}`;
        if (!pendingNotifs.find((n) => n.id === notifId)) {
          pendingNotifs.unshift({
            id: notifId,
            type: 'warning',
            title: 'Pembayaran Belum Diselesaikan',
            desc: `Invoice <strong>${invId}</strong> sebesar <strong>Rp ${Number(data.data.amount).toLocaleString('id-ID')}</strong> menunggu pembayaran Anda.`,
            time: new Date().getTime(),
            read: false,
          });
          localStorage.setItem('bp_notifications', JSON.stringify(pendingNotifs));
        }

        //Mengembalikan Nilai button
        btn.innerHTML = 'Bayar Sekarang';
        btn.disabled = false;

        setTimeout(() => {
          window.location.href = '/payment';
        }, 1000);
      } else {
        showNotification(data.message, 'error');
        //Mengembalikan Nilai button
        btn.innerHTML = 'Bayar Sekarang';
        btn.disabled = false;
      }
    })
    .catch((error) => console.error('Gagal checkout:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  loadCustomerData();
  renderCheckoutItems();
  loadUpsellProducts();
});
