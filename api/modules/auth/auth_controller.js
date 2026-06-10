import service from './auth_service.js';
import jwt from 'jsonwebtoken';

//LOGIN
export const login = async (req, res) => {
  try {
    //Capture Payload
    let data = await service.capture_payload_login(req.body);

    //Validation Payload
    await service.validation_payload_login(data);

    //Login
    const dataUser = await service.login(data);

    //Buat Session JWT
    const SecretKey = process.env.SECRET_KEY_JWT;
    const token = jwt.sign({ id: dataUser.id }, SecretKey, { expiresIn: '1h' });

    //Set Cookie dengan durasi 1 hari
    res.cookie('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });

    //Response
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Login Berhasil',
      user: {
        username: dataUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

//LOGIN ADMIN
export const login_admin = async (req, res) => {
  try {
    //Capture Payload
    let data = await service.capture_payload_login_admin(req.body);
    //Validation Payload
    await service.validation_payload_login_admin(data);
    //Login
    const dataUser = await service.login_admin(data);
    //Buat Session JWT
    const SecretKey = process.env.SECRET_KEY_JWT;
    const token = jwt.sign({ id: dataUser.id }, SecretKey, { expiresIn: '1h' });
    //Set Cookie dengan durasi 1 hari
    res.cookie('admin_token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });
    //Response
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Login Berhasil',
      user: {
        username: dataUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

//Check Session
export const check_session = async (req, res) => {
  try {
    const userId = req.userId;
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        code: 401,
        status: 'Unauthorized',
        message: 'Token tidak ada',
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
    const dataUser = await service.get_user_by_id(decoded.id);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Session ditemukan',
      user: {
        username: dataUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

//Check Session Admin
export const check_session_admin = async (req, res) => {
  try {
    const userId = req.userId;
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({
        code: 401,
        status: 'Unauthorized',
        message: 'Admin token tidak ada',
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
    const dataUser = await service.get_user_by_id(decoded.id);
    if (!dataUser || dataUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        status: 'Forbidden',
        message: 'Akses ditolak',
      });
    }
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Session admin ditemukan',
      user: {
        username: dataUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

//Logout
export const logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0),
    });
    return res.status(200).json({
      code: 200,
      message: 'Logout berhasil',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Logout Admin
export const logout_admin = async (req, res) => {
  try {
    res.cookie('admin_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0),
    });
    return res.status(200).json({
      code: 200,
      message: 'Logout admin berhasil',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Config Auth Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.URL_BACKEND}/auth/callback_auth`
);

//Auth Google
export const auth_google = async (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: `${process.env.URL_BACKEND}/auth/callback_auth`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const queryString = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${queryString}`);
};

//callback_auth
export const callback_auth = async (req, res) => {
  const { code } = req.query;
  try {
    //Menukar code dengan tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    //Mengambil data profil dari id_token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const check_user = await service.email_check(email);

    //Membuat token JWT dan cookie menggunakan database user ID
    const token = jwt.sign({ id: check_user.id }, process.env.SECRET_KEY_JWT, { expiresIn: '1h' });

    //Set Cookie dengan durasi 1 hari
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.redirect(process.env.URL_FRONTEND || '/');
  } catch (error) {
    console.error('Gagal menukar kode:', error);
    res.status(500).send(error.message);
  }
};

//REGISTER
export const registration = async (req, res) => {
  // const successSteps = [];
  try {
    console.log('INI REQ BODY : ', req.body);
    let data = await service.capture_payload_register(req.body);
    // successSteps.push("Capture Payload Berhasil");

    await service.validation_payload_register(data);
    // successSteps.push("Validation Payload Berhasil");

    await service.check_email(data);
    // successSteps.push("Check Email Berhasil");

    const dataUser = await service.save_data_register(data);
    // successSteps.push("Save Data Berhasil");

    // await service.send_email(data);
    // successSteps.push("Send Email Berhasil");

    //Buat Session JWT | Auto Login
    const SecretKey = process.env.SECRET_KEY_JWT;
    const token = jwt.sign({ id: dataUser.id }, SecretKey, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Registerasi Berhasil & Otomatis Login',
      user: {
        username: dataUser.username,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};
