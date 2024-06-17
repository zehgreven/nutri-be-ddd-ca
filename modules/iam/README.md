# Nutri IAM

This project is a simple implementation of an identity and access management system, using Domain-Driven Design and Clean Architecture principles. It's main purpose is to provide a simple and secure way to manage authentication and authorization in your application.

## Features

- User registration
- User login
- User password reset
- User account management
- Role management
- Permission management
- Profile management
- Role-based access control

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Jest
- Docker
- Swagger

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the environment variables
3. Run `docker-compose up -d` to start the PostgreSQL and RabbitMQ
4. Run `yarn` to install the dependencies
5. Run `yarn migrate:up` to apply the migrations
6. Run `yarn start:prod` to start the application
   6.1. If you are in dev environment you can run `yarn start:dev` instead

## Usage

Once the application is running, you can access the Swagger UI at `http://localhost:3000/docs`.

## License

All rights reserved.
