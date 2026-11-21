# Linksy QA Test Plan

## Purpose

Verify the core authentication, user discovery/profile, private conversation, and messaging workflows in Linksy. This plan combines the existing backend unit tests with manual API and Socket.IO checks; it does not claim that manual tests have already been executed.

## Scope

- Registration, local login, Google sign-in, logout, and access-token handling.
- Profile-image upload and registration with its pending upload token.
- Authenticated user search, user listing, public profiles, and own-profile updates.
- One-to-one conversation creation/joining, message history, messaging, read receipts, and presence.
- Validation, unauthenticated access, malformed identifiers, and authorization boundaries.

## Out of scope

- Load, stress, penetration, and browser compatibility testing.
- AWS S3, Redis, MongoDB, and Google identity provider availability/SLA testing.
- Automated end-to-end UI coverage.

## Test approach

1. Run the existing backend unit suite: from `backend/linksy-b`, run `pnpm test`.
2. Start the backend with the required environment variables and reachable MongoDB, Redis, and S3-compatible configuration.
3. Start the application with test accounts and prepare two active users for two-party tests.
4. Execute the sprint scenarios and cases under `sprint-1/`, `sprint-2/`, and `sprint-3/`.
5. Socket.IO cases require two authenticated clients connected to the same server; the access token is an HTTP-only cookie and must be included in the Socket.IO handshake cookie header.
6. Record actual results, environment/build details, and defects in each sprint execution and bug report.

## Entry criteria

- Backend dependencies are installed and environment configuration is available.
- MongoDB and Redis are reachable; S3 settings are valid for image-upload checks.
- Two distinct active accounts are available for private conversation and authorization tests.
- Test accounts and data are isolated from production.

## Exit criteria

- All P0/P1 cases pass, or have an explicitly documented blocker/accepted defect.
- Failed or blocked cases have reproducible evidence and linked bug reports.
- No unresolved critical/high-severity defect remains without an owner and disposition.
- Actual test totals and environment are entered in the test report.

## Priorities

- **P0:** Core authentication or private-data security failure.
- **P1:** Primary chat/user workflow failure.
- **P2:** Validation, pagination, or recoverable secondary workflow failure.

## Test inventory

| Area | Case IDs | Primary verification |
|---|---|---|
| Authentication | AUTH-001–AUTH-007 | `sprint-1/test-scenarios.md` |
| Messaging | MSG-001–MSG-008 | `sprint-2/test-scenarios.md` |
| Conversations | CONV-001–CONV-007 | `sprint-3/test-scenarios.md` |
| User management | USER-001–USER-008 | `sprint-1/test-scenarios.md` |

## Existing automated coverage

Backend Vitest tests currently exercise authentication controller/validation/middleware, image upload services/controllers, user controller/service, and socket handler behavior. They are unit tests with mocked dependencies; they do not replace the live API, database, external provider, or two-client Socket.IO checks in this plan.
