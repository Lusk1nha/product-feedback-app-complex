# --- Estágio 1: Base ---
FROM node:20-alpine AS base
# Ativa o pnpm que já vem no Node 20
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# --- Estágio 2: Instalação de Dependências ---
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./

# Instala todas as deps (incluindo devDependencies para o build)
RUN pnpm install --frozen-lockfile

# --- Estágio 3: Build da Aplicação ---
FROM base AS build
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
# Compila o NestJS (gera a pasta dist)
RUN pnpm build

# --- Estágio 4: Imagem Final de Produção ---
FROM base AS deploy
WORKDIR /app

# Copia apenas o necessário do estágio de build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
# Opcional: Copiar package.json se precisar de scripts em runtime
COPY package.json ./

EXPOSE 3000

# CORREÇÃO: Adicione o /src/ no caminho
CMD ["node", "dist/src/main"]