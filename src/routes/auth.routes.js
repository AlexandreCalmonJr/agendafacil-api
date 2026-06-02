const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { erro: 'Muitas tentativas de registro. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/login
router.post('/login', loginLimiter, authController.login);

// POST /api/registro
router.post('/registro', registroLimiter, authController.registro);

// POST /api/login-google
router.post('/login-google', loginLimiter, authController.loginGoogle);

// POST /api/logout
router.post('/logout', authController.logout);

module.exports = router;
