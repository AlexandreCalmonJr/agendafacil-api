const express = require('express');
const router = express.Router();
const agendamentosController = require('../controllers/agendamentos.controller');
const prontuariosController = require('../controllers/prontuarios.controller');
const { verificarToken, verificarPerfil } = require('../middleware/auth.middleware');

// GET /api/agendamentos - Usuário logado (filtrado por perfil)
router.get('/', verificarToken, agendamentosController.listar);

// GET /api/agendamentos/:id - Usuário logado
router.get('/:id', verificarToken, agendamentosController.buscarPorId);

// POST /api/agendamentos - Cliente ou Admin
router.post('/', verificarToken, verificarPerfil('cliente', 'admin'), agendamentosController.criar);

// PUT /api/agendamentos/:id - Usuário logado
router.put('/:id', verificarToken, agendamentosController.atualizar);

// DELETE /api/agendamentos/:id - Usuário logado
router.delete('/:id', verificarToken, agendamentosController.cancelar);

// ================= PRONTUARIOS =================
// GET /api/agendamentos/:id/prontuario
router.get('/:id/prontuario', verificarToken, prontuariosController.buscarPorAgendamento);

// PUT /api/agendamentos/:id/prontuario
router.put('/:id/prontuario', verificarToken, verificarPerfil('profissional', 'admin'), prontuariosController.salvarProntuario);

module.exports = router;
