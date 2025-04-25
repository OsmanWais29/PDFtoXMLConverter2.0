# Use Node.js 16 as the base image
FROM node:16-alpine

# Install OpenJDK for running the Java converter
RUN apk add --no-cache openjdk11-jre

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Create required directories
RUN mkdir -p uploads output

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]