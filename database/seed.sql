-- ============================================
-- AgendaFácil - Dados de Exemplo (Seed)
-- ============================================
-- Senhas: todas são "123456" criptografadas com bcrypt

USE agendafacil;

-- Usuários (senha: 123456 => $2a$10$...)
INSERT INTO usuarios (nome, email, senha, perfil, telefone) VALUES
('Administrador', 'admin@agendafacil.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'admin', '(11) 99999-0000'),
('Dra. Ana Silva', 'ana.silva@clinica.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'profissional', '(11) 98888-1111'),
('Dr. Carlos Mendes', 'carlos.mendes@clinica.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'profissional', '(11) 97777-2222'),
('Dra. Beatriz Oliveira', 'beatriz.oliveira@clinica.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'profissional', '(11) 96666-3333'),
('Maria Santos', 'maria.santos@email.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'cliente', '(11) 95555-4444'),
('João Pereira', 'joao.pereira@email.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'cliente', '(11) 94444-5555'),
('Fernanda Lima', 'fernanda.lima@email.com', '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6', 'cliente', '(11) 93333-6666');

-- Profissionais
INSERT INTO profissionais (usuario_id, especialidade, descricao, registro_profissional) VALUES
(2, 'Dermatologia', 'Especialista em dermatologia clínica e estética com 10 anos de experiência.', 'CRM 12345-SP'),
(3, 'Nutrição', 'Nutricionista esportivo e clínico, especialista em reeducação alimentar.', 'CRN 67890-SP'),
(4, 'Psicologia', 'Psicóloga clínica com abordagem cognitivo-comportamental.', 'CRP 11223-SP');

-- Serviços
INSERT INTO servicos (profissional_id, nome, descricao, duracao_minutos, preco) VALUES
(1, 'Consulta Dermatológica', 'Avaliação completa da pele com orientações personalizadas.', 45, 250.00),
(1, 'Limpeza de Pele', 'Procedimento de limpeza profunda com extração e hidratação.', 60, 180.00),
(1, 'Peeling Químico', 'Tratamento para renovação celular e rejuvenescimento.', 30, 350.00),
(2, 'Consulta Nutricional', 'Avaliação nutricional completa com plano alimentar.', 60, 200.00),
(2, 'Retorno Nutricional', 'Acompanhamento e ajuste do plano alimentar.', 30, 120.00),
(3, 'Sessão de Psicoterapia', 'Sessão individual de psicoterapia (50 minutos).', 50, 220.00),
(3, 'Avaliação Psicológica', 'Avaliação psicológica completa com relatório.', 90, 400.00);

-- Clientes
INSERT INTO clientes (usuario_id, data_nascimento, cpf, endereco) VALUES
(5, '1990-05-15', '123.456.789-00', 'Rua das Flores, 123 - São Paulo/SP'),
(6, '1985-10-20', '987.654.321-00', 'Av. Paulista, 1000 - São Paulo/SP'),
(7, '1995-03-08', '456.789.123-00', 'Rua Augusta, 500 - São Paulo/SP');

-- Agendamentos
INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data_hora, status, observacoes) VALUES
(1, 1, 1, '2025-07-10 09:00:00', 'agendado', 'Primeira consulta - verificar manchas na pele'),
(1, 2, 4, '2025-07-10 14:00:00', 'confirmado', 'Deseja reeducação alimentar para emagrecimento'),
(2, 3, 6, '2025-07-11 10:00:00', 'agendado', 'Sessão de acompanhamento semanal'),
(3, 1, 2, '2025-07-11 15:00:00', 'agendado', 'Limpeza de pele - pele oleosa'),
(2, 2, 5, '2025-07-12 09:30:00', 'confirmado', 'Retorno - ajustar dieta');
