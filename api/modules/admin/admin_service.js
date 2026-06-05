import sql from '../../database/db.js';
import bcrypt from 'bcrypt';

// Ambil data profile dari database
const get_admin_data = async (id_admin) => {
  try {
    const adminData = await sql`
    SELECT id, full_name, username, user_email, user_phone, status, role
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
    SELECT id, full_name, username, user_email, user_phone, status, role
    FROM users
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
    const { full_name, username, user_email, user_phone, status, role, password } = data;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password || '12345678', 10);

    // Simpan ke database
    await sql`
    INSERT INTO users (full_name, username, user_email, user_phone, status, role, user_pass)
    VALUES (${full_name}, ${username}, ${user_email}, ${user_phone}, ${status}, ${role}, ${hashedPassword})`;

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
      SET full_name = ${full_name}, username = ${username}, user_email = ${user_email}, 
          user_phone = ${user_phone}, status = ${status}, role = ${role}, user_pass = ${hashedPassword}
      WHERE id = ${id}`;
    } else {
      await sql`
      UPDATE users 
      SET full_name = ${full_name}, username = ${username}, user_email = ${user_email}, 
          user_phone = ${user_phone}, status = ${status}, role = ${role}
      WHERE id = ${id}`;
    }

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
    // Hapus juga order yang terkait untuk menghindari foreign key constraint error jika ada
    await sql`DELETE FROM orders WHERE user_id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${id}`;

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

// Menambahkan data order baru
const add_order_data = async (data) => {
  try {
    const { user_id, product_id, total_amount, status } = data;

    // Generate Invoice Order ID
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const order_id = `INV-${year}${month}${day}-${random}`;

    const expired_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const signature = Math.random().toString(36).substring(2, 15);
    const qris_url = '';
    const qris_image = '';

    await sql`
    INSERT INTO orders (order_id, user_id, product_id, total_amount, status, signature, qris_url, expired_at, qris_image, created_at)
    VALUES (${order_id}, ${user_id}, ${product_id}, ${total_amount}, ${status}, ${signature}, ${qris_url}, ${expired_at}, ${qris_image}, ${new Date()})`;

    return {
      code: 200,
      status: 'success',
      message: 'Data order berhasil ditambahkan',
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
    await sql`DELETE FROM orders WHERE id = ${id}`;

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
  add_order_data,
  update_order_data,
  delete_order_data,
  get_products,
};

export default service;
