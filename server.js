const app = require('./src/app');
const startAutoSetup = require('./src/config/init-db');

const PORT = process.env.PORT || 3001;

// Roda a configuração do banco antes de liberar a porta
startAutoSetup().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor AgendaFácil rodando na porta ${PORT}`);
    console.log(`📋 API disponível em http://localhost:${PORT}`);
  });
});
