const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { getDatabaseConfig, getDatabaseConnectionConfig } = require('./db-config');

async function startAutoSetup() {
  const dbConfig = getDatabaseConnectionConfig(false);
  const dbName = getDatabaseConfig().database;

  let connection;
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);

    const [rows] = await connection.query("SHOW TABLES LIKE 'usuarios'");

    if (rows.length === 0) {
      console.log('📦 Banco de Dados vazio detectado! Iniciando configuração automática...');

      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('⏳ Executando criação de tabelas...');
      await connection.query(schemaSql);

      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('⏳ Adicionando dados falsos...');
      await connection.query(seedSql);

      console.log('✅ Banco de dados configurado automaticamente com sucesso!');
    } else {
      console.log('📦 Tabelas já existem no Banco de Dados. Nenhuma ação automática foi necessária.');
    }
  } catch (error) {
    console.error('❌ Erro durante a configuração automática do Banco de Dados:', error.code || error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = startAutoSetup;
