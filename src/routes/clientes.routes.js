const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verificarToken, verificarPerfil } = require('../middleware/auth.middleware');

// GET /api/clientes - Admin, Profissional e Recepcionista
router.get('/', verificarToken, verificarPerfil('admin', 'profissional', 'recepcionista'), clientesController.listar);

// GET /api/clientes/meu-historico - Cliente vê o seu, profissionais e recepção veem do cliente_id
router.get('/meu-historico', verificarToken, verificarPerfil('cliente', 'admin', 'profissional', 'recepcionista'), clientesController.buscarHistoricoSaude);

// GET /api/clientes/:id - Admin, Profissional e Recepcionista
router.get('/:id', verificarToken, verificarPerfil('admin', 'profissional', 'recepcionista'), clientesController.buscarPorId);

// POST /api/clientes - Público (cadastro)
router.post('/', clientesController.criar);

module.exports = router;
