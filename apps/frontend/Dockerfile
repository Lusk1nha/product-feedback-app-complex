# Usa uma imagem Node leve (Alpine)
FROM node:20-alpine

# Configura variáveis de ambiente para o pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Ativa o corepack (gerenciador de pacotes nativo do Node que inclui pnpm)
RUN corepack enable

# Define o diretório de trabalho dentro do container
WORKDIR /app

# 1. Copia apenas os arquivos de dependência primeiro (Melhora o cache do Docker)
# O Docker só vai rodar o install de novo se esses arquivos mudarem
COPY package.json pnpm-lock.yaml ./

# 2. Instala as dependências
RUN pnpm install --frozen-lockfile

# 3. Copia o resto do código fonte
# Nota: No docker-compose usamos volumes, então isso aqui serve mais para
# garantir que a imagem seja funcional sozinha, mas o volume vai sobrescrever.
COPY . .

# 4. Expõe a porta padrão do Vite
EXPOSE 5173

# 5. Comando de inicialização
# O flag --host é CRUCIAL. Sem ele, o Vite roda em 127.0.0.1 (inacessível de fora).
# Com --host, ele roda em 0.0.0.0
CMD ["pnpm", "dev", "--host"]