# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM node:22-alpine AS backend-dependencies

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev


FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app/backend

COPY --from=backend-dependencies --chown=node:node /app/backend/node_modules ./node_modules
COPY --chown=node:node backend/package.json backend/package-lock.json ./
COPY --chown=node:node backend/src ./src
COPY --from=frontend-build --chown=node:node /app/frontend/dist /app/frontend/dist

USER node

EXPOSE 5001

CMD ["npm", "start"]
