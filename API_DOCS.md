# SaifIQ API Documentation

> **Base URL:** `https://saifiq.halmanhaj.com/api/v1`
> **Socket.IO:** `wss://saifiq.halmanhaj.com`

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <token>
```

Token expires after **7 days**. Response format:
```json
{
  "success": true,
  "data": { ... },
  "message": "...",
  "errors": null
}
```

---

## 1. Auth

### POST `/auth/register`
```json
{ "username": "player1", "email": "a@b.com", "password": "123456", "country": "SA" }
```
**Response:** `{ token, user: { id, username, email, role, avatarUrl, country, friendCode } }`

### POST `/auth/login`
```json
{ "email": "a@b.com", "password": "123456" }
```
**Response:** `{ token, user }`

### POST `/auth/google`
```json
{ "idToken": "google_id_token_here" }
```

### POST `/auth/apple`
```json
{ "identityToken": "apple_token_here", "fullName": "optional" }
```

### POST `/auth/forgot-password`
```json
{ "email": "a@b.com" }
```

### POST `/auth/verify-reset-code`
```json
{ "email": "a@b.com", "code": "123456" }
```
**Response:** `{ resetToken }`

### POST `/auth/reset-password`
```json
{ "resetToken": "...", "newPassword": "newpass123" }
```

### GET `/auth/me` (Auth required)
**Response:**
```json
{
  "id": "uuid",
  "username": "player1",
  "email": "a@b.com",
  "role": "player",
  "avatarUrl": "/uploads/avatars/defaults/avatar-01.png",
  "level": 1,
  "gems": 10,
  "country": "SA",
  "friendCode": "A3F9K2",
  "createdAt": "2026-04-12T..."
}
```

### PATCH `/auth/me` (Auth required)
```json
{ "username": "newname", "country": "AE" }
```

### POST `/auth/me/avatar` (Auth required)
**Content-Type:** `multipart/form-data`
**Field:** `avatar` (image file, max 2MB, png/jpg/webp)
**Response:** `{ avatarUrl: "/uploads/avatars/uuid.png" }`

---

## 2. Friends

All endpoints require Auth.

### GET `/friends`
**Response:** Array of friends with online status:
```json
[{
  "friendshipId": "uuid",
  "id": "uuid",
  "username": "player2",
  "avatarUrl": "...",
  "level": 5,
  "country": "SA",
  "friendCode": "B4K2M8",
  "isOnline": true
}]
```

### GET `/friends/requests`
**Response:** Pending incoming requests:
```json
[{
  "friendshipId": "uuid",
  "id": "uuid",
  "username": "player3",
  "avatarUrl": "...",
  "requestedAt": "2026-04-12T..."
}]
```

### GET `/friends/blocked`

### GET `/friends/search?q=player`
Search users by username (min 2 chars). Returns max 20 results.

### POST `/friends/request`
```json
{ "userId": "target-uuid" }
```

### POST `/friends/add-by-code`
```json
{ "friendCode": "A3F9K2" }
```

### PATCH `/friends/:friendshipId/accept`

### PATCH `/friends/:friendshipId/reject`

### DELETE `/friends/:friendshipId`
Remove friend.

### POST `/friends/block`
```json
{ "userId": "target-uuid" }
```

### DELETE `/friends/block/:userId`
Unblock user.

---

## 3. Avatars

### GET `/avatars` (Auth required)
**Response:** Available avatars:
```json
[{
  "id": "uuid",
  "name": "avatar-01",
  "imageUrl": "/uploads/avatars/defaults/avatar-01.png",
  "gemCost": 0,
  "sortOrder": 1
}]
```

### POST `/avatars/:id/select` (Auth required)
Select/buy avatar. Free avatars apply immediately. Paid avatars deduct gems.
**Response:** `{ avatarUrl, gemsDeducted? }`

---

## 4. Notifications

### GET `/notifications?page=1&limit=20` (Auth required)

### GET `/notifications/unread-count` (Auth required)
**Response:** `{ count: 3 }`

### PATCH `/notifications/:id/read` (Auth required)

### PATCH `/notifications/read-all` (Auth required)

### PUT `/notifications/fcm-token` (Auth required)
```json
{ "fcmToken": "firebase_token_here" }
```

**Notification types:** `match_invite`, `match_result`, `gem_reward`, `system`, `admin_custom`

---

## 5. Daily Reward

### GET `/daily-reward/status` (Auth required)
```json
{
  "claimed": false,
  "streak": 3,
  "currentDay": 4,
  "todayReward": { "type": "item", "value": "shield", "label": "shield" },
  "rewards": [
    { "type": "gems", "value": 5, "label": "5 gems" },
    { "type": "gems", "value": 10, "label": "10 gems" },
    ...
  ]
}
```

### POST `/daily-reward/claim` (Auth required)
**Response:** `{ reward: { type, value, label }, streak, currentDay }`

---

## 6. Spin Wheel

### GET `/spin/status` (Auth required)
```json
{
  "canSpin": true,
  "nextFreeInSeconds": 0,
  "extraSpinsUsed": 0,
  "maxExtraSpins": 3,
  "extraSpinCost": 10,
  "slots": [
    { "label": "5 gems", "type": "gems", "value": 5 },
    { "label": "10 gems", "type": "gems", "value": 10 },
    { "label": "20 gems", "type": "gems", "value": 20 },
    { "label": "50 gems", "type": "gems", "value": 50 },
    { "label": "random item", "type": "item" },
    { "label": "50 points", "type": "points", "value": 50 },
    { "label": "extra spin", "type": "extra_spin" },
    { "label": "nothing", "type": "nothing" }
  ]
}
```

### POST `/spin/spin` (Auth required)
```json
{ "useExtra": false }
```
`useExtra: true` = paid spin (10 gems), max 3/day
**Response:** `{ slotIndex, reward: { type, value, label } }`

---

## 7. Rooms (Public)

### GET `/rooms/:code`
No auth required. For invite link previews.
```json
{
  "code": "482915",
  "mode": "1v1",
  "hostName": "player1",
  "playerCount": 1,
  "required": 2,
  "isFull": false
}
```

---

## 8. Content (Public)

### GET `/content`
Returns all content (privacy policy, terms, about, contact).

### GET `/content/:key`
Keys: `privacy_policy`, `terms_of_use`, `about_app`, `contact_us`

---

## Socket.IO Events

Connect with:
```js
const socket = io("wss://saifiq.halmanhaj.com", {
  auth: { token: "Bearer <jwt_token>" }
});
```

### Connection
| Event | Direction | Data |
|-------|-----------|------|
| `connected` | Server -> Client | `{ userId, username }` |

---

### Queue (Random Matchmaking)

| Event | Direction | Data |
|-------|-----------|------|
| `queue:join` | Client -> Server | `{ mode: '1v1' \| '4player' }` |
| `queue:joined` | Server -> Client | `{ position, mode }` |
| `queue:leave` | Client -> Server | — |
| `queue:left` | Server -> Client | — |
| `queue:error` | Server -> Client | `{ message }` |
| `match:found` | Server -> Client | `{ matchId, mode }` |

---

### Room (Private Challenge)

| Event | Direction | Data |
|-------|-----------|------|
| `room:create` | Client -> Server | `{ mode: '1v1' \| '4player' }` |
| `room:created` | Server -> Client | `{ code, mode, players[], required, shareLink }` |
| `room:join` | Client -> Server | `{ code: '482915' }` |
| `room:player-joined` | Server -> Room | `{ players[], playerCount, required }` |
| `room:leave` | Client -> Server | — |
| `room:player-left` | Server -> Room | `{ players[], playerCount, required }` |
| `room:disbanded` | Server -> Room | `{ reason }` |
| `room:invite` | Client -> Server | `{ code, friendId }` |
| `room:invited` | Server -> Client | `{ code, mode, inviterName, shareLink }` |
| `room:match-starting` | Server -> Room | `{ matchId }` |
| `room:error` | Server -> Client | `{ message }` |
| `match:found` | Server -> Client | `{ matchId, mode }` (auto when room full) |

**Flow:**
1. Host: `room:create { mode: '1v1' }` -> gets code `482915`
2. Host: `room:invite { code: '482915', friendId }` -> friend gets notification
3. OR: Share link `https://saifiq.halmanhaj.com/join/482915`
4. Friend: `room:join { code: '482915' }` -> room full -> auto `match:found`

---

### Match (Gameplay)

| Event | Direction | Data |
|-------|-----------|------|
| `match:join` | Client -> Server | `{ matchId }` |
| `match:player-joined` | Server -> Room | `{ userId }` |
| `match:started` | Server -> Room | `{ matchId }` |
| `match:question` | Server -> Room | `{ question, index, total, hp }` |
| `match:answer` | Client -> Server | `{ matchId, answer, timeMs }` |
| `match:answer-submitted` | Server -> Room | `{ userId, correct, scores, hp, attack, eliminated }` |
| `match:attack` | Server -> Room | `{ attackerId, targetId, damage, targetHp }` |
| `match:eliminated` | Server -> Room | `{ eliminated[] }` |
| `match:use-item` | Client -> Server | `{ matchId, itemType }` |
| `match:item-used` | Server -> Room | `{ userId, itemType, effect }` |
| `match:item-effect` | Server -> Client | `{ effect, ...data }` |
| `match:ended` | Server -> Room | `{ winner, scores, rewards }` |

**Match Flow:**
1. `match:found` -> Client sends `match:join { matchId }`
2. When all joined -> `match:started` then `match:question` (1s delay)
3. Player answers -> `match:answer { matchId, answer, timeMs }`
4. Server broadcasts results, attacks, eliminations
5. Auto-advance to next question after all answer or timeout (15s + 2s)
6. After 8 questions or 1 player left -> `match:ended`

**Question format:**
```json
{
  "question": {
    "id": "uuid",
    "text": "...",
    "type": "mcq",
    "options": ["A", "B", "C", "D"],
    "imageUrl": null,
    "category": "science",
    "difficulty": "medium",
    "points": 20,
    "timeLimitSeconds": 12
  },
  "index": 0,
  "total": 8,
  "hp": { "player1-uuid": 100, "player2-uuid": 100 }
}
```

**Answer format for match:answer:**
- MCQ: `answer` = option index (0-3)
- Quick Input: `answer` = string text
- Numeric: `answer` = number

---

### Items (Power-ups)

| Type | Cost | Effect |
|------|------|--------|
| `eliminate_two` | 50 | Hide 2 wrong MCQ options |
| `hint` | 30 | Show first letter of answer |
| `freeze_time` | 60 | Freeze timer 5 seconds |
| `shield` | 40 | Block next attack |
| `double_damage` | 70 | 2x damage on attack |
| `steal` | 80 | Steal gems from opponent |
| `skip` | 20 | Skip current question |
| `reveal` | 90 | Reveal correct answer |

---

## Game Config

- **Questions per match:** 8
- **Question timeout:** 15 seconds
- **Starting HP:** 100
- **Damage:** easy=10, medium=20, hard=30
- **Win reward:** 50 gems
- **Lose reward:** 10 gems

## Image URLs

Relative paths like `/uploads/avatars/defaults/avatar-01.png` should be prefixed with the server root:
```
https://saifiq.halmanhaj.com/uploads/avatars/defaults/avatar-01.png
```
Full URLs (starting with `http`) are used as-is (e.g., Google profile pictures).
