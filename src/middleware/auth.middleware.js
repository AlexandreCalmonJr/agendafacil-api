const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não está definido nas variáveis de ambiente.');
  process.exit(1);
}

const extrairToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const token = extrairToken(req);

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    return next();
  } catch (err) {
    // Fallback para o cookie apenas se o header não for válido,
    // evitando que um cookie antigo impeça um token válido enviado pelo cliente.
    const cookieToken = req.cookies && req.cookies.token ? req.cookies.token : null;
    const authToken = req.headers['authorization']
      ? (req.headers['authorization'].startsWith('Bearer ') ? req.headers['authorization'].slice(7) : req.headers['authorization'])
      : null;

    const tokensParaTentar = [authToken, cookieToken].filter(Boolean);

    for (const candidate of tokensParaTentar) {
      try {
        const decoded = jwt.verify(candidate, JWT_SECRET);
        req.usuario = decoded;
        return next();
      } catch (candidateErr) {
        // tenta o próximo token
      }
    }

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
