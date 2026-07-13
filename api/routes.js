import express from 'express';
const router = express.Router();

import productRoutes from './modules/products/product_routes';
import authRoutes from './modules/auth/auth_routes';
import userRoutes from './modules/users/user_routes';
import checkoutRoutes from './modules/checkout/checkout_routes';
import paymentRoutes from './modules/payment/payment_routes';
import passwordRoutes from './modules/password/password_routes';
import adminRoutes from './modules/admin/admin_routes.js';

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payment', paymentRoutes);
router.use('/password', passwordRoutes);
router.use('/admin', adminRoutes);

export default router;
