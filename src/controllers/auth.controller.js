const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'agendafacil_secret_key_2025';

// POST /api/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    // Buscar dados adicionais conforme o perfil
    let dadosPerfil = {};
    if (usuario.perfil === 'profissional') {
      const [prof] = await pool.query(
        'SELECT id as profissional_id, especialidade FROM profissionais WHERE usuario_id = ?',
        [usuario.id]
      );
      if (prof.length > 0) dadosPerfil = prof[0];
    } else if (usuario.perfil === 'cliente') {
      const [cli] = await pool.query(
        'SELECT id as cliente_id FROM clientes WHERE usuario_id = ?',
        [usuario.id]
      );
      if (cli.length > 0) dadosPerfil = cli[0];
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ...dadosPerfil
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        telefone: usuario.telefone,
        ...dadosPerfil
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// POST /api/registro
const registro = async (req, res) => {
  try {
    const { nome, email, senha, telefone, perfil } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar email duplicado
    const [existente] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const perfilUsuario = perfil || 'cliente';

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, perfilUsuario, telefone || null]
    );

    // Se for cliente, criar registro na tabela clientes
    if (perfilUsuario === 'cliente') {
      await pool.query(
        'INSERT INTO clientes (usuario_id) VALUES (?)',
        [result.insertId]
      );
    }

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      id: result.insertId
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { login, registro };
