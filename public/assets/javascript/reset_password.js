// NOTIFICATION FUNCTION
function showNotification(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

async function submitNewPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!newPassword || !confirmPassword) {
        showNotification('Mohon isi semua field', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Konfirmasi password tidak cocok', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password minimal 8 karakter', 'error');
        return;
    }

    // Ambil token dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showNotification('Token reset password tidak valid atau tidak ditemukan', 'error');
        return;
    }

    const btn = document.getElementById('btn-submit-reset');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Menyimpan...';
    btn.disabled = true;

    try {
        const baseUrl = localStorage.getItem('base_url_api');

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const token = urlParams.get('token');

        // Memanggil API update password
        const response = await fetch(`${baseUrl}/reset_password`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ token: token, new_password: newPassword })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Password berhasil diubah! Mengarahkan ke halaman utama...', 'success');
            setTimeout(() => {
                // window.location.href = '../product/products.html'; // Sesuaikan dengan route halaman utama/login
                console.log(data.data);
            }, 2000);
        } else {
            showNotification('Gagal: ' + (data.message || 'Terjadi kesalahan'), 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Terjadi kesalahan jaringan.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}