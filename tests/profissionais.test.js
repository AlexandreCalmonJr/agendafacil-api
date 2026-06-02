const request = require('supertest');
const app = require('../src/app');
const { mockQuery, mockGetConnection, mockConnection, tokenAdmin, tokenCliente, tokenProfissional } = require('./setup');

describe('Profissionais Controller', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('GET /api/profissionais', () => {
    it('deve listar todos os profissionais (rota pública)', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, especialidade: 'Clínico Geral', descricao: 'Especialista',
        registro_profissional: 'CRM-12345', ativo: true,
        nome: 'Dr. João', email: 'joao@test.com', telefone: '123'
      }]]);

      const res = await request(app).get('/api/profissionais');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].nome).toBe('Dr. João');
    });
  });

  describe('GET /api/profissionais/:id', () => {
    it('deve retornar 404 para profissional inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/profissionais/999');

      expect(res.status).toBe(404);
    });

    it('deve retornar profissional por ID', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, especialidade: 'Cardiologia', nome: 'Dr. Ana'
      }]]);

      const res = await request(app).get('/api/profissionais/1');

      expect(res.status).toBe(200);
      expect(res.body.especialidade).toBe('Cardiologia');
    });
  });

  describe('POST /api/profissionais', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .post('/api/profissionais')
        .send({ nome: 'Dr. Teste', email: 'teste@test.com', senha: '123456', especialidade: 'Clínico' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 403 para perfil cliente', async () => {
      const res = await request(app)
        .post('/api/profissionais')
        .set('Authorization', `Bearer ${tokenCliente}`)
        .send({ nome: 'Dr. Teste', email: 'teste@test.com', senha: '123456', especialidade: 'Clínico' });

      expect(res.status).toBe(403);
    });

    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      const res = await request(app)
        .post('/api/profissionais')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve criar profissional com dados válidos (admin)', async () => {
      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce([{ insertId: 1 }]);
      mockConnection.commit.mockResolvedValueOnce();
      mockGetConnection.mockResolvedValueOnce(mockConnection);

      const res = await request(app)
        .post('/api/profissionais')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          nome: 'Dr. Novo', email: 'novo@test.com',
          senha: '123456', especialidade: 'Cardiologia'
        });

      expect(res.status).toBe(201);
      expect(mockConnection.commit).toHaveBeenCalled();
    });
  });
});
