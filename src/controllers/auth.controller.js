const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não está definido nas variáveis de ambiente.');
  process.exit(1);
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PERFIS_PUBLICOS = ['cliente'];
const PERFIS_PERMITIDOS_ADMIN = ['admin', 'profissional', 'recepcionista'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buscarDadosPerfil = async (usuario) => {
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
  return dadosPerfil;
};

const gerarToken = (usuario, dadosPerfil) => {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, ...dadosPerfil },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const enviarTokenEmCookie = (res, token, usuario, dadosPerfil) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });

  res.json({
    mensagem: 'Login realizado com sucesso',
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      telefone: usuario.telefone,
      ...dadosPerfil
    }
  });
};

// POST /api/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
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

    const dadosPerfil = await buscarDadosPerfil(usuario);
    const token = gerarToken(usuario, dadosPerfil);
    enviarTokenEmCookie(res, token, usuario, dadosPerfil);
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

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }

    if (senha.length < 8) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 8 caracteres' });
    }

    // Registro público só permite perfil 'cliente'
    const perfilUsuario = PERFIS_PUBLICOS.includes(perfil) ? perfil : 'cliente';

    const [existente] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, perfilUsuario, telefone || null]
    );

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

// POST /api/login-google
const loginGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ erro: 'Token do Google é obrigatório' });
    }

    // Verificar token com a API do Google
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      return res.status(401).json({ erro: 'Token do Google inválido ou expirado' });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ erro: 'Token do Google sem e-mail válido' });
    }

    const { email, name, sub } = payload;

    let [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
      [email]
    );

    let usuario;
    if (rows.length === 0) {
      const senhaAleatoria = await bcrypt.hash(sub, 10);
      const [result] = await pool.query(
        'INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES (?, ?, ?, ?, TRUE)',
        [name || email.split('@')[0], email, senhaAleatoria, 'cliente']
      );

      const usuarioId = result.insertId;
      await pool.query(
        'INSERT INTO clientes (usuario_id) VALUES (?)',
        [usuarioId]
      );

      const [newUser] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [usuarioId]);
      usuario = newUser[0];
    } else {
      usuario = rows[0];
    }

    const dadosPerfil = await buscarDadosPerfil(usuario);
    const tokenLocal = gerarToken(usuario, dadosPerfil);
    enviarTokenEmCookie(res, tokenLocal, usuario, dadosPerfil);
  } catch (err) {
    console.error('Erro no login com Google:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// POST /api/logout
const logout = async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ mensagem: 'Logout realizado com sucesso' });
};

module.exports = { login, registro, loginGoogle, logout };
