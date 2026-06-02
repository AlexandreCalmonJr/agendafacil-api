const jwt = require('jsonwebtoken');
const { verificarToken, verificarPerfil } = require('../src/middleware/auth.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {}, headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('verificarToken', () => {
    it('deve retornar 401 sem token', () => {
      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido' });
    });

    it('deve retornar 401 para token inválido', () => {
      req.headers['authorization'] = 'Bearer invalid-token';

      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve aceitar token válido via Authorization header', () => {
      const token = jwt.sign(
        { id: 1, nome: 'Test', email: 'test@test.com', perfil: 'admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      req.headers['authorization'] = `Bearer ${token}`;

      verificarToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.usuario).toBeDefined();
      expect(req.usuario.perfil).toBe('admin');
    });

    it('deve aceitar token válido via cookie', () => {
      const token = jwt.sign(
        { id: 1, nome: 'Test', email: 'test@test.com', perfil: 'cliente' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      req.cookies.token = token;

      verificarToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.usuario.perfil).toBe('cliente');
    });

    it('deve retornar 401 para token expirado', () => {
      const token = jwt.sign(
        { id: 1, nome: 'Test', email: 'test@test.com', perfil: 'admin' },
        JWT_SECRET,
        { expiresIn: '0s' }
      );
      req.headers['authorization'] = `Bearer ${token}`;

      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('verificarPerfil', () => {
    it('deve retornar 401 se req.usuario não existir', () => {
      const middleware = verificarPerfil('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve retornar 403 para perfil não autorizado', () => {
      req.usuario = { perfil: 'cliente' };
      const middleware = verificarPerfil('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve chamar next() para perfil autorizado', () => {
      req.usuario = { perfil: 'admin' };
      const middleware = verificarPerfil('admin', 'recepcionista');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('deve aceitar múltiplos perfis', () => {
      req.usuario = { perfil: 'profissional' };
      const middleware = verificarPerfil('admin', 'profissional');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
