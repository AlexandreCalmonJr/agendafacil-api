const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// GET /api/clientes
const listar = async (req, res) => {
  try {
    const { perfil, profissional_id } = req.usuario;

    let query = `
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
    `;
    const params = [];

    if (perfil === 'profissional') {
      // Doutor só enxerga seus próprios pacientes (que têm algum agendamento com ele)
      query = `
        SELECT DISTINCT
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
        JOIN agendamentos a ON c.id = a.cliente_id
        WHERE a.profissional_id = ?
        ORDER BY u.nome
      `;
      params.push(profissional_id);
    } else {
      query += ` ORDER BY u.nome`;
    }

    const [rows] = await pool.query(query, params);
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

// GET /api/clientes/meu-historico?cliente_id=...
const buscarHistoricoSaude = async (req, res) => {
  try {
    let targetClientId = req.usuario.cliente_id;

    // Se o usuário for profissional ou admin, ele pode passar um cliente_id na query
    if (['profissional', 'admin'].includes(req.usuario.perfil)) {
      if (req.query.cliente_id) {
        targetClientId = req.query.cliente_id;
      } else if (req.usuario.perfil === 'profissional') {
        return res.status(400).json({ erro: 'cliente_id é obrigatório para profissionais' });
      }
    }

    if (!targetClientId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.notas_clinicas,
        p.prescricoes,
        p.exames,
        p.created_at,
        a.data_hora,
        up.nome as profissional_nome,
        s.nome as servico_nome
      FROM prontuarios p
      JOIN agendamentos a ON p.agendamento_id = a.id
      JOIN profissionais prof ON a.profissional_id = prof.id
      JOIN usuarios up ON prof.usuario_id = up.id
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.cliente_id = ?
      ORDER BY a.data_hora DESC
    `, [targetClientId]);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico de saúde:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { listar, buscarPorId, criar, buscarHistoricoSaude };
