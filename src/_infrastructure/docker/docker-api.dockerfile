FROM node:18.12.1
WORKDIR /opt/decode/api
COPY ./package.json .
RUN cd /opt/decode/api
COPY ./dist  ./dist
COPY ./node_modules  ./node_modules
COPY ./dist/.env ./.env
RUN cd /opt/decode/api
RUN npm run migrate:firstrun