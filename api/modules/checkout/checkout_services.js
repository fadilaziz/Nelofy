import sql from '../../database/db';
import axios from 'axios';
import { formatRupiah } from '../../common/helper';

//Payload checkout
export const capture_payload_checkout = async (payload) => {
  console.log('ini data checkout', payload);
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload is empty');
  }

  const dataUser = await sql`
    SELECT id, full_name, username, email, phone
    FROM users
    WHERE id = ${payload.user_id}`;

  const {
    user_id = dataUser[0].id,
    full_name = dataUser[0].full_name,
    username = dataUser[0].username,
    email = dataUser[0].email,
    phone = dataUser[0].phone,
    voucher_code,
    product_id,
    qty,
    payment_method,
  } = payload;

  return {
    user_id,
    full_name,
    username,
    email,
    phone,
    voucher_code,
    product_id,
    qty,
    payment_method,
  };
};

//Validasi payload checkout
export const validation_payload_checkout = async (payload) => {
  if (!payload.full_name) {
    throw new Error('Full name is required');
  }

  if (!payload.username) {
    throw new Error('Username is required');
  }

  const regex = /\S+@\S+\.\S+/;
  if (!payload.email) {
    throw new Error('User email is required');
  } else if (!regex.test(payload.email)) {
    throw new Error('Email is not valid');
  }

  if (!payload.product_id) {
    throw new Error('Product ID is required');
  }

  if (!payload.qty) {
    throw new Error('Quantity is required');
  } else if (payload.qty > 2) {
    throw new Error("Quantity exceeds buyer's limit");
  }
  return payload;
};

//Get price product
export const get_product_price = async (payload) => {
  if (!payload.product_id) {
    throw new Error('Product ID is required');
  }
  const dataProduct = await sql`
    SELECT price
    FROM products
    WHERE id = ${payload.product_id}`;
  payload.price = dataProduct[0].price;

  //Mengubah price menjadi integer
  payload.price = parseInt(payload.price);
  return payload;
};

//Kalkuasi jika ada voucher code atau diskon
export const calculate_discount = async (payload) => {
  if (!payload.voucher_code) {
    payload.discount = 0;
    payload.total = payload.price * payload.qty;
    return payload;
  }

  //Ambil data voucher
  const dataVoucher = await sql`
    SELECT *
    FROM vouchers
    WHERE uniq_code = ${payload.voucher_code}`;

  //Validasi apakah voucher masih berlaku
  if (dataVoucher[0].expired < Date.now()) {
    throw new Error('Voucher code is expired');
  }

  //Menentukan besaran diskon
  if (payload.voucher_code == dataVoucher[0].uniq_code) {
    const discount = dataVoucher[0].discount / 100;
    payload.discount = payload.price * payload.qty * discount;
    payload.total = payload.price * payload.qty - payload.discount;
  }
  return payload;
};

//Transaksi Full checkout
export const transaction = async (payload) => {
  console.log('payload ', payload);
  return await sql.begin(async (t) => {
    const total = payload.total;
    const url = process.env.KLIKQRIS_URL;

    //Generate Invoice Random
    function generateInvoiceRandom() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();

      return `INV-${year}${month}${day}-${random}`;
    }
    const no_invoice = generateInvoiceRandom();

    //Generate angka acak sebanyak 3 digit
    // function generateAmountUniq() {
    //     const random = Math.floor(100 + Math.random() * 900);
    //     return random;
    // }
    // const amount_uniq = generateAmountUniq();

    // const total_amount = total + amount_uniq;

    //Payload untuk klikqris
    const payload_qris = {
      order_id: no_invoice,
      id_merchant: process.env.KLIKQRIS_ID_MERCHANT,
      amount: total,
      keterangan: 'Pembayaran Tagihan',
    };

    //Header Configurasi klikqris
    const option = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.KLIKQRIS_API_KEY,
        id_merchant: process.env.KLIKQRIS_ID_MERCHANT,
      },
      body: JSON.stringify(payload_qris),
    };

    const res = await axios.post(url, payload_qris, option);

    // Simpan data Order utama
    const [order] = await t`
            INSERT INTO orders (order_id, user_id,product_id,total_amount, status, signature, qris_url, expired_at, qris_image,created_at)
            VALUES (${no_invoice}, ${payload.user_id}, ${payload.product_id}, ${res.data.data.total_amount}, 'PENDING', ${res.data.data.signature}, ${res.data.data.qris_url}, ${res.data.data.expired_at}, ${res.data.data.qris_image},${new Date()})
            RETURNING id
        `;

    // Simpan data Invoice
    // await t`
    //         INSERT INTO invoices (order_id, no_invoice, jatuh_tempo, qty, subtotal, total, status, created_at)
    //         VALUES (${order.id}, ${no_invoice}, ${res.data.data.expired_at}, ${payload.qty}, ${payload.price}, ${payload.total}, 'pending', ${new Date()},)
    //     `;

    payload.no_invoice = res.data.data.order_id;
    payload.signature = res.data.data.signature;
    payload.expired_at = res.data.data.expired_at;
    payload.total_amount = res.data.data.total_amount;

    // Kembalikan hasil akhir
    return payload;
  });
};

//Update Status Menjadi SUCCESS jika qris sudah di bayar
export const update_status_order = async (payload) => {
  if (!payload) {
    throw new Error('Payload is required');
  }

  //Ambil data order
  const orderdata = await sql`
        SELECT signature
        FROM orders
        WHERE order_id = ${payload.order_id}`;

  //Verifikasi Signature dari database dan payload
  if (orderdata[0].signature == payload.signature) {
    //Jika status PAID maka akan update status order
    if (payload.status == 'PAID') {
      const [order] = await sql`
            UPDATE orders SET status = 'SUCCESS'
            WHERE signature = ${payload.signature}
            AND order_id = ${payload.order_id}`;
      await sql`
            UPDATE invoices SET status = 'SUCCESS'
            WHERE no_invoice = ${payload.order_id}`;
      return order;
      //Jika status EXPIRED maka akan update status order
    } else if (payload.status == 'EXPIRED') {
      const [order] = await sql`
            UPDATE orders SET status = 'EXPIRED'
            WHERE signature = ${payload.signature}
            AND order_id = ${payload.order_id}`;
      await sql`
            UPDATE invoices SET status = 'EXPIRED'
            WHERE no_invoice = ${payload.order_id}`;
      return order;
    } else {
      throw new Error('Status tidak cocok');
    }
  } else {
    throw new Error('Signature tidak cocok');
  }
};

//Kirim pesan whatsapp dan email ke user setelah transaksi berhasil
export const order_success_send_message = async (payload) => {
  //Ambil id_user, dari table orders
  const orderData = await sql`
    SELECT user_id FROM orders
    WHERE order_id = ${payload.order_id}`;

  //Ambil phone dan email
  const userData = await sql`
    SELECT full_name,phone, email
    FROM users
    WHERE id = ${orderData[0].user_id}`;

  payload.full_name = userData[0].full_name;
  payload.phone = userData[0].phone;
  payload.email = userData[0].email;

  //Kondisi if jika tidak ada phone atau email
  if (!payload.phone || !payload.email) {
    throw new Error('User phone or email is not found');
  }

  //Mengubah harga menjadi format rupiah
  const amount = formatRupiah(payload.total_amount);

  //Pesan template whatsapp
  const message = `
*Ringkasan Transaksi #${payload.order_id}*

Halo *${payload.full_name}*, transaksi Anda telah kami terima dengan detail berikut:

*Total:* ${amount}
*Status:* *${payload.status}*

Terima kasih telah menggunakan layanan kami.
_Pesan ini dikirim secara otomatis._`;

  //Menambahkan destination dan message ke dalam payload
  payload.destination = userData[0].phone;
  payload.message = message;

  //Kirim pesan whatsapp
  const whatsapp = require('../whatsapp/whatsapp_services');
  await whatsapp.hit_api_woowa_send_wa(payload);
};

export const checkout_send_queue = async (payload) => {
  console.log('ini queue', payload);
  //Ambil data products
  const product_data = await sql`
    SELECT product_name
    FROM products
    WHERE id = ${payload.product_id}`;
  payload.product_name = product_data[0].product_name;

  //Mengambil data user
  const user_data = await sql`
    SELECT full_name, email
    FROM users
    WHERE id = ${payload.user_id}`;
  payload.full_name = user_data[0].full_name;
  payload.email = user_data[0].email;

  //Mengambil id order
  const order_id = await sql`
    SELECT id
    FROM orders
    WHERE order_id = ${payload.no_invoice}`;
  payload.order_id = order_id[0].id;

  console.log('ini order id', payload.order_id);

  //Send Email
  const email_message = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111111; background: #f5f5f5; }
                .wrapper { padding: 24px 16px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; overflow: hidden; }

                /* Header — persis navbar website Nelofy */
                .header { background: #ffffff; border-bottom: 1px solid #e5e5e5; }
                .logo-text {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111111;
                    letter-spacing: -0.5px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .content { padding: 28px 30px 32px; }

                /* Status badge — pending/menunggu */
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: #fff7ed;
                    color: #9a3412;
                    border: 1px solid #ffedd5;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    margin-bottom: 20px;
                }

                .greeting { font-size: 15px; font-weight: 600; color: #111111; margin-bottom: 4px; }
                .subtext { font-size: 13px; color: #525252; margin-bottom: 24px; }

                /* Invoice info box */
                .invoice-box { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 4px; padding: 0 20px; margin-bottom: 24px; }
                .info-row { padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
                .info-row:last-child { border-bottom: none; }
                .info-label { color: #737373; margin-bottom: 2px; }
                .info-value { font-weight: 600; color: #111111; }
                .info-value-danger { font-weight: 600; color: #e11d48; }

                /* Product table */
                .product-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .product-table-header-left { text-align: left; font-size: 11px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #e5e5e5; }
                .product-table-header-right { text-align: right; font-size: 11px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #e5e5e5; }
                .product-table-cell { padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top; font-size: 13px; }
                .product-name { font-weight: 600; font-size: 14px; color: #111111; margin-bottom: 3px; }
                .product-sub { font-size: 12px; color: #737373; }
                .product-price { font-weight: 600; font-size: 14px; color: #111111; text-align: right; white-space: nowrap; padding: 14px 0; vertical-align: top; }

                /* Total — dark seperti di website */
                .total-section { background: #111111; color: #ffffff; padding: 18px 20px; border-radius: 4px; }
                .total-label { font-size: 13px; color: rgba(255,255,255,0.6); }
                .total-amount { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff; text-align: right; }

                .note { font-size: 11px; color: #a3a3a3; margin-top: 16px; text-align: center; font-style: italic; }

                /* Footer */
                .footer { text-align: center; padding: 18px 30px; font-size: 12px; color: #a3a3a3; background: #fafafa; border-top: 1px solid #e5e5e5; line-height: 1.8; }
                .footer a { color: #525252; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="wrapper">
            <div class="container">

                <!-- Header / Logo — identik dengan navbar website -->
                <table class="header" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding: 16px 30px;">
                            <span class="logo-text">Nelo<span style="color: #a3a3a3;">fy</span></span>
                        </td>
                    </tr>
                </table>

                <!-- Content -->
                <div class="content">
                    <span class="status-badge">&#9679;&nbsp; Menunggu Pembayaran</span>

                    <p class="greeting">Halo, ${payload.full_name}</p>
                    <p class="subtext">Pesanan Anda telah diterima. Silakan selesaikan pembayaran sesuai detail di bawah ini.</p>

                    <!-- Invoice Info -->
                    <div class="invoice-box">
                        <div class="info-row">
                            <div class="info-label">Nomor Invoice</div>
                            <div class="info-value">${payload.no_invoice}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Metode Pembayaran</div>
                            <div class="info-value">${payload.payment_method}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Batas Waktu Pembayaran</div>
                            <div class="info-value-danger">${payload.expired_at}</div>
                        </div>
                    </div>

                    <!-- Product -->
                    <table class="product-table" cellpadding="0" cellspacing="0" border="0">
                        <thead>
                            <tr>
                                <th class="product-table-header-left">Deskripsi Produk</th>
                                <th class="product-table-header-right">Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="product-table-cell">
                                    <div class="product-name">${payload.product_name}</div>
                                    <div class="product-sub">Akses Kursus &amp; Modul Digital</div>
                                </td>
                                <td class="product-price">Rp ${formatRupiah(payload.price)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Total -->
                    <table class="total-section" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td class="total-label">Total yang harus dibayar</td>
                            <td class="total-amount">${formatRupiah(payload.total_amount)}</td>
                        </tr>
                    </table>
                    <button style="background: #111111; color: #ffffff; padding: 18px 20px; border-radius: 4px;" href="https://faidilaziz.my.id/payment?order_id=${payload.order_id}">Bayar</button>

                    <p class="note">Sistem akan melakukan verifikasi otomatis dalam 1&ndash;5 menit setelah transfer diterima.</p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    &copy; 2026 <strong style="color: #525252;">Nelofy</strong> &mdash; Platform Digital Development.<br>
                    Butuh bantuan? Hubungi kami di <a href="mailto:support@nelofy.id">support@nelofy.id</a>
                </div>

            </div>
            </div>
        </body>
        </html>`;

  //Insert queue email
  await sql`
        INSERT INTO queue (type, message,destination, status, subject)
        VALUES (${'email'}, ${email_message}, ${payload.email}, ${'pending'}, ${'Info Pembayaran Tagihan'})`;

  //Send WA
  const whatsapp_message = `
*KONFIRMASI PESANAN* 📦

Halo *${payload.full_name}*,
Terima kasih telah berbelanja! Pesanan Anda telah kami terima dan sedang menunggu pembayaran.

*DETAIL PEMBELIAN:*
-------------------------------------------
*No. Invoice:* ${payload.no_invoice}
*Produk:* ${payload.product_name}
*Harga:* ${formatRupiah(payload.price)}
-------------------------------------------
*Total Bayar:* *${formatRupiah(payload.total_amount)}*
-------------------------------------------

*Metode Pembayaran:* ${payload.payment_method}
*Batas Pembayaran:* ${payload.expired_at}

*Link Pembayaran:* https://faidilaziz.my.id/payment?order_id=${payload.order_id}

*Catatan:*
Pembayaran akan diverifikasi secara otomatis oleh sistem. Anda akan menerima notifikasi segera setelah transaksi berhasil.

Terima kasih atas kepercayaan Anda!`;

  payload.message = 'success to send queue';

  //Insert queue whatsapp
  await sql`
        INSERT INTO queue (type, message,destination, status)
        VALUES (${'whatsapp'}, ${whatsapp_message}, ${payload.phone}, ${'pending'})`;

  return payload;
};

const service = {
  update_status_order,
  order_success_send_message,
  capture_payload_checkout,
  validation_payload_checkout,
  get_product_price,
  calculate_discount,
  transaction,
  checkout_send_queue,
};

export default service;
