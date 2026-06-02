const request = require('supertest');
const app = require('../src/app');
const { mockQuery, mockGetConnection, mockConnection, tokenAdmin, tokenCliente, tokenProfissional, tokenRecepcionista } = require('./setup');

describe('Clientes Controller', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('GET /api/clientes', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/api/clientes');

      expect(res.status).toBe(401);
    });

    it('deve retornar 403 para perfil cliente', async () => {
      const res = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
    });

    it('deve listar clientes (admin)', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, nome: 'Maria', email: 'maria@test.com',
        cpf: '123.456.789-00'
      }]]);

      const res = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/api/clientes/1');

      expect(res.status).toBe(401);
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/clientes/999')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar cliente por ID', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, nome: 'Maria', email: 'maria@test.com'
      }]]);

      const res = await request(app)
        .get('/api/clientes/1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/clientes', () => {
    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      const res = await request(app)
        .post('/api/clientes')
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve criar cliente com dados válidos (rota pública)', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce([{ insertId: 1 }]);
      mockConnection.commit.mockResolvedValueOnce();
      mockGetConnection.mockResolvedValueOnce(mockConnection);

      const res = await request(app)
        .post('/api/clientes')
        .send({
          nome: 'Novo Cliente', email: 'novo@test.com',
          senha: '12345678'
        });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/clientes/meu-historico', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/api/clientes/meu-historico');

      expect(res.status).toBe(401);
    });

    it('deve retornar histórico do paciente (perfil cliente)', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/clientes/meu-historico')
        .set('Authorization', `Bearer ${tokenCliente}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
