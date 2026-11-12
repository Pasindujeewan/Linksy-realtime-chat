# Backend API

Base URL: `http://localhost:<PORT>` (the default port is `5000`).

All request/response bodies are JSON unless otherwise noted. The API supports local and Google authentication, profile image upload, and protected profile reads.

## Common response format

Successful responses use:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "<description>",
  "code": "<ERROR_CODE>"
}
```

## Authentication / cookies

The API sets an `accessToken` cookie on successful login, Google sign-in, and registration. The cookie is:

- `httpOnly: true`
- `sameSite: "strict"`
- `secure: true` in production
- `maxAge: 15 minutes`

Protected routes accept the token from the `accessToken` cookie or an `Authorization: Bearer <access-token>` header.

## 1) Upload a profile image

`POST /api/upload/profile-image`

Uploads a profile image before the user completes registration. The image is validated and stored in S3 as a pending upload, with a short-lived token used during registration.

### Request

- Content-Type: `multipart/form-data`
- Field: `image`

Example via `FormData`:

```js
const formData = new FormData();
formData.append("image", file);
```

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "message": "Profile image uploaded successfully",
    "data": {
      "uploadToken": "<uuid>",
      "expiresIn": 9000
    }
  }
}
```

Notes:

- Supported types: `image/jpeg`, `image/png`, `image/webp`
- Max file size: `5 MB`
- `uploadToken` is meant to be sent as `imageToken` in the registration payload

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `NO_FILE_UPLOADED` | No image file was sent |
| `400 Bad Request` | `INVALID_FILE_UPLOAD` | The upload is missing a file buffer or MIME type |
| `400 Bad Request` | `UNSUPPORTED_FILE_TYPE` | The image is not JPEG, PNG, or WEBP |

## 2) Register a user

`POST /api/auth/register`

Creates a local user and sets the access token cookie.

### Request body

| Field | Required | Type | Rules |
| --- | --- | --- | --- |
| `username` | Yes | string | Trimmed; 3–20 characters; letters, numbers, and underscores only |
| `email` | Yes | string | Valid email; trimmed and lowercased |
| `password` | Yes | string | 8–128 characters |
| `bio` | No | string | Maximum 160 characters |
| `imageToken` | Yes | string | Token returned from `/api/upload/profile-image` |

Example:

```json
{
  "username": "linksy_user",
  "email": "user@example.com",
  "password": "securePassword123",
  "bio": "Hello, Linksy!",
  "imageToken": "<upload-token>"
}
```

### Success response

Status: `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "<user-id>",
      "username": "linksy_user"
    }
  }
}
```

The response also sets an `accessToken` cookie. Password hashes and plaintext passwords are never returned.

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `VALIDATION_FAIELD` | Missing or invalid request fields, or strict schema validation failed |
| `400 Bad Request` | `INVALID_IMAGE_TOKEN` | `imageToken` is missing, invalid, or expired |
| `409 Conflict` | `USER_ALREADY_EXSIT` | Email or username already exists |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Unexpected server error |

## 3) Sign in with Google

`POST /api/auth/google`

Verifies a Firebase ID token for a verified Google account. If the Google account is new, the API creates a user automatically. An existing account with the same email that was not created through Google cannot be linked automatically.

### Request body

```json
{
  "idToken": "<firebase-id-token>"
}
```

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "<user-id>",
      "username": "linksy_user"
    }
  }
}
```

The server also sets the `accessToken` cookie.

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `INVALID_GOOGLE_AUTH_DATA` | Request body is missing or has an invalid `idToken` |
| `401 Unauthorized` | `INVALID_FIREBASE_TOKEN` | Firebase ID token is invalid or expired |
| `401 Unauthorized` | `INVALID_GOOGLE_ACCOUNT` | Token is not for a verified Google account |
| `403 Forbidden` | `ACCOUNT_INACTIVE` | The Google account is inactive |
| `409 Conflict` | `ACCOUNT_ALREADY_EXISTS` | Email belongs to a non-Google account |
| `409 Conflict` | `USERNAME_UNAVAILABLE` | A unique username could not be generated |

## 4) Log in

`POST /api/auth/login`

Authenticates an existing local user.

### Request body

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "<user-id>",
      "username": "linksy_user"
    }
  }
}
```

The server also sets the `accessToken` cookie.

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `INVALID_LOGIN_DATA` | Request body fails validation |
| `401 Unauthorized` | `INVALID_CREDENTIALS` | Email/password are incorrect |

## 5) Log out

`POST /api/auth/logout`

Logs the user out and revokes the current access token from the `accessToken` cookie, if present. This endpoint does not require a request body.

### Request

No body required.

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "User logged out successfully",
  "data": null
}
```

An invalid or expired cookie is ignored; the endpoint still clears the cookie. Unexpected server or Redis errors are returned as `500 Internal Server Error`.

## 6) Get user profile

`GET /api/user/me/:userId`

Fetches the user profile by id. This endpoint requires authentication.

### Request

- Header: `Authorization` bearer token or the `accessToken` cookie

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "<user-id>",
    "username": "linksy_user",
    "email": "user@example.com",
    "bio": "Hello, Linksy!",
    "avatarUrl": "<signed-image-url-valid-for-5-minutes>",
    "isActive": true,
    "lastSeenAt": null,
    "createdAt": "2025-01-10T12:00:00.000Z",
    "updatedAt": "2025-01-10T12:00:00.000Z"
  }
}
```

### Errors

| Status | Code | When |
| --- | --- | --- |
| `404 Not Found` | `USER_NOT_FOUND` | No user exists with the requested ID |
| `401 Unauthorized` | `UNAUTHORIZED` | Token is missing |
| `401 Unauthorized` | `INVALID_ACCESS_TOKEN` | Token is invalid or expired |
| `401 Unauthorized` | `TOKEN_REVOKED` | Token has been blacklisted on logout |

## 7) Get another user's profile

`GET /api/user/:userId`

Fetches an active user's public profile fields. This endpoint requires authentication.

### Request

- Header: `Authorization: Bearer <access-token>` or the `accessToken` cookie
- Path parameter: `userId` (MongoDB ObjectId)

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "<user-id>",
    "username": "linksy_user",
    "email": "user@example.com",
    "bio": "Hello, Linksy!",
    "avatarUrl": "<signed-image-url-valid-for-5-minutes>"
  }
}
```

The response includes only the profile fields listed above; inactive users are not returned.

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `INVALID_USER_ID` | The path parameter is not a valid MongoDB ObjectId |
| `404 Not Found` | `USER_NOT_FOUND` | No active user exists with the requested ID |
| `401 Unauthorized` | `UNAUTHORIZED` | Token is missing |
| `401 Unauthorized` | `INVALID_ACCESS_TOKEN` | Token is invalid or expired |
| `401 Unauthorized` | `TOKEN_REVOKED` | Token has been blacklisted on logout |

## 8) Search users by username

`GET /api/user/search?username=<query>`

Searches active users by a case-insensitive partial username match. The signed-in user's own profile is excluded. Results are ordered by username and limited to 10 users.

### Request

- Header: `Authorization` bearer token or the `accessToken` cookie
- Query parameter: `username` (required, 1–20 characters after trimming)

Example:

```http
GET /api/user/search?username=linksy
```

### Success response

Status: `200 OK`

```json
{
  "success": true,
  "message": "Users found successfully",
  "data": {
    "users": [
      {
        "id": "<user-id>",
        "username": "linksy_user",
        "avatarUrl": "<signed-image-url-valid-for-5-minutes>"
      }
    ]
  }
}
```

An empty `users` array is returned when there are no matches.

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `INVALID_USERNAME_SEARCH` | `username` is missing, empty after trimming, or longer than 20 characters |
| `401 Unauthorized` | `UNAUTHORIZED` | Token is missing |
| `401 Unauthorized` | `INVALID_ACCESS_TOKEN` | Token is invalid or expired |
| `401 Unauthorized` | `TOKEN_REVOKED` | Token has been blacklisted on logout |

## Unknown routes

Requests that do not match a registered route return `404 Not Found`:

```json
{
  "success": false,
  "message": "Route not found: GET /api/unknown",
  "error": {
    "code": "ROUTE_NOT_FOUND"
  }
}
```
