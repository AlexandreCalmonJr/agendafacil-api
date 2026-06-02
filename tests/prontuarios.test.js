const request = require('supertest');
const app = require('../src/app');
const { mockQuery, tokenAdmin } = require('./setup');

describe('Prontuários Controller', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('GET /api/agendamentos/:id/prontuario', () => {
    it('deve retornar null se não houver prontuário', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/agendamentos/1/prontuario')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    });

    it('deve retornar prontuário existente', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, agendamento_id: 1,
        notas_clinicas: 'Paciente apresenta melhora',
        prescricoes: 'Dipirona 500mg', exames: ''
      }]]);

      const res = await request(app)
        .get('/api/agendamentos/1/prontuario')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.notas_clinicas).toBeDefined();
    });
  });

  describe('PUT /api/agendamentos/:id/prontuario', () => {
    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .put('/api/agendamentos/1/prontuario')
        .send({ notas_clinicas: 'Teste' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 403 para perfil cliente', async () => {
      const res = await request(app)
        .put('/api/agendamentos/1/prontuario')
        .set('Authorization', `Bearer ${require('./setup').tokenCliente}`)
        .send({ notas_clinicas: 'Teste' });

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 para agendamento inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .put('/api/agendamentos/999/prontuario')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ notas_clinicas: 'Teste' });

      expect(res.status).toBe(404);
    });

    it('deve salvar prontuário com dados válidos', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 1, profissional_id: 1 }]])
        .mockResolvedValueOnce({});

      const res = await request(app)
        .put('/api/agendamentos/1/prontuario')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          notas_clinicas: 'Paciente está bem',
          prescricoes: 'Paracetamol',
          exames: 'Hemograma completo'
        });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/sucesso/);
    });
  });
});
