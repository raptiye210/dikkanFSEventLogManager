# Node.js 22 tabanlı resmi bir imaj kullanıyoruz
FROM node:latest

# Çalışma dizinini ayarlıyoruz
WORKDIR /dikkan-fs-eventlog

# package.json ve package-lock.json (varsa) kopyalıyoruz
COPY package*.json ./

# Bağımlılıkları yüklüyoruz
RUN npm install

# Uygulama dosyalarını kopyalıyoruz
COPY . .

# Uygulamanın çalışacağı portu belirtiyoruz
EXPOSE 8082/udp

# Uygulamayı başlatma komutu
CMD ["npm", "start"]