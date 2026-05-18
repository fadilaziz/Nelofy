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
    let globalTransactionData = [
      {
        no_invoice: "INV/20260510/NEL/0012",
        order_id: 2849,
        invoice_created_at: "2026-05-10T10:00:00.000Z",
        invoice_status: "paid",
        product_name: "Fullstack Web Development Bootcamp",
        product_price: 499000,
        total_amount: 499000
      },
      {
        no_invoice: "INV/20260515/NEL/0034",
        order_id: 2854,
        invoice_created_at: "2026-05-15T14:30:00.000Z",
        invoice_status: "pending",
        product_name: "UI/UX Design Masterclass",
        product_price: 350000,
        total_amount: 350000
      },
      {
        no_invoice: "INV/20260505/NEL/0008",
        order_id: 2831,
        invoice_created_at: "2026-05-05T09:15:00.000Z",
        invoice_status: "expired",
        product_name: "React & Next.js Advanced Course",
        product_price: 299000,
        total_amount: 299000
      },
      {
        no_invoice: "INV/20260512/NEL/0022",
        order_id: 2851,
        invoice_created_at: "2026-05-12T16:45:00.000Z",
        invoice_status: "paid",
        product_name: "Python for Data Science",
        product_price: 450000,
        total_amount: 450000
      },
      {
        no_invoice: "INV/20260517/NEL/0041",
        order_id: 2860,
        invoice_created_at: "2026-05-17T21:10:00.000Z",
        invoice_status: "pending",
        product_name: "DevOps & Cloud Computing Guide",
        product_price: 599000,
        total_amount: 599000
      }
    ];

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
      const tx = (globalTransactionData || []).find(t => t.no_invoice === noInvoice);
      if (!tx) return;

      const modal = document.getElementById("detail-transaksi-modal");
      const body = document.getElementById("detail-transaksi-body");
      if (!modal || !body) return;

      const dt = new Date(tx.invoice_created_at).toLocaleString("id-ID", {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const product_name = tx.product_name || "Paket Kursus Nelofy Premium";
      const product_price = tx.product_price || tx.total_amount || 0;
      const total_amount = tx.total_amount || product_price || 0;

      const formatRupiah = (num) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0
        }).format(num);
      };

      const currentStatus = (tx.invoice_status || "").toLowerCase();
      const isPending = currentStatus === 'pending' || currentStatus === 'unpaid';
      const isPaid = currentStatus === 'paid';
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
        actionButtonHtml = `<a href="/payment?order_id=${tx.order_id}" style="display: block; width: 100%; text-align: center; padding: 12px; background: var(--black); color: var(--white); border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin-top: 24px; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Bayar Sekarang</a>`;
      } else if (isPaid) {
        actionButtonHtml = `<a href="/products" style="display: block; width: 100%; text-align: center; padding: 12px; background: var(--gray-100); color: var(--black); border: 1px solid var(--gray-300); border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin-top: 24px; transition: 0.2s;">Mulai Belajar</a>`;
      }

      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Header Info -->
          <div style="border-bottom: 1px solid var(--gray-200); padding-bottom: 16px;">
            <div style="font-size: 12px; color: var(--gray-400); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Nomor Invoice</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--black);">${tx.no_invoice}</div>
            <div style="font-size: 13px; color: var(--gray-500); margin-top: 6px;">
              Order ID: <strong>#${tx.order_id}</strong> &bull; ${dt}
            </div>
          </div>

          <!-- Product Details -->
          <div>
            <h4 style="font-size: 14px; font-weight: 700; color: var(--black); margin-bottom: 12px;">Produk yang Dibeli</h4>
            <div style="border: 1px solid var(--gray-200); border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; background: var(--gray-50);">
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--black); margin-bottom: 4px;">${product_name}</div>
                <div style="font-size: 12px; color: var(--gray-500);">Akses Kelas & Modul Digital</div>
              </div>
              <div style="font-weight: 700; font-size: 14px; color: var(--black);">${formatRupiah(product_price)}</div>
            </div>
          </div>

          <!-- Billing Details -->
          <div style="border-top: 1px solid var(--gray-200); padding-top: 16px; display: flex; flex-direction: column; gap: 10px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--black); margin-bottom: 4px;">Ringkasan Pembayaran</h4>
            
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--gray-500);">Harga Produk</span>
              <span style="color: var(--black); font-weight: 500;">${formatRupiah(product_price)}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 13px; align-items: center;">
              <span style="color: var(--gray-500);">Status Pembayaran</span>
              <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 99px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                ${statusLabel}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; border-top: 1px dashed var(--gray-200); padding-top: 12px; margin-top: 4px;">
              <span style="color: var(--black);">Total Pembayaran</span>
              <span style="color: var(--black); font-size: 16px;">${formatRupiah(total_amount)}</span>
            </div>
          </div>

          ${actionButtonHtml}
        </div>
      `;

      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    };

    window.closeDetailTransaksiModal = function () {
      const modal = document.getElementById("detail-transaksi-modal");
      if (modal) modal.classList.remove("show");
      document.body.style.overflow = "";
    };

    window.submitEditProfile = function () {
      // TODO: Submit API request to update profile
      alert('Update profile: Fitur segera hadir!');
      closeEditProfileModal();
    };

    window.openChangePasswordModal = function () {
      if (!globalUserData) return;
      document.getElementById('reset-password-email').textContent = globalUserData.user_email || '-';
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
        const email = globalUserData.user_email;

        // Kirim request API reset password
        const response = await fetch(`${baseUrl}/request_change_password`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ email })
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
      if (!confirm('Apakah Anda yakin ingin keluar?')) return;
      
      try {
        const baseUrl = localStorage.getItem('base_url_api');
        
        // Opsional: panggil API logout jika ada endpointnya
        await fetch(`${baseUrl}/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Hapus data dari local storage
        localStorage.clear();
        
        // Arahkan ke halaman login
        window.location.href = 'http://nelofy.id/products';
      } catch (error) {
        // Tetap paksa logout di sisi client
        localStorage.clear();
        window.location.href = 'http://nelofy.id/products';
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
      } catch (e) { }
    })();

    // Menutup sidebar otomatis setelah klik di mobile
    function closeSidebar() {
      document.getElementById('profile-sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('open');
    }

    // Set Menu yang Aktif
    function setActiveSidebar(index) {
      const links = document.querySelectorAll('.sidebar-link');
      links.forEach(l => l.classList.remove('active'));
      if (links[index]) links[index].classList.add('active');
      closeSidebar();
    }

    // Render Main Profile 
    window.renderProfile = function () {
      setActiveSidebar(0);
      const mainbox = document.getElementById("profile-main");

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
      const initial = data.username ? data.username.charAt(0).toUpperCase() : "U";

      mainbox.innerHTML = `
        <div class="profile-card fade-in-up" id="profile-container">
          <div class="profile-header">
            <div class="profile-avatar" id="avatar-initial">${initial}</div>
            <div class="profile-title">
              <h2 id="header-name">${data.username || "Guest"}</h2>
              <p id="header-email">${data.user_email || "-"}</p>
            </div>
          </div>
          
          <div class="profile-body">
            <div class="data-group">
              <h3>Informasi Pribadi</h3>
              <div class="data-grid">
                <div class="data-item">
                  <span class="data-label">Username</span>
                  <span class="data-value">${data.username || "-"}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Email</span>
                  <span class="data-value">${data.user_email || "-"}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">No. Telepon</span>
                  <span class="data-value">${data.user_phone || "-"}</span>
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
    // Render Riwayat Pembelian
    window.renderRiwayat = function () {
      setActiveSidebar(1);
      const mainbox = document.getElementById("profile-main");

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
          <h3 style="margin-bottom: 20px;">Riwayat Pembelian</h3>
          
          <div class="filter-wrapper">
            <div class="search-input-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="riwayat-search" class="search-input-field" placeholder="Cari No. Invoice atau Order ID..." oninput="filterRiwayat()">
            </div>
            
            <select id="riwayat-sort-filter" class="filter-select" onchange="filterRiwayat()">
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

    window.filterRiwayat = function () {
      const searchVal = document.getElementById("riwayat-search")?.value.toLowerCase().trim() || "";
      const sortVal = document.getElementById("riwayat-sort-filter")?.value || "newest";
      const tableContainer = document.getElementById("riwayat-table-container");

      if (!tableContainer) return;

      const rawData = globalTransactionData || [];

      // Filter: only PAID/SUCCESS
      let filtered = rawData.filter(tx => {
        const currentStatus = (tx.invoice_status || "").toLowerCase();
        const isPaid = currentStatus === "paid";
        
        const matchesSearch = 
          (tx.no_invoice || "").toLowerCase().includes(searchVal) ||
          (String(tx.order_id) || "").toLowerCase().includes(searchVal);

        return isPaid && matchesSearch;
      });

      // Sort
      filtered.sort((a, b) => {
        const dateA = new Date(a.invoice_created_at);
        const dateB = new Date(b.invoice_created_at);
        return sortVal === "newest" ? dateB - dateA : dateA - dateB;
      });

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
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Order ID</th>
                <th>Tanggal Pembayaran</th>
                <th>Status</th>
                <th style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
      `;

      filtered.forEach(tx => {
        const dt = new Date(tx.invoice_created_at).toLocaleString("id-ID", {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        html += `
          <tr>
            <td style="font-weight: 700; color: var(--black);">${tx.no_invoice}</td>
            <td>#${tx.order_id}</td>
            <td style="color: var(--gray-500);">${dt}</td>
            <td>
              <span style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 99px; background: #dcfce7; color: #166534; border: 1px solid #16653440;">
                LUNAS
              </span>
            </td>
            <td style="text-align: right;">
              <div class="btn-action-group">
                <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
                <a href="/products" class="btn-secondary-sm">Buka Kelas</a>
              </div>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
      tableContainer.innerHTML = html;
    };

    // Render Pesanan Saya
    window.renderTransaksi = function () {
      setActiveSidebar(2);
      const mainbox = document.getElementById("profile-main");

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
          <h3 style="margin-bottom: 20px;">Pesanan Saya</h3>
          
          <div class="filter-wrapper">
            <div class="search-input-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="transaksi-search" class="search-input-field" placeholder="Cari No. Invoice atau Order ID..." oninput="filterTransaksi()">
            </div>
            
            <select id="transaksi-status-filter" class="filter-select" onchange="filterTransaksi()">
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

    window.filterTransaksi = function () {
      const searchVal = document.getElementById("transaksi-search")?.value.toLowerCase().trim() || "";
      const statusVal = document.getElementById("transaksi-status-filter")?.value || "all";
      const tableContainer = document.getElementById("transaksi-table-container");

      if (!tableContainer) return;

      const rawData = globalTransactionData || [];

      // Filter
      const filtered = rawData.filter(tx => {
        const matchesSearch = 
          (tx.no_invoice || "").toLowerCase().includes(searchVal) ||
          (String(tx.order_id) || "").toLowerCase().includes(searchVal);

        const currentStatus = (tx.invoice_status || "").toLowerCase();
        let matchesStatus = true;
        if (statusVal === "pending") {
          matchesStatus = currentStatus === "pending" || currentStatus === "unpaid";
        } else if (statusVal === "paid") {
          matchesStatus = currentStatus === "paid";
        } else if (statusVal === "ex") {
          matchesStatus = currentStatus === "expired" || currentStatus === "ex";
        }

        return matchesSearch && matchesStatus;
      });

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

      let html = `
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Order ID</th>
                <th>Tanggal Pembuatan</th>
                <th>Status</th>
                <th style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
      `;

      filtered.forEach(tx => {
        const currentStatus = (tx.invoice_status || "").toLowerCase();
        const isPending = currentStatus === 'pending' || currentStatus === 'unpaid';
        const isPaid = currentStatus === 'paid';
        const isExpired = currentStatus === 'expired' || currentStatus === 'ex';

        const dt = new Date(tx.invoice_created_at).toLocaleString("id-ID", {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

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

        let actionHtml = '';
        if (isPending) {
          actionHtml = `
            <div class="btn-action-group">
              <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
              <a href="/payment?order_id=${tx.order_id}" class="btn-primary-sm">Bayar</a>
            </div>
          `;
        } else if (isExpired) {
          actionHtml = `
            <div class="btn-action-group">
              <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
              <span class="label-status-text">Kedaluwarsa</span>
            </div>
          `;
        } else {
          actionHtml = `
            <div class="btn-action-group">
              <button onclick="window.openDetailTransaksiModal('${tx.no_invoice}')" class="btn-detail">Detail</button>
              <span class="label-status-text">Selesai</span>
            </div>
          `;
        }

        html += `
          <tr>
            <td style="font-weight: 700; color: var(--black);">${tx.no_invoice}</td>
            <td>#${tx.order_id}</td>
            <td style="color: var(--gray-500);">${dt}</td>
            <td>
              <span style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 99px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                ${statusLabel}
              </span>
            </td>
            <td style="text-align: right;">${actionHtml}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
      tableContainer.innerHTML = html;
    };

    document.addEventListener("DOMContentLoaded", () => {
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
        fetch(baseUrl + '/get_current_user', {
          method: 'GET',
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            'ngrok-skip-browser-warning': 'true'
          }
        })
          .then(response => response.json())
          .then(result => {
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
              console.error("Format data tidak sesuai:", result);
            }
          })
          .catch(error => console.error("Gagal memuat profil:", error));

        // Fetch Data Transaksi
        fetch(baseUrl + '/get_transaction', {
          method: 'GET',
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(result => {
            if (result && result.code == 200 && result.data && result.data.length > 0) {
              globalTransactionData = result.data;
            } else {
              console.log("Menggunakan data dummy transaksi karena kosong dari database.");
            }
            
            // Jika tab=transaksi atau tab=riwayat, re-render setelah data transaksi tersedia
            const urlParams = new URLSearchParams(window.location.search);
            const currentTab = urlParams.get('tab');
            if (currentTab === 'transaksi') {
              window.renderTransaksi();
            } else if (currentTab === 'riwayat') {
              window.renderRiwayat();
            }
          })
          .catch(error => {
            console.error("Gagal memuat transaksi dari database, menggunakan data dummy:", error);
            const urlParams = new URLSearchParams(window.location.search);
            const currentTab = urlParams.get('tab');
            if (currentTab === 'transaksi') {
              window.renderTransaksi();
            } else if (currentTab === 'riwayat') {
              window.renderRiwayat();
            }
          });

      } else {
        console.warn("Anda belum login (baseUrl tidak ada).");
      }
    });