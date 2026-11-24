# Sprint 1 Test Scenarios

Sprint 1 covers authentication and user-management workflows.

| Scenario ID | Area | Scenario |
|---|---|---|
| S1-AUTH-01 | Authentication | Select a profile image from the device, upload it, and register a unique local account without entering an image URL. |
| S1-AUTH-02 | Authentication | Reject malformed or duplicate registration data. |
| S1-AUTH-03 | Authentication | Log in with valid and invalid credentials. |
| S1-AUTH-04 | Authentication | Verify logout and access-token revocation. |
| S1-USER-01 | User management | List active other users with pagination. |
| S1-USER-02 | User management | Search and retrieve public user profiles. |
| S1-USER-03 | User management | Update only the authenticated user's own profile. |
| S1-USER-04 | User management | Reject unauthorized or malformed profile updates. |

Detailed executable cases: `test-cases.xlsx`, rows with prefixes `AUTH-` and `USER-`.

Defect history: `BUG-2026-001` records the former manual image URL requirement; the fix is reported complete.
