const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Criando tabela mensagens_contato...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mensagens_contato (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        assunto VARCHAR(150),
        mensagem TEXT NOT NULL,
        lida BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Tabela criada com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
