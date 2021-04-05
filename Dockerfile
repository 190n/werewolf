FROM node:14-alpine AS build
WORKDIR /app
COPY . .
WORKDIR /app/packages/werewolf-frontend
RUN yarn
RUN yarn global add parcel-bundler
RUN rm -fr dist .env .env.production
ENV NODE_ENV=production
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
