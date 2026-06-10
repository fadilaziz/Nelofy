import sql from '../../database/db.js';
import bcrypt from 'bcrypt';

//LOGIN
//Capture payload login
export const capture_payload_login = async (payload) => {
  //Cek apakah payload ada
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload is empty');
  }

  //Capture Payload Login
  const { email, password } = payload;

  //Kembalikan payload yang ditangkap
  return payload;
};

//Validasi Payload Login
export const validation_payload_login = async (data) => {
  //Cek apakah payload ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Payload is empty');
  }
  //Cek apakah email ada
  if (!data.email) {
    throw new Error('Email is required');
  }
  //Cek apakah password ada
  if (!data.password) {
    throw new Error('Password is required');
  }
  return true;
};

//Cek apakah data login ada
export const login = async (data) => {
  //Cek apakah data ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is empty');
  }

  //Cek apakah email ada dan role nya user
  const check_email = await sql`SELECT * FROM users WHERE email = ${data.email} AND role = 'user'`;
  if (check_email.count === 0) {
    throw new Error('Email tidak terdaftar atau role bukan user, Silahkan cek kembali');
  }

  //Cek apakah password benar
  const check_password = await bcrypt.compare(data.password, check_email[0].password);
  if (!check_password) {
    throw new Error('Password salah, Silahkan cek kembali');
  }

  //Ambil data yang login
  const data_user =
    await sql`SELECT id, full_name, username, email, phone, status FROM users WHERE email = ${data.email}`;

  //Kembalikan data yang login
  return data_user[0];
};

//Get user by id | Check Session
export const get_user_by_id = async (id) => {
  //Cek apakah data ada
  if (!id) {
    throw new Error('Data is empty');
  }

  //Cek apakah id ada
  const check_id = await sql`SELECT id FROM users WHERE id = ${id}`;
  if (check_id.count === 0) {
    throw new Error('Id tidak terdaftar');
  }

  //Ambil data yang login
  const data_user =
    await sql`SELECT id, full_name, username, email, phone, status, role FROM users WHERE id = ${id}`;

  //Kembalikan data yang login
  return data_user[0];
};

//LOGIN ADMIN
//Capture Payload Login Admin
export const capture_payload_login_admin = async (payload) => {
  //Cek apakah payload ada
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload is empty');
  }

  //Capture Payload Login
  const { email, password } = payload;

  //Kembalikan payload yang ditangkap
  return payload;
};

//Validasi Payload Login
export const validation_payload_login_admin = async (data) => {
  //Cek apakah payload ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Payload is empty');
  }
  //Cek apakah email ada
  if (!data.email) {
    throw new Error('Email is required');
  }
  //Cek apakah password ada
  if (!data.password) {
    throw new Error('Password is required');
  }
  //Cek apakah role ada
  if (data.role === 'admin') {
    return true;
  }
  console.log('INI INI : ', data);
  throw new Error('Role is not admin');
};

//Cek apakah data login admin ada
export const login_admin = async (data) => {
  //Cek apakah data ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is empty');
  }

  //Cek apakah email ada dan role nya admin
  const check_user = await sql`SELECT * FROM users WHERE email = ${data.email} AND role = 'admin'`;
  if (check_user.count === 0) {
    throw new Error('Email tidak terdaftar atau role bukan admin, Silahkan cek kembali');
  }

  //Cek apakah password benar
  const check_password = await bcrypt.compare(data.password, check_user[0].password);
  if (!check_password) {
    throw new Error('Password salah, Silahkan cek kembali');
  }

  const user = check_user[0];

  //Cek apakah yang login admin
  if (user.role === 'admin') {
    return user;
  } else {
    throw new Error('Anda tidak memiliki akses untuk login ke admin');
  }
};

//Cek email google Auth
export const email_check = async (email) => {
  //Cek apakah data ada
  if (!email) {
    throw new Error('Data is empty');
  }

  console.log('INI EMAIL : ', email);

  //Cek apakah email ada
  const check_email = await sql`SELECT * FROM users WHERE user_email = ${email}`;
  if (check_email.count === 0) {
    throw new Error('Email tidak terdaftar');
  }

  //Ambil data yang login
  const data_user =
    await sql`SELECT id, full_name, username, user_email, user_phone, status FROM users WHERE user_email = ${email}`;

  //Kembalikan data yang login
  return data_user[0];
};

//REGISTER
//Capture Payload Register
export const capture_payload_register = async (payload) => {
  //Cek apakah payload ada
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload is empty');
  }

  //Capture Payload Register
  const { full_name, username, email, password, phone } = payload;

  //Kembalikan payload yang ditangkap
  return {
    full_name,
    username,
    email,
    password,
    phone,
  };
};

//Validasi Payload Register
export const validation_payload_register = async (data) => {
  //Cek apakah payload ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Payload is empty');
  }

  //Cek apakah full_name ada
  if (!data.full_name) {
    throw new Error('Full name is required');
  }
  //Cek apakah username ada
  if (!data.username) {
    throw new Error('Username is required');
  }
  //Cek apakah email ada
  if (!data.email.includes('@')) {
    throw new Error('Email is invalid');
  }
  //Cek apakah password ada
  if (data.password.length < 8) {
    throw new Error('Password is too short');
  }
  //Cek apakah phone ada
  if (data.phone.length < 10) {
    throw new Error('Phone is too short');
  }
  return true;
};

//Cek apakah email sudah terdaftar
export const check_email = async (data) => {
  //Cek apakah data ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is empty');
  }

  //Cek apakah email sudah terdaftar
  const check_email = await sql`
        SELECT *
        FROM users
        WHERE email = ${data.email}`;
  if (check_email.count > 0) {
    throw new Error('Email sudah terdaftar');
  }

  //Kembalikan data yang baru saja disimpan
  return true;
};

//Simpan data Ke database
export const save_data_register = async (data) => {
  //Cek apakah data ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is empty');
  }

  //Bcrypt Password
  const salt = await bcrypt.genSalt(10);
  const hash_password = await bcrypt.hash(data.password, salt);
  data.password = hash_password;

  //Menyimpan data
  const result = await sql`
        INSERT INTO users (full_name, username, email, password, phone, role, google_id, auth_provider, status, reset_token, reset_token_expiry)
        VALUES (${data.full_name}, ${data.username}, ${data.email}, ${data.password}, ${data.phone}, 'user', null, 'local', 'active', null, null)`;

  //Cek apakah data berhasil disimpan
  if (result.count === 0) {
    throw new Error('Gagal Menyimpan Data');
  }

  //Ambil data yang baru saja disimpan
  const data_user = await sql`
    SELECT id,full_name, username, email,phone
    FROM users
    WHERE email = ${data.email}`;

  console.log('INI DATA USER : ', data_user);

  //Kembalikan data yang baru saja disimpan
  return data_user[0];
};

//Send Email
// export const send_email = async (data) => {
//   try {
//     //Cek apakah email berhasil terkirim
//     let result = await email_response.send_email(data);
//     if (result.code === 200) {
//       //Ubah status pending menjadi success
//       await sql(`
//                 UPDATE queue
//                 SET status='success'
//                 WHERE type = 'email';`);
//       data.code = 200;
//       data.status = 'success';
//       data.message = 'success to send email';
//     } else {
//       console.log('Pesan email gagal terkirim...!');
//       data.code = 400;
//       data.status = 'failed';
//       data.message = 'failed to send email';
//     }
//   } catch (e) {
//     console.log(e.stack);
//     data.status = 'failed';
//     data.code = 400;
//   }
//   return data;
// };

const service = {
  capture_payload_login,
  validation_payload_login,
  login,
  capture_payload_login_admin,
  validation_payload_login_admin,
  login_admin,
  get_user_by_id,
  email_check,
  capture_payload_register,
  validation_payload_register,
  check_email,
  save_data_register,
};

export default service;
