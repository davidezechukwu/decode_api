FROM node:20.10.0

WORKDIR /opt/decode/api/www
COPY ./package.json .
COPY ./dist  ./dist
COPY ./node_modules  ./node_modules
COPY ./dist/.env ./.env
