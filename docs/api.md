# Backend API

Base URL: `http://localhost:<PORT>` (the default port is `5000`).

All request and response bodies use JSON unless otherwise noted. The current API exposes one authentication endpoint.

## Register

`POST /api/auth/register`

Creates a local user and sets an access token cookie.

### Request body

| Field | Required | Type | Rules |
| --- | --- | --- | --- |
| `username` | Yes | string | Trimmed; 3–20 characters; letters, numbers, and underscores only. |
| `email` | Yes | string | Valid email, maximum 254 characters; trimmed and converted to lowercase. |
| `password` | Yes | string | 8–128 characters. |
| `avatarUrl` | Yes | string | Must be a valid URL. |
| `bio` | No | string | Maximum 160 characters. |

Unknown fields are rejected. `bio` defaults to an empty string in the user model when omitted; `avatarUrl` must currently be provided.

Example:

```json
{
  "username": "linksy_user",
  "email": "user@example.com",
  "password": "securePassword123",
  "avatarUrl": "https://example.com/avatar.png",
  "bio": "Hello, Linksy!"
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
      "username": "linksy_user",
      "email": "user@example.com",
      "bio": "Hello, Linksy!",
      "avatarUrl": "https://example.com/avatar.png"
    }
  }
}
```

The response also sets an `accessToken` cookie with `HttpOnly` and `SameSite=Strict`. It expires after 15 minutes. The `Secure` flag is enabled in production. The password and password hash are not included in the response.

### Errors

Application errors use this format:

```json
{
  "success": false,
  "message": "<description>",
  "code": "<ERROR_CODE>"
}
```

| Status | Code | When |
| --- | --- | --- |
| `400 Bad Request` | `VALIDATION_FAIELD` | A required field is missing, a value is invalid, or an extra field is present. The message contains the validation issue descriptions. |
| `409 Conflict` | `USER_ALREADY_EXSIT` | The email or username is already registered. |
| `500 Internal Server Error` | `INTERNAL_ERROR` | An unexpected error occurs. |

Example validation error:

```json
{
  "success": false,
  "message": "Password must contain at least 8 characters",
  "code": "VALIDATION_FAIELD"
}
```

## Unknown routes

Requests that do not match a registered route return `404 Not Found` with the current not-found response format:

```json
{
  "success": false,
  "message": "Route not found: GET /api/unknown",
  "error": {
    "code": "ROUTE_NOT_FOUND"
  }
}
```
