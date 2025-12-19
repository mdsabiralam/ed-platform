# Base Image (Backend এর মতোই Node 22)
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Vite এর ডিফল্ট পোর্ট
EXPOSE 5173

# ডেভেলপমেন্ট সার্ভার রান করা
CMD ["npm", "run", "dev", "--", "--host"] 