# Base Image 
FROM oven/bun:latest

# Menentukan Working Directory
WORKDIR /app

# Copy File Depednesi 
COPY package.json bun.lockb* ./

# Install Dependensi Denagn Bun 
RUN bun install --production

# Copy Semua Source Code
COPY . .





