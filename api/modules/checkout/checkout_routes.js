import express from 'express';
const router = express.Router();
import { verifyToken } from '../../middleware/auth_middleware.js';
import { checkout_products, callback_qris } from './checkout_controller.js';

router.post('/create_checkout', verifyToken, checkout_products);
router.post('/callback_qris', callback_qris);

export default router;
