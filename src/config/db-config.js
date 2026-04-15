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

function debugDatabaseConfig(config, source) {
  if (process.env.DEBUG_DB_CONFIG !== 'true') {
    return;
  }

  console.log('🔧 DB CONFIG SOURCE:', source);
  console.log('🔧 DB CONFIG:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    passwordSet: Boolean(config.password)
  });
  console.log('🔧 DB ENV PRESENCE:', {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    MYSQL_URL: Boolean(process.env.MYSQL_URL),
    MYSQL_PUBLIC_URL: Boolean(process.env.MYSQL_PUBLIC_URL),
    MYSQL_HOST: Boolean(process.env.MYSQL_HOST),
    MYSQLUSER: Boolean(process.env.MYSQLUSER),
    MYSQLPASSWORD: Boolean(process.env.MYSQLPASSWORD)
  });
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
    const config = parseDatabaseUrl(databaseUrl);
    debugDatabaseConfig(config, 'URL');
    return config;
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

  debugDatabaseConfig(config, 'ENV');
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
