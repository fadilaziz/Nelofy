import express from 'express';
import { verifyToken } from '../../middleware/auth_middleware.js';
import {
  request_change_password,
  request_reset_password,
  request_reset_password_admin,
  reset_password,
  update_password,
} from './reset_password_controller.js';

const router = express.Router();

router.post('/request_reset_password', request_reset_password);
router.post('/request_reset_password_admin', request_reset_password_admin);
router.post('/request_change_password', verifyToken, request_change_password);
router.post('/update_password', verifyToken, update_password);
router.post('/reset_password', reset_password);

export default router;
