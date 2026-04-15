const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'agendafacil_secret_key_2025';

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar perfil do usuário
const verificarPerfil = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este perfil' });
    }

    next();
  };
};

module.exports = { verificarToken, verificarPerfil };
