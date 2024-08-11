# Dockerized Code Runner

## Project Description

Dockerized Code Runner is a backend service designed to compile and run code snippets in various programming languages, such as Python, C++, JavaScript, and Java, within Docker containers. This project aims to provide a secure and isolated environment for executing user-submitted code, capturing program output, and measuring performance metrics like execution time. The service also implements a time limit feature to prevent long-running or infinite loops from hanging the server.

## Features

- **Supports Multiple Languages**: Python, C++, JavaScript, and Java.
- **Time Limit**: If code execution exceeds the specified time limit (e.g., 2 seconds), the service returns a "Time Limit Exceeded" message.
- **Isolated Execution**: Each code snippet runs in its own Docker container, ensuring a secure and isolated environment.
- **Performance Metrics**: Captures execution time and other performance metrics using the `/usr/bin/time` command.

## Installation

### Prerequisites

- **Node.js**: Make sure you have Node.js installed on your machine.
- **Docker**: Install Docker to manage and run the containers.

### Steps

1. Clone the repository:
    ```bash
    git clone https://github.com/Tally-Code-Brewers/Backend.git
    cd Backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Build the Docker images for the supported languages (optional, if not using pre-built images):
    ```bash
    docker build -t python-runner ./docker/python
    docker build -t cpp-runner ./docker/cpp
    docker build -t java-runner ./docker/java
    ```

4. Start the server:
    ```bash
    npm start
    ```

The server will run on `http://localhost:3000`.

## Usage

### Running Code

To run a code snippet, send a POST request to the `/run` endpoint with the following JSON structure:

```json
{
  "language": "cpp",
  "code": "#include<iostream>\\nusing namespace std;\\nint main() {\\ncout << \\"Hello World\\";\\nreturn 0;\\n}",
  "input": ""
}
