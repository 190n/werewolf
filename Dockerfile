FROM node:14-alpine AS build
WORKDIR /app
COPY . .
RUN yarn
RUN yarn global add parcel-bundler
RUN rm -fr dist .env .env.production
ENV NODE_ENV=production
RUN parcel build src/frontend/index.html
RUN yarn build-ts

FROM node:14-alpine
WORKDIR /app
COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production STATIC_ROOT=dist
RUN yarn

EXPOSE 5000
ENTRYPOINT ["node", "./dist/backend/server.js"]
