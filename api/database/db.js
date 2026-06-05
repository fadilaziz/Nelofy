import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

//Menghubungkan ke database
const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

//Cek koneksi ke database
if (sql) {
  console.log('Berhasil terhubung ke database')
} else {
  console.log('Gagal terhubung ke database')
}

export default sql;