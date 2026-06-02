<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
</p>

<h1 align="center">VitalHub API</h1>

<p align="center">
  Backend REST para gestão de clínicas médicas
</p>

---

## Setup

```bash
npm install
cp .env.example .env     # Configure credenciais MySQL
npm run dev              # http://localhost:3001
```

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | Sim | Segredo JWT |
| `DATABASE_URL` | Sim* | String de conexão MySQL |
| `DB_HOST` / `DB_USER` / `DB_PASS` / `DB_NAME` | Sim* | Configuração individual |
| `FRONTEND_URL` | Não | CORS origin (default: localhost:5173) |
| `GOOGLE_CLIENT_ID` | Não | Google OAuth |

---

## Endpoints

### Auth
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/api/login` | Login | Público |
| `POST` | `/api/registro` | Cadastro de paciente | Público |
| `POST` | `/api/login-google` | Login Google | Público |
| `POST` | `/api/logout` | Logout | Público |

### Profissionais
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/profissionais` | Listar | Público |
| `GET` | `/api/profissionais/:id` | Buscar | Público |
| `POST` | `/api/profissionais` | Cadastrar | Admin, Recepcionista |

### Serviços
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/servicos` | Listar | Público |
| `GET` | `/api/servicos/:id` | Buscar | Público |
| `POST` | `/api/servicos` | Cadastrar | Admin, Profissional |

### Clientes
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/clientes` | Listar | Admin, Prof, Recepção |
| `GET` | `/api/clientes/:id` | Buscar | Admin, Prof, Recepção |
| `GET` | `/api/clientes/meu-historico` | Prontuários | Autenticado |
| `POST` | `/api/clientes` | Cadastrar | Público |

### Agendamentos
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/agendamentos` | Listar | Autenticado |
| `GET` | `/api/agendamentos/:id` | Buscar | Autenticado |
| `GET` | `/api/agendamentos/disponibilidade` | Slots | Autenticado |
| `POST` | `/api/agendamentos` | Criar | Cliente, Admin, Recepção |
| `PUT` | `/api/agendamentos/:id` | Atualizar | Autenticado |
| `DELETE` | `/api/agendamentos/:id` | Cancelar | Autenticado |

### Prontuários
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/api/agendamentos/:id/prontuario` | Buscar | Autenticado |
| `PUT` | `/api/agendamentos/:id/prontuario` | Salvar | Profissional, Admin |

### Outros
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/noticias/saude` | Notícias de saúde |
| `GET` | `/api/noticias/clinica` | Notícias da clínica |
| `POST` | `/api/contato` | Enviar mensagem |

---

## Testes

```bash
npm test              # Executar testes
npm run test:coverage # Com cobertura
```

---

## Documentação Detalhada

→ [API.md](./API.md) — Request/response completos, erros, variáveis de ambiente

---

## Credenciais de Teste

Senha: **`123456`**

| Perfil | Email |
|--------|-------|
| Admin | `admin@clinica.com` |
| Médico | `ana.silva@clinica.com` |
| Paciente | `maria.santos@email.com` |
| Recepcionista | `recepcao@clinica.com` |

---

<p align="center">VitalHub API — Clínica Vita</p>
