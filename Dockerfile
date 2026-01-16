# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# 1. Copiar package.json e lock (ajuste se tiver pnpm/yarn)
COPY package*.json ./

# 2. Instalar dependências (dev + prod) para build e Prisma
RUN npm ci

# 3. Copiar schema do Prisma (ajuste o caminho se necessário)
#    Aqui assumo que o schema está em ./prisma/schema.prisma
COPY prisma ./prisma

# 4. Gerar Prisma Client (gera @prisma/client com enums, tipos, etc.)
RUN npx prisma generate

# 5. Copiar o restante do código da aplicação
COPY . .

# 6. Build da aplicação Nest
RUN npm run build

# Etapa de runtime
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# 7. Reaproveitar o node_modules já com Prisma Client gerado
COPY --from=build /app/node_modules ./node_modules

# 8. Copiar package.json (por organização)
COPY --from=build /app/package*.json ./

# 9. IMPORTANTE: Copiar a pasta prisma para poder rodar migrations
COPY --from=build /app/prisma ./prisma

# 10. Copiar apenas o build (dist) para runtime
COPY --from=build /app/dist ./dist

# 11. Porta da API
EXPOSE 3000

# 12. Usar o mesmo script de produção que você usa localmente
#     (conforme log: "npm run start:prod" -> "node dist/apps/api/main")
CMD ["npm", "run", "start:prod"]
