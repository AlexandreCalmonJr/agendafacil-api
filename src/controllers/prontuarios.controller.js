const pool = require('../config/database');

// GET /api/agendamentos/:id/prontuario
const buscarPorAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM prontuarios WHERE agendamento_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.json(null); // Nenhum prontuário ainda
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar prontuário:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// PUT /api/agendamentos/:id/prontuario
const salvarProntuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas_clinicas, prescricoes, exames } = req.body;

    // Verifica se o agendamento existe e o usuário tem permissão para editá-lo
    const [agendamento] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    
    if (agendamento.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    // Se o usuário logado for um profissional, garantir que ele seja o responsável
    if (req.usuario && req.usuario.perfil === 'profissional' && req.usuario.profissional_id) {
      if (agendamento[0].profissional_id !== req.usuario.profissional_id) {
        return res.status(403).json({ erro: 'Acesso negado. Você só pode preencher os próprios prontuários.' });
      }
    }

    // Usando INSERT ... ON DUPLICATE KEY UPDATE do MySQL
    const query = `
      INSERT INTO prontuarios (agendamento_id, notas_clinicas, prescricoes, exames) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        notas_clinicas = VALUES(notas_clinicas),
        prescricoes = VALUES(prescricoes),
        exames = VALUES(exames)
    `;

    await pool.query(query, [
      id, 
      notas_clinicas || null, 
      prescricoes || null, 
      exames || null
    ]);

    res.json({ mensagem: 'Prontuário salvo com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar prontuário:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { buscarPorAgendamento, salvarProntuario };
