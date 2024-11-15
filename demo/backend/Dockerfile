FROM node:latest

COPY packages/api-js /packages/api-js

WORKDIR /demo/backend

COPY demo/backend/package.json .
COPY demo/backend/yarn.lock .

RUN yarn

COPY demo/backend ./

EXPOSE 3001

CMD [ "yarn", "start" ]
