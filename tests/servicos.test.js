const request = require('supertest');
const app = require('../src/app');
const { mockQuery, tokenAdmin, tokenProfissional } = require('./setup');

describe('Serviços Controller', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('GET /api/servicos', () => {
    it('deve listar todos os serviços (rota pública)', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, nome: 'Consulta', duracao_minutos: 30,
        preco: 150.00, profissional_id: 1, profissional_nome: 'Dr. Ana',
        especialidade: 'Clínico Geral'
      }]]);

      const res = await request(app).get('/api/servicos');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve filtrar por profissional_id', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/servicos?profissional_id=1');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/servicos/:id', () => {
    it('deve retornar 404 para serviço inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/servicos/999');

      expect(res.status).toBe(404);
    });

    it('deve retornar serviço por ID', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, nome: 'Retorno', duracao_minutos: 15, preco: 0
      }]]);

      const res = await request(app).get('/api/servicos/1');

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Retorno');
    });
  });

  describe('POST /api/servicos', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .post('/api/servicos')
        .send({ profissional_id: 1, nome: 'Teste', duracao_minutos: 30, preco: 100 });

      expect(res.status).toBe(401);
    });

    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      const res = await request(app)
        .post('/api/servicos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para duração ou preço inválidos', async () => {
      const res = await request(app)
        .post('/api/servicos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ profissional_id: 1, nome: 'Teste', duracao_minutos: -5, preco: -10 });

      expect(res.status).toBe(400);
    });

    it('deve criar serviço com dados válidos', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/servicos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          profissional_id: 1, nome: 'Novo Serviço',
          duracao_minutos: 30, preco: 200
        });

      expect(res.status).toBe(201);
    });
  });
});
