# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# 1. Copiar package.json e lock (ajuste se tiver pnpm/yarn)
COPY package*.json ./

# 2. Instalar dependências (dev + prod) para build e Prisma
RUN npm ci

# 3. Copiar apenas o arquivo do Prisma primeiro para otimizar cache
COPY prisma ./prisma/

# 4. Gerar Prisma Client (com o schema do build context)
RUN npx prisma generate

# 5. Copiar o restante do código (exceto o que estiver no .dockerignore)
COPY . .

# 6. Forçar nova geração do Prisma para garantir sincronia com os tipos TS
RUN npx prisma generate

# 7. Build da aplicação Nest
RUN npm run build

# Etapa de runtime
FROM node:20-alpine

# Instalar OpenSSL necessário para Prisma
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

# 7. Copiar package files
COPY --from=build /app/package*.json ./

# 8. Copiar schema do Prisma
COPY --from=build /app/prisma ./prisma

# 9. Instalar APENAS dependências de produção
RUN npm ci --omit=dev

# 10. Gerar Prisma Client na arquitetura correta
RUN npx prisma generate

# 11. Copiar o build (dist)
COPY --from=build /app/dist ./dist

# 12. Porta da API
EXPOSE 3000

# 13. Start da aplicação
CMD ["npm", "run", "start:prod"]