const pool = require('../config/database');

// GET /api/agendamentos
const listar = async (req, res) => {
  try {
    const { data, profissional_id, cliente_id, status } = req.query;

    let query = `
      SELECT 
        a.id,
        a.data_hora,
        a.status,
        a.observacoes,
        a.created_at,
        c.id as cliente_id,
        uc.nome as cliente_nome,
        uc.telefone as cliente_telefone,
        p.id as profissional_id,
        up.nome as profissional_nome,
        p.especialidade,
        s.id as servico_id,
        s.nome as servico_nome,
        s.duracao_minutos,
        s.preco,
        a.link_telemedicina,
        a.notificado,
        a.modalidade,
        a.pagamento_status,
        a.valor_consulta,
        a.sala
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN usuarios uc ON c.usuario_id = uc.id
      JOIN profissionais p ON a.profissional_id = p.id
      JOIN usuarios up ON p.usuario_id = up.id
      JOIN servicos s ON a.servico_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Filtro por data (agenda do dia)
    if (data) {
      query += ' AND DATE(a.data_hora) = ?';
      params.push(data);
    }

    // Filtro por profissional
    if (profissional_id) {
      query += ' AND a.profissional_id = ?';
      params.push(profissional_id);
    }

    // Filtro por cliente
    if (cliente_id) {
      query += ' AND a.cliente_id = ?';
      params.push(cliente_id);
    }

    // Filtro por status
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    // Filtrar por perfil do usuário logado
    if (req.usuario && req.usuario.perfil === 'cliente' && req.usuario.cliente_id) {
      query += ' AND a.cliente_id = ?';
      params.push(req.usuario.cliente_id);
    } else if (req.usuario && req.usuario.perfil === 'profissional' && req.usuario.profissional_id) {
      query += ' AND a.profissional_id = ?';
      params.push(req.usuario.profissional_id);
    }
    // Admin e Recepcionista não possuem filtro extra (vêem tudo)

    query += ' ORDER BY a.data_hora ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// GET /api/agendamentos/:id
const buscarPorId = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.data_hora,
        a.status,
        a.observacoes,
        a.created_at,
        c.id as cliente_id,
        uc.nome as cliente_nome,
        p.id as profissional_id,
        up.nome as profissional_nome,
        p.especialidade,
        s.id as servico_id,
        s.nome as servico_nome,
        s.duracao_minutos,
        s.preco,
        a.link_telemedicina,
        a.modalidade,
        a.pagamento_status,
        a.valor_consulta,
        a.sala
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN usuarios uc ON c.usuario_id = uc.id
      JOIN profissionais p ON a.profissional_id = p.id
      JOIN usuarios up ON p.usuario_id = up.id
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// POST /api/agendamentos
const criar = async (req, res) => {
  try {
    const { cliente_id, profissional_id, servico_id, data_hora, observacoes } = req.body;

    if (!cliente_id || !profissional_id || !servico_id || !data_hora) {
      return res.status(400).json({ erro: 'cliente_id, profissional_id, servico_id e data_hora são obrigatórios' });
    }

    // Buscar duração do serviço
    const [servico] = await pool.query('SELECT duracao_minutos FROM servicos WHERE id = ?', [servico_id]);
    if (servico.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    const duracao = servico[0].duracao_minutos;
    const inicio = new Date(data_hora);
    const fim = new Date(inicio.getTime() + duracao * 60000);

    // Verificar conflito de horário
    const [conflitos] = await pool.query(`
      SELECT a.id, a.data_hora, s.duracao_minutos
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.profissional_id = ?
        AND a.status IN ('agendado', 'confirmado')
        AND (
          (a.data_hora < ? AND DATE_ADD(a.data_hora, INTERVAL s.duracao_minutos MINUTE) > ?)
          OR (a.data_hora >= ? AND a.data_hora < ?)
        )
    `, [profissional_id, fim, inicio, inicio, fim]);

    if (conflitos.length > 0) {
      return res.status(409).json({ erro: 'Conflito de horário: o profissional já possui um agendamento neste período' });
    }

    const [result] = await pool.query(
      'INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data_hora, observacoes, link_telemedicina, modalidade) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cliente_id, profissional_id, servico_id, data_hora, observacoes || null, req.body.link_telemedicina || null, req.body.modalidade || 'presencial']
    );

    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso',
      id: result.insertId
    });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// PUT /api/agendamentos/:id
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_hora, status, observacoes } = req.body;

    // Verificar se existe
    const [existente] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    const campos = [];
    const valores = [];

    if (data_hora) {
      campos.push('data_hora = ?');
      valores.push(data_hora);
    }
    if (status) {
      campos.push('status = ?');
      valores.push(status);
    }
    if (observacoes !== undefined) {
      campos.push('observacoes = ?');
      valores.push(observacoes);
    }
    if (req.body.link_telemedicina !== undefined) {
      campos.push('link_telemedicina = ?');
      valores.push(req.body.link_telemedicina);
    }
    if (req.body.notificado !== undefined) {
      campos.push('notificado = ?');
      valores.push(req.body.notificado);
    }
    if (req.body.modalidade !== undefined) {
      campos.push('modalidade = ?');
      valores.push(req.body.modalidade);
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    valores.push(id);
    await pool.query(
      `UPDATE agendamentos SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    res.json({ mensagem: 'Agendamento atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// DELETE /api/agendamentos/:id
const cancelar = async (req, res) => {
  try {
    const { id } = req.params;

    const [existente] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    // Soft delete: muda status para cancelado
    await pool.query(
      'UPDATE agendamentos SET status = ? WHERE id = ?',
      ['cancelado', id]
    );

    res.json({ mensagem: 'Agendamento cancelado com sucesso' });
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// GET /api/agendamentos/disponibilidade?data=...&profissional_id=...
const verificarDisponibilidade = async (req, res) => {
  try {
    const { data, profissional_id } = req.query;

    if (!data || !profissional_id) {
      return res.status(400).json({ erro: 'Data e profissional_id são obrigatórios' });
    }

    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(data_hora, '%H:%i') as hora,
        s.duracao_minutos
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.profissional_id = ? 
        AND DATE(a.data_hora) = ?
        AND a.status IN ('agendado', 'confirmado')
    `, [profissional_id, data]);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao verificar disponibilidade:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, cancelar, verificarDisponibilidade };
