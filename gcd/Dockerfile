FROM node:alpine

WORKDIR /opt/mywebapp

COPY package.json .

RUN yarn install

COPY . .

CMD ["yarn", "start"]