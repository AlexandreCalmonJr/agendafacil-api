const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não está definido nas variáveis de ambiente.');
  process.exit(1);
}

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  let token = null;

  // Tentar ler do cookie httpOnly primeiro
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Fallback para Authorization header
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

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
