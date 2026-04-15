const pool = require('../config/database');

// GET /api/servicos
const listar = async (req, res) => {
  try {
    const { profissional_id } = req.query;

    let query = `
      SELECT 
        s.id,
        s.nome,
        s.descricao,
        s.duracao_minutos,
        s.preco,
        s.profissional_id,
        u.nome as profissional_nome,
        p.especialidade
      FROM servicos s
      JOIN profissionais p ON s.profissional_id = p.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE s.ativo = TRUE
    `;
    const params = [];

    if (profissional_id) {
      query += ' AND s.profissional_id = ?';
      params.push(profissional_id);
    }

    query += ' ORDER BY u.nome, s.nome';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar serviços:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// GET /api/servicos/:id
const buscarPorId = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.nome,
        s.descricao,
        s.duracao_minutos,
        s.preco,
        s.profissional_id,
        u.nome as profissional_nome
      FROM servicos s
      JOIN profissionais p ON s.profissional_id = p.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar serviço:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// POST /api/servicos
const criar = async (req, res) => {
  try {
    const { profissional_id, nome, descricao, duracao_minutos, preco } = req.body;

    if (!profissional_id || !nome || !duracao_minutos || preco === undefined) {
      return res.status(400).json({ erro: 'profissional_id, nome, duracao_minutos e preco são obrigatórios' });
    }

    const [result] = await pool.query(
      'INSERT INTO servicos (profissional_id, nome, descricao, duracao_minutos, preco) VALUES (?, ?, ?, ?, ?)',
      [profissional_id, nome, descricao || null, duracao_minutos, preco]
    );

    res.status(201).json({
      mensagem: 'Serviço cadastrado com sucesso',
      id: result.insertId
    });
  } catch (err) {
    console.error('Erro ao criar serviço:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { listar, buscarPorId, criar };
