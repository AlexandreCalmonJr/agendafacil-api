const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const authRoutes = require('./routes/auth.routes');
const profissionaisRoutes = require('./routes/profissionais.routes');
const servicosRoutes = require('./routes/servicos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const agendamentosRoutes = require('./routes/agendamentos.routes');
const noticiasRoutes = require('./routes/noticias.routes');

app.use('/api', authRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/contato', require('./routes/contato.routes'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Clínica Vita está rodando!',
    versao: '1.0.0',
    endpoints: {
      auth: '/api/login, /api/registro',
      profissionais: '/api/profissionais',
      servicos: '/api/servicos',
      clientes: '/api/clientes',
      agendamentos: '/api/agendamentos',
      noticias: '/api/noticias/saude, /api/noticias/clinica'
    }
  });
});

// Tratamento de rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
