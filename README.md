Aqui está uma proposta de **README.md** profissional para o seu projeto.

Ele não apenas explica "como rodar", mas também destaca as **decisões arquiteturais avançadas** que implementamos (DDD, Clean Architecture, Segurança), o que valoriza muito o seu portfólio como desenvolvedor Sênior/Especialista.

---

# 🚀 Product Feedback API

Back-end robusto e escalável para uma plataforma de feedbacks de produtos. Construído com **NestJS**, seguindo princípios de **Clean Architecture**, **DDD (Domain-Driven Design)** e **Modular Monolith**.

---

## 🧠 Arquitetura e Design Patterns

Este projeto não é apenas um CRUD. Ele foi desenhado para ser resiliente, testável e seguro.

### 🏛️ Modular Monolith & Clean Architecture

O código é organizado em módulos desacoplados, com limites claros entre camadas:

- **Domain Layer:** Entidades puras, Value Objects e Regras de Negócio. Zero dependência de frameworks.
- **Application Layer:** Use Cases que orquestram a lógica.
- **Infrastructure Layer:** Implementações concretas (Banco de dados, Hash, Adapters).
- **Interface Layer:** Controllers, DTOs e Presenters.

### 🔒 Segurança Avançada

- **Autenticação:** Sistema robusto com **Access Token** (curta duração) e **Refresh Token** (longa duração).
- **HttpOnly Cookies:** Tokens não são expostos no LocalStorage, mitigando ataques XSS.
- **Separação de Identidade:** A entidade `User` (quem você é) é separada de `Account` (como você loga). Isso prepara o terreno para múltiplos provedores (Google, GitHub, Senha) na mesma conta.
- **Helmet & CORS:** Configurados rigorosamente para produção.

### 🛡️ Tratamento de Erros

- **Domain Errors:** Erros de negócio tipados (ex: `UserAlreadyExistsError`).
- **Exception Filters:** Um "tradutor" global que intercepta erros de domínio e os converte para os códigos HTTP corretos (400, 409, etc.), mantendo os UseCases agnósticos à Web.

---

## 🛠️ Stack Tecnológica (Frontend)

- **Runtime:** Node.js
- **Framework:** Vite + React
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Drizzle ORM (Type-safe SQL)
- **Validação:** Zod & Class-Validator
- **Testes:** Jest & Supertest (E2E e Unitários)
- **Docs:** Scalar (Swagger)
- **Container:** Docker & Docker Compose

## 🛠️ Stack Tecnológica (Api)

- **Runtime:** Node.js
- **Framework:** NestJS 11
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Drizzle ORM (Type-safe SQL)
- **Validação:** Zod & Class-Validator
- **Testes:** Jest & Supertest (E2E e Unitários)
- **Docs:** Scalar (Swagger)
- **Container:** Docker & Docker Compose

## 🛠️ Stack Tecnológica (Realtime)

- **Runtime:** Elixir
- **Framework:** Phoenix
- **Linguagem:** Elixir
- **Banco de Dados:** PostgreSQL
- **Testes:** ExUnit
- **Container:** Docker & Docker Compose

---

## ⚡ Como Rodar o Projeto

### Pré-requisitos

- Node.js (v20+)
- pnpm
- Docker (para o banco de dados)

### 1. Instalação

```bash
pnpm install

```

### 2. Variáveis de Ambiente

Copie o arquivo de exemplo e preencha os segredos:

```bash
cp .env.example .env

```

**Exemplo de `.env`:**

```ini
NODE_ENV=development
PORT=3000
# URL do Frontend (Crucial para CORS e Cookies funcionarem)
FRONTEND_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/product_feedback"

# Segurança JWT (Gere strings aleatórias fortes)
JWT_ACCESS_SECRET="segredo-access-super-seguro"
JWT_REFRESH_SECRET="segredo-refresh-super-seguro"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"

```

### 3. Banco de Dados

Suba o container do Postgres e rode as migrações:

```bash
# Sobe o banco
docker-compose up -d

# Gera os arquivos SQL baseados no schema do Drizzle
pnpm db:generate

# Aplica as mudanças no banco
pnpm db:migrate

```

### 4. Rodando a API

```bash
# Modo de desenvolvimento (Watch mode)
pnpm start:dev

```

Acesse a documentação da API em: `http://localhost:3000/docs`

---

## 🧪 Testes

O projeto possui uma suíte de testes rigorosa focada na confiabilidade.

### Testes E2E (Ponta a Ponta)

Testam o fluxo completo: Controller -> UseCase -> Banco de Dados (Dockerizado/Test DB). Verifica fluxos reais como Login, Registro e Cookies.

_Necessário configurar `.env.test`._

```bash
# Roda os testes E2E
pnpm test:e2e

```

### Testes Unitários

Testam a lógica de negócio isolada usando Mocks.

```bash
pnpm test

```

---

## 📂 Estrutura de Pastas

```bash
src/
├── modules/
│   └── iam/                # Módulo de Identity & Access Management
│       ├── application/    # Use Cases (Logica da aplicação)
│       ├── domain/         # Entidades e Erros (Coração do negócio)
│       ├── infrastructure/ # Implementação de banco (Drizzle)
│       └── interface/      # Controllers e DTOs
├── shared/                 # Código compartilhado (Kernel)
│   ├── core/               # Classes base (Entity, ValueObject)
│   ├── infrastructure/     # Configs globais (Env, Filters, Database)
└── main.ts                 # Ponto de entrada

```

---

## 📝 Roadmap & Próximos Passos

- [x] Arquitetura Base (NestJS + Drizzle)
- [x] Cadastro de Usuário (Password Hash)
- [x] Autenticação (JWT + HttpOnly Cookies)
- [x] Tratamento de Erros Global
- [ ] Implementar Feedback CRUD
- [ ] Implementar Upvotes (Concorrência)
- [ ] Login Social (Google OAuth)

---

Feito com 💜 por **Lucas Pedro**.
