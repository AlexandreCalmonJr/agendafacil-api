const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const novosProfissionais = [
  {
    nome: 'Dra. Eliana Rocha',
    email: 'eliana.rocha@clinicavita.com.br',
    especialidade: 'Ginecologia',
    descricao: 'Especialista em saúde da mulher e obstetrícia de alto risco.',
    registro: 'CRM/SP 123456',
    servicos: [
      { nome: 'Consulta Ginecológica', preco: 250, duracao: 40 },
      { nome: 'Ultrassom Transvaginal', preco: 350, duracao: 30 }
    ]
  },
  {
    nome: 'Dr. Sergio Lima',
    email: 'sergio.lima@clinicavita.com.br',
    especialidade: 'Oftalmologia',
    descricao: 'Especialista em cirurgia refratária e catarata.',
    registro: 'CRM/SP 234567',
    servicos: [
      { nome: 'Exame de Refração', preco: 200, duracao: 30 },
      { nome: 'Mapeamento de Retina', preco: 300, duracao: 40 }
    ]
  },
  {
    nome: 'Dra. Paula Souza',
    email: 'paula.souza@clinicavita.com.br',
    especialidade: 'Endocrinologia',
    descricao: 'Foco em diabetes, tireoide e metabolismo.',
    registro: 'CRM/SP 345678',
    servicos: [
      { nome: 'Consulta Endocrinológica', preco: 280, duracao: 45 },
      { nome: 'Bioimpedância', preco: 150, duracao: 20 }
    ]
  },
  {
    nome: 'Dr. André Santos',
    email: 'andre.santos@clinicavita.com.br',
    especialidade: 'Neurologia',
    descricao: 'Especialista em distúrbios do sono e enxaqueca.',
    registro: 'CRM/SP 456789',
    servicos: [
      { nome: 'Consulta Neurológica', preco: 350, duracao: 60 },
      { nome: 'Eletroencefalograma', preco: 400, duracao: 45 }
    ]
  },
  {
    nome: 'Dra. Luísa Farias',
    email: 'luisa.farias@clinicavita.com.br',
    especialidade: 'Psiquiatria',
    descricao: 'Atendimento humanizado em saúde mental e bem-estar.',
    registro: 'CRM/SP 567890',
    servicos: [
      { nome: 'Avaliação Psiquiátrica', preco: 400, duracao: 60 },
      { nome: 'Acompanhamento Terapêutico', preco: 300, duracao: 50 }
    ]
  },
  {
    nome: 'Dr. Fernando Costa',
    email: 'fernando.costa@clinicavita.com.br',
    especialidade: 'Urologia',
    descricao: 'Referência em urologia minimamente invasiva.',
    registro: 'CRM/SP 678901',
    servicos: [
      { nome: 'Check-up Masculino', preco: 280, duracao: 30 },
      { nome: 'Urodinâmica', preco: 450, duracao: 60 }
    ]
  },
  {
    nome: 'Dra. Beatriz Neves',
    email: 'beatriz.neves@clinicavita.com.br',
    especialidade: 'Otorrinolaringologia',
    descricao: 'Especialista em rinite, sinusite e distúrbios auditivos.',
    registro: 'CRM/SP 789012',
    servicos: [
      { nome: 'Consulta Otorrino', preco: 220, duracao: 30 },
      { nome: 'Audiometria', preco: 180, duracao: 40 }
    ]
  },
  {
    nome: 'Dr. Gustavo Pires',
    email: 'gustavo.pires@clinicavita.com.br',
    especialidade: 'Gastrenterologia',
    descricao: 'Foco em doenças do trato digestivo e endoscopia.',
    registro: 'CRM/SP 890123',
    servicos: [
      { nome: 'Consulta Gastro', preco: 250, duracao: 30 },
      { nome: 'Teste de Intolerância Alimentar', preco: 320, duracao: 90 }
    ]
  },
  {
    nome: 'Dra. Camila Barros',
    email: 'camila.barros@clinicavita.com.br',
    especialidade: 'Pneumologia',
    descricao: 'Especialista em asma, DPOC e saúde respiratória.',
    registro: 'CRM/SP 901234',
    servicos: [
      { nome: 'Consulta Pneumo', preco: 280, duracao: 40 },
      { nome: 'Espirometria', preco: 250, duracao: 30 }
    ]
  },
  {
    nome: 'Dr. Tiago Silva',
    email: 'tiago.silva@clinicavita.com.br',
    especialidade: 'Hematologia',
    descricao: 'Foco em anemias, coagulação e oncologia hematológica.',
    registro: 'CRM/SP 012345',
    servicos: [
      { nome: 'Investigação Hematológica', preco: 350, duracao: 50 },
      { nome: 'Mielograma', preco: 600, duracao: 90 }
    ]
  },
  {
    nome: 'Dra. Vanessa Luz',
    email: 'vanessa.luz@clinicavita.com.br',
    especialidade: 'Nutrologia',
    descricao: 'Abordagem médica para emagrecimento saudável e performance.',
    registro: 'CRM/SP 135790',
    servicos: [
      { nome: 'Plano Nutrológico Especializado', preco: 450, duracao: 90 },
      { nome: 'Acompanhamento Metabólico', preco: 300, duracao: 45 }
    ]
  },
  {
    nome: 'Dr. Rodrigo Meireles',
    email: 'rodrigo.meireles@clinicavita.com.br',
    especialidade: 'Geriatria',
    descricao: 'Atendimento dedicado ao envelhecimento ativo e saudável.',
    registro: 'CRM/SP 246801',
    servicos: [
      { nome: 'Check-up Geriátrico', preco: 350, duracao: 75 },
      { nome: 'Gestão de Medicamentos', preco: 200, duracao: 40 }
    ]
  }
];

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('--- Iniciando Semente de Profissionais v2 ---');

  try {
    const senhaHash = await bcrypt.hash('vida123', 10);

    for (const prof of novosProfissionais) {
      console.log(`Cadastrando ${prof.nome}...`);

      // 1. Criar Usuário
      const [userResult] = await connection.execute(
        'INSERT INTO usuarios (nome, email, senha, perfil, telefone) VALUES (?, ?, ?, ?, ?)',
        [prof.nome, prof.email, senhaHash, 'profissional', '(11) 99999-0000']
      );
      const usuarioId = userResult.insertId;

      // 2. Criar Perfil Profissional
      const [profResult] = await connection.execute(
        'INSERT INTO profissionais (usuario_id, especialidade, descricao, registro_profissional) VALUES (?, ?, ?, ?)',
        [usuarioId, prof.especialidade, prof.descricao, prof.registro]
      );
      const profissionalId = profResult.insertId;

      // 3. Criar Serviços
      for (const serv of prof.servicos) {
        await connection.execute(
          'INSERT INTO servicos (profissional_id, nome, preco, duracao_minutos) VALUES (?, ?, ?, ?)',
          [profissionalId, serv.nome, serv.preco, serv.duracao]
        );
      }

      console.log(`[OK] ${prof.nome} (${prof.especialidade}) cadastrado com sucesso.`);
    }

    console.log('\n--- Semente concluída com sucesso! 12 novos especialistas adicionados. ---');
  } catch (err) {
    console.error('\nErro durante o seeding:', err);
  } finally {
    await connection.end();
  }
}

seed();
