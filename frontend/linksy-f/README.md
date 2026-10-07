# Linksy Frontend

Frontend application for **Linksy**, a real-time communication platform that allows users to connect and communicate through instant messaging.

## Tech Stack

- React
- JavaScript
- Socket.IO Client
- CSS
- Vite

## Features

- User registration and login
- Google authentication
- Real-time messaging
- Conversation management
- Online/offline user status
- Message notifications
- Responsive user interface

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- pnpm

### Installation

Clone the repository and install the dependencies:

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Update the values according to your backend configuration.

### Run the Development Server

```bash
pnpm dev
```

The application will be available at:

```text
http://localhost:5173
```

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Project Structure

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── context/
├── utils/
├── assets/
├── App.jsx
└── main.jsx
```

## Development Workflow

The frontend is developed using an **Agile/Scrum workflow**. Development tasks, bugs, and sprint work are managed using **Jira**.

## Backend

The frontend communicates with the Linksy backend through REST APIs and Socket.IO for real-time communication.
