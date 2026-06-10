import sql from '../../database/db.js';
import bcrypt from 'bcrypt';

//Ambil data user terbaru
const get_current_user = async (user_id) => {
  try {
    const data = await sql`
        SELECT full_name, username, email, phone
        FROM users
        WHERE id = ${user_id}`;

    return data[0];
  } catch (error) {
    throw error;
  }
};

//Ambil data trasnsaksi berdasarkan user_id
const get_transaction = async (user_id) => {
  try {
    const data = await sql`
        SELECT
        o.user_id,
        i.id AS invoice_id,
        i.order_id,
        i.no_invoice,
        i.jatuh_tempo,
        i.status AS invoice_status,
        i.created_at AS invoice_created_at,
        o.total_amount,
        o.product_id,
        p.product_name,
        p.price AS product_price
        FROM public.orders o
        JOIN public.invoices i ON o.id = i.order_id
        LEFT JOIN public.products p ON o.product_id = p.id
        WHERE o.user_id = ${user_id};
        `;

    //Membuat perbandingan tanggal jatuh tempo dengan tanggal hari ini
    const today = new Date();
    const dataWithStatus = data.map((item) => {
      const jatuh_tempo = new Date(item.jatuh_tempo);
      let status = item.invoice_status;

      // Hanya update status menjadi 'ex' atau 'pending' jika status belum 'paid'
      if (status !== 'paid') {
        status = jatuh_tempo < today ? 'ex' : 'pending';
      }

      return { ...item, status };
    });

    //Simpan data status ke database
    dataWithStatus.forEach(async (item) => {
      // Hanya update jika statusnya berubah, untuk efisiensi dan mencegah penimpaan yang tidak perlu
      if (item.status !== item.invoice_status) {
        await sql`
                UPDATE public.invoices
                SET status = ${item.status}
                WHERE id = ${item.invoice_id};
                `;
      }
    });

    return dataWithStatus;
  } catch (error) {
    throw error;
  }
};

//Menga,bil semua data order yang berstatus success
const get_purchase = async (user_id) => {
  try {
    const data = await sql`
        SELECT
        o.user_id,
        o.id,
        o.order_id,
        o.status AS order_status,
        o.total_amount,
        o.expired_at,
        o.created_at AS order_created_at,
        p.product_name
        FROM public.orders o
        LEFT JOIN public.products p ON o.product_id = p.id
        WHERE o.user_id = ${user_id} AND o.status = 'SUCCESS'`;
    return data;
  } catch (error) {
    throw error;
  }
};

//Mengambil semua data order berdasarkan user_id
const get_order = async (user_id) => {
  try {
    const data = await sql`
        SELECT
        o.user_id,
        o.id,
        o.order_id,
        o.status AS order_status,
        o.total_amount,
        o.expired_at,
        o.created_at AS order_created_at,
        p.product_name
        FROM public.orders o
        LEFT JOIN public.products p ON o.product_id = p.id
        WHERE o.user_id = ${user_id}`;

    return data;
  } catch (error) {
    throw error;
  }
};

const service = {
  get_current_user,
  get_transaction,
  get_purchase,
  get_order,
};

export default service;
