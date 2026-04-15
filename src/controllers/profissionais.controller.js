const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// GET /api/profissionais
const listar = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.especialidade,
        p.descricao,
        p.registro_profissional,
        p.ativo,
        u.nome,
        u.email,
        u.telefone
      FROM profissionais p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.ativo = TRUE
      ORDER BY u.nome
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar profissionais:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// GET /api/profissionais/:id
const buscarPorId = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.especialidade,
        p.descricao,
        p.registro_profissional,
        p.ativo,
        u.nome,
        u.email,
        u.telefone
      FROM profissionais p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar profissional:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// POST /api/profissionais
const criar = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { nome, email, senha, telefone, especialidade, descricao, registro_profissional } = req.body;

    if (!nome || !email || !senha || !especialidade) {
      return res.status(400).json({ erro: 'Nome, email, senha e especialidade são obrigatórios' });
    }

    // Criar usuário
    const senhaHash = await bcrypt.hash(senha, 10);
    const [userResult] = await connection.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, 'profissional', telefone || null]
    );

    // Criar profissional
    const [profResult] = await connection.query(
      'INSERT INTO profissionais (usuario_id, especialidade, descricao, registro_profissional) VALUES (?, ?, ?, ?)',
      [userResult.insertId, especialidade, descricao || null, registro_profissional || null]
    );

    await connection.commit();

    res.status(201).json({
      mensagem: 'Profissional cadastrado com sucesso',
      id: profResult.insertId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Erro ao criar profissional:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro interno do servidor' });
  } finally {
    connection.release();
  }
};

module.exports = { listar, buscarPorId, criar };
