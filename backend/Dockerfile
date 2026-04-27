FROM node:20-alpine

# Install FFmpeg and other dependencies
RUN apk add --no-cache ffmpeg python3 make g++ netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure the script is executable
RUN chmod +x start.sh

EXPOSE 4000

CMD ["./start.sh"]
