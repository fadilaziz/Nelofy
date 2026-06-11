// Global State Cache
let allUsers = [];
let filteredUsers = [];
let userPage = 1;

let allOrders = [];
let filteredOrders = [];
let orderPage = 1;
let activeOrderStatus = 'all';

let activeUserStatus = 'all';

const itemsPerPage = 8;

let allProducts = [];
let currentTab = 'dashboard';

// Dom Elements
let tabIndicator, pageTitleLabel, totalProductLabel, totalCount;
let adminSearchWrapper, adminSearch, btnAddEntity;
let userTableBody, userCardBody, userPagination;
let orderTableBody, orderCardBody, orderPagination;
let statUsers, statOrders, statRevenue;

document.addEventListener('DOMContentLoaded', () => {
  // Bind UI Elements
  tabIndicator = document.getElementById('tab-indicator');
  pageTitleLabel = document.getElementById('page-title-label');
  totalProductLabel = document.getElementById('total-product-label');
  totalCount = document.getElementById('total-count');
  adminSearchWrapper = document.getElementById('admin-search-wrapper');
  adminSearch = document.getElementById('admin-search');
  btnAddEntity = document.getElementById('btn-add-entity');

  userTableBody = document.getElementById('user-table-body');
  userCardBody = document.getElementById('user-card-body');
  userPagination = document.getElementById('user-pagination');

  orderTableBody = document.getElementById('order-table-body');
  orderCardBody = document.getElementById('order-card-body');
  orderPagination = document.getElementById('order-pagination');

  statUsers = document.getElementById('stat-total-users');
  statOrders = document.getElementById('stat-total-orders');
  statRevenue = document.getElementById('stat-total-revenue');

  // Initialize Tab Switchers
  initTabSwitching();

  // Search input listeners
  adminSearch.addEventListener('input', () => {
    if (currentTab === 'user') {
      applyUserFilters();
    } else if (currentTab === 'order') {
      applyOrderFilters();
    }
  });

  // Filter dropdown options listeners
  document.querySelectorAll('.user-filter-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.user-filter-option').forEach((o) => {
        o.classList.remove('active');
        o.style.color = 'var(--gray-500)';
        const check = o.querySelector('.check-icon');
        if (check) check.style.display = 'none';
      });
      opt.classList.add('active');
      opt.style.color = 'var(--black)';
      const check = opt.querySelector('.check-icon');
      if (check) check.style.display = 'block';

      activeUserStatus = opt.getAttribute('data-value');
      applyUserFilters();
      
      const userDropdown = document.getElementById('user-filter-dropdown');
      if (userDropdown) userDropdown.style.display = 'none';
    });
  });

  document.querySelectorAll('.order-filter-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      // update ui
      document.querySelectorAll('.order-filter-option').forEach((o) => {
        o.classList.remove('active');
        o.style.color = 'var(--gray-500)';
        const check = o.querySelector('.check-icon');
        if (check) check.style.display = 'none';
      });
      opt.classList.add('active');
      opt.style.color = 'var(--black)';
      const check = opt.querySelector('.check-icon');
      if (check) check.style.display = 'block';

      activeOrderStatus = opt.getAttribute('data-value');
      applyOrderFilters();
      
      const orderDropdown = document.getElementById('order-filter-dropdown');
      if (orderDropdown) orderDropdown.style.display = 'none';
    });
  });

  // Filter button toggle logic
  const filterBtnAction = document.getElementById('filter-open-btn');
  const orderDropdown = document.getElementById('order-filter-dropdown');
  const userDropdown = document.getElementById('user-filter-dropdown');
  
  if (filterBtnAction) {
    filterBtnAction.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentTab === 'order') {
        if (orderDropdown) {
          orderDropdown.style.display = orderDropdown.style.display === 'none' || orderDropdown.style.display === '' ? 'block' : 'none';
        }
        if (userDropdown) userDropdown.style.display = 'none';
      } else if (currentTab === 'user') {
        if (userDropdown) {
          userDropdown.style.display = userDropdown.style.display === 'none' || userDropdown.style.display === '' ? 'block' : 'none';
        }
        if (orderDropdown) orderDropdown.style.display = 'none';
      } else {
        openSidebarFilter();
      }
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#filter-open-btn') && !e.target.closest('.filter-dropdown')) {
      if (orderDropdown) orderDropdown.style.display = 'none';
      if (userDropdown) userDropdown.style.display = 'none';
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (orderDropdown && !orderDropdown.contains(e.target) && filterBtnAction && !filterBtnAction.contains(e.target)) {
      orderDropdown.style.display = 'none';
    }
  });

  // Entity Add button listener
  btnAddEntity.addEventListener('click', () => {
    if (currentTab === 'user') {
      openAddUserModal();
    } else if (currentTab === 'order') {
      openAddOrderModal();
    }
  });

  // Load Initial Data
  fetchDashboardStats();
  fetchUsers();
  fetchProducts();

  // Restore tab terakhir yang dipilih sebelum refresh
  const savedTab = localStorage.getItem('admin_active_tab') || 'dashboard';
  const savedLink = document.querySelector(`.sidebar-link[data-tab="${savedTab}"]`);
  document.querySelectorAll('.sidebar-link').forEach((l) => l.classList.remove('active'));
  if (savedLink) savedLink.classList.add('active');
  switchTab(savedTab);

  // Realtime polling (dijalankan setelah tab terkonfigurasi)
  initRealtimeSync();
});

function closeAddOrderModal() {
  const overlay = document.getElementById('add-order-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

async function openAddOrderModal() {
  const userSelect = document.getElementById('add-order-user');
  const productSelect = document.getElementById('add-order-product');
  
  userSelect.innerHTML = '<option value="" disabled selected>Pilih User...</option>';
  allUsers.forEach((u) => {
    userSelect.innerHTML += `<option value="${u.id}">${u.full_name} (${u.username})</option>`;
  });
  
  productSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
  const baseUrl = localStorage.getItem('base_url_api');
  try {
    const res = await fetch(`${baseUrl}/admin/products-list`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const result = await res.json();
    if (result.code === 200) {
      productSelect.innerHTML = '<option value="" disabled selected>Pilih Produk...</option>';
      (result.products || []).forEach((p) => {
        productSelect.innerHTML += `<option value="${p.id}">${p.product_name}</option>`;
      });
    }
  } catch (e) {
    productSelect.innerHTML = '<option value="" disabled>Gagal memuat produk</option>';
  }
  
  document.getElementById('add-order-modal-overlay').classList.add('open');
}

async function saveAddOrderForm(event) {
  event.preventDefault();
  const userId = document.getElementById('add-order-user').value;
  const productId = document.getElementById('add-order-product').value;
  const paymentMethod = document.getElementById('add-order-payment').value;
  
  if (!userId || !productId) {
    showNotification('Pilih User dan Produk', 'warning');
    return;
  }
  
  const btnSubmit = document.getElementById('btn-submit-add-order');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Menyimpan...';
  
  const payload = {
    user_id: parseInt(userId),
    product_id: parseInt(productId),
    qty: 1,
    payment_method: paymentMethod,
  };
  
  const baseUrl = localStorage.getItem('base_url_api');
  try {
    const res = await fetch(`${baseUrl}/admin/add-order-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    
    const result = await res.json();
    if (res.status === 200 || result.code === 200) {
      showNotification('Pesanan berhasil ditambahkan', 'success');
      closeAddOrderModal();
      // Fetch ulang data order
      fetchDashboardStats();
    } else {
      showNotification(result.message || 'Gagal menyimpan pesanan', 'error');
    }
  } catch (e) {
    console.error(e);
    showNotification('Terjadi kesalahan server', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Simpan Pesanan';
  }
}

// ══════════════════════════════════════════
//  INITIALIZATION
// ══════════════════════════════════════════
function initTabSwitching() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Update sidebar active state
      sidebarLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');

      const targetTab = link.dataset.tab;
      // Simpan tab aktif ke localStorage agar tetap saat refresh
      localStorage.setItem('admin_active_tab', targetTab);
      switchTab(targetTab);
      closeSidebarFilter(); // for mobile
    });
  });
}

function switchTab(tab) {
  currentTab = tab;

  // Hide dropdowns if open
  const orderDropdown = document.getElementById('order-filter-dropdown');
  const userDropdown = document.getElementById('user-filter-dropdown');
  if (orderDropdown) orderDropdown.style.display = 'none';
  if (userDropdown) userDropdown.style.display = 'none';

  // Hide all sections
  document.querySelectorAll('.admin-section').forEach((sec) => {
    sec.classList.remove('active');
  });

  // Show target section
  const activeSec = document.getElementById(`section-${tab}`);
  if (activeSec) activeSec.classList.add('active');

  // Reset search
  adminSearch.value = '';

  // Configure Filter Bar UI & sidebar filter blocks
  document.querySelectorAll('.filter-group').forEach((grp) => (grp.style.display = 'none'));

  if (tab === 'dashboard') {
    totalProductLabel.textContent = 'Overview Panel';
    totalCount.textContent = '—';
    adminSearchWrapper.style.display = 'none';
    if (btnAddEntity) btnAddEntity.style.display = 'none';
    const filterBtn = document.getElementById('filter-open-btn');
    if (filterBtn) filterBtn.style.display = 'none';
    fetchDashboardStats();
  } else if (tab === 'user') {
    totalProductLabel.textContent = 'User List';
    adminSearchWrapper.style.display = 'flex';
    if (btnAddEntity) {
      btnAddEntity.style.display = 'inline-flex';
      btnAddEntity.textContent = '+ Tambah User';
    }
    const filterBtn = document.getElementById('filter-open-btn');
    if (filterBtn) filterBtn.style.display = 'inline-flex';

    const filterRole = document.getElementById('filter-user-role');
    if (filterRole) filterRole.style.display = 'none';
    applyUserFilters();
  } else if (tab === 'order') {
    totalProductLabel.textContent = 'Daftar Pesanan';
    adminSearchWrapper.style.display = 'flex';
    if (btnAddEntity) {
      btnAddEntity.style.display = 'inline-flex';
      btnAddEntity.textContent = '+ Tambah Order';
    }
    const filterBtn = document.getElementById('filter-open-btn');
    if (filterBtn) filterBtn.style.display = 'inline-flex';

    applyOrderFilters();
  }
}

// ══════════════════════════════════════════
//  FETCH METHODS
// ══════════════════════════════════════════
function openSidebarFilter() {
  const sidebar = document.getElementById('sidebar-filter');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebarFilter() {
  const sidebar = document.getElementById('sidebar-filter');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}
// ══════════════════════════════════════════
async function fetchDashboardStats() {
  try {
    const baseUrl = localStorage.getItem('base_url_api');

    // Fetch users count
    const userRes = await fetch(`${baseUrl}/admin/user-data`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    if (userRes.status === 401 || userRes.status === 403) return window.location.href = '/login';
    const userData = await userRes.json();
    const uCount = userData.dataUser ? userData.dataUser.length : 0;
    statUsers.textContent = uCount;

    // Fetch orders count & total revenue
    const orderRes = await fetch(`${baseUrl}/admin/order-data`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    if (orderRes.status === 401 || orderRes.status === 403) return window.location.href = '/login';
    const orderData = await orderRes.json();
    allOrders = orderData.dataOrder || [];

    statOrders.textContent = allOrders.length;

    // calculate total revenue from SUCCESS orders
    const revenue = allOrders
      .filter((o) => o.status === 'SUCCESS')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    statRevenue.textContent = `Rp ${revenue.toLocaleString('id-ID')}`;

    if (currentTab === 'order') applyOrderFilters();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
}

async function fetchUsers() {
  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const res = await fetch(`${baseUrl}/admin/user-data`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    if (res.status === 401 || res.status === 403) return window.location.href = '/login';
    const result = await res.json();
    allUsers = result.dataUser || [];

    if (currentTab === 'user') applyUserFilters();
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
  }
}

async function fetchProducts() {
  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const res = await fetch(`${baseUrl}/admin/products-list`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    if (res.status === 401 || res.status === 403) return window.location.href = '/login';
    const result = await res.json();
    allProducts = result.products || [];
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
  }
}

// ══════════════════════════════════════════
//  FILTER & SEARCH ENGINE: USERS
// ══════════════════════════════════════════
function applyUserFilters() {
  const searchVal = adminSearch.value.toLowerCase().trim();

  // Get active role radio value if it still exists, otherwise default to 'all'
  const roleRadio = document.querySelector('input[name="user-role-filter"]:checked');
  const activeRole = roleRadio ? roleRadio.value : 'all';

  const activeStatus = activeUserStatus || 'all';

  filteredUsers = allUsers.filter((u) => {
    // Search filter
    if (searchVal) {
      const name = (u.full_name || '').toLowerCase();
      const uname = (u.username || '').toLowerCase();
      const email = (u.user_email || '').toLowerCase();
      const phone = (u.user_phone || '').toLowerCase();
      if (
        !name.includes(searchVal) &&
        !uname.includes(searchVal) &&
        !email.includes(searchVal) &&
        !phone.includes(searchVal)
      ) {
        return false;
      }
    }

    // Role filter
    if (activeRole !== 'all') {
      if ((u.role || '').toLowerCase() !== activeRole) return false;
    }

    // Status filter
    if (activeStatus !== 'all') {
      if ((u.status || '').toLowerCase() !== activeStatus) return false;
    }

    return true;
  });

  userPage = 1;
  renderUsers();
}

// ══════════════════════════════════════════
//  RENDER USERS
// ══════════════════════════════════════════
function renderUsers() {
  userTableBody.innerHTML = '';
  if (userCardBody) userCardBody.innerHTML = '';
  totalCount.textContent = `${filteredUsers.length} total`;

  if (filteredUsers.length === 0) {
    userTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-400);">Tidak ada data user ditemukan</td></tr>`;
    if (userCardBody) userCardBody.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--gray-400); width: 100%; grid-column: 1 / -1;">Tidak ada data user ditemukan</div>`;
    userPagination.innerHTML = '';
    return;
  }

  const startIdx = (userPage - 1) * itemsPerPage;
  const pageItems = filteredUsers.slice(startIdx, startIdx + itemsPerPage);

  pageItems.forEach((u, index) => {
    const rowNo = startIdx + index + 1;
    const statusBadgeClass = u.status === 'active' ? 'badge-active' : 'badge-inactive';
    const statusLabel = u.status === 'active' ? 'Aktif' : 'Nonaktif';
    const roleBadgeClass = u.role === 'admin' ? 'badge-admin' : 'badge-user';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size: 13px; color: var(--gray-500);">${rowNo}</td>
      <td>
        <div style="font-weight: 600; color: var(--black);">${u.full_name}</div>
        <div style="font-size: 12px; color: var(--gray-400);">@${u.username}</div>
      </td>
      <td>
        <div style="font-weight: 500; color: var(--gray-700);">${u.email}</div>
        <div style="font-size: 12px; color: var(--gray-400);">${u.phone || '—'}</div>
      </td>
      <td><span class="badge ${roleBadgeClass}">${u.role}</span></td>
      <td><span class="badge ${statusBadgeClass}">${statusLabel}</span></td>
      <td style="text-align: right;">
        <div class="action-buttons" style="justify-content: flex-end;">
          <button class="btn-action" title="Detail" onclick="viewUserDetail(${u.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
          <button class="btn-action" title="Edit" onclick="editUser(${u.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action btn-delete" title="Hapus" onclick="deleteUser(${u.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    `;
    userTableBody.appendChild(tr);

    if (userCardBody) {
      const card = document.createElement('div');
      card.className = 'data-card-item';
      card.innerHTML = `
        <div class="data-card-header">
          <div>
            <div style="font-weight: 700; color: var(--black); font-size: 14px;">${u.full_name}</div>
            <div style="font-size: 12px; color: var(--gray-500);">@${u.username}</div>
          </div>
          <span class="badge ${statusBadgeClass}">${statusLabel}</span>
        </div>
        <div class="data-card-body">
          <div class="data-card-row">
            <span>Email</span>
            <span style="font-weight: 500; color: var(--black); text-align: right; word-break: break-all; max-width: 60%;">${u.email}</span>
          </div>
          <div class="data-card-row">
            <span>No. Telp</span>
            <span style="font-weight: 500; color: var(--black);">${u.phone || '—'}</span>
          </div>
          <div class="data-card-row">
            <span>Role</span>
            <span class="badge ${roleBadgeClass}">${u.role}</span>
          </div>
        </div>
        <div class="data-card-actions">
          <button class="btn-action" title="Detail" onclick="viewUserDetail(${u.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
          <button class="btn-action" title="Edit" onclick="editUser(${u.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action btn-delete" title="Hapus" onclick="deleteUser(${u.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      `;
      userCardBody.appendChild(card);
    }
  });

  renderPaginationControls(
    filteredUsers.length,
    userPage,
    (newPage) => {
      userPage = newPage;
      renderUsers();
    },
    userPagination
  );
}

// ══════════════════════════════════════════
//  PAGINATION CONTROLS GENERATOR
// ══════════════════════════════════════════
function renderPaginationControls(totalItems, currentPage, onPageChange, containerEl) {
  containerEl.innerHTML = '';
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Prev Button
  const prevBtn = document.createElement('a');
  prevBtn.href = '#';
  prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.textContent = '‹';
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) onPageChange(currentPage - 1);
  });
  containerEl.appendChild(prevBtn);

  // Pages Button
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('a');
    pageBtn.href = '#';
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      onPageChange(i);
    });
    containerEl.appendChild(pageBtn);
  }

  // Next Button
  const nextBtn = document.createElement('a');
  nextBtn.href = '#';
  nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
  nextBtn.textContent = '›';
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });
  containerEl.appendChild(nextBtn);
}

// ══════════════════════════════════════════
//  USER CRUD OPERATIONS
// ══════════════════════════════════════════
function openAddUserModal() {
  document.getElementById('user-modal-title').textContent = 'Tambah User Baru';
  document.getElementById('user-form-id').value = '';
  document.getElementById('uf-fullname').value = '';
  document.getElementById('uf-username').value = '';
  document.getElementById('uf-email').value = '';
  document.getElementById('uf-phone').value = '';

  const pwInput = document.getElementById('uf-password');
  pwInput.value = '';
  pwInput.required = true;
  document.getElementById('uf-password-label').textContent = 'Password';
  document.getElementById('uf-password-hint').style.display = 'none';

  const alertInfo = document.getElementById('uf-alert-info');
  if (alertInfo) alertInfo.style.display = 'flex';

  document.getElementById('user-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function editUser(id) {
  const user = allUsers.find((u) => u.id === id);
  if (!user) return;

  document.getElementById('user-modal-title').textContent = 'Edit Pengguna';
  document.getElementById('user-form-id').value = user.id;
  document.getElementById('uf-fullname').value = user.full_name;
  document.getElementById('uf-username').value = user.username;
  document.getElementById('uf-email').value = user.email || '';
  document.getElementById('uf-phone').value = user.phone || '';

  const pwInput = document.getElementById('uf-password');
  pwInput.value = '';
  pwInput.required = false;
  document.getElementById('uf-password-label').textContent = 'Ubah Password (Opsional)';
  document.getElementById('uf-password-hint').style.display = 'block';

  const alertInfo = document.getElementById('uf-alert-info');
  if (alertInfo) alertInfo.style.display = 'none';

  document.getElementById('user-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeUserModal() {
  document.getElementById('user-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

async function saveUserForm(e) {
  e.preventDefault();
  const id = document.getElementById('user-form-id').value;
  const full_name = document.getElementById('uf-fullname').value.trim();
  const username = document.getElementById('uf-username').value.trim();
  const user_email = document.getElementById('uf-email').value.trim();
  const user_phone = document.getElementById('uf-phone').value.trim();
  const password = document.getElementById('uf-password').value;

  // validation
  if (!full_name || !username || !user_email || !user_phone) {
    showNotification('Mohon isi semua field wajib!', 'error');
    return;
  }
  if (!id && !password) {
    showNotification('Password wajib diisi untuk user baru!', 'error');
    return;
  }

  // Data untuk tambah baru (status & role ditetapkan di backend jika tidak ada)
  const data = { full_name, username, user_email, user_phone };

  if (id) {
    const existingUser = allUsers.find((u) => u.id == id);
    if (existingUser) {
      data.status = existingUser.status;
      data.role = existingUser.role;
    }
  }

  if (password && password.trim() !== '') {
    data.password = password;
  }

  const baseUrl = localStorage.getItem('base_url_api');
  let url = `${baseUrl}/admin/add-user-data`;
  let method = 'POST';

  if (id) {
    url = `${baseUrl}/admin/user-data/${id}`;
    method = 'PUT';
  }

  const btnSubmit = document.getElementById('btn-submit-user');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Loading...';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (result.status === 'success') {
      showNotification(result.message || 'Data user berhasil disimpan!', 'success');
      closeUserModal();
      fetchUsers();
    } else {
      showNotification(result.message || 'Gagal menyimpan data user', 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Terjadi kesalahan jaringan', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Simpan Perubahan';
  }
}

async function deleteUser(id) {
  const isConfirmed = await showConfirmModal(
    'Apakah Anda yakin ingin menghapus user ini? Ini juga akan menghapus semua data order milik user tersebut.'
  );
  if (!isConfirmed) return;

  const baseUrl = localStorage.getItem('base_url_api');
  try {
    const res = await fetch(`${baseUrl}/admin/user-data/${id}`, {
      method: 'DELETE',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const result = await res.json();
    if (result.status === 'success') {
      showNotification(result.message || 'User berhasil dihapus', 'success');
      fetchUsers();
    } else {
      showNotification(result.message || 'Gagal menghapus user', 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Terjadi kesalahan jaringan', 'error');
  }
}

function viewUserDetail(id) {
  const user = allUsers.find((u) => u.id === id);
  if (!user) return;

  const detailContent = document.getElementById('user-detail-content');
  const badgeStyle =
    user.status === 'active'
      ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;'
      : 'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;';
  const dotStyle = user.status === 'active' ? 'background: #166534;' : 'background: #991b1b;';
  const statusText = user.status === 'active' ? 'AKTIF' : 'NONAKTIF';

  detailContent.innerHTML = `
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
      <!-- Section 1: Profil -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed #d1d5db; padding-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Detail Profil</div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--black); margin: 0; line-height: 1.2;">${user.full_name}</h3>
            <div style="display: flex; align-items: center; gap: 6px; color: var(--gray-500); font-size: 13px; margin-top: 4px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              @${user.username}
            </div>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; ${badgeStyle}">
            <span style="width: 6px; height: 6px; border-radius: 50%; ${dotStyle}"></span>
            ${statusText}
          </span>
        </div>
      </div>

      <!-- Section 2: Informasi Kontak -->
      <div>
        <div style="font-size: 14px; font-weight: 700; color: var(--black); margin-bottom: 12px;">Informasi Kontak</div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Email Card -->
          <div style="display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid var(--gray-200); border-radius: 10px; background: var(--white); box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; color: var(--gray-500); margin-bottom: 2px;">Alamat Email</div>
              <div style="font-size: 14px; color: var(--black); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.email || '—'}</div>
            </div>
          </div>

          <!-- Phone Card -->
          <div style="display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid var(--gray-200); border-radius: 10px; background: var(--white); box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; color: var(--gray-500); margin-bottom: 2px;">Nomor Telepon</div>
              <div style="font-size: 14px; color: var(--black); font-weight: 600;">${user.phone || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Rincian Akun -->
      <div style="border: 1px solid var(--gray-200); border-radius: 10px; background: var(--white); padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px; color: var(--black); font-weight: 700; font-size: 14px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Rincian Sistem
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--gray-500); font-weight: 600;">User ID</span>
            <span style="font-weight: 600; color: var(--black); font-family: monospace;">#${user.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--gray-500); font-weight: 600;">Role</span>
            <span style="font-weight: 600; color: var(--black); text-transform: capitalize;">${user.role}</span>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <button onclick="closeUserDetailModal()" style="width: 100%; padding: 14px; background: var(--black); color: var(--white); border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">
        Tutup Detail
      </button>
    </div>
  `;

  document.getElementById('user-detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeUserDetailModal() {
  document.getElementById('user-detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════
//  ORDER RENDERING
// ══════════════════════════════════════════
function applyOrderFilters() {
  const searchTerm = adminSearch.value.toLowerCase().trim();

  filteredOrders = allOrders.filter((o) => {
    // Search filter
    if (searchTerm) {
      const s1 = o.order_id?.toLowerCase() || '';
      const s2 = o.user_fullname?.toLowerCase() || '';
      const s3 = o.product_name?.toLowerCase() || '';
      if (!s1.includes(searchTerm) && !s2.includes(searchTerm) && !s3.includes(searchTerm)) {
        return false;
      }
    }

    // Status filter
    if (activeOrderStatus !== 'all') {
      if ((o.status || '').toLowerCase() !== activeOrderStatus) return false;
    }

    return true;
  });

  totalCount.textContent = `${filteredOrders.length} Pesanan`;
  orderPage = 1;
  renderOrders();
}

function renderOrders() {
  orderTableBody.innerHTML = '';
  if (orderCardBody) orderCardBody.innerHTML = '';
  if (filteredOrders.length === 0) {
    orderTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--gray-500);">Tidak ada pesanan ditemukan.</td></tr>`;
    if (orderCardBody) orderCardBody.innerHTML = `<div style="text-align:center; padding:30px; color:var(--gray-500); width: 100%; grid-column: 1 / -1;">Tidak ada pesanan ditemukan.</div>`;
    orderPagination.innerHTML = '';
    return;
  }

  const start = (orderPage - 1) * itemsPerPage;
  const paginated = filteredOrders.slice(start, start + itemsPerPage);

  paginated.forEach((o, index) => {
    const rowNo = start + index + 1;

    let statusBadge = '';
    if (o.status === 'SUCCESS') {
      statusBadge = '<span class="badge" style="background:#dcfce7; color:#166534;">SUCCESS</span>';
    } else if (o.status === 'PENDING') {
      statusBadge = '<span class="badge" style="background:#fef08a; color:#854d0e;">PENDING</span>';
    } else {
      statusBadge = `<span class="badge" style="background:#fee2e2; color:#991b1b;">${o.status || 'EXPIRED'}</span>`;
    }

    const d = new Date(o.created_at);
    const dateStr = d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--black); font-family: monospace; font-size: 13px;">${o.order_id || '-'}</td>
      <td>
        <div style="font-weight: 600; color: var(--black);">${o.user_fullname || '-'}</div>
        <div style="font-size: 12px; color: var(--gray-400);">@${o.user_username || '-'}</div>
      </td>
      <td>
        <div style="font-weight: 500; color: var(--gray-700); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${o.product_name || '-'}">${o.product_name || '-'}</div>
        <div style="font-size: 12px; color: var(--gray-400);">${dateStr}</div>
      </td>
      <td style="font-weight: 700; color: var(--black);">Rp ${Number(o.total_amount || 0).toLocaleString('id-ID')}</td>
      <td>${statusBadge}</td>
      <td style="text-align: right;">
        <div class="action-buttons" style="justify-content: flex-end;">
          <button class="btn-action" title="Detail" onclick="viewOrderDetail(${o.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
          <button class="btn-action" title="Edit" onclick="editOrder(${o.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action btn-delete" title="Hapus" onclick="deleteOrder(${o.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    `;
    orderTableBody.appendChild(tr);

    if (orderCardBody) {
      const card = document.createElement('div');
      card.className = 'data-card-item';
      card.innerHTML = `
        <div class="data-card-header">
          <div>
            <div style="font-weight: 700; color: var(--black); font-size: 14px; font-family: monospace;">${o.order_id || '-'}</div>
            <div style="font-size: 12px; color: var(--gray-500);">${dateStr}</div>
          </div>
          ${statusBadge}
        </div>
        <div class="data-card-body">
          <div class="data-card-row">
            <span>Pembeli</span>
            <span style="font-weight: 500; color: var(--black); text-align: right;">${o.user_fullname || '-'}<br><span style="font-size:11px; color:var(--gray-400);">@${o.user_username || '-'}</span></span>
          </div>
          <div class="data-card-row">
            <span>Produk</span>
            <span style="font-weight: 500; color: var(--black); text-align: right; max-width: 60%;">${o.product_name || '-'}</span>
          </div>
          <div class="data-card-row">
            <span>Total</span>
            <span style="font-weight: 700; color: var(--black);">Rp ${Number(o.total_amount || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div class="data-card-actions">
          <button class="btn-action" title="Detail" onclick="viewOrderDetail(${o.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
          <button class="btn-action" title="Edit" onclick="editOrder(${o.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action btn-delete" title="Hapus" onclick="deleteOrder(${o.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      `;
      orderCardBody.appendChild(card);
    }
  });

  renderOrderPagination();
}

function renderOrderPagination() {
  orderPagination.innerHTML = '';
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  // Prev Button
  const prevBtn = document.createElement('button');
  prevBtn.className = `page-btn ${orderPage === 1 ? 'disabled' : ''}`;
  prevBtn.textContent = '‹';
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (orderPage > 1) {
      orderPage--;
      renderOrders();
    }
  });
  orderPagination.appendChild(prevBtn);

  // Pages Button
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === orderPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      orderPage = i;
      renderOrders();
    });
    orderPagination.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.className = `page-btn ${orderPage === totalPages ? 'disabled' : ''}`;
  nextBtn.textContent = '›';
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (orderPage < totalPages) {
      orderPage++;
      renderOrders();
    }
  });
  orderPagination.appendChild(nextBtn);
}

// ══════════════════════════════════════════
//  ORDER CRUD OPERATIONS
// ══════════════════════════════════════════
function editOrder(id) {
  const order = allOrders.find((o) => o.id === id);
  if (!order) return;

  document.getElementById('order-form-id').value = order.id;
  document.getElementById('of-status').value = order.status || 'PENDING';
  
  const displayId = document.getElementById('edit-order-id-display');
  if (displayId) {
    displayId.textContent = order.order_id || '-';
  }

  document.getElementById('order-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('order-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

async function saveOrderForm(e) {
  e.preventDefault();
  const id = document.getElementById('order-form-id').value;
  const status = document.getElementById('of-status').value;

  const order = allOrders.find((o) => o.id == id);
  if (!order) return;

  const data = {
    user_id: order.user_id,
    product_id: order.product_id,
    total_amount: order.total_amount,
    status: status
  };

  const baseUrl = localStorage.getItem('base_url_api');
  let url = `${baseUrl}/admin/order-data/${id}`;
  
  const btnSubmit = document.getElementById('btn-submit-order');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Loading...';

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (result.status === 'success') {
      showNotification(result.message || 'Status pesanan berhasil diupdate!', 'success');
      closeOrderModal();
      fetchDashboardStats(); // refresh orders
    } else {
      showNotification(result.message || 'Gagal mengupdate pesanan', 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Terjadi kesalahan jaringan', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Simpan Perubahan';
  }
}

async function deleteOrder(id) {
  const isConfirmed = await showConfirmModal(
    'Apakah Anda yakin ingin menghapus pesanan ini? Aksi ini tidak dapat dibatalkan.'
  );
  if (!isConfirmed) return;

  const baseUrl = localStorage.getItem('base_url_api');
  try {
    const res = await fetch(`${baseUrl}/admin/order-data/${id}`, {
      method: 'DELETE',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const result = await res.json();
    if (result.status === 'success') {
      showNotification('Data pesanan berhasil dihapus', 'success');
      fetchDashboardStats(); // refresh orders
    } else {
      showNotification(result.message || 'Gagal menghapus pesanan', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Terjadi kesalahan jaringan', 'error');
  }
}

function viewOrderDetail(id) {
  const order = allOrders.find((o) => o.id === id);
  if (!order) return;

  const container = document.getElementById('order-detail-content');
  const d = new Date(order.created_at).toLocaleString('id-ID');
  const expiredText = order.expired_at ? new Date(order.expired_at).toLocaleString('id-ID') : '-';
  const qrisLink = order.qris_url ? `<a href="${order.qris_url}" target="_blank" style="color: var(--primary); text-decoration: underline; font-size: 13px; font-weight: 500;">Buka Link Pembayaran</a>` : '-';
  const qrisImageHtml = order.qris_url ? `<div style="margin-top: 12px; text-align: center;"><img src="${order.qris_url}" alt="QRIS" style="max-width: 200px; border-radius: 8px; border: 1px solid #e5e7eb;"/></div>` : '';
  
  let statusBadge = '';
  if (order.status === 'SUCCESS') {
    statusBadge = '<span style="display:inline-block; padding:3px 8px; background:#dcfce7; color:#166534; border-radius:4px; font-size:11px; font-weight:700;">SUCCESS</span>';
  } else if (order.status === 'PENDING') {
    statusBadge = '<span style="display:inline-block; padding:3px 8px; background:#fef08a; color:#854d0e; border-radius:4px; font-size:11px; font-weight:700;">PENDING</span>';
  } else {
    statusBadge = `<span style="display:inline-block; padding:3px 8px; background:#fee2e2; color:#991b1b; border-radius:4px; font-size:11px; font-weight:700;">${order.status || 'EXPIRED'}</span>`;
  }

  container.innerHTML = `
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #d1d5db; padding-bottom: 16px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 12px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">ID Pesanan</div>
          <div style="font-size: 18px; font-weight: 700; color: var(--black); font-family: monospace; margin-top: 4px;">${order.order_id || '-'}</div>
        </div>
        <div style="text-align: right;">
          <div>${statusBadge}</div>
          <div style="font-size: 12px; color: var(--gray-500); margin-top: 6px;">${d}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 12px; color: var(--gray-500); font-weight: 600; margin-bottom: 4px;">Informasi Pembeli</div>
          <div style="font-weight: 600; color: var(--black); font-size: 14px;">${order.user_fullname || '-'}</div>
          <div style="font-size: 12px; color: var(--gray-400);">@${order.user_username || '-'}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: var(--gray-500); font-weight: 600; margin-bottom: 4px;">Produk</div>
          <div style="font-weight: 600; color: var(--black); font-size: 14px; line-height: 1.4;">${order.product_name || '-'}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <div>
          <div style="font-size: 12px; color: var(--gray-500); font-weight: 600; margin-bottom: 4px;">Batas Pembayaran</div>
          <div style="font-weight: 600; color: var(--black); font-size: 13px;">${expiredText}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: var(--gray-500); font-weight: 600; margin-bottom: 4px;">Link QRIS</div>
          <div>${qrisLink}</div>
        </div>
      </div>

      ${qrisImageHtml}

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02); margin-top: 20px;">
        <div style="font-weight: 600; color: var(--gray-500);">Total Harga</div>
        <div style="font-weight: 800; font-size: 18px; color: var(--black);">Rp ${Number(order.total_amount || 0).toLocaleString('id-ID')}</div>
      </div>
    </div>
  `;

  document.getElementById('order-detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderDetailModal() {
  document.getElementById('order-detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════
//  REALTIME SYNC — Polling dengan fetch
//  (EventSource tidak support custom header
//   ngrok-skip-browser-warning, jadi pakai polling)
// ══════════════════════════════════════════
let _pollInterval = null;
let _lastOrderCount = -1;
let _lastUserCount = -1;
let _lastOrderIds = '';
let _lastUserIds = '';
const _POLL_MS = 5000; // cek setiap 5 detik

function initRealtimeSync() {
  if (_pollInterval) clearInterval(_pollInterval);

  // Set badge Live langsung
  showRealtimeBadge(true);

  _pollInterval = setInterval(async () => {
    const baseUrl = localStorage.getItem('base_url_api');
    if (!baseUrl) return;

    try {
      // ── Cek Users ──
      const userRes = await fetch(`${baseUrl}/admin/user-data`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        credentials: 'include',
      });
      if (userRes.status === 401 || userRes.status === 403) {
        clearInterval(_pollInterval);
        window.location.href = '/login';
        return;
      }
      if (userRes.ok) {
        const userData = await userRes.json();
        const users = userData.dataUser || [];
        const ids = users.map((u) => u.id).join(',');

        if (_lastUserIds !== '' && ids !== _lastUserIds) {
          allUsers = users;
          populateUserDropdown();
          if (currentTab === 'user') applyUserFilters();
          if (users.length > _lastUserCount && _lastUserCount >= 0) {
            showNotification('User baru terdaftar!', 'success');
          } else if (_lastUserIds !== '') {
            showNotification('Data user diperbarui', 'info');
          }
        }
        _lastUserIds = ids;
        _lastUserCount = users.length;
      }
    } catch (err) {
      // Koneksi bermasalah, sembunyikan badge Live sementara
      showRealtimeBadge(false);
      console.warn('[Realtime] Gagal polling:', err.message);
      return;
    }

    // Pastikan badge Live selalu tampil saat koneksi normal
    showRealtimeBadge(true);
  }, _POLL_MS);
}

// Tampilkan/sembunyikan indikator Live di header
function showRealtimeBadge(connected) {
  // Indikator dinonaktifkan
}

// CSS animasi pulse dot untuk badge Live
if (!document.getElementById('sse-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'sse-pulse-style';
  style.textContent = `
    @keyframes pulse-dot {
      0%,100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.5; transform: scale(1.4); }
    }
  `;
  document.head.appendChild(style);
}
