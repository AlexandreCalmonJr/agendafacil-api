const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agendafacil'
  });

  try {
    const newHash = '$2a$10$iEACMVHDdMP6OUQ1nLPm7uZkcYmA8DZDBQoPw63bhYPkPJro3r9j2';
    const [result] = await connection.query('UPDATE usuarios SET senha = ?', [newHash]);
    console.log(`✅ Senhas atualizadas com sucesso para ${result.affectedRows} usuários.`);
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await connection.end();
  }
}

fixPasswords();
