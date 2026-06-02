process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

const mockQuery = jest.fn();
const mockGetConnection = jest.fn();

const mockConnection = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn()
};

mockGetConnection.mockResolvedValue(mockConnection);

jest.mock('../src/config/database', () => ({
  query: (...args) => mockQuery(...args),
  getConnection: (...args) => mockGetConnection(...args)
}));

const jwt = require('jsonwebtoken');

const gerarToken = (payload) => {
  return jwt.sign(
    { id: 1, nome: 'Test User', email: 'test@test.com', perfil: 'admin', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const tokenAdmin = gerarToken({ perfil: 'admin' });
const tokenCliente = gerarToken({ perfil: 'cliente', cliente_id: 1 });
const tokenProfissional = gerarToken({ perfil: 'profissional', profissional_id: 1 });
const tokenRecepcionista = gerarToken({ perfil: 'recepcionista' });

module.exports = {
  mockQuery,
  mockGetConnection,
  mockConnection,
  gerarToken,
  tokenAdmin,
  tokenCliente,
  tokenProfissional,
  tokenRecepcionista
};
