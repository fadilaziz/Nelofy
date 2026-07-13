import express from 'express';
import { verifyToken } from '../../middleware/auth_middleware.js';
import { get_payment_products } from './payment_controller.js';

const router = express.Router();

router.post('/payment_products', verifyToken, get_payment_products);

export default router;
