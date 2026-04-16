-- ============================================
-- Clínica Vita - Schema do Banco de Dados (Versão Final Elite)
-- ============================================

-- Tabela de Usuários (autenticação e perfil)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'profissional', 'cliente', 'recepcionista') NOT NULL DEFAULT 'cliente',
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  especialidade VARCHAR(100) NOT NULL,
  descricao TEXT,
  registro_profissional VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profissional_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  duracao_minutos INT NOT NULL DEFAULT 30,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  data_nascimento DATE,
  cpf VARCHAR(14) UNIQUE,
  endereco VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  servico_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  modalidade ENUM('presencial', 'teleconsulta') DEFAULT 'presencial',
  link_telemedicina VARCHAR(255),
  notificado BOOLEAN DEFAULT FALSE,
  status ENUM('agendado', 'confirmado', 'em_espera', 'em_atendimento', 'concluido', 'cancelado') NOT NULL DEFAULT 'agendado',
  pagamento_status ENUM('pendente', 'pago') DEFAULT 'pendente',
  valor_consulta DECIMAL(10,2) DEFAULT 0.00,
  sala VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices para performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id, data_hora);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id, data_hora);

-- Tabela de Prontuários (Sala de Atendimento)
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
