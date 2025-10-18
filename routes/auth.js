// routes/auth.js

import express from 'express';
import { register, login, getMe, transferOwnership, adminExists } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin-exists', adminExists);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/transfer-ownership', protect, transferOwnership);

export default router;