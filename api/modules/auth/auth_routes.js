import express from 'express';
const router = express.Router();
import { verifyToken, verifyAdminToken } from '../../middleware/auth_middleware.js';
import { login, registration, logout, check_session, login_admin, logout_admin, auth_google, callback_auth, check_session_admin } from './auth_controller.js';

//User
router.post('/login', login);
router.post('/register', registration);
router.post('/logout', verifyToken, logout);
router.get('/check_session', verifyToken, check_session);
router.get('/google', auth_google);
router.get('/callback_auth', callback_auth);

//Admin
router.post('/login-admin', login_admin);
router.post('/logout-admin', logout_admin);
router.get('/check_session_admin', verifyAdminToken, check_session_admin);

export default router;
