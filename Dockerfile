FROM node:22.14.0-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 30030

CMD ["npm", "run", "dev"] 