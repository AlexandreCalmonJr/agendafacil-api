-- ============================================
-- Clínica Vita - Seed de Dados (Versão Final Elite)
-- ============================================

-- Limpar dados existentes (em ordem reversa de FK)
DELETE FROM prontuarios;
DELETE FROM agendamentos;
DELETE FROM clientes;
DELETE FROM servicos;
DELETE FROM profissionais;
DELETE FROM usuarios;

-- 1. USUÁRIOS (Senha comum para todos: 123456)
-- Hash: $2a$10$iEACMVHDdMP6OUQ1nLPm7uZkcYmA8DZDBQoPw63bhYPkPJro3r9j2
INSERT INTO usuarios (id, nome, email, senha, perfil, telefone) VALUES
(1, 'Administrador Vita', 'admin@clinica.com', '$2a$10$iEACMVHDdMP6OUQ1nLPm7uZkcYmA8DZDBQoPw63bhYPkPJro3r9j2', 'admin', '(11) 98888-8888'),
(2, 'Dra. Ana Silva', 'ana.silva@clinica.com', '$2a$10$iEACMVHDdMP6OUQ1nLPm7uZkcYmA8DZDBQoPw63bhYPkPJro3r9j2', 'profissional', '(11) 97777-7777'),
(3, 'Dr. Roberto Santos', 'roberto.santos@clinica.com', '$2a$10$iEACMVHDdMP6OUQ1nLPm7uZkcYmA8DZDBQoPw63bhYPkPJro3r9j2', 'profissional', '(11) 96666-6666'),
(4, 'Maria Santos', 'maria.santos@email.com', '$2a$10$iEACMVHDdMP6OUQ1nLPm7uZkcYmA8DZDBQoPw63bhYPkPJro3r9j2', 'cliente', '(11) 95555-5555');

-- 2. PROFISSIONAIS
INSERT INTO profissionais (id, usuario_id, especialidade, descricao, registro_profissional) VALUES
(1, 2, 'Clínica Geral / Medicina da Família', 'Especialista em cuidados preventivos e gestão de saúde longitudinal.', 'CRM-SP 123456'),
(2, 3, 'Psiquiatria Clínica', 'Atendimento focado em transtornos de ansiedade e saúde mental moderna.', 'CRM-SP 654321');

-- 3. SERVIÇOS
INSERT INTO servicos (id, profissional_id, nome, descricao, duracao_minutos, preco) VALUES
(1, 1, 'Consulta Geral (Check-up)', 'Avaliação completa de saúde física e solicitação de exames de rotina.', 45, 250.00),
(2, 1, 'Teleconsulta de Retorno', 'Acompanhamento online de tratamentos em curso.', 30, 150.00),
(3, 2, 'Psicoterapia Individual', 'Sessão de terapia focada em autoconhecimento e saúde emocional.', 50, 350.00);

-- 4. CLIENTES
INSERT INTO clientes (id, usuario_id, data_nascimento, cpf, endereco) VALUES
(1, 4, '1990-05-15', '123.456.789-00', 'Rua das Flores, 123, São Paulo - SP');

-- 5. AGENDAMENTOS (Passado, Hoje, Futuro)
INSERT INTO agendamentos (id, cliente_id, profissional_id, servico_id, data_hora, modalidade, status, observacoes) VALUES
-- Consulta passada (para teste de histórico)
(1, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), 'presencial', 'concluido', 'Paciente apresentava cansaço excessivo.'),
-- Consulta de hoje (para teste de Dashboards)
(2, 1, 1, 1, CONCAT(CURDATE(), ' 14:30:00'), 'presencial', 'agendado', 'Retorno para entrega de exames.'),
-- Consulta futura (Teleconsulta)
(3, 1, 1, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 'teleconsulta', 'confirmado', 'Monitoramento remoto.');

-- 6. PRONTUÁRIOS (Referentes à consulta passada)
INSERT INTO prontuarios (agendamento_id, notas_clinicas, prescricoes, exames) VALUES
(1, 'Paciente relatou fadiga. Exame físico normal. Suspeita inicial de deficiência vitamínica.', '1. Vitamina D 50.000 UI - 1 gota por dia\n2. Melatonina 3mg antes de dormir.', '1. Hemograma Completo\n2. Dosagem de Vitamina D e B12\n3. Perfil Lipídico');
