FROM node:22

COPY packages/react-js /packages/react-js

WORKDIR /demo/app


COPY demo/app/package.json .
COPY demo/app/yarn.lock .

RUN yarn

COPY demo/app ./

EXPOSE 5173

CMD ["yarn", "dev"]
