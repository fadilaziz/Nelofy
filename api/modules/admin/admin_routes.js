import express from 'express';
import { verifyToken } from '../../middleware/auth_middleware.js';
import {
  get_admin_data,
  get_all_user_data,
  add_user_data,
  update_user_data,
  delete_user_data,
  get_all_orders,
  add_order_data,
  update_order_data,
  delete_order_data,
  get_products,
} from './admin_controller.js';

const router = express.Router();

// Profile/Admin data route
router.get('/admin-data', verifyToken, get_admin_data);

// User CRUD routes
router.get('/user-data', verifyToken, get_all_user_data);
router.post('/add-user-data', verifyToken, add_user_data);
router.put('/user-data/:id', verifyToken, update_user_data);
router.delete('/user-data/:id', verifyToken, delete_user_data);

// Order CRUD routes
router.get('/order-data', verifyToken, get_all_orders);
router.post('/add-order-data', verifyToken, add_order_data);
router.put('/order-data/:id', verifyToken, update_order_data);
router.delete('/order-data/:id', verifyToken, delete_order_data);

// Products dropdown list
router.get('/products-list', verifyToken, get_products);

export default router;
