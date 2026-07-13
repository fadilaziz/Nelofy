//Ambil element button
const send_email_btn = document.getElementById('submit-btn');

send_email_btn.addEventListener('click', async () => {
  //Ambil data dari input email
  const email = document.getElementById('email').value;

  //Cek apakah email sudah diisi
  if (!email) {
    alert('Email tidak boleh kosong');
    return;
  }

  //Ambil base URL backend dari localstorage
  const BASE_URL = localStorage.getItem('base_url_api');

  //Kirim request ke backend
  try {
    console.log('ini base url : ', BASE_URL + '/password/request_reset_password_admin');
    const response = await fetch(BASE_URL + '/password/request_reset_password_admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      window.location.href = '/login';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan saat mengirim permintaan');
  }
});
