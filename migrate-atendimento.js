const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agendafacil',
    multipleStatements: true
  });

  try {
    console.log('⏳ Alterando tabela agendamentos para incluir novos status...');
    await connection.query(`
      ALTER TABLE agendamentos 
      MODIFY COLUMN status ENUM('agendado', 'confirmado', 'em_espera', 'em_atendimento', 'concluido', 'cancelado') NOT NULL DEFAULT 'agendado';
    `);
    console.log('✅ Coluna status atualizada com sucesso!');

    console.log('⏳ Criando tabela prontuarios...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prontuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agendamento_id INT NOT NULL UNIQUE,
        notas_clinicas TEXT,
        prescricoes TEXT,
        exames TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Tabela prontuarios criada com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await connection.end();
  }
}

migrate();
