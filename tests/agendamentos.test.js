const request = require('supertest');
const app = require('../src/app');
const { mockQuery, mockGetConnection, mockConnection, tokenAdmin, tokenCliente, tokenProfissional } = require('./setup');

describe('Agendamentos Controller', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockGetConnection.mockReset();
    mockConnection.query.mockReset();
    mockConnection.commit.mockReset();
    mockConnection.rollback.mockReset();
    mockConnection.release.mockReset();
    mockGetConnection.mockResolvedValue(mockConnection);
  });

  describe('GET /api/agendamentos', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/api/agendamentos');

      expect(res.status).toBe(401);
    });

    it('deve listar agendamentos com paginação', async () => {
      mockQuery
        .mockResolvedValueOnce([[{
          id: 1, data_hora: '2026-06-10 10:00:00', status: 'agendado',
          cliente_nome: 'Maria', profissional_nome: 'Dr. Ana'
        }]])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app)
        .get('/api/agendamentos')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.dados).toBeDefined();
      expect(res.body.paginacao).toBeDefined();
    });

    it('deve filtrar por data', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ total: 0 }]]);

      const res = await request(app)
        .get('/api/agendamentos?data=2026-06-10')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/agendamentos/disponibilidade', () => {
    it('deve retornar 400 sem data e profissional_id', async () => {
      const res = await request(app)
        .get('/api/agendamentos/disponibilidade')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar slots bloqueados', async () => {
      mockQuery.mockResolvedValueOnce([[{
        data_hora: '2026-06-10 10:00:00', duracao_minutos: 30
      }]]);

      const res = await request(app)
        .get('/api/agendamentos/disponibilidade?data=2026-06-10&profissional_id=1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/agendamentos', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .post('/api/agendamentos')
        .send({});

      expect(res.status).toBe(401);
    });

    it('deve retornar 403 para perfil profissional', async () => {
      const res = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${tokenProfissional}`)
        .send({});

      expect(res.status).toBe(403);
    });

    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      const res = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve criar agendamento com dados válidos', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1, duracao_minutos: 30 }]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cliente_id: 1, profissional_id: 1, servico_id: 1,
          data_hora: '2026-06-10 10:00:00'
        });

      expect(res.status).toBe(201);
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('deve retornar 409 para conflito de horário do profissional', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1, duracao_minutos: 30 }]])
        .mockResolvedValueOnce([[{ id: 1 }]]);

      const res = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cliente_id: 1, profissional_id: 1, servico_id: 1,
          data_hora: '2026-06-10 10:00:00'
        });

      expect(res.status).toBe(409);
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe('PUT /api/agendamentos/:id', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .put('/api/agendamentos/1')
        .send({});

      expect(res.status).toBe(401);
    });

    it('deve retornar 404 para agendamento inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .put('/api/agendamentos/999')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ status: 'confirmado' });

      expect(res.status).toBe(404);
    });

    it('deve retornar 400 para status inválido', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, cliente_id: 1, profissional_id: 1 }]]);

      const res = await request(app)
        .put('/api/agendamentos/1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ status: 'status_invalido' });

      expect(res.status).toBe(400);
    });

    it('deve atualizar agendamento', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 1, cliente_id: 1, profissional_id: 1 }]])
        .mockResolvedValueOnce({});

      const res = await request(app)
        .put('/api/agendamentos/1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ status: 'confirmado' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/agendamentos/:id', () => {
    it('deve retornar 404 para agendamento inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .delete('/api/agendamentos/999')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
    });

    it('deve cancelar agendamento (soft delete)', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 1, cliente_id: 1, profissional_id: 1 }]])
        .mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/agendamentos/1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/sucesso/);
    });
  });
});
