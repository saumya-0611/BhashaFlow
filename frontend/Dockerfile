FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Crucial: Vite needs --host to expose the network outside the container
CMD ["npm", "run", "dev", "--", "--host"]