const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// GET /api/clientes
const listar = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.data_nascimento,
        c.cpf,
        c.endereco,
        u.nome,
        u.email,
        u.telefone,
        u.ativo
      FROM clientes c
      JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY u.nome
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// GET /api/clientes/:id
const buscarPorId = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.data_nascimento,
        c.cpf,
        c.endereco,
        u.nome,
        u.email,
        u.telefone
      FROM clientes c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// POST /api/clientes
const criar = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { nome, email, senha, telefone, data_nascimento, cpf, endereco } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }

    // Criar usuário
    const senhaHash = await bcrypt.hash(senha, 10);
    const [userResult] = await connection.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, 'cliente', telefone || null]
    );

    // Criar cliente
    const [clientResult] = await connection.query(
      'INSERT INTO clientes (usuario_id, data_nascimento, cpf, endereco) VALUES (?, ?, ?, ?)',
      [userResult.insertId, data_nascimento || null, cpf || null, endereco || null]
    );

    await connection.commit();

    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso',
      id: clientResult.insertId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Erro ao criar cliente:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Email ou CPF já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro interno do servidor' });
  } finally {
    connection.release();
  }
};

module.exports = { listar, buscarPorId, criar };
