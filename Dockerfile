FROM node:14-alpine AS build
WORKDIR /app
COPY . .
WORKDIR /app/packages/werewolf-frontend
RUN yarn
RUN rm -fr dist .env .env.production .parcel-cache
ENV NODE_ENV=production

ARG backendBaseUrl=''
ARG frontendBaseUrl=''
ARG backendBaseSocketUrl='ws://localhost:5000'

ENV BACKEND_BASE_URL=${backendBaseUrl}
ENV FRONTEND_BASE_URL=${frontendBaseUrl}
ENV BACKEND_BASE_SOCKET_URL=${backendBaseSocketUrl}
RUN yarn build
WORKDIR /app/packages/werewolf-backend
RUN rm -fr dist
ENV NODE_ENV=development
RUN yarn
RUN yarn build

FROM node:14-alpine
WORKDIR /app
COPY --from=build /app/packages/werewolf-backend/dist ./backend
COPY --from=build /app/packages/werewolf-backend/package.json /app/packages/werewolf-backend/yarn.lock ./
COPY --from=build /app/packages/werewolf-frontend/dist ./frontend
ENV NODE_ENV=production STATIC_ROOT=frontend
RUN yarn

EXPOSE 5000
ENTRYPOINT ["node", "./backend/server.js"]
