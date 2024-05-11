FROM node:14
WORKDIR /app

COPY package*.json ./

RUN npm install

 RUN npm install -g nodemon ts-node

 COPY . .

 RUN npm rebuild bcrypt --build-from-source

EXPOSE 3000

CMD ["nodemon", "-e", "ts", "--exec", "ts-node", "src/index.ts"]
