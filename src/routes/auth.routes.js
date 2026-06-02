const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/login
router.post('/login', authController.login);

// POST /api/registro
router.post('/registro', authController.registro);

// POST /api/login-google
router.post('/login-google', authController.loginGoogle);

module.exports = router;
