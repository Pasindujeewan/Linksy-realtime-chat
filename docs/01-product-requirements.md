# Product Requirements Document

## 1. Project Information

| Field   | Details        |
| ------- | -------------- |
| Product | Linksy         |
| Version | 1.0            |
| Status  | Draft          |
| Author  | Pasindu Jeewan |
| Date    | 2026-10-05     |

---

## 2. Product Overview

**Linksy** is a secure real-time chat application that allows authenticated users to communicate through private conversations with real-time messaging and online presence.

---

## 3. Problem

Traditional request-response communication does not provide instant message delivery or real-time user presence.

Linksy aims to provide reliable real-time communication while maintaining proper authentication, authorization, and data security.

---

## 4. Goals

- Provide secure user authentication.
- Enable private one-to-one conversations.
- Deliver messages in real time.
- Store conversation and message history.
- Track online/offline status and last seen.
- Build a scalable and maintainable backend.

---

## 5. Scope

### In Scope

- User registration and login
- JWT authentication
- User search
- Private conversations
- Real-time messaging
- Message history
- Online/offline status
- Last seen
- Typing indicators
- Notifications
- Input validation
- Rate limiting
- Automated testing

### Out of Scope

- Group chat
- Voice/video calls
- File sharing
- End-to-end encryption
- Message reactions
- Advanced admin dashboard

---

## 6. Functional Requirements

| ID    | Requirement                                                    |
| ----- | -------------------------------------------------------------- |
| FR-01 | Users can register and create an account.                      |
| FR-02 | Users can securely log in and log out.                         |
| FR-03 | Authenticated users can search for other users.                |
| FR-04 | Users can create private conversations.                        |
| FR-05 | Users can send and receive messages in real time.              |
| FR-06 | Messages are stored and can be retrieved later.                |
| FR-07 | Users can see online/offline and last-seen status.             |
| FR-08 | Users can see typing indicators.                               |
| FR-09 | Users receive notifications for new messages.                  |
| FR-10 | Only authorized conversation participants can access messages. |

---

## 7. Non-Functional Requirements

- **Security:** Passwords, tokens, APIs, and Socket.IO connections must be properly secured.
- **Performance:** Messages should be delivered with low latency.
- **Scalability:** The system should support multiple backend instances.
- **Reliability:** Messages should be persisted reliably.
- **Maintainability:** Use modular architecture, validation, testing, and consistent coding practices.

---

## 8. Technology Stack

| Component            | Technology           |
| -------------------- | -------------------- |
| Frontend             | React                |
| Backend              | Node.js + Express.js |
| Real-time            | Socket.IO            |
| Database             | MongoDB              |
| Cache / Shared State | Redis                |
| Authentication       | JWT                  |
| Password Hashing     | Argon2               |
| Validation           | Zod                  |
| Testing              | Jest                 |
| API Testing          | Postman              |

---

## 9. Success Criteria

The project is successful when:

- Users can securely authenticate.
- Users can create private conversations.
- Messages are delivered in real time.
- Messages are persisted correctly.
- Unauthorized users cannot access conversations.
- Online status and last seen work correctly.
- Core functionality has automated tests.
- The application can be deployed successfully.
