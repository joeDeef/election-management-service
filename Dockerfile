# USAMOS NODE 22 (LTS) para cumplir con NestJS 11 y @supabase/supabase-js
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos archivos de configuración primero para aprovechar el cache de capas
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# npm ci ahora funcionará si sincronizaste el lock file localmente
RUN npm ci

# Copiamos todo el código fuente
COPY . .

# Construimos la aplicación
RUN npm run build

# --- Stage de Producción ---
FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Tini es esencial para manejar señales de terminación en contenedores
RUN apk add --no-cache tini

# Usuario de seguridad para no correr como root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Copiamos solo lo necesario desde el builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

# Puerto que usa tu microservicio de gestión electoral
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/main"]