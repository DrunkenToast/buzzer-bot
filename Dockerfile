# build stage
FROM node:16-alpine as build-stage
WORKDIR /app
RUN yarn global add pm2
COPY package*.json ./
RUN yarn install
COPY . .
CMD pm2-runtime 'yarn serve'
