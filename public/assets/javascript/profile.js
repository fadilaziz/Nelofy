//Check Auth
// function checkAuth() {
//   try {
//     const response = fetch(`/users/get_current_user`);

//     if (response.message == 'Unauthorized') {
//       window.location.href = '/';
//     }
//   } catch (error) {
//     window.location.href = '/';
//   }
// }
// checkAuth();

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

/* ── Help Modal ── */
function openHelpModal(e) {
  e && e.preventDefault();
  document.getElementById('help-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

function closeHelpModal() {
  document.getElementById('help-overlay').classList.remove('open');
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}
function closeHelpModalOnBackdrop(e) {
  if (e.target === document.getElementById('help-overlay')) closeHelpModal();
}
/* Close on Escape */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeHelpModal();
    closeForgotPasswordModal();
  }
});
/* FAQ accordion */
function toggleFaq(btn) {
  const item = btn.closest('.help-faq-item');
  const isOpen = item.classList.contains('open');
  /* Close all */
  document.querySelectorAll('.help-faq-item.open').forEach((el) => el.classList.remove('open'));
  /* Open clicked (unless it was already open) */
  if (!isOpen) item.classList.add('open');
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
let globalUserData = null;
let globalTransactionData = [];
let globalRiwayatData = [];

window.openEditProfileModal = function () {
  if (!globalUserData) return;
  document.getElementById('edit-username').value = globalUserData.username || '';
  document.getElementById('edit-email').value = globalUserData.user_email || '';
  document.getElementById('edit-phone').value = globalUserData.user_phone || '';

  const modal = document.getElementById('edit-profile-modal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

window.closeEditProfileModal = function () {
  const modal = document.getElementById('edit-profile-modal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
};

window.openDetailTransaksiModal = function (noInvoice) {
  let tx = (globalTransactionData || []).find((t) => t.no_invoice === noInvoice);
  if (!tx && globalRiwayatData) {
    tx = globalRiwayatData.find((t) => t.no_invoice === noInvoice);
  }
  if (!tx) return;

  const modal = document.getElementById('detail-transaksi-modal');
  const body = document.getElementById('detail-transaksi-body');
  if (!modal || !body) return;

  const dt = new Date(tx.invoice_created_at).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const product_name = tx.product_name || 'Paket Kursus Nelofy Premium';
  const product_price = tx.product_price || tx.total_amount || 0;
  const total_amount = tx.total_amount || product_price || 0;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const currentStatus = (tx.invoice_status || '').toLowerCase();
  const isPending = currentStatus === 'pending' || currentStatus === 'unpaid';
  const isPaid = currentStatus === 'paid' || currentStatus === 'success';
  const isExpired = currentStatus === 'expired' || currentStatus === 'ex';

  let statusBg = '#dcfce7';
  let statusColor = '#166534';
  let statusLabel = 'LUNAS';

  if (isPending) {
    statusBg = '#fef3c7';
    statusColor = '#92400e';
    statusLabel = 'BELUM BAYAR';
  } else if (isExpired) {
    statusBg = '#fee2e2';
    statusColor = '#991b1b';
    statusLabel = 'KEDALUWARSA';
  }

  let actionButtonHtml = '';
  if (isPending) {
    actionButtonHtml = `<a href="/payment?order_id=${tx.order_id}" style="display: block; width: 100%; text-align: center; padding: 12px; background: var(--black); color: var(--white); border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Bayar Sekarang</a>`;
  } else if (isPaid) {
    actionButtonHtml = `<a href="/products" style="display: block; width: 100%; text-align: center; padding: 12px; background: var(--gray-100); color: var(--black); border: 1px solid var(--gray-300); border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin-top: 24px; transition: 0.2s;">Mulai Belajar</a>`;
  }

  // Header dengan Badge Status
  body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px;">

          <!-- Top Area: Invoice & Status -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--gray-200); padding-bottom: 20px;">
            <div>
              <div style="font-size: 11px; letter-spacing: 0.5px; color: var(--gray-500); font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Detail Pesanan</div>
              <div style="font-size: 20px; font-weight: 800; color: var(--black); letter-spacing: -0.5px;">${tx.no_invoice}</div>
              <div style="font-size: 13px; color: var(--gray-500); margin-top: 8px; display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${dt}
              </div>
            </div>
            <div style="padding: 6px 12px; margin-top:18px; border-radius: 8px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 12px; box-shadow: 0 2px 8px ${statusColor}20;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor};"></div>
              ${statusLabel}
            </div>
          </div>

          <!-- Product Card Area -->
          <div>
            <h4 style="font-size: 14px; font-weight: 700; color: var(--black); margin-bottom: 12px;">Produk yang Dibeli</h4>
            <div style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 16px; display: flex; gap: 16px; align-items: center; background: #fafafa; transition: background 0.2s;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--gray-200) 0%, var(--gray-300) 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 15px; color: var(--black); margin-bottom: 4px; line-height: 1.3;">${product_name}</div>
                <div style="font-size: 12.5px; color: var(--gray-500);">Akses Kelas & Modul Digital Lengkap</div>
              </div>
              <div style="font-weight: 700; font-size: 15px; color: var(--black); text-align: right;">${formatRupiah(product_price)}</div>
            </div>
          </div>

          <!-- Payment Summary Receipt -->
          <div style="background: var(--white); border: 1px solid var(--gray-200); border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--black); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Rincian Pembayaran
            </h4>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                <span style="color: var(--gray-500);">Order ID</span>
                <span style="color: var(--black); font-weight: 600;">#${tx.order_id}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                <span style="color: var(--gray-500);">Harga Produk</span>
                <span style="color: var(--black); font-weight: 600;">${formatRupiah(product_price)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                <span style="color: var(--gray-500);">Biaya Layanan</span>
                <span style="color: var(--green); font-weight: 600;">Gratis</span>
              </div>
            </div>

            <div style="border-top: 2px dashed var(--gray-200); margin: 16px 0;"></div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--black); font-size: 14px; font-weight: 700;">Total Pembayaran</span>
              <span style="color: var(--black); font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${formatRupiah(total_amount)}</span>
            </div>
          </div>

          <!-- Actions -->
          <div style="margin-top: 8px;">
            ${actionButtonHtml}
          </div>
        </div>
      `;

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

window.closeDetailTransaksiModal = function () {
  const modal = document.getElementById('detail-transaksi-modal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = '';
};

window.submitEditProfile = function () {
  // TODO: Submit API request to update profile
  alert('Update profile: Fitur segera hadir!');
  closeEditProfileModal();
};

window.openChangePasswordModal = function () {
  if (!globalUserData) return;
  document.getElementById('reset-password-email').textContent = globalUserData.email || '-';
  const modal = document.getElementById('change-password-modal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

window.closeChangePasswordModal = function () {
  const modal = document.getElementById('change-password-modal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
};

window.submitChangePassword = async function () {
  // Dapatkan spesifik tombol dalam modal ganti password
  const modal = document.getElementById('change-password-modal');
  const btn = modal.querySelector('.btn-submit');

  // Simpan teks asli dan ubah ke state Loading SEBELUM fetch dimulai
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Loading...';
  btn.disabled = true;

  try {
    // Ambil base url dari localstorage
    const baseUrl = localStorage.getItem('base_url_api');

    // Ambil Email yang sebelumnya sudah di dapat dari fetch
    const email = globalUserData.email;

    // Kirim request API reset password
    const response = await fetch(`${baseUrl}/password/request_change_password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      showNotification('Link reset password berhasil dikirim!', 'success');
      closeChangePasswordModal();
    } else {
      showNotification('Gagal mengirim: ' + (data.message || 'Terjadi kesalahan'), 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Terjadi kesalahan jaringan.', 'error');
  } finally {
    // Kembalikan state tombol setelah selesai
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
};

window.logoutUser = async function () {
  const isConfirmed = await showConfirmModal('Apakah Anda yakin ingin keluar?');
  if (!isConfirmed) return;

  try {
    const baseUrl = localStorage.getItem('base_url_api');

    // Opsional: panggil API logout jika ada endpointnya
    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Hapus data dari local storage
    localStorage.clear();

    // Arahkan ke halaman login
    window.location.href = '/';
  } catch (error) {
    // Tetap paksa logout di sisi client
    localStorage.clear();
    window.location.href = '/';
  }
};

// ── Populate Navbar Profile Chip dari localStorage ──
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

// Menutup sidebar otomatis setelah klik di mobile
function closeSidebar() {
  document.getElementById('profile-sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
}

// Set Menu yang Aktif
function setActiveSidebar(index) {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach((l) => l.classList.remove('active'));
  if (links[index]) links[index].classList.add('active');
  closeSidebar();
}

// Render Main Profile
window.renderProfile = function () {
  setActiveSidebar(0);
  const mainbox = document.getElementById('profile-main');

  const mobileTitle = document.getElementById('mobile-header-title');
  if (mobileTitle) mobileTitle.textContent = 'Profil Saya';

  if (!globalUserData) {
    mainbox.innerHTML = `
          <div class="profile-card fade-in-up" id="profile-container" style="padding: 32px;">
            <div class="profile-header" style="display: flex; align-items: center; gap: 20px; margin-bottom: 32px;">
              <div class="skeleton-pulse skeleton-avatar"></div>
              <div style="flex: 1;">
                <div class="skeleton-pulse skeleton-title"></div>
                <div class="skeleton-pulse skeleton-text"></div>
              </div>
            </div>
            <div class="profile-body">
              <div class="data-group">
                <div class="skeleton-pulse" style="height: 18px; width: 150px; margin-bottom: 16px; border-radius: 4px;"></div>
                <div class="data-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
                  <div class="data-item">
                    <div class="skeleton-pulse skeleton-label"></div>
                    <div class="skeleton-pulse skeleton-value"></div>
                  </div>
                  <div class="data-item">
                    <div class="skeleton-pulse skeleton-label"></div>
                    <div class="skeleton-pulse skeleton-value"></div>
                  </div>
                  <div class="data-item">
                    <div class="skeleton-pulse skeleton-label"></div>
                    <div class="skeleton-pulse skeleton-value"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
    return;
  }

  const data = globalUserData;
  const initial = data.username ? data.username.charAt(0).toUpperCase() : 'U';

  mainbox.innerHTML = `
        <div class="profile-card fade-in-up" id="profile-container">
          <div class="profile-header">
            <div class="profile-avatar" id="avatar-initial">${initial}</div>
            <div class="profile-title">
              <h2 id="header-name">${data.username || 'Guest'}</h2>
              <p id="header-email">${data.email || '-'}</p>
            </div>
          </div>

          <div class="profile-body">
            <div class="data-group">
              <h3>Informasi Pribadi</h3>
              <div class="data-grid">
                <div class="data-item">
                  <span class="data-label">Username</span>
                  <span class="data-value">${data.username || '-'}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Email</span>
                  <span class="data-value">${data.email || '-'}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">No. Telepon</span>
                  <span class="data-value">${data.phone || '-'}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Password</span>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="data-value">********</span>
                    <button class="change-password-btn" onclick="openChangePasswordModal()">Ganti Password</button>
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-top: 32px; border-top: 1px solid var(--gray-200); padding-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
              <button class="logout-main-btn" onclick="logoutUser()">Logout</button>
              <button class="edit-profile-main-btn" onclick="openEditProfileModal()">Edit Profile</button>
            </div>
          </div>
        </div>
      `;
};

// Render Riwayat Pembelian
window.renderRiwayat = function () {
  setActiveSidebar(1);
  const mainbox = document.getElementById('profile-main');

  const mobileTitle = document.getElementById('mobile-header-title');
  if (mobileTitle) mobileTitle.textContent = 'Riwayat Pembelian';

  if (globalRiwayatData) {
    localStorage.setItem('riwayat_count', globalRiwayatData.length);
  }
  const badgeRiwayat = document.getElementById('badge-riwayat');
  if (badgeRiwayat) badgeRiwayat.style.display = 'none';

  const data = globalRiwayatData;

  if (data === null) {
    mainbox.innerHTML = `
          <div class="profile-card fade-in-up" style="padding: 32px;">
            <div class="skeleton-pulse" style="height: 24px; width: 160px; margin-bottom: 24px; border-radius: 4px;"></div>

            <div class="filter-wrapper" style="display: flex; gap: 12px; margin-bottom: 20px;">
              <div class="skeleton-pulse" style="height: 42px; flex: 1; border-radius: 8px;"></div>
              <div class="skeleton-pulse" style="height: 42px; width: 150px; border-radius: 8px;"></div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
              <div class="skeleton-pulse" style="height: 38px; width: 100%; border-radius: 6px;"></div>
              <div class="skeleton-pulse" style="height: 48px; width: 100%; border-radius: 6px;"></div>
              <div class="skeleton-pulse" style="height: 48px; width: 100%; border-radius: 6px;"></div>
              <div class="skeleton-pulse" style="height: 48px; width: 100%; border-radius: 6px;"></div>
            </div>
          </div>
        `;
    return;
  }

  mainbox.innerHTML = `
        <div class="profile-card fade-in-up" style="padding: 32px;">
          <h3 class="desktop-only" style="margin-bottom: 20px;">Riwayat Pembelian</h3>

          <div class="filter-wrapper">
            <div class="search-input-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="riwayat-search" class="search-input-field" placeholder="Cari No. Invoice atau Order ID..." oninput="filterRiwayat(true)">
            </div>

            <select id="riwayat-sort-filter" class="filter-select" onchange="filterRiwayat(true)">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>

          <div id="riwayat-table-container"></div>
        </div>
      `;

  // Initial filter rendering
  window.filterRiwayat();
};

window.currentRiwayatPage = 1;
window.currentTransaksiPage = 1;
window.itemsPerPage = 5;

window.changeRiwayatPage = function (page) {
  window.currentRiwayatPage = page;
  window.filterRiwayat();
};

window.changeTransaksiPage = function (page) {
  window.currentTransaksiPage = page;
  window.filterTransaksi();
};

window.filterRiwayat = function (resetPage = false) {
  if (resetPage) window.currentRiwayatPage = 1;
  const searchVal = document.getElementById('riwayat-search')?.value.toLowerCase().trim() || '';
  const sortVal = document.getElementById('riwayat-sort-filter')?.value || 'newest';
  const tableContainer = document.getElementById('riwayat-table-container');

  if (!tableContainer) return;

  const rawData = globalRiwayatData || [];

  // Filter: only PAID/SUCCESS
  let filtered = rawData.filter((tx) => {
    const currentStatus = (tx.invoice_status || tx.order_status || '').toLowerCase();
    const isPaid = currentStatus === 'paid' || currentStatus === 'success';

    const matchesSearch =
      (tx.no_invoice || '').toLowerCase().includes(searchVal) ||
      (String(tx.order_id) || '').toLowerCase().includes(searchVal) ||
      (String(tx.id) || '').toLowerCase().includes(searchVal);

    return isPaid && matchesSearch;
  });

  // Sort
  filtered.sort((a, b) => {
    const dateA = new Date(a.order_created_at || a.invoice_created_at || 0);
    const dateB = new Date(b.order_created_at || b.invoice_created_at || 0);
    return sortVal === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filtered.length / window.itemsPerPage);
  if (window.currentRiwayatPage > totalPages && totalPages > 0) {
    window.currentRiwayatPage = totalPages;
  }

  const startIdx = (window.currentRiwayatPage - 1) * window.itemsPerPage;
  const endIdx = startIdx + window.itemsPerPage;
  const paginatedData = filtered.slice(startIdx, endIdx);

  // Render table
  if (filtered.length === 0) {
    tableContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px 0; color: var(--gray-400); text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p style="font-size: 14px; font-weight: 500;">Tidak ada riwayat pembelian.</p>
          </div>
        `;
    return;
  }

  let html = `
        <!-- Desktop Layout: Table -->
        <div class="desktop-only table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Nama Produk</th>
                <th>Tanggal Pembayaran</th>
                <th>Status</th>
                <th>Harga</th>
                <th style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
      `;

  let mobileCardsHtml = `
        <!-- Mobile Layout: Cards -->
        <div class="mobile-only" style="width: 100%;">
      `;

  paginatedData.forEach((tx) => {
    const dt = new Date(tx.order_created_at || tx.invoice_created_at).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    html += `
          <tr>
            <td style="font-weight: 700; color: var(--black);">
            ${tx.order_id}
            </td>
            <td style="font-weight: 700; color: var(--black);">
            ${tx.product_name}
            </td>
            <td style="color: var(--gray-500);">${dt}</td>
            <td>
              <span style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 99px; background: #dcfce7; color: #166534; border: 1px solid #16653440;">
                LUNAS
              </span>
            </td>
            <td>
            Rp ${Number(tx.total_amount).toLocaleString('id-ID')}
            </td>
            <td style="text-align: right;">
              <div class="btn-action-group">
                <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
                <a href="/products" class="btn-secondary-sm">Buka Kelas</a>
              </div>
            </td>
          </tr>
        `;

    mobileCardsHtml += `
          <div class="transaction-card" style="margin-bottom: 4px;">
            <div class="card-left">
              <div class="invoice-number">${tx.order_id}</div>
              <div class="product-name">${tx.product_name}</div>
              <div class="price-info">Rp ${Number(tx.total_amount).toLocaleString('id-ID')}</div>
            </div>
            <div class="card-right">
              <div class="card-meta">
                <span class="order-date">${dt}</span>
                <span class="status-badge" style="background-color: #dcfce7; color: #166534;">LUNAS</span>
              </div>
              <div class="card-actions">
                <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail-card">Detail</button>
                <a href="/products" class="btn-bayar-card" style="text-decoration: none; text-align: center;">Buka Kelas</a>
              </div>
            </div>
          </div>
        `;
  });

  html += `
            </tbody>
          </table>
        </div>
      `;

  mobileCardsHtml += `
        </div>
      `;

  html = html + mobileCardsHtml;

  if (totalPages > 1) {
    html += `
      <div class="pagination" style="display: flex; justify-content: center; gap: 12px; margin-top: 24px;">
        <button class="btn-secondary-sm" onclick="changeRiwayatPage(${window.currentRiwayatPage - 1})" ${window.currentRiwayatPage === 1 ? 'disabled' : ''} style="${window.currentRiwayatPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">Sebelumnya</button>
        <span style="display: flex; align-items: center; font-size: 14px; font-weight: 500;">Hal ${window.currentRiwayatPage} dari ${totalPages}</span>
        <button class="btn-secondary-sm" onclick="changeRiwayatPage(${window.currentRiwayatPage + 1})" ${window.currentRiwayatPage === totalPages ? 'disabled' : ''} style="${window.currentRiwayatPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}">Selanjutnya</button>
      </div>
    `;
  }

  tableContainer.innerHTML = html;
};

window.renderTransaksi = function () {
  setActiveSidebar(2);
  const mainbox = document.getElementById('profile-main');

  const mobileTitle = document.getElementById('mobile-header-title');
  if (mobileTitle) mobileTitle.textContent = 'Pesanan Saya';

  if (globalTransactionData) {
    localStorage.setItem('pesanan_count', globalTransactionData.length);
  }
  const badgePesanan = document.getElementById('badge-pesanan');
  if (badgePesanan) badgePesanan.style.display = 'none';

  const data = globalTransactionData;

  if (data === null) {
    mainbox.innerHTML = `
          <div class="profile-card fade-in-up" style="padding: 32px;">
            <div class="skeleton-pulse" style="height: 24px; width: 160px; margin-bottom: 24px; border-radius: 4px;"></div>

            <div class="filter-wrapper" style="display: flex; gap: 12px; margin-bottom: 20px;">
              <div class="skeleton-pulse" style="height: 42px; flex: 1; border-radius: 8px;"></div>
              <div class="skeleton-pulse" style="height: 42px; width: 150px; border-radius: 8px;"></div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
              <div class="skeleton-pulse" style="height: 38px; width: 100%; border-radius: 6px;"></div>
              <div class="skeleton-pulse" style="height: 48px; width: 100%; border-radius: 6px;"></div>
              <div class="skeleton-pulse" style="height: 48px; width: 100%; border-radius: 6px;"></div>
              <div class="skeleton-pulse" style="height: 48px; width: 100%; border-radius: 6px;"></div>
            </div>
          </div>
        `;
    return;
  }

  mainbox.innerHTML = `
        <div class="profile-card fade-in-up" style="padding: 32px;">
          <h3 class="desktop-only" style="margin-bottom: 20px;">Pesanan Saya</h3>

          <div class="filter-wrapper">
            <div class="search-input-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="transaksi-search" class="search-input-field" placeholder="Cari No. Invoice atau Order ID..." oninput="filterTransaksi(true)">
            </div>

            <select id="transaksi-status-filter" class="filter-select" onchange="filterTransaksi(true)">
              <option value="all">Semua Status</option>
              <option value="pending">Belum Bayar</option>
              <option value="paid">Lunas</option>
              <option value="ex">Kedaluwarsa</option>
            </select>
          </div>

          <div id="transaksi-table-container"></div>
        </div>
      `;

  // Initial filter rendering
  window.filterTransaksi();
};

window.filterTransaksi = function (resetPage = false) {
  if (resetPage) window.currentTransaksiPage = 1;
  const searchVal = document.getElementById('transaksi-search')?.value.toLowerCase().trim() || '';
  const statusVal = document.getElementById('transaksi-status-filter')?.value || 'all';
  const tableContainer = document.getElementById('transaksi-table-container');

  if (!tableContainer) return;

  const rawData = globalTransactionData || [];

  // Filter and Sort by newest
  const filtered = rawData
    .filter((tx) => {
      const currentStatus = (tx.invoice_status || '').toLowerCase();
      const isPaid = currentStatus === 'paid' || currentStatus === 'success';

      // Hide paid items from "Pesanan Saya" because they go to "Riwayat Pembelian"
      if (isPaid) return false;

      const matchesSearch =
        (tx.no_invoice || '').toLowerCase().includes(searchVal) ||
        (String(tx.order_id) || '').toLowerCase().includes(searchVal);

      let matchesStatus = true;
      if (statusVal === 'pending') {
        matchesStatus = currentStatus === 'pending' || currentStatus === 'unpaid';
      } else if (statusVal === 'ex') {
        matchesStatus = currentStatus === 'expired' || currentStatus === 'ex';
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      return new Date(b.invoice_created_at) - new Date(a.invoice_created_at);
    });

  const totalPages = Math.ceil(filtered.length / window.itemsPerPage);
  if (window.currentTransaksiPage > totalPages && totalPages > 0) {
    window.currentTransaksiPage = totalPages;
  }

  const startIdx = (window.currentTransaksiPage - 1) * window.itemsPerPage;
  const endIdx = startIdx + window.itemsPerPage;
  const paginatedData = filtered.slice(startIdx, endIdx);

  // Render table
  if (filtered.length === 0) {
    tableContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px 0; color: var(--gray-400); text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p style="font-size: 14px; font-weight: 500;">Belum ada pesanan.</p>
          </div>
        `;
    return;
  }

  // Desktop Layout: Table
  let html = `
        <!-- Desktop Layout: Table -->
        <div class="desktop-only table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="text-align: left;">No. Invoice</th>
                <th>Nama Produk</th>
                <th>Status</th>
                <th>Total</th>
                <th>Tanggal Order</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
  `;

  // Mobile Layout: Cards
  let mobileCardsHtml = `
        <!-- Mobile Layout: Cards -->
        <div class="mobile-only" style="width: 100%;">
  `;

  paginatedData.forEach((tx) => {
    const currentStatus = (tx.invoice_status || '').toLowerCase();
    const isPending = currentStatus === 'pending' || currentStatus === 'unpaid';
    const isPaid = currentStatus === 'paid';
    const isExpired = currentStatus === 'expired' || currentStatus === 'ex';

    // Format tanggal pembuatan order (Tanggal Checkout)
    const dt = new Date(tx.invoice_created_at).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Logika warna status
    let statusBg = '#dcfce7';
    let statusColor = '#166534';
    let statusLabel = 'SELESAI';

    if (isPending) {
      statusBg = '#fef3c7';
      statusColor = '#92400e';
      statusLabel = 'PENDING';
    } else if (isExpired) {
      statusBg = '#fee2e2';
      statusColor = '#991b1b';
      statusLabel = 'DIBATALKAN';
    }

    // Tombol aksi dinamis berdasarkan status untuk desktop
    let actionHtml = '';
    if (isPending) {
      actionHtml = `
      <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
      <a style="padding: 6px 14px; background: var(--black); color: var(--white); border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" href="/payment?order_id=${tx.order_id}" class="btn-bayar">Bayar</a>
    `;
    } else if (isPaid) {
      actionHtml = `
      <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
    `;
    } else if (isExpired) {
      actionHtml = `
      <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
    `;
    }

    // Tombol aksi dinamis berdasarkan status untuk mobile
    let actionHtmlMobile = '';
    if (isPending) {
      actionHtmlMobile = `
        <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail-card">Detail</button>
        <a href="/payment?order_id=${tx.order_id}" class="btn-bayar-card" style="text-decoration: none; text-align: center;">Bayar</a>
      `;
    } else {
      actionHtmlMobile = `
        <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail-card-full">Detail</button>
      `;
    }

    // Append desktop rows
    html += `
        <tr>
          <td style="font-weight: 500; font-size: 12px; color: var(--black);">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-family: monospace;">${tx.no_invoice}</span>
              <button onclick="copyInvoice(this, '${tx.no_invoice}')" title="Salin No. Invoice" style="background: none; border: 1px solid var(--gray-200); border-radius: 5px; cursor: pointer; padding: 3px 5px; display: inline-flex; align-items: center; justify-content: center; color: var(--gray-400); transition: all 0.15s; flex-shrink: 0;" onmouseover="this.style.borderColor='var(--gray-400)';this.style.color='var(--black)'" onmouseout="this.style.borderColor='var(--gray-200)';this.style.color='var(--gray-400)'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </td>
          <td style="font-weight: 500; font-size: 12px; color: var(--black); text-align: center;">
          ${tx.product_name || '-'}
          </td>
          <td style="color: var(--gray-500); text-align: center;">
            <span style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 99px; background: ${statusBg}; color: ${statusColor};">
              ${statusLabel}
            </span>
          </td>
          <td style="font-weight: 500; font-size: 11px; color: var(--black); text-align: center;">
          Rp ${Number(tx.total_amount).toLocaleString('id-ID')}
          </td>
          <td style="font-weight: 500; font-size: 11px; color: var(--black); text-align: center;">
            ${dt}
          </td>
          <td>
            <div class="btn-action-group" style="justify-content: center; display: flex; gap: 8px;">
              ${actionHtml}
            </div>
          </td>
        </tr>
      `;

    // Append mobile cards
    mobileCardsHtml += `
          <div class="transaction-card" style="margin-bottom: 4px;">
            <div class="card-left">
              <div class="invoice-number" style="display: flex; align-items: center; gap: 6px;">
                <span style="font-family: monospace;">${tx.no_invoice}</span>
                <button onclick="copyInvoice(this, '${tx.no_invoice}')" title="Salin No. Invoice" style="background: none; border: 1px solid var(--gray-200); border-radius: 5px; cursor: pointer; padding: 3px 5px; display: inline-flex; align-items: center; justify-content: center; color: var(--gray-400); transition: all 0.15s; flex-shrink: 0;" onmouseover="this.style.borderColor='var(--gray-400)';this.style.color='var(--black)'" onmouseout="this.style.borderColor='var(--gray-200)';this.style.color='var(--gray-400)'">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
              <div class="product-name">${tx.product_name || '-'}</div>
              <div class="price-info">Rp ${Number(tx.total_amount).toLocaleString('id-ID')}</div>
            </div>
            <div class="card-right">
              <div class="card-meta">
                <span class="order-date">${dt}</span>
                <span class="status-badge" style="background: ${statusBg}; color: ${statusColor};">${statusLabel}</span>
              </div>
              <div class="card-actions">
                ${actionHtmlMobile}
              </div>
            </div>
          </div>
        `;
  });

  html += `
            </tbody>
          </table>
        </div>
  `;

  mobileCardsHtml += `
        </div>
  `;

  html = html + mobileCardsHtml;

  if (totalPages > 1) {
    html += `
      <div class="pagination" style="display: flex; justify-content: center; gap: 12px; margin-top: 24px;">
        <button class="btn-secondary-sm" onclick="changeTransaksiPage(${window.currentTransaksiPage - 1})" ${window.currentTransaksiPage === 1 ? 'disabled' : ''} style="${window.currentTransaksiPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">Sebelumnya</button>
        <span style="display: flex; align-items: center; font-size: 14px; font-weight: 500;">Hal ${window.currentTransaksiPage} dari ${totalPages}</span>
        <button class="btn-secondary-sm" onclick="changeTransaksiPage(${window.currentTransaksiPage + 1})" ${window.currentTransaksiPage === totalPages ? 'disabled' : ''} style="${window.currentTransaksiPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}">Selanjutnya</button>
      </div>
    `;
  }

  tableContainer.innerHTML = html;
};

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi Mobile Burger Menu
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('profile-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => closeSidebar());
  }

  // Mengambil data dari backend
  const baseUrl = localStorage.getItem('base_url_api');

  if (baseUrl) {
    // Fetch User Profile
    fetch(baseUrl + '/users/get_current_user', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result && result.data) {
          globalUserData = result.data;

          // Handle ?tab= query param dari navbar dropdown
          const urlParams = new URLSearchParams(window.location.search);
          const tab = urlParams.get('tab');
          if (tab === 'riwayat') {
            window.renderRiwayat();
          } else if (tab === 'transaksi') {
            window.renderTransaksi();
          } else {
            window.renderProfile(); // Default: profile
          }
        } else {
          console.error('Format data tidak sesuai:', result);
        }
      })
      .catch((error) => console.error('Gagal memuat profil:', error));

    // Fetch Data Transaksi
    fetch(baseUrl + '/users/get_all_order', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result && result.code == 200 && result.data && result.data.length > 0) {
          globalTransactionData = result.data.map((o) => ({
            no_invoice: o.order_id,
            order_id: o.id,
            invoice_created_at: o.order_created_at || o.expired_at,
            invoice_status: o.order_status,
            total_amount: o.total_amount,
            product_name: o.product_name || 'Order #' + o.order_id,
          }));

          const storedPesananCount = localStorage.getItem('pesanan_count');
          if (storedPesananCount === null) {
            localStorage.setItem('pesanan_count', result.data.length);
          } else if (result.data.length > parseInt(storedPesananCount)) {
            const newCount = result.data.length - parseInt(storedPesananCount);
            const badge = document.getElementById('badge-pesanan');
            if (badge) {
              badge.style.display = 'flex';
              badge.textContent = newCount;
            }
          }
        } else {
          console.log('Menggunakan data dummy transaksi karena kosong dari database.');
        }

        // Jika tab=transaksi atau tab=riwayat, re-render setelah data transaksi tersedia
        const urlParams = new URLSearchParams(window.location.search);
        const currentTab = urlParams.get('tab');
        if (currentTab === 'transaksi') {
          window.renderTransaksi();
        } else if (currentTab === 'riwayat') {
          window.renderRiwayat();
        }
      });

    //fetch riwayat pembelian
    fetch(`${baseUrl}/users/get_all_purchases`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result && result.code == 200 && result.data && result.data.length > 0) {
          globalRiwayatData = result.data.map((o) => ({
            id: o.id,
            invoice_id: o.invoice_id || o.order_id,
            no_invoice: o.order_id,
            invoice_created_at: o.invoice_created_at || o.order_created_at || o.expired_at,
            invoice_status: o.invoice_status || o.order_status || 'SUCCESS',
            order_id: o.order_id,
            order_created_at: o.order_created_at,
            order_status: o.order_status,
            total_amount: o.total_amount,
            product_name: o.product_name || 'Order #' + o.order_id,
          }));

          const storedRiwayatCount = localStorage.getItem('riwayat_count');
          if (storedRiwayatCount === null) {
            localStorage.setItem('riwayat_count', result.data.length);
          } else if (result.data.length > parseInt(storedRiwayatCount)) {
            const newCount = result.data.length - parseInt(storedRiwayatCount);
            const badge = document.getElementById('badge-riwayat');
            if (badge) {
              badge.style.display = 'flex';
              badge.textContent = newCount;
            }
          }
        } else {
          console.log('Menggunakan data dummy transaksi karena kosong dari database.');
        }

        // Jika tab=transaksi atau tab=riwayat, re-render setelah data transaksi tersedia
        const urlParams = new URLSearchParams(window.location.search);
        const currentTab = urlParams.get('tab');
        if (currentTab === 'transaksi') {
          window.renderTransaksi();
        } else if (currentTab === 'riwayat') {
          window.renderRiwayat();
        }
      });
  } else {
    console.warn('Anda belum login (baseUrl tidak ada).');
  }
});

// Salin No. Invoice ke clipboard
function copyInvoice(btn, invoiceNo) {
  navigator.clipboard
    .writeText(invoiceNo)
    .then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      btn.style.borderColor = '#16a34a';
      btn.style.color = '#16a34a';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.borderColor = 'var(--gray-200)';
        btn.style.color = 'var(--gray-400)';
      }, 1500);
    })
    .catch(() => {
      // Fallback untuk browser lama
      const el = document.createElement('textarea');
      el.value = invoiceNo;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
}
