import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
};

/**
 * // In booking.controller.ts
if (tier.event.status === "cancelled") {
  throw { status: 400, message: "Cannot book a cancelled event" };
}
```
```
throw { status: 400, message: "..." }
          ↓
catch (err) block runs
          ↓
next(err) called
          ↓
Express sees 4-param middleware
          ↓
errorMiddleware receives err
          ↓
status = err.status = 400
message = err.message = "Cannot book a cancelled event"
          ↓
res.status(400).json({ message: "Cannot book a cancelled event" })
          ↓
Postman sees clean error response ✅
```

---

## HTTP Status codes you used in this project

| Code | Meaning | Used when |
|---|---|---|
| `200` | OK | Successful GET request |
| `201` | Created | New resource created |
| `400` | Bad Request | Invalid input or business rule violation |
| `401` | Unauthorized | No token or invalid token |
| `403` | Forbidden | Valid token but wrong permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Email already in use |
| `500` | Internal Server Error | Unexpected crash |

---

## Key concepts learned

| Concept | What it means |
|---|---|
| 4 parameters | Tells Express this is an error handler |
| `err.status` | Custom status code thrown from controller |
| `err.message` | Human readable error description |
| `\|\| 500` | Fallback for unexpected errors |
| `next(err)` | How errors reach this middleware |
| Last in app.ts | Must be last so all errors reach it |

---

## Summary — Your middleware chain
```
Every request passes through:

1. express.json()    → parse body
2. authMiddleware    → verify token (protected routes only)
3. controller        → business logic
4. errorMiddleware   → catch any errors (last resort)
 */