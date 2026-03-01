FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create data directory for database
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start script that runs both server and monitor
CMD ["sh", "-c", "node server.js & node monitor.js"]
