// Global State Cache
let allUsers = [];
let filteredUsers = [];
let userPage = 1;
const itemsPerPage = 8;

let allOrders = [];
let filteredOrders = [];
let orderPage = 1;

let allProducts = [];
let currentTab = 'dashboard';

// Dom Elements
let tabIndicator, pageTitleLabel, totalProductLabel, totalCount;
let adminSearchWrapper, adminSearch, btnAddEntity;
let userTableBody, orderTableBody;
let userPagination, orderPagination;
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
  orderTableBody = document.getElementById('order-table-body');
  userPagination = document.getElementById('user-pagination');
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

  // Filter checkboxes/radios listeners
  document.querySelectorAll('.user-filter-radio').forEach((radio) => {
    radio.addEventListener('change', applyUserFilters);
  });
  document.querySelectorAll('.order-filter-radio').forEach((radio) => {
    radio.addEventListener('change', applyOrderFilters);
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
  fetchOrders();
  fetchProducts();
});

// ══════════════════════════════════════════
//  TAB NAVIGATION
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
      switchTab(targetTab);
      closeSidebarFilter(); // for mobile
    });
  });
}

function switchTab(tab) {
  currentTab = tab;

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
    btnAddEntity.style.display = 'none';
    document.getElementById('filter-open-btn').style.display = 'none';
    fetchDashboardStats();
  } else if (tab === 'user') {
    totalProductLabel.textContent = 'User List';
    adminSearchWrapper.style.display = 'flex';
    btnAddEntity.style.display = 'inline-flex';
    btnAddEntity.textContent = '+ Tambah User';
    document.getElementById('filter-open-btn').style.display = 'inline-flex';

    document.getElementById('filter-user-role').style.display = 'block';
    document.getElementById('filter-user-status').style.display = 'block';
    applyUserFilters();
  } else if (tab === 'order') {
    totalProductLabel.textContent = 'Order List';
    adminSearchWrapper.style.display = 'flex';
    btnAddEntity.style.display = 'inline-flex';
    btnAddEntity.textContent = '+ Tambah Order';
    document.getElementById('filter-open-btn').style.display = 'inline-flex';

    document.getElementById('filter-order-status').style.display = 'block';
    applyOrderFilters();
  }
}

// ══════════════════════════════════════════
//  FETCH METHODS
// ══════════════════════════════════════════
async function fetchDashboardStats() {
  try {
    const baseUrl = localStorage.getItem('base_url_api');

    // Fetch users count
    const userRes = await fetch(`${baseUrl}/admin/user-data`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const userData = await userRes.json();
    const uCount = userData.dataUser ? userData.dataUser.length : 0;
    statUsers.textContent = uCount;

    // Fetch orders count & total revenue
    const orderRes = await fetch(`${baseUrl}/admin/order-data`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const orderData = await orderRes.json();
    const orders = orderData.dataOrder || [];

    statOrders.textContent = orders.length;

    // calculate total revenue from SUCCESS orders
    const revenue = orders
      .filter((o) => o.status === 'SUCCESS')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    statRevenue.textContent = `Rp ${revenue.toLocaleString('id-ID')}`;
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
    const result = await res.json();
    allUsers = result.dataUser || [];

    // update order creation dropdowns
    populateUserDropdown();

    if (currentTab === 'user') applyUserFilters();
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
  }
}

async function fetchOrders() {
  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const res = await fetch(`${baseUrl}/admin/order-data`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const result = await res.json();
    allOrders = result.dataOrder || [];
    if (currentTab === 'order') applyOrderFilters();
  } catch (error) {
    console.error('Gagal mengambil data order:', error);
  }
}

async function fetchProducts() {
  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const res = await fetch(`${baseUrl}/admin/products-list`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    });
    const result = await res.json();
    allProducts = result.products || [];

    populateProductDropdown();
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
  }
}

// ══════════════════════════════════════════
//  POPULATE DROPDOWNS
// ══════════════════════════════════════════
function populateUserDropdown() {
  const select = document.getElementById('of-user');
  if (!select) return;

  select.innerHTML = '<option value="">Pilih Pelanggan...</option>';
  allUsers.forEach((u) => {
    const option = document.createElement('option');
    option.value = u.id;
    option.textContent = `${u.full_name} (${u.username})`;
    select.appendChild(option);
  });
}

function populateProductDropdown() {
  const select = document.getElementById('of-product');
  if (!select) return;

  select.innerHTML = '<option value="">Pilih Produk...</option>';
  allProducts.forEach((p) => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.product_name} - Rp ${Number(p.price).toLocaleString('id-ID')}`;
    select.appendChild(option);
  });
}

function onProductSelectChange() {
  const pSelect = document.getElementById('of-product');
  const amountInput = document.getElementById('of-amount');
  const productId = pSelect.value;

  if (!productId) {
    amountInput.value = '';
    return;
  }

  const product = allProducts.find((p) => String(p.id) === String(productId));
  if (product) {
    amountInput.value = parseInt(product.price);
  }
}

// ══════════════════════════════════════════
//  FILTER & SEARCH ENGINE: USERS
// ══════════════════════════════════════════
function applyUserFilters() {
  const searchVal = adminSearch.value.toLowerCase().trim();

  // Get active role radio value
  const roleRadio = document.querySelector('input[name="user-role-filter"]:checked');
  const activeRole = roleRadio ? roleRadio.value : 'all';

  // Get active status radio value
  const statusRadio = document.querySelector('input[name="user-status-filter"]:checked');
  const activeStatus = statusRadio ? statusRadio.value : 'all';

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
//  FILTER & SEARCH ENGINE: ORDERS
// ══════════════════════════════════════════
function applyOrderFilters() {
  const searchVal = adminSearch.value.toLowerCase().trim();

  // Get active order status radio value
  const statusRadio = document.querySelector('input[name="order-status-filter"]:checked');
  const activeStatus = statusRadio ? statusRadio.value : 'all';

  filteredOrders = allOrders.filter((o) => {
    // Search filter
    if (searchVal) {
      const invoice = (o.order_id || '').toLowerCase();
      const customer = (o.user_fullname || '').toLowerCase();
      const product = (o.product_name || '').toLowerCase();
      if (
        !invoice.includes(searchVal) &&
        !customer.includes(searchVal) &&
        !product.includes(searchVal)
      ) {
        return false;
      }
    }

    // Status filter
    if (activeStatus !== 'all') {
      if ((o.status || '').toUpperCase() !== activeStatus.toUpperCase()) return false;
    }

    return true;
  });

  orderPage = 1;
  renderOrders();
}

// ══════════════════════════════════════════
//  RENDER USERS
// ══════════════════════════════════════════
function renderUsers() {
  userTableBody.innerHTML = '';
  totalCount.textContent = `${filteredUsers.length} total`;

  if (filteredUsers.length === 0) {
    userTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray-400);">
          Tidak ada data user ditemukan
        </td>
      </tr>
    `;
    userPagination.innerHTML = '';
    return;
  }

  const startIdx = (userPage - 1) * itemsPerPage;
  const pageItems = filteredUsers.slice(startIdx, startIdx + itemsPerPage);

  pageItems.forEach((u) => {
    const tr = document.createElement('tr');

    // Status & Role badges
    const statusBadgeClass = u.status === 'active' ? 'badge-active' : 'badge-inactive';
    const statusLabel = u.status === 'active' ? 'Aktif' : 'Nonaktif';
    const roleBadgeClass = u.role === 'admin' ? 'badge-admin' : 'badge-user';

    tr.innerHTML = `
      <td>${u.id}</td>
      <td style="font-weight: 600;">${u.full_name}</td>
      <td>${u.username}</td>
      <td>${u.user_email}</td>
      <td>${u.user_phone || '—'}</td>
      <td><span class="badge ${roleBadgeClass}">${u.role}</span></td>
      <td><span class="badge ${statusBadgeClass}">${statusLabel}</span></td>
      <td style="text-align: center;">
        <div class="action-buttons" style="justify-content: center;">
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
//  RENDER ORDERS
// ══════════════════════════════════════════
function renderOrders() {
  orderTableBody.innerHTML = '';
  totalCount.textContent = `${filteredOrders.length} total`;

  if (filteredOrders.length === 0) {
    orderTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray-400);">
          Tidak ada data order ditemukan
        </td>
      </tr>
    `;
    orderPagination.innerHTML = '';
    return;
  }

  const startIdx = (orderPage - 1) * itemsPerPage;
  const pageItems = filteredOrders.slice(startIdx, startIdx + itemsPerPage);

  pageItems.forEach((o) => {
    const tr = document.createElement('tr');

    // Status Badge
    let statusClass = 'badge-pending';
    if (o.status === 'SUCCESS') statusClass = 'badge-success';
    if (o.status === 'EXPIRED') statusClass = 'badge-expired';

    const formattedAmount = Number(o.total_amount || 0).toLocaleString('id-ID');
    const createdDate = o.created_at
      ? new Date(o.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—';

    tr.innerHTML = `
      <td>${o.id}</td>
      <td style="font-family: monospace; font-size: 12px; font-weight: 600;">${o.order_id}</td>
      <td>
        <div style="font-weight: 600;">${o.user_fullname || '—'}</div>
        <div style="font-size: 11px; color: var(--gray-500);">@${o.user_username || '—'}</div>
      </td>
      <td style="font-weight: 500;">${o.product_name || 'Produk tidak tersedia'}</td>
      <td style="font-weight: 700;">Rp ${formattedAmount}</td>
      <td><span class="badge ${statusClass}">${o.status}</span></td>
      <td>${createdDate}</td>
      <td style="text-align: center;">
        <div class="action-buttons" style="justify-content: center;">
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
  });

  renderPaginationControls(
    filteredOrders.length,
    orderPage,
    (newPage) => {
      orderPage = newPage;
      renderOrders();
    },
    orderPagination
  );
}

// ══════════════════════════════════════════
//  PAGINATION CONTROLS GENERATOR
// ══════════════════════════════════════════
function renderPaginationControls(totalItems, currentPage, onPageChange, containerEl) {
  containerEl.innerHTML = '';
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return;

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
  document.getElementById('uf-role').value = 'user';
  document.getElementById('uf-status').value = 'active';

  const pwInput = document.getElementById('uf-password');
  pwInput.value = '';
  pwInput.required = true;
  document.getElementById('uf-password-label').textContent = 'Password';
  document.getElementById('uf-password-hint').style.display = 'none';

  document.getElementById('user-modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function editUser(id) {
  const user = allUsers.find((u) => u.id === id);
  if (!user) return;

  document.getElementById('user-modal-title').textContent = 'Edit Pengguna';
  document.getElementById('user-form-id').value = user.id;
  document.getElementById('uf-fullname').value = user.full_name;
  document.getElementById('uf-username').value = user.username;
  document.getElementById('uf-email').value = user.user_email;
  document.getElementById('uf-phone').value = user.user_phone || '';
  document.getElementById('uf-role').value = user.role;
  document.getElementById('uf-status').value = user.status;

  const pwInput = document.getElementById('uf-password');
  pwInput.value = '';
  pwInput.required = false;
  document.getElementById('uf-password-label').textContent = 'Ubah Password (Opsional)';
  document.getElementById('uf-password-hint').style.display = 'block';

  document.getElementById('user-modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeUserModal() {
  document.getElementById('user-modal-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

async function saveUserForm(e) {
  e.preventDefault();
  const id = document.getElementById('user-form-id').value;
  const full_name = document.getElementById('uf-fullname').value.trim();
  const username = document.getElementById('uf-username').value.trim();
  const user_email = document.getElementById('uf-email').value.trim();
  const user_phone = document.getElementById('uf-phone').value.trim();
  const role = document.getElementById('uf-role').value;
  const status = document.getElementById('uf-status').value;
  const password = document.getElementById('uf-password').value;

  const data = { full_name, username, user_email, user_phone, role, status };
  if (password && password.trim() !== '') {
    data.password = password;
  }

  // validation
  if (!full_name || !username || !user_email || !user_phone) {
    showNotification('Mohon isi semua field wajib!', 'error');
    return;
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
  const badgeClass = user.status === 'active' ? 'badge-active' : 'badge-inactive';
  const roleClass = user.role === 'admin' ? 'badge-admin' : 'badge-user';

  detailContent.innerHTML = `
    <div><strong>Nama Lengkap:</strong><br/>${user.full_name}</div>
    <div><strong>Username:</strong><br/>@${user.username}</div>
    <div><strong>Alamat Email:</strong><br/>${user.user_email}</div>
    <div><strong>Nomor Telepon:</strong><br/>${user.user_phone || '—'}</div>
    <div><strong>Role Akun:</strong><br/><span class="badge ${roleClass}">${user.role}</span></div>
    <div><strong>Status Akun:</strong><br/><span class="badge ${badgeClass}">${user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></div>
  `;

  document.getElementById('user-detail-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeUserDetailModal() {
  document.getElementById('user-detail-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════
//  ORDER CRUD OPERATIONS
// ══════════════════════════════════════════
function openAddOrderModal() {
  document.getElementById('order-modal-title').textContent = 'Tambah Order Baru';
  document.getElementById('order-form-id').value = '';
  document.getElementById('of-user').value = '';
  document.getElementById('of-product').value = '';
  document.getElementById('of-amount').value = '';
  document.getElementById('of-status').value = 'PENDING';

  document.getElementById('order-modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function editOrder(id) {
  const order = allOrders.find((o) => o.id === id);
  if (!order) return;

  document.getElementById('order-modal-title').textContent = 'Edit Transaksi Order';
  document.getElementById('order-form-id').value = order.id;
  document.getElementById('of-user').value = order.user_id || '';
  document.getElementById('of-product').value = order.product_id || '';
  document.getElementById('of-amount').value = parseInt(order.total_amount);
  document.getElementById('of-status').value = order.status;

  document.getElementById('order-modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('order-modal-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

async function saveOrderForm(e) {
  e.preventDefault();
  const id = document.getElementById('order-form-id').value;
  const user_id = document.getElementById('of-user').value;
  const product_id = document.getElementById('of-product').value;
  const total_amount = document.getElementById('of-amount').value;
  const status = document.getElementById('of-status').value;

  if (!user_id || !product_id || !total_amount) {
    showNotification('Mohon lengkapi semua field!', 'error');
    return;
  }

  const data = { user_id, product_id, total_amount, status };
  const baseUrl = localStorage.getItem('base_url_api');
  let url = `${baseUrl}/admin/add-order-data`;
  let method = 'POST';

  if (id) {
    url = `${baseUrl}/admin/order-data/${id}`;
    method = 'PUT';
  }

  const btnSubmit = document.getElementById('btn-submit-order');
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
      showNotification(result.message || 'Transaksi order berhasil disimpan!', 'success');
      closeOrderModal();
      fetchOrders();
    } else {
      showNotification(result.message || 'Gagal menyimpan transaksi order', 'error');
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
  const isConfirmed = await showConfirmModal('Apakah Anda yakin ingin menghapus order ini?');
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
      showNotification(result.message || 'Order berhasil dihapus', 'success');
      fetchOrders();
    } else {
      showNotification(result.message || 'Gagal menghapus order', 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Terjadi kesalahan jaringan', 'error');
  }
}

function viewOrderDetail(id) {
  const order = allOrders.find((o) => o.id === id);
  if (!order) return;

  const detailContent = document.getElementById('order-detail-content');
  let statusClass = 'badge-pending';
  if (order.status === 'SUCCESS') statusClass = 'badge-success';
  if (order.status === 'EXPIRED') statusClass = 'badge-expired';

  const createdDate = order.created_at
    ? new Date(order.created_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const expiredDate = order.expired_at
    ? new Date(order.expired_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  detailContent.innerHTML = `
    <div><strong>Invoice ID:</strong><br/><span style="font-family: monospace; font-size: 12.5px; font-weight: 700;">${order.order_id}</span></div>
    <div><strong>Nama Pelanggan:</strong><br/>${order.user_fullname || '—'} (@${order.user_username || '—'})</div>
    <div><strong>Produk:</strong><br/>${order.product_name || '—'}</div>
    <div><strong>Total Pembayaran:</strong><br/><strong>Rp ${Number(order.total_amount || 0).toLocaleString('id-ID')}</strong></div>
    <div><strong>Status Order:</strong><br/><span class="badge ${statusClass}">${order.status}</span></div>
    <div><strong>Signature:</strong><br/><span style="font-family: monospace; font-size: 11px;">${order.signature || '—'}</span></div>
    <div><strong>QRIS Link:</strong><br/>${order.qris_url ? `<a href="${order.qris_url}" target="_blank" style="color: var(--black); text-decoration: underline;">Link QRIS</a>` : '—'}</div>
    <div><strong>Tanggal Dibuat:</strong><br/>${createdDate}</div>
    <div><strong>Batas Waktu:</strong><br/>${expiredDate}</div>
  `;

  document.getElementById('order-detail-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeOrderDetailModal() {
  document.getElementById('order-detail-overlay').style.display = 'none';
  document.body.style.overflow = '';
}
