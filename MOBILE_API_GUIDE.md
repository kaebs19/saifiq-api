# SaifIQ Mobile API Guide

Base URL: `https://saifiq.halmanhaj.com/api/v1`
Auth: `Authorization: Bearer <token>`

---

## Dual Currency System

| Currency | How to get | Used for |
|----------|-----------|----------|
| Gold | Match wins (50), losses (10), daily rewards, spin wheel | Match items (shield, hint, etc.) |
| Gems | Real money (IAP) | Avatars, cosmetics |

New user starts with: `gold: 500, gems: 0`

---

## User Profile

### GET /auth/me
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player1",
    "email": "a@b.com",
    "role": "player",
    "avatarUrl": "/uploads/avatars/...",
    "level": 1,
    "gems": 0,
    "gold": 500,
    "country": "SA",
    "friendCode": "482951",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## User Stats

### GET /user/stats
```json
{
  "success": true,
  "data": {
    "totalMatches": 6100,
    "wins": 2521,
    "losses": 3579,
    "winRate": 41,
    "currentStreak": 1,
    "wins1v1": 1352,
    "wins4player": 582,
    "totalKills": 2125,
    "totalCorrectAnswers": 587
  }
}
```

---

## Store (Player)

### GET /store/items
Active items with gold prices.
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "type": "skip", "nameAr": "تخطى السؤال", "descriptionAr": "يتجاوز السؤال الحالي", "goldCost": 20 },
    { "id": "uuid", "type": "hint", "nameAr": "تلميح", "descriptionAr": "يعرض تلميحاً للإجابة الصحيحة", "goldCost": 30 },
    { "id": "uuid", "type": "shield", "nameAr": "درع حماية", "descriptionAr": "يحمي من هجمة واحدة", "goldCost": 40 },
    { "id": "uuid", "type": "eliminate_two", "nameAr": "حذف إجابتين", "descriptionAr": "يحذف خيارين خاطئين من سؤال MCQ", "goldCost": 50 },
    { "id": "uuid", "type": "freeze_time", "nameAr": "تجميد الوقت", "descriptionAr": "يوقف المؤقت مؤقتاً", "goldCost": 60 },
    { "id": "uuid", "type": "double_damage", "nameAr": "ضعف الضرر", "descriptionAr": "يضاعف الضرر في الهجوم", "goldCost": 70 },
    { "id": "uuid", "type": "steal", "nameAr": "سرقة", "descriptionAr": "يسرق ذهب من خصم", "goldCost": 80 },
    { "id": "uuid", "type": "reveal", "nameAr": "كشف الإجابة", "descriptionAr": "يكشف الإجابة الصحيحة", "goldCost": 90 }
  ]
}
```

### POST /store/items/:itemType/buy
Purchase an item with gold. Item goes to inventory.

`itemType` values: `eliminate_two`, `hint`, `freeze_time`, `shield`, `double_damage`, `steal`, `skip`, `reveal`

```json
{
  "success": true,
  "message": "تم الشراء بنجاح",
  "data": {
    "itemType": "shield",
    "quantity": 3,
    "goldSpent": 40,
    "remainingGold": 460
  }
}
```

Errors:
- `400` — insufficient gold
- `404` — item not found or inactive

### GET /store/inventory
Player's owned items.
```json
{
  "success": true,
  "data": [
    { "itemType": "shield", "quantity": 3 },
    { "itemType": "hint", "quantity": 1 }
  ]
}
```

---

## Leaderboard

### GET /leaderboard?type=all_time|weekly|friends

**Query params:**
- `type`: `all_time` (default), `weekly`, `friends`
- `limit`: max 100, default 50

**Response (all_time / weekly):**
```json
{
  "success": true,
  "data": {
    "players": [
      { "rank": 1, "id": "uuid", "username": "player1", "avatarUrl": "...", "country": "SA", "level": 5, "totalPoints": 12500, "weeklyPoints": 800, "wins": 150 },
      { "rank": 2, "id": "uuid", "username": "player2", "avatarUrl": "...", "country": "AE", "level": 3, "totalPoints": 10200, "weeklyPoints": 600, "wins": 120 }
    ]
  }
}
```

**Response (friends):**
```json
{
  "success": true,
  "data": {
    "players": [
      { "rank": 1, "id": "uuid", "username": "friend1", "avatarUrl": "...", "totalPoints": 8000, "wins": 90 },
      { "rank": 2, "id": "uuid", "username": "me", "avatarUrl": "...", "totalPoints": 5000, "wins": 60 }
    ],
    "myRank": 2
  }
}
```

---

## Transaction Changes

All transactions now include a `currency` field:
```json
{ "id": "uuid", "userId": "uuid", "amount": -40, "type": "purchase", "currency": "gold", "description": "شراء أداة: درع حماية" }
```

Values: `"gold"` or `"gems"`

---

## Clans (العشائر)

تكلفة إنشاء عشيرة: **500 ذهب**. كل لاعب يمكنه الانضمام لعشيرة واحدة فقط.

### Roles
- `owner` — زعيم (كل الصلاحيات)
- `admin` — مشرف (قبول/رفض/طرد)
- `member` — عضو

### Levels
| Level | Points | Max Members |
|-------|--------|-------------|
| 1 | 0 | 30 |
| 2 | 5,000 | 40 |
| 3 | 15,000 | 50 |

---

### POST /clans
Create a clan (costs 500 gold).
```json
// Request
{ "name": "الصقور", "description": "أقوى عشيرة", "badge": "eagle", "color": "#FFD700" }

// Response
{ "success": true, "data": { "id": "uuid", "name": "الصقور", ... } }
```

### GET /clans/search?q=الصقور
Search clans by name. Paginated.

### GET /clans/my
Get my clan details + `myRole`.

### GET /clans/:id
Get clan details + `memberCount`.

### PATCH /clans/:id
Update clan (owner/admin). Body: `{ name, description, badge, color, isOpen }`

### DELETE /clans/:id
Delete clan (owner only).

---

### POST /clans/:id/join
Join or request to join. Returns `{ status: "joined" }` if open, `{ status: "pending" }` if closed.

### POST /clans/:id/leave
Leave clan (owner must transfer first).

### GET /clans/:id/members
Paginated member list with `role`, `weeklyPoints`, `isOnline`.

### POST /clans/:id/members/:uid/kick
Kick a member (admin/owner).

### POST /clans/:id/members/:uid/promote
Promote member to admin (owner only).

### POST /clans/:id/members/:uid/demote
Demote admin to member (owner only).

### POST /clans/:id/transfer/:uid
Transfer ownership to another member (owner only).

---

### GET /clans/:id/requests
Pending join requests (admin/owner).

### POST /clans/:id/requests/:rid/accept
Accept a join request.

### POST /clans/:id/requests/:rid/reject
Reject a join request.

---

### GET /clans/:id/chat
Paginated messages (newest first).
```json
{
  "data": [
    { "id": "uuid", "type": "text", "content": "مرحبا", "isPinned": false, "User": { "id": "uuid", "username": "player1", "avatarUrl": "..." }, "createdAt": "..." },
    { "id": "uuid", "type": "game_code", "content": "player1 يدعوكم للعب!", "roomCode": "ABC123", "User": { ... }, "createdAt": "..." },
    { "id": "uuid", "type": "system", "content": "player2 انضم للعشيرة", "User": { ... }, "createdAt": "..." }
  ]
}
```

### POST /clans/:id/chat
Send message. Body: `{ "content": "مرحبا", "type": "text" }`
Type `announcement` requires admin/owner role.

### POST /clans/:id/chat/game-code
Send game invite. Body: `{ "roomCode": "ABC123" }`

### POST /clans/:id/chat/:mid/pin
Toggle pin on a message (admin/owner).

---

### GET /clans/leaderboard
Top clans ranked by `weeklyPoints`.
```json
{
  "data": [
    { "rank": 1, "id": "uuid", "name": "الصقور", "badge": "eagle", "color": "#FFD700", "level": 3, "weeklyPoints": 5000, "memberCount": 45 }
  ]
}
```

### GET /clans/:id/leaderboard
Members ranked by `weeklyPoints` within a clan.
```json
{
  "data": [
    { "rank": 1, "id": "uuid", "username": "player1", "avatarUrl": "...", "role": "owner", "weeklyPoints": 500 }
  ]
}
```

---

## IAP (In-App Purchases)

### GET /iap/packages
List available gem packages.
```json
{
  "data": [
    { "productId": "com.saifiq.gems.50",   "gems": 50,   "gold": 0 },
    { "productId": "com.saifiq.gems.300",  "gems": 300,  "gold": 0 },
    { "productId": "com.saifiq.gems.700",  "gems": 700,  "gold": 0 },
    { "productId": "com.saifiq.gems.1500", "gems": 1500, "gold": 200 },
    { "productId": "com.saifiq.gems.5000", "gems": 5000, "gold": 1000 }
  ]
}
```

### POST /iap/verify
Verify purchase and add gems to account.
```json
// Request
{ "productId": "com.saifiq.gems.300", "transactionId": "2000000123456789" }

// Response
{
  "success": true,
  "message": "تم الشراء بنجاح",
  "data": {
    "gemsAdded": 300,
    "goldAdded": 0,
    "newGems": 350,
    "newGold": 500
  }
}
```

Errors:
- `400` — unknown productId
- `409` — transactionId already used (duplicate)

### POST /iap/apple-notifications
Apple App Store Server Notifications V2 webhook (public, no auth).
Handles `REFUND` events → automatically deducts gems/gold from user.

---

## Admin Currency (Admin-only)

All endpoints require `role: "admin"`. Returns 403 otherwise.

### GET /admin/users/search?q=<query>&limit=20
Search by `username`, `email`, or `friendCode`.
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "username": "player1", "email": "a@b.com", "friendCode": "482951", "avatarUrl": "...", "gold": 120, "gems": 0, "level": 3, "role": "player" }
  ]
}
```

### POST /admin/users/:userId/grant
Grant or deduct currency.
```json
// Request
{ "currency": "gold", "amount": 500, "reason": "دعم فني" }

// Response
{
  "success": true,
  "message": "تمت إضافة 500 ذهب",
  "data": { "userId": "uuid", "currency": "gold", "amount": 500, "newBalance": 620 }
}
```

Errors:
- `400` — invalid currency, amount is 0, or would result in negative balance
- `404` — userId not found
- `403` — not admin

### GET /admin/audit?userId=<uuid>&limit=50
Audit log of admin actions.

---

## Clan Real-time (Socket.io)

### Client → Server
| Event | Payload |
|-------|---------|
| `clan:join`   | `{ clanId }` — joins room after member check |
| `clan:leave`  | `{ clanId }` — leaves the room |
| `clan:typing` | `{ clanId }` — throttled to 1/2s on iOS |

### Server → Client (broadcast to `clan:<clanId>` room)
- `clan:message` — `{ clanId, message: { id, type, content, isPinned, roomCode, User, createdAt } }`
- `clan:member-joined` — `{ clanId, user: { id, username, avatarUrl } }`
- `clan:member-left` — `{ clanId, userId }`
- `clan:member-role-changed` — `{ clanId, userId, newRole }`
- `clan:typing` — `{ clanId, userId, username }` (excludes sender)
- `clan:updated` — `{ clanId }` — re-fetch clan details via REST

---

## Clan Chat Pagination

### GET /clans/:id/chat?limit=30&before=<messageId>
Cursor-based pagination. Default limit 30, max 100.

```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "limit": 30,
    "hasMore": true,
    "nextBefore": "message-uuid"
  }
}
```

Pass `nextBefore` as the next `before` to load older messages.
