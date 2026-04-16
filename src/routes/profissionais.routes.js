const express = require('express');
const router = express.Router();
const profissionaisController = require('../controllers/profissionais.controller');
const { verificarToken, verificarPerfil } = require('../middleware/auth.middleware');

// GET /api/profissionais - Público
router.get('/', profissionaisController.listar);

// GET /api/profissionais/:id - Público
router.get('/:id', profissionaisController.buscarPorId);

// POST /api/profissionais - Admin e Recepcionista
router.post('/', verificarToken, verificarPerfil('admin', 'recepcionista'), profissionaisController.criar);

module.exports = router;
