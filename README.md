# AgendaFácil API

API REST para sistema de agendamento de serviços em clínica.

## Tecnologias

- Node.js + Express
- MySQL (mysql2)
- JWT (jsonwebtoken)
- Bcrypt (bcryptjs)

## Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do MySQL

# Criar banco de dados localmente
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# Rodar em desenvolvimento
npm run dev

# Rodar em produção
npm start
```

### Variáveis de ambiente suportadas

A aplicação aceita as seguintes variáveis para conexão MySQL:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `DATABASE_URL` ou `MYSQL_URL`

Isso melhora a compatibilidade com provedores como Railway, que expõem as credenciais MySQL em variáveis como `MYSQL_HOST`.

## Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/login` | Login | Público |
| POST | `/api/registro` | Registro | Público |
| GET | `/api/profissionais` | Listar profissionais | Público |
| POST | `/api/profissionais` | Cadastrar profissional | Admin |
| GET | `/api/servicos` | Listar serviços | Público |
| POST | `/api/servicos` | Cadastrar serviço | Admin/Prof |
| GET | `/api/clientes` | Listar clientes | Admin/Prof |
| POST | `/api/clientes` | Cadastrar cliente | Público |
| GET | `/api/agendamentos` | Listar agendamentos | Logado |
| POST | `/api/agendamentos` | Criar agendamento | Cliente/Admin |
| PUT | `/api/agendamentos/:id` | Atualizar agendamento | Logado |
| DELETE | `/api/agendamentos/:id` | Cancelar agendamento | Logado |

## Credenciais de teste (seed)

- **Admin:** admin@agendafacil.com / 123456
- **Profissional:** ana.silva@clinica.com / 123456
- **Cliente:** maria.santos@email.com / 123456
