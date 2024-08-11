# Dockerfile.java
FROM openjdk:11-jdk-slim

# Install the 'time' command using apt-get
RUN apt-get update && apt-get install -y time

WORKDIR /app