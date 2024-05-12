FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g ts-node

COPY . .


EXPOSE 3000

CMD ["ts-node", "dist/index.js"]

#CMD ["ts-node", "src/index.ts"]
