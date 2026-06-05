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
  const { user_email, user_pass } = payload;

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
  if (!data.user_email) {
    throw new Error('Email is required');
  }
  //Cek apakah password ada
  if (!data.user_pass) {
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

  //Cek apakah email ada
  const check_email = await sql`SELECT * FROM users WHERE user_email = ${data.user_email}`;
  if (check_email.count === 0) {
    throw new Error('Email tidak terdaftar, Silahkan cek kembali');
  }

  //Cek apakah password benar
  const check_password = await bcrypt.compare(data.user_pass, check_email[0].user_pass);
  if (!check_password) {
    throw new Error('Password salah, Silahkan cek kembali');
  }

  //Ambil data yang login
  const data_user =
    await sql`SELECT id, full_name, username, user_email, user_phone, status FROM users WHERE user_email = ${data.user_email}`;

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
    await sql`SELECT id, full_name, username, user_email, user_phone, status FROM users WHERE id = ${id}`;

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
  console.log('INI Validasi data : ', data);
  //Cek apakah payload ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Payload is empty');
  }
  //Cek apakah email ada
  if (!data.user_email) {
    throw new Error('Email is required');
  }
  //Cek apakah password ada
  if (!data.user_pass) {
    throw new Error('Password is required');
  }
  //Cek apakah role ada
  if (data.user_role === 'admin') {
    return true;
  }
  throw new Error('Role is not admin');
};

//Cek apakah data login admin ada
export const login_admin = async (data) => {
  console.log('INI SERVICE LOGIN : ', data);
  //Cek apakah data ada
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is empty');
  }

  //Cek apakah email ada dan role nya admin
  const check_user =
    await sql`SELECT * FROM users WHERE user_email = ${data.user_email} AND role = 'admin'`;
  if (check_user.count === 0) {
    throw new Error('Email tidak terdaftar atau role bukan admin, Silahkan cek kembali');
  }

  //Cek apakah password benar
  // const check_password = await bcrypt.compare(data.user_pass, check_user[0].user_pass);
  // if (!check_password) {
  //   throw new Error('Password salah, Silahkan cek kembali');
  // }

  const user = check_user[0];
  console.log(user);

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
  const { full_name, username, user_email, user_pass, user_phone } = payload;

  //Kembalikan payload yang ditangkap
  return {
    full_name,
    username,
    user_email,
    user_pass,
    user_phone,
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
  //Cek apakah user_email ada
  if (!data.user_email.includes('@')) {
    throw new Error('User email is invalid');
  }
  //Cek apakah user_pass ada
  if (data.user_pass.length < 8) {
    throw new Error('User pass is too short');
  }
  //Cek apakah user_phone ada
  if (data.user_phone.length < 10) {
    throw new Error('User phone is too short');
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
        WHERE user_email = ${data.user_email}`;
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
  const hash_password = await bcrypt.hash(data.user_pass, salt);
  data.user_pass = hash_password;

  //Menyimpan data
  const result = await sql`
        INSERT INTO users (full_name, username, user_email, user_pass, user_phone)
        VALUES (${data.full_name}, ${data.username}, ${data.user_email}, ${data.user_pass}, ${data.user_phone})`;

  //Cek apakah data berhasil disimpan
  if (result.count === 0) {
    throw new Error('Gagal Menyimpan Data');
  }

  //Ambil data yang baru saja disimpan
  const data_user = await sql`
    SELECT id,full_name, username, user_email,user_phone
    FROM users
    WHERE user_email = ${data.user_email}`;

  //Kembalikan data yang baru saja disimpan
  return data_user[0];
};

//Send Email
export const send_email = async (data) => {
  try {
    //Cek apakah email berhasil terkirim
    let result = await email_response.send_email(data);
    if (result.code === 200) {
      //Ubah status pending menjadi success
      await sql(`
                UPDATE queue
                SET status='success'
                WHERE type = 'email';`);
      data.code = 200;
      data.status = 'success';
      data.message = 'success to send email';
    } else {
      console.log('Pesan email gagal terkirim...!');
      data.code = 400;
      data.status = 'failed';
      data.message = 'failed to send email';
    }
  } catch (e) {
    console.log(e.stack);
    data.status = 'failed';
    data.code = 400;
  }
  return data;
};

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
  send_email,
};

export default service;
