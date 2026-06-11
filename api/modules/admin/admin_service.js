import sql from '../../database/db.js';
import bcrypt from 'bcrypt';
import { broadcastUpdate } from './admin_sse.js';

// Ambil data profile dari database
const get_admin_data = async (id_admin) => {
  try {
    const adminData = await sql`
    SELECT id, full_name, username, email, phone, status, role
    FROM users
    WHERE id = ${id_admin}`;

    if (adminData.count === 0) {
      return {
        code: 404,
        status: 'error',
        message: 'Admin tidak ditemukan',
      };
    }

    return {
      code: 200,
      status: 'success',
      message: 'Data admin berhasil diambil',
      dataAdmin: adminData[0],
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Ambil semua data user dari database
const get_all_user_data = async () => {
  try {
    const userData = await sql`
    SELECT id, full_name, username, email, phone, status, role
    FROM users WHERE role = 'user'
    ORDER BY id DESC`;

    return {
      code: 200,
      status: 'success',
      message: 'Data user berhasil diambil',
      dataUser: userData,
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Menyimpan data user baru
const add_user_data = async (data) => {
  try {
    const { full_name, username, user_email, password, user_phone } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    await sql`
    INSERT INTO users (full_name, username, email, password, phone, status, role)
    VALUES (${full_name}, ${username}, ${user_email}, ${hashedPassword}, ${user_phone}, 'active', 'user')`;

    broadcastUpdate('user', 'created');
    return {
      code: 200,
      status: 'success',
      message: 'Data user berhasil ditambahkan',
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Mengubah data user
const update_user_data = async (id, data) => {
  try {
    const { full_name, username, user_email, user_phone, status, role, password } = data;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`
      UPDATE users
      SET full_name = ${full_name}, username = ${username}, email = ${user_email},
          phone = ${user_phone}, status = ${status}, role = ${role}, password = ${hashedPassword}
      WHERE id = ${id}`;
    } else {
      await sql`
      UPDATE users
      SET full_name = ${full_name}, username = ${username}, email = ${user_email},
          phone = ${user_phone}, status = ${status}, role = ${role}
      WHERE id = ${id}`;
    }

    broadcastUpdate('user', 'updated');
    return {
      code: 200,
      status: 'success',
      message: 'Data user berhasil diupdate',
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Menghapus data user
const delete_user_data = async (id) => {
  try {
    // Hapus juga invoice & order yang terkait untuk menghindari foreign key constraint error jika ada
    await sql`DELETE FROM invoices WHERE order_id IN (SELECT id FROM orders WHERE user_id = ${id})`;
    await sql`DELETE FROM orders WHERE user_id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${id}`;

    broadcastUpdate('user', 'deleted');
    return {
      code: 200,
      status: 'success',
      message: 'Data user berhasil dihapus',
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Ambil semua data order
const get_all_orders = async () => {
  try {
    const orderData = await sql`
    SELECT o.id, o.order_id, o.user_id, o.product_id, o.total_amount, o.status,
           o.signature, o.qris_url, o.expired_at, o.qris_image, o.created_at,
           u.full_name AS user_fullname, u.username AS user_username,
           p.product_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC`;

    return {
      code: 200,
      status: 'success',
      message: 'Data order berhasil diambil',
      dataOrder: orderData,
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};


// Mengubah data order
const update_order_data = async (id, data) => {
  try {
    const { user_id, product_id, total_amount, status } = data;

    await sql`
    UPDATE orders
    SET user_id = ${user_id}, product_id = ${product_id}, total_amount = ${total_amount}, status = ${status}
    WHERE id = ${id}`;

    const invoiceStatus = status === 'SUCCESS' ? 'paid' : status === 'EXPIRED' ? 'ex' : 'pending';
    await sql`
    UPDATE invoices
    SET status = ${invoiceStatus}
    WHERE order_id = ${id}`;

    broadcastUpdate('order', 'updated');
    return {
      code: 200,
      status: 'success',
      message: 'Data order berhasil diupdate',
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Menghapus data order
const delete_order_data = async (id) => {
  try {
    await sql`DELETE FROM invoices WHERE order_id = ${id}`;
    await sql`DELETE FROM orders WHERE id = ${id}`;

    broadcastUpdate('order', 'deleted');
    return {
      code: 200,
      status: 'success',
      message: 'Data order berhasil dihapus',
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

// Ambil list products untuk dropdown input order
const get_products = async () => {
  try {
    const products = await sql`SELECT id, product_name, price FROM products ORDER BY id DESC`;
    return {
      code: 200,
      status: 'success',
      message: 'Data produk berhasil diambil',
      products,
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

const service = {
  get_admin_data,
  get_all_user_data,
  add_user_data,
  update_user_data,
  delete_user_data,
  get_all_orders,
  update_order_data,
  delete_order_data,
  get_products,
};

export default service;
