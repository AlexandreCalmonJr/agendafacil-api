# VitalHub API — Documentação

> API REST para gestão de clínicas médicas

**Base URL:** `http://localhost:3001/api`

## Autenticação

A API utiliza **JWT via httpOnly cookie**. Após o login, o token é automaticamente anexado às requisições.

```bash
# Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","senha":"123456"}' \
  -c cookies.txt

# Requisição autenticada
curl http://localhost:3001/api/agendamentos -b cookies.txt
```

---

## Endpoints

### Auth

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/api/login` | Autenticar usuário | Público |
| `POST` | `/api/registro` | Cadastrar novo paciente | Público |
| `POST` | `/api/login-google` | Login com Google OAuth | Público |
| `POST` | `/api/logout` | Encerrar sessão | Público |

**POST /api/login**

Request:
```json
{ "email": "admin@clinica.com", "senha": "123456" }
```

Response `200`:
```json
{
  "mensagem": "Login realizado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Administrador Vita",
    "email": "admin@clinica.com",
    "perfil": "admin"
  }
}
```

**POST /api/registro**

Request:
```json
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "senha": "12345678",
  "telefone": "11999998888"
}
```

Response `201`:
```json
{ "mensagem": "Usuário cadastrado com sucesso", "id": 5 }
```

---

### Profissionais

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/profissionais` | Listar profissionais | Público |
| `GET` | `/api/profissionais/:id` | Buscar profissional | Público |
| `POST` | `/api/profissionais` | Cadastrar profissional | Admin, Recepcionista |

**POST /api/profissionais**

Request:
```json
{
  "nome": "Dr. João Silva",
  "email": "joao@clinica.com",
  "senha": "123456",
  "especialidade": "Cardiologia",
  "telefone": "11988887777",
  "registro_profissional": "CRM-12345"
}
```

Response `201`:
```json
{ "mensagem": "Profissional cadastrado com sucesso", "id": 13 }
```

---

### Serviços

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/servicos` | Listar serviços | Público |
| `GET` | `/api/servicos/:id` | Buscar serviço | Público |
| `POST` | `/api/servicos` | Cadastrar serviço | Admin, Profissional |

**GET /api/servicos?profissional_id=1**

Response `200`:
```json
[
  {
    "id": 1,
    "nome": "Consulta Clínica",
    "duracao_minutos": 30,
    "preco": 150.00,
    "profissional_id": 1,
    "profissional_nome": "Dr. Ana Silva",
    "especialidade": "Clínico Geral"
  }
]
```

---

### Clientes

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/clientes` | Listar clientes | Admin, Profissional, Recepcionista |
| `GET` | `/api/clientes/:id` | Buscar cliente | Admin, Profissional, Recepcionista |
| `GET` | `/api/clientes/meu-historico` | Histórico de saúde | Todos autenticados |
| `POST` | `/api/clientes` | Cadastrar cliente | Público |

**GET /api/clientes/meu-historico?cliente_id=1**

Response `200`:
```json
[
  {
    "id": 1,
    "notas_clinicas": "Paciente apresenta melhora",
    "prescricoes": "Dipirona 500mg",
    "exames": "Hemograma completo",
    "data_hora": "2026-06-10T10:00:00.000Z",
    "profissional_nome": "Dr. Ana Silva",
    "servico_nome": "Consulta Clínica"
  }
]
```

---

### Agendamentos

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/agendamentos` | Listar agendamentos | Autenticado |
| `GET` | `/api/agendamentos/:id` | Buscar agendamento | Autenticado |
| `GET` | `/api/agendamentos/disponibilidade` | Verificar slots | Autenticado |
| `POST` | `/api/agendamentos` | Criar agendamento | Cliente, Admin, Recepcionista |
| `PUT` | `/api/agendamentos/:id` | Atualizar agendamento | Autenticado |
| `DELETE` | `/api/agendamentos/:id` | Cancelar agendamento | Autenticado |

**GET /api/agendamentos?data=2026-06-10&status=agendado,confirmado&pagina=1&limite=50**

Response `200`:
```json
{
  "dados": [
    {
      "id": 1,
      "data_hora": "2026-06-10T10:00:00.000Z",
      "status": "agendado",
      "cliente_nome": "Maria Santos",
      "profissional_nome": "Dr. Ana Silva",
      "servico_nome": "Consulta Clínica",
      "modalidade": "presencial"
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 50,
    "total": 1,
    "paginas": 1
  }
}
```

**POST /api/agendamentos**

Request:
```json
{
  "cliente_id": 1,
  "profissional_id": 1,
  "servico_id": 1,
  "data_hora": "2026-06-10T10:00:00",
  "modalidade": "presencial",
  "observacoes": "Primeira consulta"
}
```

Response `201`:
```json
{ "mensagem": "Agendamento criado com sucesso", "id": 1 }
```

**GET /api/agendamentos/disponibilidade?data=2026-06-10&profissional_id=1**

Response `200`:
```json
[
  { "hora": "08:00" },
  { "hora": "08:30" },
  { "hora": "10:00" }
]
```

**Status válidos:** `agendado`, `confirmado`, `em_espera`, `em_atendimento`, `concluido`, `cancelado`

---

### Prontuários

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/agendamentos/:id/prontuario` | Buscar prontuário | Autenticado |
| `PUT` | `/api/agendamentos/:id/prontuario` | Salvar prontuário | Profissional, Admin |

**PUT /api/agendamentos/:id/prontuario**

Request:
```json
{
  "notas_clinicas": "Paciente apresenta melhora significativa",
  "prescricoes": "Paracetamol 500mg - 8/8h por 5 dias",
  "exames": "Solicitar hemograma completo"
}
```

Response `200`:
```json
{ "mensagem": "Prontuário salvo com sucesso" }
```

---

### Notícias

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/noticias/saude` | Notícias de saúde (G1) | Público |
| `GET` | `/api/noticias/clinica` | Notícias da clínica | Público |

---

### Contato

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/api/contato` | Enviar mensagem | Público |

Request:
```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "mensagem": "Gostaria de agendar uma consulta"
}
```

---

## Erros

| Código | Descrição |
|--------|-----------|
| `400` | Dados inválidos ou obrigatórios |
| `401` | Não autenticado / token inválido |
| `403` | Sem permissão para este recurso |
| `404` | Recurso não encontrado |
| `409` | Conflito (email duplicado, horário ocupado) |
| `429` | Rate limit excedido |
| `500` | Erro interno do servidor |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Segredo para assinatura JWT |
| `DATABASE_URL` | Sim* | String de conexão MySQL |
| `DB_HOST` | Sim* | Host do MySQL (alternativa a DATABASE_URL) |
| `DB_USER` | Sim* | Usuário do MySQL |
| `DB_PASS` | Sim* | Senha do MySQL |
| `DB_NAME` | Sim* | Nome do banco |
| `FRONTEND_URL` | Não | URL do frontend (default: localhost:5173) |
| `GOOGLE_CLIENT_ID` | Não | Client ID do Google OAuth |
| `PORT` | Não | Porta do servidor (default: 3001) |

\* Pelo menos DATABASE_URL ou DB_HOST/DB_USER/DB_PASS/DB_NAME são obrigatórios.

---

## Credenciais de Teste

Senha padrão: **`123456`**

| Perfil | Email |
|--------|-------|
| Admin | `admin@clinica.com` |
| Médico | `ana.silva@clinica.com` |
| Paciente | `maria.santos@email.com` |
| Recepcionista | `recepcao@clinica.com` |
