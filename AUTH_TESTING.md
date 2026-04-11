# SaifIQ Auth — Testing Guide

## Base URL
```
http://localhost:5001/api/v1
```

## How to test

### Option 1 — VSCode REST Client (recommended)
1. Install extension: **REST Client** (`humao.rest-client`)
2. Open `auth.http` in VSCode
3. Click **"Send Request"** above any endpoint

### Option 2 — Curl
See examples below.

### Option 3 — Postman
Import the endpoints manually (base URL + paths from table below).

---

## Auth Endpoints

| # | Method | Path | Auth | Body |
|---|--------|------|------|------|
| 1 | POST | `/auth/register` | — | `{username, email, password, country}` |
| 2 | POST | `/auth/login` | — | `{email, password}` |
| 3 | GET  | `/auth/me` | Bearer | — |
| 4 | POST | `/auth/admin-login` | — | `{email, password}` |
| 5 | POST | `/auth/forgot-password` | — | `{email}` |
| 6 | POST | `/auth/verify-reset-code` | — | `{email, code}` |
| 7 | POST | `/auth/reset-password` | — | `{resetToken, newPassword}` |
| 8 | POST | `/auth/google` | — | `{idToken}` |
| 9 | POST | `/auth/apple` | — | `{identityToken, fullName?}` |

---

## Response shape (all endpoints)

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "errors": null
}
```

Errors:
```json
{
  "success": false,
  "message": "error message in Arabic",
  "data": null,
  "errors": ["detail1", "detail2"]
}
```

---

## Test credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@saifiq.com` | `Admin@123` |
| Player | `player1@test.com` | `Test@123` |

---

## Full curl examples

### Register
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_player",
    "email": "new@test.com",
    "password": "Pass@123",
    "country": "SA"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com","password":"Test@123"}'
```

### Get me (with token)
```bash
TOKEN="paste_token_here"
curl http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Password reset (3 steps)
```bash
# Step 1: Request code
curl -X POST http://localhost:5001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com"}'

# Code will appear in server console (dev mode)

# Step 2: Verify code → get resetToken
curl -X POST http://localhost:5001/api/v1/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com","code":"123456"}'

# Step 3: Reset password
curl -X POST http://localhost:5001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"paste_token","newPassword":"NewPass@456"}'
```

---

## Rate limits

- **Auth endpoints**: 10 attempts / 15 minutes per IP (successful login doesn't count)
- After hitting the limit: HTTP 429 with message "محاولات تسجيل كثيرة، انتظر 15 دقيقة"

## Security notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens signed with HS256, expire in 7 days
- Reset codes stored in Redis with 10 min TTL
- Reset tokens (JWT) expire in 15 min
- Email enumeration protected (always returns success on forgot-password)
