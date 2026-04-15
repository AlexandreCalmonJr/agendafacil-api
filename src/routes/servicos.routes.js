const express = require('express');
const router = express.Router();
const servicosController = require('../controllers/servicos.controller');
const { verificarToken, verificarPerfil } = require('../middleware/auth.middleware');

// GET /api/servicos - Público
router.get('/', servicosController.listar);

// GET /api/servicos/:id - Público
router.get('/:id', servicosController.buscarPorId);

// POST /api/servicos - Admin ou Profissional
router.post('/', verificarToken, verificarPerfil('admin', 'profissional'), servicosController.criar);

module.exports = router;
