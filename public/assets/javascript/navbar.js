//Menyuntikan strukture navbar ke body
function topBarInject() {
  const topBar = `
    <!-- ─── TOP ANNOUNCEMENT BAR ─── -->
        <div class="topbar-left">
        Dapatkan <span style="color: var(--primary); font-weight: 700;">Diskon 10%</span> untuk pembelian pertama.&nbsp;
        <a href="#"></a>
        </div>
        <div class="topbar-right">
        <!-- Masuk btn (visible saat belum login) -->
        <a href="#" id="auth-masuk-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>Masuk
        </a>
        <a href="#" id="auth-daftar-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>Daftar
        </a>
        <a href="#" id="bantuan-btn" onclick="openHelpModal(event)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>Bantuan
        </a>
        <div class="profile-chip-wrapper" id="profile-chip-wrapper">
        <div class="nav-profile-chip" id="nav-profile-chip">
          <div class="nav-profile-avatar" id="nav-profile-avatar"></div>
          <span class="nav-profile-name" id="nav-profile-name"></span>
          <svg class="nav-profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="profile-dropdown">
          <a href="/profile" class="profile-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Profile
          </a>
          <a href="/profile?tab=riwayat" class="profile-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            Riwayat Pembelian
          </a>
          <a href="/profile?tab=transaksi" class="profile-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            Pesanan Saya
          </a>
          <div class="profile-dropdown-item" id="theme-toggle-btn" style="cursor: pointer; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg id="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg id="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              Dark Mode
            </div>
            <div class="theme-switch-track" style="width: 32px; height: 18px; background: var(--gray-300); border-radius: 99px; position: relative; transition: background 0.3s;">
               <div class="theme-switch-handle" style="width: 14px; height: 14px; background: var(--white); border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s;"></div>
            </div>
          </div>
          <a href="#" class="profile-dropdown-item" id="auth-logout-btn" style="color: var(--red);" onclick="logout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--red);">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>Logout
          </a>
        </div>
      </div>
        </div>
    `;

  //Memasukan ke bagian paling atas dari body
  document.getElementById('topbar').innerHTML = topBar;
}

//Menyuntikan navbar ke body
function navbarInject() {
  const navBar = `
    <a href="/" class="nav-logo">Nelo<span>fy</span></a>
    <div class="nav-actions">
      <!-- Theme Toggle for Logged-Out Users -->
      <button id="theme-toggle-loggedout" class="nav-icon-btn" title="Toggle Tema" style="display: none;">
        <svg id="theme-icon-sun-lo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block; width: 20px; height: 20px;">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg id="theme-icon-moon-lo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none; width: 20px; height: 20px;">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <div class="notif-wrapper">
        <button class="nav-icon-btn" id="notif-toggle-btn" title="Notifikasi" style="position:relative;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span class="notif-badge" id="notif-badge">0</span>
        </button>

        <div class="notif-dropdown" id="notif-dropdown">
          <div class="notif-dropdown-header">
            <div class="notif-header-top">
              <div class="notif-dropdown-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                Notifikasi
              </div>
              <span class="notif-count-label" id="notif-count-label">0 baru</span>
            </div>
            <div class="notif-tabs">
              <button class="notif-tab active" data-target="transaksi">Transaksi</button>
              <button class="notif-tab" data-target="pesan">Pesan</button>
            </div>
          </div>
          <div class="notif-dropdown-body" id="notif-dropdown-body">
          </div>
          <div class="notif-dropdown-footer">
            <a href="#" id="notif-clear-all">Tandai semua sudah dibaca</a>
          </div>
        </div>
      </div>
      <div class="notif-overlay" id="notif-overlay"></div>
      <button id="cart-open-btn" class="nav-icon-btn" title="Keranjang" style="position:relative;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
        <span id="cart-badge" style="
          display:none; position:absolute; top:2px; right:2px;
          background:#e11d48; color:#fff; font-size:9px; font-weight:700;
          min-width:16px; height:16px; border-radius:99px; padding:0 4px;
          align-items:center; justify-content:center; line-height:1;
          font-family:'Inter',sans-serif; pointer-events:none;
        ">0</span>
      </button>
    </div>
    `;

  //Memasukan ke bagian paling atas dari body
  document.getElementsByClassName('navbar')[0].innerHTML = navBar;
}

topBarInject();
navbarInject();
