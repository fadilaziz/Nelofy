import express from 'express';
const router = express.Router();
import { verifyToken } from '../../middleware/auth_middleware.js';
import { get_current_user, get_transaction, get_order, get_purchases } from './user_controller.js';

router.get('/get_current_user', verifyToken, get_current_user);
router.get('/get_transaction', verifyToken, get_transaction);
router.get('/get_all_order', verifyToken, get_order);
router.get('/get_all_purchases', verifyToken, get_purchases);

export default router;
