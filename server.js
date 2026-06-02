const app = require('./src/app');

const PORT = process.env.PORT || 3001;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Clínica Vita rodando na porta ${PORT}`);
  console.log(`📋 API disponível em http://localhost:${PORT}`);
});
