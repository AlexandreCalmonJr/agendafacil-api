const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota para receber mensagens de contato
router.post('/', async (req, res) => {
  const { nome, email, assunto, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ erro: 'Nome, e-mail e mensagem são obrigatórios' });
  }

  try {
    await pool.execute(
      'INSERT INTO mensagens_contato (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)',
      [nome, email, assunto || 'Geral', mensagem]
    );
    res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    res.status(500).json({ erro: 'Falha ao processar sua mensagem' });
  }
});

module.exports = router;
