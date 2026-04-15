const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function startAutoSetup() {
  // Criar uma conexão separada temporária com multipleStatements ativado 
  // (Isso permite rodar scripts longos inteiros, por segurança não colocamos na Pool original)
  const connectionString = `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'agendafacil'}`;

  let connection;
  try {
    connection = await mysql.createConnection({
        uri: connectionString,
        multipleStatements: true
    });
    
    // Testa se a primeira tabela principal (usuarios) já existe
    const [rows] = await connection.query("SHOW TABLES LIKE 'usuarios'");
    
    if (rows.length === 0) {
      console.log('📦 Banco de Dados vazio detectado! Iniciando configuração automática...');
      
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

      // Schema
      let schemaSql = fs.readFileSync(schemaPath, 'utf8');
      schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS agendafacil;/g, '');
      schemaSql = schemaSql.replace(/USE agendafacil;/g, '');
      
      console.log('⏳ Executando criação de tabelas...');
      await connection.query(schemaSql);
      
      // Seed
      let seedSql = fs.readFileSync(seedPath, 'utf8');
      seedSql = seedSql.replace(/USE agendafacil;/g, '');
      
      console.log('⏳ Adicionando dados falsos...');
      await connection.query(seedSql);

      console.log('✅ Banco de dados configurado automaticamente com sucesso!');
    } else {
       console.log('📦 Tabelas já existem no Banco de Dados. Nenhuma ação automática foi necessária.');
    }

  } catch (error) {
    console.error('❌ Erro durante a configuração automática do Banco de Dados:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = startAutoSetup;
