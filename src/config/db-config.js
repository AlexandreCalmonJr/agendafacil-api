require('dotenv').config();

function parseDatabaseUrl(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username) || 'root',
      password: decodeURIComponent(url.password) || '',
      database: url.pathname ? url.pathname.replace(/^\//, '') : 'agendafacil'
    };
  } catch (error) {
    throw new Error(`Invalid database URL: ${error.message}`);
  }
}

function getEnvVar(...keys) {
  for (const key of keys) {
    if (typeof process.env[key] === 'string' && process.env[key].length > 0) {
      return process.env[key];
    }
  }
  return undefined;
}

function getDatabaseConfig() {
  const databaseUrl = getEnvVar(
    'DATABASE_URL',
    'DATABASE_URI',
    'MYSQL_URL',
    'MYSQLURI',
    'MYSQLURL',
    'MYSQL_PUBLIC_URL',
    'MYSQL_PUBLIC_URI',
    'MYSQLPUBLIC_URL',
    'MYSQLPUBLICURI'
  );
  if (databaseUrl) {
    return parseDatabaseUrl(databaseUrl);
  }

  const config = {
    host: getEnvVar('DB_HOST', 'DBHOST', 'MYSQL_HOST', 'MYSQLHOST') || 'localhost',
    port: Number(getEnvVar('DB_PORT', 'DBPORT', 'MYSQL_PORT', 'MYSQLPORT') || 3306),
    user: getEnvVar(
      'DB_USER',
      'DBUSER',
      'MYSQL_USERNAME',
      'MYSQLUSER',
      'MYSQL_USER'
    ) || 'root',
    password: getEnvVar(
      'DB_PASS',
      'DBPASS',
      'MYSQL_PASSWORD',
      'MYSQLPASSWORD',
      'MYSQL_ROOT_PASSWORD',
      'MYSQLROOTPASSWORD'
    ) || '',
    database: getEnvVar('DB_NAME', 'DBNAME', 'MYSQL_DATABASE', 'MYSQLDATABASE') || 'agendafacil'
  };

  if (process.env.DEBUG_DB_CONFIG === 'true') {
    console.log('🔧 Database config loaded:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      passwordSet: Boolean(config.password)
    });
  }

  return config;
}

function getDatabaseConnectionConfig(includeDatabase = true) {
  const config = getDatabaseConfig();
  if (includeDatabase) {
    return config;
  }
  const { database, ...connectionConfig } = config;
  return connectionConfig;
}

module.exports = {
  getDatabaseConfig,
  getDatabaseConnectionConfig
};
