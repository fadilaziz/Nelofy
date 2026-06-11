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

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════

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

function formatRupiah(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) +
    ', ' +
    d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

// ══════════════════════════════════════════
//  COPY TO CLIPBOARD
// ══════════════════════════════════════════

function copyToClipboard() {
  const numberEl = document.getElementById('val-payment-number');
  const text = numberEl.textContent.replace(/\s/g, '');
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy-number');
    btn.classList.add('copied');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!`;
    showNotification('Nomor rekening berhasil disalin', 'success');
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Salin`;
    }, 2000);
  });
}

// ══════════════════════════════════════════
//  COUNTDOWN TIMER
// ══════════════════════════════════════════

let countdownInterval = null;

function startCountdown(expiresAt) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  const target = new Date(expiresAt).getTime();

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(countdownInterval);
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      document.getElementById('cd-hours').classList.add('danger');
      document.getElementById('cd-minutes').classList.add('danger');
      document.getElementById('cd-seconds').classList.add('danger');
      // Update status
      updateStatusBanner('expired');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');

    // Red when less than 1 hour
    if (hours < 1) {
      document.getElementById('cd-hours').classList.add('danger');
      document.getElementById('cd-minutes').classList.add('danger');
      document.getElementById('cd-seconds').classList.add('danger');
    }
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

function updateStatusBanner(status) {
  const banner = document.getElementById('status-banner');
  const title = document.getElementById('status-title');
  const desc = document.getElementById('status-desc');
  const badgeEl = document.getElementById('status-badge');
  const orderBadge = document.getElementById('order-badge');
  const orderBadgeText = document.getElementById('order-badge-text');

  banner.className = `status-banner ${status}`;
  orderBadge.className = `badge ${status}`;

  if (status === 'pending') {
    title.textContent = 'Menunggu Pembayaran';
    desc.textContent = 'Segera lakukan pembayaran sebelum batas waktu berakhir.';
    banner.querySelector('.status-banner-icon').innerHTML =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    orderBadgeText.textContent = 'PENDING';
  } else if (status === 'expired') {
    title.textContent = 'Pembayaran Kedaluwarsa';
    desc.textContent = 'Batas waktu pembayaran telah berakhir. Silakan buat pesanan baru.';
    banner.querySelector('.status-banner-icon').innerHTML =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    orderBadgeText.textContent = 'EXPIRED';
    document.getElementById('countdown-section').style.display = 'none';
  } else if (status === 'paid' || status === 'success') {
    title.textContent = 'Pembayaran Berhasil';
    desc.textContent = 'Transaksi Anda telah berhasil diverifikasi. Terima kasih!';
    banner.querySelector('.status-banner-icon').innerHTML =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    orderBadgeText.textContent = 'LUNAS';
    document.getElementById('countdown-section').style.display = 'none';

    // Fix layout so it doesn't look messy/empty when the countdown is hidden
    const quickInfo = document.querySelector('.payment-quick-info');
    if (quickInfo) {
      quickInfo.style.justifyContent = 'center';
    }

    // Hide the QRIS / Bank Transfer instructions to clean up the page
    const instructionsBlock = document.getElementById('payment-instructions-block');
    if (instructionsBlock) {
      instructionsBlock.style.display = 'none';
    }
  }
}

// ══════════════════════════════════════════
//  RENDER PAYMENT DATA
// ══════════════════════════════════════════

function renderPayment(paymentData) {
  const d = paymentData;

  // Invoice / Order ID
  document.getElementById('val-invoice').textContent = d.no_invoice || d.order_id || '—';

  // Status
  const now = new Date();
  const jatuhTempo = new Date(d.jatuh_tempo || d.expired_at);
  let status = (d.invoice_status || d.status || 'PENDING').toLowerCase();

  if (status === 'pending' && jatuhTempo < now) {
    status = 'expired';
  }
  updateStatusBanner(status);

  // Stop polling if status is no longer pending
  if (status !== 'pending' && window.checkPaymentStatus) {
    clearInterval(window.checkPaymentStatus);
  }

  // Countdown
  if (status === 'pending') {
    startCountdown(d.jatuh_tempo || d.expired_at);
  } else {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    document.getElementById('countdown-section').style.display = 'none';
  }

  // Total
  document.getElementById('val-total-tagihan').textContent = formatRupiah(
    d.total_tagihan || d.total_amount
  );

  // Payment method
  document.getElementById('val-payment-method').textContent = d.payment_method || 'QRIS';

  // Check if QRIS
  const isQris = (d.payment_method || 'QRIS').toLowerCase().includes('qris');

  if (isQris) {
    // Show QRIS QR Code view, hide bank transfer view
    document.getElementById('bank-transfer-view').style.display = 'none';
    document.getElementById('qris-view').classList.add('visible');

    // Dynamic QRIS Image
    const qrUrl = d.qris_image || d.qris_url || `../../assets/images/my_qris.jpeg`;
    document.getElementById('qris-qr-img').src = qrUrl;

    // Update payment steps for QRIS
    document.getElementById('payment-steps').innerHTML = `
          <li>Buka aplikasi e-Wallet (GoPay, OVO, DANA, ShopeePay) atau mobile banking Anda.</li>
          <li>Pilih menu <strong>Scan QR</strong> atau <strong>Bayar dengan QR</strong>.</li>
          <li>Arahkan kamera ke QR code yang tertera di atas.</li>
          <li>Pastikan nominal pembayaran sudah sesuai, lalu konfirmasi.</li>
          <li>Pembayaran akan diverifikasi secara otomatis.</li>
        `;
  } else {
    // Bank transfer
    document.getElementById('bank-transfer-view').style.display = 'flex';
    document.getElementById('qris-view').classList.remove('visible');

    const bankAccounts = {
      'Transfer Bank BCA': '014 987 654 321',
      'Transfer Bank BRI': '002 123 456 789',
      'Transfer Bank BNI': '009 555 444 333',
    };
    const accountNumber = bankAccounts[d.payment_method] || '—';
    document.getElementById('val-payment-number').textContent = accountNumber;
  }

  // Detail grid
  document.getElementById('val-tanggal').textContent = formatDateTime(
    d.tanggal_pesan || new Date()
  );
  document.getElementById('val-order-id').textContent = `#${d.order_id}`;
  document.getElementById('val-invoice-status').textContent =
    status === 'pending'
      ? 'Menunggu Pembayaran'
      : status === 'expired'
        ? 'Kedaluwarsa'
        : status === 'paid' || status === 'success'
          ? 'Lunas'
          : status.toUpperCase();
  document.getElementById('val-jatuh-tempo').textContent = formatDateTime(
    d.jatuh_tempo || d.expired_at
  );

  // Items
  const tbody = document.getElementById('order-items-body');
  tbody.innerHTML = '';

  const items = d.items || [
    {
      product_name: d.product_name || 'Produk',
      price: d.price || d.total_amount,
      quantity: 1,
    },
  ];

  items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
          <td>
            <div class="order-product-name">${item.product_name}</div>
            <div class="order-product-meta">Online Course</div>
          </td>
          <td>${item.quantity}</td>
          <td>${formatRupiah(item.price)}</td>
        `;
    tbody.appendChild(tr);
  });

  // Summary
  document.getElementById('val-subtotal').textContent = formatRupiah(
    d.total_order || d.total_amount
  );

  const discount = Number(d.discount) || 0;
  if (discount > 0) {
    document.getElementById('discount-row').style.display = 'flex';
    document.getElementById('val-discount').textContent = `- ${formatRupiah(discount)}`;
  }

  document.getElementById('val-grand-total').textContent = formatRupiah(
    d.total_tagihan || d.total_amount
  );

  const btnConfirm = document.getElementById('btn-confirm-payment');
  if (btnConfirm && status !== 'pending') {
    btnConfirm.style.display = 'none';
  }
}

// ══════════════════════════════════════════
//  CONFIRM PAYMENT (placeholder)
// ══════════════════════════════════════════

function confirmPayment() {
  const btn = document.getElementById('btn-confirm-payment');
  btn.textContent = 'Memproses...';
  btn.style.pointerEvents = 'none';

  showNotification('Pembayaran Anda sedang diverifikasi. Mohon tunggu konfirmasi.', 'success');

  setTimeout(() => {
    btn.textContent = 'Saya Sudah Bayar';
    btn.style.pointerEvents = '';
  }, 3000);
}

// ══════════════════════════════════════════
//  LOAD PAYMENT DATA
// ══════════════════════════════════════════

async function loadPaymentData() {
  const loadingEl = document.getElementById('loading-state');
  const errorEl = document.getElementById('error-state');
  const contentEl = document.getElementById('payment-content');

  // Get order_id dari URLSearchParams
  const rawOrderId = new URLSearchParams(window.location.search).get('order_id');

  //Validasi order_id
  if (!rawOrderId) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    document.getElementById('error-message').textContent =
      'Tidak ada order ID yang ditemukan. Silakan lakukan checkout terlebih dahulu.';
    return;
  }

  try {
    const baseUrl = localStorage.getItem('base_url_api');
    const response = await fetch(`${baseUrl}/payment/payment_products`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        order_id: rawOrderId,
      }),
    });

    const result = await response.json();

    console.log('Payment API Response:', result);

    if (result.code === 200 && result.data && result.data.length > 0) {
      loadingEl.style.display = 'none';
      errorEl.style.display = 'none';
      contentEl.style.display = 'block';
      renderPayment(result.data[0]);
    } else {
      loadingEl.style.display = 'none';
      contentEl.style.display = 'none';
      errorEl.style.display = 'block';
      document.getElementById('error-message').textContent =
        'Data pembayaran tidak ditemukan untuk order #' + rawOrderId;
    }
  } catch (error) {
    console.error('Gagal memuat data pembayaran:', error);
    loadingEl.style.display = 'none';
    contentEl.style.display = 'none';
    errorEl.style.display = 'block';
    document.getElementById('error-message').textContent =
      'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
  }
}

//Polling check status pembayaran setiap 3 detik
window.checkPaymentStatus = setInterval(() => {
  loadPaymentData();
}, 3000);

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  loadPaymentData();
});
