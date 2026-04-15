const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Clínica Vita rodando na porta ${PORT}`);
  console.log(`📋 API disponível em http://localhost:${PORT}`);
});
