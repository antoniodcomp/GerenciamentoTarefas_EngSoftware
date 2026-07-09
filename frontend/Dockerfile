FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de configuração de pacotes e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código do frontend
COPY . .

EXPOSE 5173

# Executa o Vite com a flag --host para ficar acessível externamente
CMD ["npm", "run", "dev", "--", "--host"]
