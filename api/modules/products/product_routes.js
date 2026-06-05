import express from 'express';
const router = express.Router();
const { verifyToken } = require('../../middleware/auth_middleware.js');
import { get_products, get_order_notification } from './products_controller.js';

router.get('/list', get_products);
router.get('/order_notification', verifyToken, get_order_notification);

export default router;
