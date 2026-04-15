const startAutoSetup = require('./src/config/init-db');

const PORT = process.env.PORT || 3001;

// Roda a configuração do banco antes de liberar a porta
startAutoSetup()
  .then(() => {
    const app = require('./src/app');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor AgendaFácil rodando na porta ${PORT}`);
      console.log(`📋 API disponível em http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Falha ao iniciar a API:', error.code || error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  });
