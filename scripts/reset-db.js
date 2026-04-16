const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuração do Banco (Prioriza variáveis do Railway)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'agendafacil',
  multipleStatements: true
};

async function resetDatabase() {
  console.log('🚀 Iniciando RESET TOTAL do Banco de Dados...');
  console.log(`📡 Conectando em: ${dbConfig.host}:${dbConfig.port} (DB: ${dbConfig.database})`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('⚠️ Desabilitando checagem de chaves estrangeiras...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Pegar todas as tabelas para dropar
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const table of tableNames) {
      console.log(`🗑️ Dropando tabela: ${table}`);
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    }

    console.log('🏗️ Criando tabelas do Schema Elite...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);

    console.log('🌱 Semeando dados Premium...');
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);

    console.log('✅ Reabilitando checagem de chaves estrangeiras...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✨ BANCO DE DADOS RESETADO E SINCRONIZADO COM SUCESSO! ✨');
    console.log('---------------------------------------------------------');
    console.log('Usuários de Teste:');
    console.log('- Médico: ana.silva@clinica.com / 123456');
    console.log('- Cliente: maria.santos@email.com / 123456');
    console.log('- Admin: admin@clinica.com / 123456');
    console.log('---------------------------------------------------------');

  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO RESET:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('DICA: Verifique suas credenciais no arquivo .env ou no Railway.');
    }
  } finally {
    if (connection) await connection.end();
  }
}

resetDatabase();
