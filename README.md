#NestJS Chat API
This is a simple chat API built with NestJS that allows users to create and join chat rooms, send messages, and view chat history.

##Local setup
Prerequesites: Docker, Node.js

1. Clone this repo and `cd nest-chat`
2. Run `npm i`
3. Run `docker-compose up`

All env variables are included in the repo for ease of use.
The API will be exposed on port 3000. All routes are prepended with `/api/v1`. The database is exposed on port 80. The websocket gateway is available on `localhost:3000/chat`.
Swagger documentation can be accessed on `localhost:3000/docs`.
