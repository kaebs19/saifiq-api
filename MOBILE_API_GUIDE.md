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
