// ══════════════════════════════════════════
//  CART HELPERS
// ══════════════════════════════════════════

//Ambil baseURL
const CART_KEY = "bp_cart";

// ── Global product cache (diisi setelah fetch) ──
let allProducts = [];


function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart(cart);
    updateCartBadge();
    renderCartSidebar();
    openCartSidebar();
}

function updateCartBadge() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    const badge = document.getElementById("cart-badge");
    if (!badge) return;

    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? "flex" : "none";
}

// ══════════════════════════════════════════
//  CART SIDEBAR
// ══════════════════════════════════════════

function openCartSidebar() {
    document.getElementById("cart-sidebar").classList.add("open");
    document.getElementById("cart-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeCartSidebar() {
    document.getElementById("cart-sidebar").classList.remove("open");
    document.getElementById("cart-overlay").classList.remove("open");
    document.body.style.overflow = "";
}

function renderCartSidebar() {
    const cart = getCart();
    const body = document.getElementById("cart-sidebar-body");
    const footer = document.getElementById("cart-sidebar-footer");
    const subtotalEl = document.getElementById("cart-subtotal-value");

    body.innerHTML = "";

    if (cart.length === 0) {
        footer.style.display = "none";
        body.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                <span>Keranjang masih kosong</span>
            </div>
        `;
        return;
    }

    // Render items
    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = item.id;

        const subtotalItem = Number(item.price) * item.qty;

        row.innerHTML = `
            <img class="cart-item-img"
                 src="${item.image || 'https://placehold.co/64x48?text=No+Img'}"
                 alt="${item.product_name}" />
            <div class="cart-item-info">
                <div class="cart-item-name">${item.product_name}</div>
                <div class="cart-item-type">${item.type || 'Online Course'}</div>
                <div class="cart-item-price">Rp ${subtotalItem.toLocaleString('id-ID')}</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" title="Hapus">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
            </button>
        `;

        // Qty buttons
        row.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                changeQty(id, action);
            });
        });

        // Remove button
        row.querySelector(".cart-item-remove").addEventListener("click", () => {
            removeFromCart(item.id);
        });

        body.appendChild(row);
    });

    // Subtotal
    const total = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
    subtotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    footer.style.display = "flex";
}

function changeQty(id, action) {
    const cart = getCart();
    const item = cart.find(i => String(i.id) === String(id));
    if (!item) return;

    if (action === "plus") {
        item.qty += 1;
    } else {
        item.qty -= 1;
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
    }

    saveCart(cart);
    updateCartBadge();
    renderCartSidebar();
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(i => String(i.id) !== String(id));
    saveCart(cart);
    updateCartBadge();
    renderCartSidebar();
}

function initCartSidebar() {
    document.getElementById("cart-open-btn")
        ?.addEventListener("click", () => {
            renderCartSidebar();
            openCartSidebar();
        });

    document.getElementById("cart-close-btn")
        ?.addEventListener("click", closeCartSidebar);

    document.getElementById("cart-overlay")
        ?.addEventListener("click", closeCartSidebar);

    document.getElementById("cart-clear-btn")
        ?.addEventListener("click", () => {
            saveCart([]);
            updateCartBadge();
            renderCartSidebar();
        });

    // Tutup dengan Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeCartSidebar();
    });
}

// ══════════════════════════════════════════
//  AUTH MODAL
// ══════════════════════════════════════════

function initAuthModal() {
    const authOverlay = document.getElementById("auth-overlay");
    const authCloseBtn = document.getElementById("auth-close-btn");
    const btnMasuk = document.getElementById("auth-masuk-btn");
    const btnDaftar = document.getElementById("auth-daftar-btn");
    const loginPanel = document.getElementById("login-panel");
    const registerPanel = document.getElementById("register-panel");
    const switchToLogin = document.getElementById("switch-to-login");
    const switchToRegister = document.getElementById("switch-to-register");

    if (!authOverlay) return;

    function openAuthModal(mode) {
        authOverlay.classList.add("open");
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden"; // Lock both for better mobile support

        if (mode === 'login') {
            loginPanel.classList.add("active");
            registerPanel.classList.remove("active");
        } else {
            registerPanel.classList.add("active");
            loginPanel.classList.remove("active");
        }
    }

    function closeAuthModal() {
        authOverlay.classList.remove("open");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }

    btnMasuk?.addEventListener("click", (e) => {
        e.preventDefault();
        openAuthModal('login');
    });

    btnDaftar?.addEventListener("click", (e) => {
        e.preventDefault();
        openAuthModal('register');
    });

    authCloseBtn?.addEventListener("click", closeAuthModal);

    authOverlay?.addEventListener("click", (e) => {
        if (e.target === authOverlay) {
            closeAuthModal();
        }
    });

    switchToLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        openAuthModal('login');
    });

    switchToRegister?.addEventListener("click", (e) => {
        e.preventDefault();
        openAuthModal('register');
    });

    return {
        closeAuthModal
    }
}

//  NOTIFICATION
function showNotification(message, type = 'success') {
    const container = document.getElementById('toast-container');

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

//  GET & RENDER PRODUCTS

// Fallback thumbnail — displayed when a product has no image
const FALLBACK_THUMB = '/assets/images/thumbnails/thumb_default.png';

function get_products() {
    //Ambil base url
    const baseUrl = localStorage.getItem("base_url_api");
    const container = document.getElementById("product-container");

    // Skeleton Loading Inject
    if (container) {
        if (!document.getElementById("skeleton-style")) {
            const style = document.createElement("style");
            style.id = "skeleton-style";
            style.innerHTML = `
                @keyframes shimmer {
                    0% { background-position: -468px 0; }
                    100% { background-position: 468px 0; }
                }
                .skeleton-box {
                    background: #f6f7f8;
                    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                    background-repeat: no-repeat;
                    background-size: 800px 100%;
                    animation-duration: 1.5s;
                    animation-fill-mode: forwards;
                    animation-iteration-count: infinite;
                    animation-name: shimmer;
                    animation-timing-function: linear;
                }
            `;
            document.head.appendChild(style);
        }

        container.innerHTML = Array(8).fill(`
            <div class="product-card" style="box-shadow: none; border-color: var(--gray-200); animation: none; opacity: 1; transform: none;">
                <div class="card-img-wrap skeleton-box"></div>
                <div class="card-body">
                    <div class="skeleton-box" style="height: 18px; width: 80%; margin-bottom: 6px; border-radius: 4px;"></div>
                    <div class="skeleton-box" style="height: 12px; width: 60%; margin-bottom: 6px; border-radius: 4px;"></div>
                    <div class="skeleton-box" style="height: 12px; width: 40%; margin-top: 2px; border-radius: 4px;"></div>
                    <div class="skeleton-box" style="height: 20px; width: 50%; margin-top: 10px; border-radius: 4px;"></div>
                    <div class="card-actions" style="margin-top: auto; padding-top: 10px;">
                        <div class="skeleton-box" style="flex: 1; height: 34px; border-radius: 6px;"></div>
                        <div class="skeleton-box" style="width: 34px; height: 34px; border-radius: 6px;"></div>
                    </div>
                </div>
            </div>
        `).join("");
    }

    fetch(baseUrl + "/get_products", {
        method: 'GET',
        credentials: 'include',
        mode: "cors",
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            allProducts = data.data || [];
            applyFilters();
            updateCartBadge();
        })
        .catch(error => console.error('Gagal mengambil produk:', error));
}

// ══════════════════════════════════════════
//  RENDER CARDS
// ══════════════════════════════════════════
function renderProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    const productLength = document.getElementById('total-product');

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--gray-400);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="margin-bottom:12px;opacity:.4;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <div style="font-size:15px;font-weight:600;margin-bottom:4px;">Produk tidak ditemukan</div>
                <div style="font-size:13px;">Coba ubah kata kunci atau filter pencarian</div>
            </div>
        `;
        if (productLength) productLength.innerHTML = '0 Produk Tersedia';
        return;
    }

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.setProperty('--i', index);

        const thumb = product.image || '';

        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="${thumb}" alt="${product.product_name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                <div class="card-img-placeholder" style="display:none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                </div>
            </div>
            <div class="card-body">
                <div class="card-name">${product.product_name}</div>
                <div class="card-subtitle">${product.description || ''}</div>
                <div class="card-color">${product.type || ''}</div>
                <div class="card-price-row">
                    <span class="card-price">Rp ${Number(product.price).toLocaleString('id-ID')}</span>
                </div>
                <div class="card-actions">
                    <a href="/products/${product.id}" class="btn-beli">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <span>Beli</span>
                    </a>
                    <button class="btn-keranjang" title="Tambah ke keranjang">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.btn-keranjang').addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product);
        });

        card.querySelector('.btn-beli').addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product);
        });

        container.appendChild(card);
    });

    if (productLength) productLength.innerHTML = products.length + ' Produk Tersedia';
}

// ══════════════════════════════════════════
//  FILTER ENGINE (Kategori + Tingkat + Search + Sort)
// ══════════════════════════════════════════
function applyFilters() {
    const searchTerm = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    const sortValue  = document.querySelector('.sort-select')?.value || 'Terbaru';

    // ── Kategori ──
    const kategoriChecks = document.querySelectorAll('#sidebar-filter .kategori-check');
    const selectedKategori = [];
    let semuaKategori = false;
    kategoriChecks.forEach(cb => {
        if (!cb.checked) return;
        if (cb.dataset.value === 'semua') semuaKategori = true;
        else selectedKategori.push(cb.dataset.value.toLowerCase());
    });

    // ── Tingkat ──
    const tingkatChecks = document.querySelectorAll('#sidebar-filter .tingkat-check');
    const selectedTingkat = [];
    let semuaTingkat = false;
    tingkatChecks.forEach(cb => {
        if (!cb.checked) return;
        if (cb.dataset.value === 'semua') semuaTingkat = true;
        else selectedTingkat.push(cb.dataset.value.toLowerCase());
    });

    // ── Filter produk ──
    let result = allProducts.filter(p => {
        // Search
        if (searchTerm) {
            const name  = (p.product_name || '').toLowerCase();
            const desc  = (p.description  || '').toLowerCase();
            const type  = (p.type         || '').toLowerCase();
            if (!name.includes(searchTerm) && !desc.includes(searchTerm) && !type.includes(searchTerm)) return false;
        }

        // Kategori
        if (!semuaKategori && selectedKategori.length > 0) {
            const pType = (p.type || '').toLowerCase();
            if (!selectedKategori.some(k => pType.includes(k))) return false;
        }

        // Tingkat (field level/difficulty)
        if (!semuaTingkat && selectedTingkat.length > 0) {
            const pLevel = (p.level || p.difficulty || '').toLowerCase();
            if (!selectedTingkat.some(t => pLevel.includes(t))) return false;
        }

        return true;
    });

    // ── Sort ──
    switch (sortValue) {
        case 'Harga: Rendah ke Tinggi':
            result.sort((a, b) => Number(a.price) - Number(b.price));
            break;
        case 'Harga: Tinggi ke Rendah':
            result.sort((a, b) => Number(b.price) - Number(a.price));
            break;
        case 'Nama: A\u2013Z':
            result.sort((a, b) => (a.product_name || '').localeCompare(b.product_name || '', 'id'));
            break;
        case 'Paling Populer':
            result.sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0));
            break;
        default: break;
    }

    renderProducts(result);
    updateActiveFilterBadge();
}

// ── Badge jumlah filter aktif di tombol Filter ──
function updateActiveFilterBadge() {
    const btn = document.getElementById('filter-open-btn');
    if (!btn) return;

    let count = 0;
    document.querySelectorAll('#sidebar-filter .kategori-check:not([data-value="semua"])').forEach(cb => { if (cb.checked) count++; });
    document.querySelectorAll('#sidebar-filter .tingkat-check:not([data-value="semua"])').forEach(cb => { if (cb.checked) count++; });

    // Hapus badge lama jika ada
    btn.querySelector('.filter-active-badge')?.remove();

    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'filter-active-badge';
        badge.textContent = count;
        badge.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;background:var(--black);color:var(--white);border-radius:50%;font-size:10px;font-weight:700;margin-left:4px;';
        btn.appendChild(badge);
    }
}



const authModal = initAuthModal();

//Menerima data dari google login
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
if (token) {
    localStorage.setItem("token", token);
    authModal.closeAuthModal();
    showNotification("Login berhasil", 'success');
}

// Google login 
async function googleLogin() {
    // Menambil 'code' dari URL (?code=xyz...)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
        authModal.closeAuthModal();
        showNotification("Kode autentikasi tidak ditemukan!", 'error');
        window.location.href = '/index.html';
        return;
    }

    try {
        // Kirim ke backend menggunakan fetch
        const response = await fetch(`https://6c3f-180-254-113-31.ngrok-free.app/callback_auth?code=${code}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (result.status === "success") {
            console.log("Login Berhasil, mengalihkan...");
            //Redirect ke halaman products
            window.location.href = '/index.html';
            showNotification("Login Google Berhasil", 'success');
        } else {
            alert("Login Gagal: " + result.message);
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        alert("Gagal menghubungi server.");
    }
}

// Confirm Modal function
function showConfirmModal(message, title = "Konfirmasi") {
    return new Promise((resolve) => {
        const overlay = document.getElementById("confirm-overlay");
        const titleEl = document.getElementById("confirm-title");
        const messageEl = document.getElementById("confirm-message");
        const cancelBtn = document.getElementById("confirm-cancel-btn");
        const okBtn = document.getElementById("confirm-ok-btn");

        if (!overlay) return resolve(confirm(message));

        titleEl.textContent = title;
        messageEl.textContent = message;

        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        function cleanup() {
            overlay.classList.remove("open");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            cancelBtn.removeEventListener("click", onCancel);
            okBtn.removeEventListener("click", onOk);
        }

        function onCancel() {
            cleanup();
            resolve(false);
        }

        function onOk() {
            cleanup();
            resolve(true);
        }

        cancelBtn.addEventListener("click", onCancel);
        okBtn.addEventListener("click", onOk);
    });
}

//logout
async function logout() {
    //Konfirmasi logout
    const isConfirmed = await showConfirmModal("Apakah Anda yakin ingin logout?");
    if (!isConfirmed) {
        return;
    }

    //Check apakah user sudah login
    if (!localStorage.getItem("bp_username")) {
        showNotification("Anda belum login", 'error');
        return;
    }

    //Ambil base url 
    const baseUrl = localStorage.getItem("base_url_api");

    fetch(baseUrl + "/logout", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                localStorage.removeItem("bp_username");
                showNotification(data.message, 'success');
                updateUI(null);
                get_products();
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => console.error('Gagal logout:', error));
}

// ══════════════════════════════════════════
//  NOTIFICATION SYSTEM
// ══════════════════════════════════════════

// //fetch data dari backend
// const NOTIF_KEY = fetch(baseUrl + "/get_notifications", {
//     method: "GET",
//     credentials: "include",
//     headers: {
//         "Content-Type": "application/json"
//     }
// })
//     .then(response => response.json())
//     .then(data => {
//         if (data.code === 200) {
//             return data.data;
//         } else {
//             return [];
//         }
//     })
//     .catch(error => console.error('Gagal fetch notifications:', error));

let currentNotifTab = 'transaksi';
const NOTIF_KEY = 'bp_notifs';

function getNotifications() {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
}

function saveNotifications(notifs) {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

function addNotification(notif) {
    const notifs = getNotifications();
    // Avoid duplicate by checking id
    if (notif.id && notifs.find(n => n.id === notif.id)) return;
    notifs.unshift({
        id: notif.id || Date.now().toString(),
        type: notif.type || 'warning', // 'warning', 'danger', 'success'
        title: notif.title || 'Notifikasi',
        desc: notif.desc || '',
        time: notif.time || new Date().toISOString(),
        read: false
    });
    saveNotifications(notifs);
    updateNotifBadge();
    renderNotifDropdown();
}

function removeNotification(id) {
    let notifs = getNotifications();
    notifs = notifs.filter(n => n.id !== id);
    saveNotifications(notifs);
    updateNotifBadge();
    renderNotifDropdown();
}

function markAllRead() {
    const notifs = getNotifications();
    notifs.forEach(n => n.read = true);
    saveNotifications(notifs);
    updateNotifBadge();
    renderNotifDropdown();
}

function updateNotifBadge() {
    const notifs = getNotifications();
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById("notif-badge");
    const countLabel = document.getElementById("notif-count-label");

    if (!badge) return;

    badge.textContent = unread;
    if (unread > 0) {
        badge.style.display = "flex";
        badge.classList.add("pulse");
    } else {
        badge.style.display = "none";
        badge.classList.remove("pulse");
    }

    if (countLabel) {
        countLabel.textContent = `${unread} baru`;
    }
}

function switchNotifTab(target) {
    currentNotifTab = target;
    document.querySelectorAll('.notif-tab').forEach(btn => {
        if (btn.dataset.target === target) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderNotifDropdown();
}

function renderNotifDropdown() {
    const body = document.getElementById("notif-dropdown-body");
    if (!body) return;

    let notifs = getNotifications();

    if (currentNotifTab === 'transaksi') {
        notifs = notifs.filter(n => ['warning', 'danger', 'success', 'transaction'].includes(n.type));
    } else {
        notifs = notifs.filter(n => ['message', 'info'].includes(n.type));
    }

    if (notifs.length === 0) {
        body.innerHTML = `
            <div class="notif-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span>Belum ada notifikasi</span>
            </div>
        `;
        return;
    }

    body.innerHTML = "";
    notifs.forEach(notif => {
        const item = document.createElement("div");
        item.className = "notif-item";
        if (!notif.read) {
            item.style.borderLeft = "3px solid #e11d48";
        }

        // Format relative time
        const timeAgo = getRelativeTime(new Date(notif.time));

        // Choose icon based on type
        let iconSvg = '';
        if (notif.type === 'warning') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        } else if (notif.type === 'danger') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        }

        item.innerHTML = `
            <div class="notif-item-icon ${notif.type}">
                ${iconSvg}
            </div>
            <div class="notif-item-content">
                <div class="notif-item-title">${notif.title}</div>
                <div class="notif-item-desc">${notif.desc}</div>
                <div class="notif-item-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${timeAgo}
                </div>
            </div>
        `;

        // Mark as read on click
        item.addEventListener("click", () => {
            const allNotifs = getNotifications();
            const found = allNotifs.find(n => n.id === notif.id);
            if (found) {
                found.read = true;
                saveNotifications(allNotifs);
                updateNotifBadge();
                renderNotifDropdown();
            }
        });

        body.appendChild(item);
    });
}

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHr < 24) return `${diffHr} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function openNotifDropdown() {
    const dropdown = document.getElementById("notif-dropdown");
    const overlay = document.getElementById("notif-overlay");
    if (dropdown) dropdown.classList.add("open");
    if (overlay) overlay.classList.add("open");
}

function closeNotifDropdown() {
    const dropdown = document.getElementById("notif-dropdown");
    const overlay = document.getElementById("notif-overlay");
    if (dropdown) dropdown.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
}

// async function checkPendingPayments() {
//     // Check pending payments from backend API
//     const baseUrl = localStorage.getItem("base_url_api") || "http://localhost:3000";
//     try {
//         const response = await fetch(baseUrl + "/get_order_notification", {
//             method: "GET",
//             credentials: "include",
//             headers: { "Content-Type": "application/json" }
//         });

//         const result = await response.json();
//         if (result.code === 200 && result.data && result.data.length > 0) {
//             result.data.forEach(inv => {
//                 const amount = inv.amount || 0;
//                 const invoiceId = inv.invoice_id || "N/A";
//                 const expiresAt = inv.expires_at ? new Date(inv.expires_at) : null;
//                 const now = new Date();

//                 let notifType = 'warning';
//                 let expiryText = '';
//                 if (expiresAt) {
//                     const hoursLeft = (expiresAt - now) / (1000 * 60 * 60);
//                     if (hoursLeft <= 0) {
//                         notifType = 'danger';
//                         expiryText = 'Pembayaran sudah <strong>melewati batas waktu</strong>.';
//                     } else if (hoursLeft <= 6) {
//                         notifType = 'danger';
//                         expiryText = `Sisa waktu pembayaran: <strong>${Math.ceil(hoursLeft)} jam lagi</strong>`;
//                     } else {
//                         expiryText = `Batas waktu: <strong>${expiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${expiresAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong>`;
//                     }
//                 }

//                 // Add to local storage if it doesn't exist
//                 addNotification({
//                     id: `pending_${invoiceId}`,
//                     type: notifType,
//                     title: 'Pembayaran Belum Diselesaikan',
//                     desc: `Invoice <strong>${invoiceId}</strong> sebesar <strong>Rp ${Number(amount).toLocaleString('id-ID')}</strong> menunggu pembayaran. ${expiryText}`,
//                     time: inv.timestamp ? new Date(inv.timestamp).toISOString() : new Date().toISOString()
//                 });
//             });
//         }
//     } catch (e) {
//         console.error('Error fetching pending orders for notifications:', e);
//     }
// }

function initNotificationSystem() {
    const toggleBtn = document.getElementById("notif-toggle-btn");
    const overlay = document.getElementById("notif-overlay");
    const clearAllBtn = document.getElementById("notif-clear-all");

    toggleBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById("notif-dropdown");
        if (dropdown?.classList.contains("open")) {
            closeNotifDropdown();
        } else {
            openNotifDropdown();
            // checkPendingPayments(); // Refresh data from API when opened
        }
    });

    const tabs = document.querySelectorAll('.notif-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            switchNotifTab(e.target.dataset.target);
        });
    });

    overlay?.addEventListener("click", closeNotifDropdown);

    clearAllBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        markAllRead();
        showNotification("Semua notifikasi ditandai sudah dibaca", "info");
    });

    // Close with Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNotifDropdown();
    });

    // Check for pending payments and generate notifications on init as well
    // checkPendingPayments();

    // Initial render
    updateNotifBadge();
    renderNotifDropdown();
}

function initProductSearch() {
    const searchInput = document.getElementById('product-search');
    if (!searchInput) return;
    // Setiap keystroke → re-filter semua produk
    searchInput.addEventListener('input', () => applyFilters());
}

// ══════════════════════════════════════════
//  SIDEBAR FILTER INIT
// ══════════════════════════════════════════
function initSidebarFilter() {
    // ── Kategori: Semua / individual ──
    const kategoriSemua = document.querySelector('#sidebar-filter .kategori-check[data-value="semua"]');
    const kategoriItems  = document.querySelectorAll('#sidebar-filter .kategori-check:not([data-value="semua"])');

    if (kategoriSemua) {
        // Klik "Semua" → uncheck semua item individual
        kategoriSemua.addEventListener('change', () => {
            if (kategoriSemua.checked) {
                kategoriItems.forEach(cb => { cb.checked = false; });
            }
            applyFilters();
        });

        // Klik item individual → uncheck "Semua"
        kategoriItems.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) kategoriSemua.checked = false;
                // Jika tidak ada yg dicentang → fallback ke "Semua"
                const anyChecked = [...kategoriItems].some(c => c.checked);
                if (!anyChecked) kategoriSemua.checked = true;
                applyFilters();
            });
        });
    }

    // ── Tingkat: Semua / individual ──
    const tingkatSemua = document.querySelector('#sidebar-filter .tingkat-check[data-value="semua"]');
    const tingkatItems  = document.querySelectorAll('#sidebar-filter .tingkat-check:not([data-value="semua"])');

    if (tingkatSemua) {
        tingkatSemua.addEventListener('change', () => {
            if (tingkatSemua.checked) {
                tingkatItems.forEach(cb => { cb.checked = false; });
            }
            applyFilters();
        });

        tingkatItems.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) tingkatSemua.checked = false;
                const anyChecked = [...tingkatItems].some(c => c.checked);
                if (!anyChecked) tingkatSemua.checked = true;
                applyFilters();
            });
        });
    }

    // ── Tombol Reset ──
    document.getElementById('sidebar-reset-btn')?.addEventListener('click', () => {
        if (kategoriSemua) kategoriSemua.checked = true;
        kategoriItems.forEach(cb => { cb.checked = false; });
        if (tingkatSemua)  tingkatSemua.checked  = true;
        tingkatItems.forEach(cb => { cb.checked = false; });
        const searchInput = document.getElementById('product-search');
        if (searchInput) searchInput.value = '';
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) sortSelect.value = 'Terbaru';
        applyFilters();
    });
}

//  INIT
document.addEventListener("DOMContentLoaded", () => {
    get_products();
    initCartSidebar();
    initAuthModal();
    initNotificationSystem();
    initProductSearch();
    initSidebarFilter();

    // Sort dropdown → re-filter
    document.querySelector('.sort-select')?.addEventListener('change', () => applyFilters());

    // googleLogin();
});

