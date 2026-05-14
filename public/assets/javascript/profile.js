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
    let globalTransactionData = null;

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

        // Kirim request API reset password
        const response = await fetch(`${baseUrl}/request_change_password`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
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

    // Render Kelas Saya
    window.renderKelas = function () {
      setActiveSidebar(1);
      const mainbox = document.getElementById("profile-main");

      const data = globalTransactionData;
      const paidOrders = data ? data.filter(tx => (tx.invoice_status || '').toLowerCase() === 'paid') : [];

      let html = `
        <div class="profile-card" style="padding: 32px;">
          <h3 style="margin-bottom: 20px;">Kelas Saya</h3>
      `;

      if (paidOrders.length === 0) {
        html += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 0; color: var(--gray-400);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            <p style="font-size: 14px;">Belum ada kelas yang dibeli.</p>
            <a href="/products" style="font-size: 13px; font-weight: 600; color: var(--black); text-decoration: underline;">Jelajahi Kelas</a>
          </div>
        `;
      } else {
        html += `<div style="display: flex; flex-direction: column; gap: 14px;">`;
        paidOrders.forEach(tx => {
          const dt = new Date(tx.invoice_created_at).toLocaleString("id-ID", {
            day: 'numeric', month: 'short', year: 'numeric'
          });
          html += `
            <div style="border: 1px solid var(--gray-200); border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--black); margin-bottom: 4px;">Order #${tx.order_id}</div>
                <div style="font-size: 12px; color: var(--gray-500);">Inv: ${tx.no_invoice} &bull; ${dt}</div>
              </div>
              <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; background: #dcfce7; color: #166534; border: 1px solid #16a34a40;">AKTIF</span>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
      mainbox.innerHTML = html;
    };

    // Render Main Profile 
    window.renderProfile = function () {
      setActiveSidebar(0);
      if (!globalUserData) return;

      const data = globalUserData;
      const initial = data.username ? data.username.charAt(0).toUpperCase() : "U";

      const mainbox = document.getElementById("profile-main");
      mainbox.innerHTML = `
        <div class="profile-card" id="profile-container">
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
    window.renderRiwayat = function () {
      setActiveSidebar(2);
      const mainbox = document.getElementById("profile-main");
      mainbox.innerHTML = `
        <div class="profile-card" style="padding: 32px;">
          <h3 style="margin-bottom: 16px;">Riwayat Pembelian</h3>
          <p style="color: var(--gray-500); font-size: 14px;">Belum ada riwayat pembelian untuk saat ini.</p>
        </div> 
      `;
    };

    // Render Transaksi
    window.renderTransaksi = function () {
      setActiveSidebar(3);
      const mainbox = document.getElementById("profile-main");

      let contentHtml = `
        <div class="profile-card" style="padding: 32px;">
          <h3 style="margin-bottom: 16px;">Transaksi</h3>
      `;

      const data = globalTransactionData;

      if (!data || data.length === 0) {
        contentHtml += `<p style="color: var(--gray-500); font-size: 14px;">Belum ada riwayat transaksi.</p>`;
      } else {
        contentHtml += `<div style="display: flex; flex-direction: column; gap: 16px;">`;
        data.forEach(tx => {
          // Asumsi status case insensitive: pending atau unpaid berarti butuh aksi bayar
          const currentStatus = (tx.invoice_status || "").toLowerCase();
          const isPending = currentStatus === 'pending' || currentStatus === 'unpaid';
          const isPaid = currentStatus === 'paid';
          const isExpired = currentStatus === 'expired';

          const dt = new Date(tx.invoice_created_at).toLocaleString("id-ID", {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          // Default styling (Success)
          let statusBg = '#dcfce7';
          let statusColor = '#166534';

          if (isPending) {
            statusBg = '#fef3c7';
            statusColor = '#92400e';
          } else if (isExpired) {
            statusBg = '#fee2e2';
            statusColor = '#991b1b';
          } else if (isPaid) {
            statusBg = '#dcfce7';
            statusColor = '#166534';
          }

          const statusLabel = tx.invoice_status.toUpperCase();

          contentHtml += `
            <div style="border: 1px solid var(--gray-200); border-radius: 8px; padding: 16px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
              <div>
                <div style="font-weight: 700; font-size: 15px; color: var(--black); margin-bottom: 4px;">Inv: ${tx.no_invoice}</div>
                <div style="font-size: 13px; color: var(--gray-500); margin-bottom: 10px;">Order: #${tx.order_id} &bull; ${dt}</div>
                <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                  ${statusLabel}
                </span>
              </div>
              <div style="text-align: right;">
                ${isPending
              ? `<a href="/payment?order_id=${tx.order_id}" style="display: inline-flex; padding: 10px 20px; background: var(--black); color: var(--white); border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; transition: 0.2s;">Bayar Sekarang</a>`
              : isExpired
                ? `<span style="font-size: 13px; color: var(--gray-400); font-weight: 600;">Kedaluwarsa</span>`
                : isPaid
                  ? `<span style="font-size: 13px; color: var(--gray-400); font-weight: 600;">Selesai</span>`
                  : `<span style="font-size: 13px; color: var(--gray-400); font-weight: 600;">Selesai</span>`
            }
              </div>
            </div>
          `;
        });
        contentHtml += `</div>`;
      }

      contentHtml += `</div>`;
      mainbox.innerHTML = contentHtml;
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
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(result => {
            if (result && result.data) {
              globalUserData = result.data;

              // Handle ?tab= query param dari navbar dropdown
              const urlParams = new URLSearchParams(window.location.search);
              const tab = urlParams.get('tab');
              if (tab === 'kelas') {
                window.renderKelas();
              } else if (tab === 'riwayat') {
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
            if (result && result.code == 200) {
              globalTransactionData = result.data;
              // Jika tab=kelas, re-render setelah data transaksi tersedia
              const urlParams = new URLSearchParams(window.location.search);
              if (urlParams.get('tab') === 'kelas') window.renderKelas();
            } else {
              console.error("Format data transaksi tidak sesuai:", result);
            }
          })
          .catch(error => console.error("Gagal memuat transaksi:", error));

      } else {
        console.warn("Anda belum login (baseUrl tidak ada).");
      }
    });