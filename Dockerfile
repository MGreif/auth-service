FROM node:latest AS build
WORKDIR /src
COPY package*.json /src/
RUN npm ci --only=production

FROM node:lts-alpine
ENV NODE_ENV production
WORKDIR /src
COPY --from=build /src/node_modules /src/node_modules
COPY . /src/

CMD ["node", "/src/server.js"]
