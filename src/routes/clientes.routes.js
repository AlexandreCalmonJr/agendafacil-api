const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verificarToken, verificarPerfil } = require('../middleware/auth.middleware');

// GET /api/clientes - Admin e Profissional
router.get('/', verificarToken, verificarPerfil('admin', 'profissional'), clientesController.listar);

// GET /api/clientes/:id - Admin e Profissional
router.get('/:id', verificarToken, verificarPerfil('admin', 'profissional'), clientesController.buscarPorId);

// GET /api/clientes/meu-historico - Exclusivo para o cliente logado
router.get('/meu-historico', verificarToken, verificarPerfil('cliente'), clientesController.buscarHistoricoSaude);

// POST /api/clientes - Público (cadastro)
router.post('/', clientesController.criar);

module.exports = router;
