import sql from '../../database/db.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../common/helper.js';

//Kirim url reset password ke email user
export const request_change_password = async (data) => {
  try {
    //Generate Token
    const token = generateToken();

    //Simpan token di tabble users
    await sql`
        UPDATE users
        SET reset_token = ${token}, reset_token_expiry = NOW() + INTERVAL '3 minutes'
        WHERE email = ${data.email}
        AND role = 'user'`;

    //Base url untuk reset password
    const baseUrl = process.env.URL_FRONTEND;
    const resetUrl = `${baseUrl}/change_password?token=${token}`;

    //Kirim email
    const message = `
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

                /* Header */
                .header { background: #ffffff; border-bottom: 1px solid #e5e5e5; }
                .logo-text {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111111;
                    letter-spacing: -0.5px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .content { padding: 28px 30px 32px; }

                .greeting { font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 12px; }
                .subtext { font-size: 14px; color: #525252; margin-bottom: 24px; }

                /* Button */
                .btn-container { text-align: center; margin: 32px 0; }
                .btn {
                    display: inline-block;
                    background: #111111;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .note { font-size: 12px; color: #737373; margin-top: 24px; }

                /* Footer */
                .footer { text-align: center; padding: 18px 30px; font-size: 12px; color: #a3a3a3; background: #fafafa; border-top: 1px solid #e5e5e5; line-height: 1.8; }
                .footer a { color: #525252; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="wrapper">
            <div class="container">

                <!-- Header / Logo -->
                <table class="header" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding: 16px 30px;">
                            <span class="logo-text">Nelo<span style="color: #a3a3a3;">fy</span></span>
                        </td>
                    </tr>
                </table>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Permintaan ubah password akun nelofy</p>
                    <p class="subtext">Anda meminta untuk ubah password akun Nelofy Anda. Klik tombol di bawah untuk membuat password baru.</p>

                    <div class="btn-container">
                        <a href="${resetUrl}" class="btn">
                            Ubah Password
                        </a>
                    </div>

                    <p class="note">Jika Anda tidak meminta perubahan password, abaikan email ini.</p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    &copy; 2026 <strong style="color: #525252;">Nelofy</strong> &mdash; Platform Digital Development.<br>
                    Butuh bantuan? Hubungi kami di <a href="mailto:support@nelofy.id">support@nelofy.id</a>
                </div>

            </div>
            </div>
        </body>
        </html>
        `;

    //Insert queue email
    await sql`
            INSERT INTO queue (type, message,destination, status, subject)
            VALUES (${'email'}, ${message}, ${data.email}, ${'pending'}, ${'Ubah Password Akun Nelofy'})`;
  } catch (error) {
    throw error;
  }
};

export const request_reset_password = async (data) => {
  try {
    // Ganerate token
    const token = generateToken();

    // Simpan data token di table users
    await sql`
        UPDATE users
        SET reset_token = ${token}, reset_token_expiry = NOW() + INTERVAL '3 minutes'
        WHERE email = ${data.email}`;

    //Base url untuk reset password
    const baseUrl = process.env.URL_FRONTEND;
    const resetUrl = `${baseUrl}/reset_password?token=${token}`;

    // Kirim email
    const message = `
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

                /* Header */
                .header { background: #ffffff; border-bottom: 1px solid #e5e5e5; }
                .logo-text {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111111;
                    letter-spacing: -0.5px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .content { padding: 28px 30px 32px; }

                .greeting { font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 12px; }
                .subtext { font-size: 14px; color: #525252; margin-bottom: 24px; }

                /* Button */
                .btn-container { text-align: center; margin: 32px 0; }
                .btn {
                    display: inline-block;
                    background: #111111;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .note { font-size: 12px; color: #737373; margin-top: 24px; }

                /* Footer */
                .footer { text-align: center; padding: 18px 30px; font-size: 12px; color: #a3a3a3; background: #fafafa; border-top: 1px solid #e5e5e5; line-height: 1.8; }
                .footer a { color: #525252; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="wrapper">
            <div class="container">

                <!-- Header / Logo -->
                <table class="header" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding: 16px 30px;">
                            <span class="logo-text">Nelo<span style="color: #a3a3a3;">fy</span></span>
                        </td>
                    </tr>
                </table>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Lupa Password?</p>
                    <p class="subtext">Anda meminta untuk mereset password akun Nelofy Anda. Klik tombol di bawah untuk membuat password baru.</p>

                    <div class="btn-container">
                        <a href="${resetUrl}" class="btn">
                            Buat Password Baru
                        </a>
                    </div>

                    <p class="note">Jika Anda tidak meminta reset password, abaikan email ini.</p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    &copy; 2026 <strong style="color: #525252;">Nelofy</strong> &mdash; Platform Digital Development.<br>
                    Butuh bantuan? Hubungi kami di <a href="mailto:support@nelofy.id">support@nelofy.id</a>
                </div>

            </div>
            </div>
        </body>
        </html>
        `;

    //Insert queue email
    await sql`
            INSERT INTO queue (type, message,destination, status, subject)
            VALUES (${'email'}, ${message}, ${data.email}, ${'pending'}, ${'Lupa Password Akun Nelofy'})`;
  } catch (error) {
    throw error;
  }
};

//Lupa Password Admin
export const request_reset_password_admin = async (data) => {
  try {
    // Ganerate token
    const token = generateToken();

    // Simpan data token di table users
    await sql`
        UPDATE users
        SET reset_token = ${token}, reset_token_expiry = NOW() + INTERVAL '3 minutes'
        WHERE email = ${data.email}`;

    //Base url untuk reset password
    const baseUrl = process.env.URL_FRONTEND;
    const resetUrl = `${baseUrl}/reset_password?token=${token}`;

    // Kirim email
    const message = `
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

                /* Header */
                .header { background: #ffffff; border-bottom: 1px solid #e5e5e5; }
                .logo-text {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111111;
                    letter-spacing: -0.5px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .content { padding: 28px 30px 32px; }

                .greeting { font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 12px; }
                .subtext { font-size: 14px; color: #525252; margin-bottom: 24px; }

                /* Button */
                .btn-container { text-align: center; margin: 32px 0; }
                .btn {
                    display: inline-block;
                    background: #111111;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .note { font-size: 12px; color: #737373; margin-top: 24px; }

                /* Footer */
                .footer { text-align: center; padding: 18px 30px; font-size: 12px; color: #a3a3a3; background: #fafafa; border-top: 1px solid #e5e5e5; line-height: 1.8; }
                .footer a { color: #525252; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="wrapper">
            <div class="container">

                <!-- Header / Logo -->
                <table class="header" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding: 16px 30px;">
                            <span class="logo-text">Nelo<span style="color: #a3a3a3;">fy</span></span>
                        </td>
                    </tr>
                </table>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Lupa Password Admin?</p>
                    <p class="subtext">Anda meminta untuk mereset password akun Admin Nelofy Anda. Klik tombol di bawah untuk membuat password baru.</p>

                    <div class="btn-container">
                        <a href="${resetUrl}" class="btn">
                            Buat Password Baru
                        </a>
                    </div>

                    <p class="note">Jika Anda tidak meminta reset password, abaikan email ini.</p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    &copy; 2026 <strong style="color: #525252;">Nelofy</strong> &mdash; Platform Digital Development.<br>
                    Butuh bantuan? Hubungi kami di <a href="mailto:support@nelofy.id">support@nelofy.id</a>
                </div>

            </div>
            </div>
        </body>
        </html>
        `;

    //Insert queue email
    await sql`
            INSERT INTO queue (type, message,destination, status, subject)
            VALUES (${'email'}, ${message}, ${data.email}, ${'pending'}, ${'Lupa Password Akun Admin Nelofy'})`;
  } catch (error) {
    throw error;
  }
};

//Reset password dan change password
export const update_password = async (data) => {
  try {
    //Ambil data token dan data expiry dari table users
    const tokenData = await sql`
        SELECT * FROM users WHERE reset_token = ${data.token}`;

    //Jika token tidak ditemukan
    if (tokenData[0].reset_token === 'null') {
      throw new Error('Token tidak valid');
    }

    //Cek apakah token masih berlaku
    if (tokenData[0].reset_token_expiry < new Date()) {
      throw new Error('Token tidak berlaku');
    }

    //Encrypsi data password
    const hashPassword = await bcrypt.hash(data.new_password, 10);

    // Simpan data password
    await sql`
        UPDATE users
        SET password = ${hashPassword}, reset_token = NULL, reset_token_expiry = NULL
        WHERE id = ${tokenData[0].id}`;

    //Hapus data token di table users
    await sql`
        UPDATE users
        SET reset_token = NULL, reset_token_expiry = NULL
        WHERE id = ${tokenData[0].id}`;
  } catch (error) {
    throw error;
  }
};

const service = {
  request_change_password,
  request_reset_password,
  request_reset_password_admin,
  update_password,
};

export default service;
