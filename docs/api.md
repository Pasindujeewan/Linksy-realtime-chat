# Backend API

Base URL: `http://localhost:<PORT>` (the default port is `5000`).

All request/response bodies are JSON unless otherwise noted. The API supports local authentication, profile image upload, and protected profile reads.

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

The API sets an `accessToken` cookie on successful login and registration. The cookie is:

- `httpOnly: true`
- `sameSite: "strict"`
- `secure: true` in production
- `maxAge: 15 minutes`

Protected routes may read the token from the cookie or from the `Authorization: Bearer <token>` header.

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

- Supported types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max file size: `5 MB`
- `uploadToken` is meant to be sent as `imageToken` in the registration payload

### Errors

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `NO_FILE_UPLOADED` | No image file was sent |
| `400 Bad Request` | `INVALID_IMAGE` | Image validation failed |

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

## 3) Log in

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

## 4) Log out

`POST /api/auth/logout`

Logs the user out and revokes the current access token.

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

### Errors

| Status | Code | When |
| --- | --- | --- |
| `401 Unauthorized` | `INVALID_ACCESS_TOKEN` | Token is invalid or expired |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Unexpected server error |

## 5) Get current user profile

`GET /api/user/me/:userId`

Fetches the user profile by id. This endpoint requires authentication.

### Request

- Header: `Authorization: Bearer <token>` OR cookie-based `accessToken`

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
    "avatarUrl": "profile-pending/<file-key>",
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
| `400 Bad Request` | `USER_ID_REQUIRED` | Missing user id |
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
