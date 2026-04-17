const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

// Rota para receber mensagens de contato
router.post('/', async (req, res) => {
  const { nome, email, assunto, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ erro: 'Nome, e-mail e mensagem são obrigatórios' });
  }

  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.execute(
      'INSERT INTO mensagens_contato (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)',
      [nome, email, assunto || 'Geral', mensagem]
    );
    res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    res.status(500).json({ erro: 'Falha ao processar sua mensagem' });
  } finally {
    await connection.end();
  }
});

module.exports = router;
