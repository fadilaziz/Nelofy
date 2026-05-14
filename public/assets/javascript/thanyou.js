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

// Populate summary dari localStorage atau query param
(function populateSummary() {

    // Coba ambil dari localStorage (bp_pending_order_id, dll)
    const orderId = localStorage.getItem('bp_pending_order_id') || '—';
    document.getElementById('ty-order-id').textContent = orderId !== '—' ? `#${orderId}` : '—';

    // Tanggal sekarang
    const now = new Date().toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    document.getElementById('ty-date').textContent = now;

    // Coba ambil dari query param ?invoice=INV-xxxx&order_id=xxx
    const params = new URLSearchParams(window.location.search);
    if (params.get('invoice')) {
        document.getElementById('ty-invoice').textContent = params.get('invoice');
    }
    if (params.get('order_id')) {
        document.getElementById('ty-order-id').textContent = `#${params.get('order_id')}`;
    }
})();

// Confetti burst
(function launchConfetti() {
    const colors = ['#111111', '#16a34a', '#a3a3a3', '#e5e5e5', '#404040'];
    const count = 55;
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width = (Math.random() * 6 + 5) + 'px';
        el.style.height = (Math.random() * 6 + 5) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (Math.random() * 2 + 2.5) + 's';
        el.style.animationDelay = (Math.random() * 0.8) + 's';
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
})();