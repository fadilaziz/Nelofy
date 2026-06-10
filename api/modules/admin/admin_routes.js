import express from 'express';
import { verifyAdminToken, isAdmin } from '../../middleware/auth_middleware.js';
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
  sse_stream,
} from './admin_controller.js';

const router = express.Router();

// Profile/Admin data route
router.get('/admin-data', verifyAdminToken, isAdmin, get_admin_data);

// User CRUD routes
router.get('/user-data', verifyAdminToken, isAdmin, get_all_user_data);
router.post('/add-user-data', verifyAdminToken, isAdmin, add_user_data);
router.put('/user-data/:id', verifyAdminToken, isAdmin, update_user_data);
router.delete('/user-data/:id', verifyAdminToken, isAdmin, delete_user_data);

// Order CRUD routes
router.get('/order-data', verifyAdminToken, isAdmin, get_all_orders);
router.post('/add-order-data', verifyAdminToken, isAdmin, add_order_data);
router.put('/order-data/:id', verifyAdminToken, isAdmin, update_order_data);
router.delete('/order-data/:id', verifyAdminToken, isAdmin, delete_order_data);

// Products dropdown list
router.get('/products-list', verifyAdminToken, isAdmin, get_products);

// SSE realtime stream
router.get('/events', verifyAdminToken, isAdmin, sse_stream);

export default router;
