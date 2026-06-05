import express from 'express';
const router = express.Router();
import { verifyToken } from '../../middleware/auth_middleware.js';
import { login, registration, logout, check_session, login_admin } from './auth_controller.js';

//User
router.post('/login', login);
router.post('/register', registration);
router.post('/logout', verifyToken, logout);
router.get('/check_session', verifyToken, check_session);

//Admin
router.post('/login-admin', login_admin);

export default router;
