# Linksy

A secure real-time chat application for private one-to-one communication with real-time messaging and online presence.

## Features

- User registration and authentication
- JWT-based authentication
- User search
- Private one-to-one conversations
- Real-time messaging with Socket.IO
- Message persistence and history
- Online/offline presence
- Last seen status
- Typing indicators
- Real-time notifications
- Input validation and rate limiting
- Automated testing

## Tech Stack

### Frontend

- React

### Backend

- Node.js
- Express.js
- Socket.IO

### Database & Infrastructure

- MongoDB
- Redis

### Security & Testing

- JWT
- Argon2
- Zod
- Jest
- Postman

## Project Structure

```text
linksy/
├── frontend/
├── backend/
├── docs/
├── .github/
├── .gitignore
├── README.md
└── LICENSE
```

## Documentation

Project documentation is available in the `docs/` directory.

- Product Requirements
- User Flows
- System Architecture
- Database Design
- API Specification

## Development

Clone the repository:

```bash
git clone <repository-url>
cd linksy
```

Install dependencies:

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

Create the required environment files using the provided `.env.example` files.

Start the backend:

```bash
cd backend
pnpm dev
```

Start the frontend:

```bash
cd frontend
pnpm dev
```

## Project Status

Linksy is currently under active development.

## Author

**Pasindu Jeewana**

BICT (Hons) Undergraduate
University of Sri Jayewardenepura
