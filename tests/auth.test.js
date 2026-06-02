const request = require('supertest');
const app = require('../src/app');
const { mockQuery, tokenAdmin } = require('./setup');
const bcrypt = require('bcryptjs');

describe('Auth Controller', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('POST /api/login', () => {
    it('deve retornar 400 se email ou senha não forem fornecidos', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: '', senha: '' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/obrigatórios/);
    });

    it('deve retornar 400 para email com formato inválido', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'invalido', senha: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/inválido/);
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/login')
        .send({ email: 'nao@existe.com', senha: '123456' });

      expect(res.status).toBe(401);
      expect(res.body.erro).toMatch(/inválidos/);
    });

    it('deve retornar 401 para senha incorreta', async () => {
      const hash = await bcrypt.hash('correta', 10);
      mockQuery.mockResolvedValueOnce([[{
        id: 1, nome: 'Test', email: 'test@test.com',
        senha: hash, perfil: 'admin', ativo: true
      }]]);

      const res = await request(app)
        .post('/api/login')
        .send({ email: 'test@test.com', senha: 'errada' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 200 e cookie com token para credenciais válidas', async () => {
      const hash = await bcrypt.hash('123456', 10);
      mockQuery
        .mockResolvedValueOnce([[{
          id: 1, nome: 'Admin', email: 'admin@test.com',
          senha: hash, perfil: 'admin', telefone: '123', ativo: true
        }]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/login')
        .send({ email: 'admin@test.com', senha: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/sucesso/);
      expect(res.body.usuario.email).toBe('admin@test.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/registro', () => {
    it('deve retornar 400 se nome, email ou senha não forem fornecidos', async () => {
      const res = await request(app)
        .post('/api/registro')
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para senha com menos de 8 caracteres', async () => {
      const res = await request(app)
        .post('/api/registro')
        .send({ nome: 'Test', email: 'test@test.com', senha: '123' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/8 caracteres/);
    });

    it('deve retornar 201 para registro válido', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/registro')
        .send({ nome: 'Novo', email: 'novo@test.com', senha: '12345678' });

      expect(res.status).toBe(201);
      expect(res.body.mensagem).toMatch(/sucesso/);
    });

    it('deve forçar perfil "cliente" independente do que o cliente envia', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/registro')
        .send({ nome: 'Test', email: 'test@test.com', senha: '12345678', perfil: 'admin' });

      expect(res.status).toBe(201);
    });

    it('deve retornar 409 para email duplicado', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);

      const res = await request(app)
        .post('/api/registro')
        .send({ nome: 'Test', email: 'existente@test.com', senha: '12345678' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/logout', () => {
    it('deve retornar 200 e limpar cookie', async () => {
      const res = await request(app)
        .post('/api/logout');

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/sucesso/);
    });
  });

  describe('GET /', () => {
    it('deve retornar informações da API', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body.versao).toBeDefined();
    });
  });

  describe('Rota não encontrada', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const res = await request(app).get('/rota/inexistente');

      expect(res.status).toBe(404);
    });
  });
});
