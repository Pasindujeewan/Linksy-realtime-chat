# Linksy Test Strategy

## Testing levels

- **Unit testing:** Vitest validates controllers, services, validators, middleware, image utilities, and frontend components.
- **API testing:** Protected HTTP endpoints are tested using isolated test accounts and HTTP cookie authentication.
- **Socket.IO testing:** Real-time joins, message delivery, read receipts, and presence are tested with two or more authenticated clients.
- **Manual exploratory testing:** Invalid input, authorization boundaries, UI behavior, and cross-feature workflows are checked beyond the fixed cases.

## Sprint allocation

| Sprint | Focus |
|---|---|
| Sprint 1 | Authentication, profile image upload, user listing/search, and profile management |
| Sprint 2 | Message sending, delivery, validation, persistence, and read receipts |
| Sprint 3 | Conversation lifecycle, message-history pagination, authorization, and presence |

## Automation approach

Run backend unit tests from `backend/linksy-b` with `pnpm test`. Run frontend component tests from `frontend/linksy-f` with `pnpm test:run`. Vitest mocks external services and databases in unit tests, so live MongoDB, Redis, S3, Google, HTTP, and Socket.IO behavior requires manual or integration execution.

## Data strategy

Use synthetic test accounts and test-only credentials. Keep passwords and tokens out of reports. Create at least two active users for two-party workflows and at least one inactive or unrelated account for negative authorization checks.

## Entry and exit criteria

Testing starts when dependencies and required backing services are available. Each sprint is complete when all P0/P1 cases have a final result and unresolved defects have an owner and disposition. The final QA report is signed off only after critical/high defects are resolved or formally accepted.

## Defect management

Use `BUG-YYYY-NNN` identifiers. Report severity, priority, reproducibility, exact steps, expected/actual behavior, sanitized evidence, environment, and verification status.

## Tools

- Vitest for backend and frontend unit/component tests
- React Testing Library and user-event for React interactions
- jsdom for browser-like frontend tests
- HTTP client/Postman for live API checks
- Socket.IO clients for real-time checks
