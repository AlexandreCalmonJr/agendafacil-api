const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agendafacil',
    multipleStatements: true
  });

  try {
    console.log('🔗 Conectado ao banco de dados: ' + (process.env.DB_NAME || 'agendafacil'));
    
    let schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
    // Remove "CREATE DATABASE" and "USE" so it runs securely on Railway's default DB
    schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS agendafacil;/g, '');
    schemaSql = schemaSql.replace(/USE agendafacil;/g, '');

    console.log('⏳ Executando schema.sql...');
    await connection.query(schemaSql);
    console.log('✅ Schema aplicado com sucesso!');

    let seedSql = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf-8');
    seedSql = seedSql.replace(/USE agendafacil;/g, '');
    
    console.log('⏳ Executando seed.sql...');
    await connection.query(seedSql);
    console.log('✅ Dados iniciais injetados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await connection.end();
  }
}

run();
