# Evently API

Event Management & Ticketing REST API built with Node.js, TypeORM, and JWT authentication.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | TypeORM |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Migrations | TypeORM Migrations |

---

## Project Structure

```
evently/
├── src/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   ├── Tier.ts
│   │   └── Booking.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── tier.controller.ts
│   │   ├── booking.controller.ts
│   │   └── report.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── tier.routes.ts
│   │   ├── booking.routes.ts
│   │   └── report.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── migrations/
│   │   └── *-Init.ts
│   ├── app.ts
│   ├── index.ts
│   ├── data-source.ts
│   └── seed.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root of the project:

```env
PORT=3000
DB_PATH=./evently.db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. Run migrations

```bash
npm run migration:run
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Start the server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with nodemon |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run migration:generate` | Generate a new migration from entity changes |
| `npm run migration:run` | Run all pending migrations |
| `npm run seed` | Seed the database with realistic test data |

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and receive JWT token | No |

### Events

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/events` | Get all published events | Yes |
| GET | `/events/:id` | Get single event by ID | Yes |
| POST | `/events` | Create a new event | Yes |
| PUT | `/events/:id` | Update event (organizer only) | Yes |
| DELETE | `/events/:id` | Cancel event (organizer only) | Yes |

### Tiers

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/events/:id/tiers` | Get all tiers for an event | Yes |
| POST | `/events/:id/tiers` | Add a tier to an event | Yes |
| PUT | `/events/:id/tiers/:tierId` | Update a tier (no bookings) | Yes |
| DELETE | `/events/:id/tiers/:tierId` | Delete a tier (no bookings) | Yes |

### Bookings

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/bookings` | Create a booking | Yes |
| GET | `/bookings` | Get my bookings | Yes |
| DELETE | `/bookings/:id` | Cancel a booking | Yes |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/revenue` | Q1 — Total revenue in January 2025 |
| GET | `/reports/cities` | Q2 — Top city by tickets sold in Q1 2025 |
| GET | `/reports/top-events` | Q3 — Top 3 best selling events |
| GET | `/reports/tier-breakdown?title=Tech Summit 2025` | Q4 — Revenue % per tier for an event |
| GET | `/reports/low-seats` | Q5 — Events with fewer than 10 seats remaining |
| GET | `/reports/avg-price` | Q6 — Average ticket price by city |
| GET | `/reports/unique-attendees?organizerId=1` | Q7 — Unique attendees per organizer |
| GET | `/reports/cancelled` | Q8 — Cancelled bookings and lost revenue |
| GET | `/reports/top-tier` | Q9 — Tier type generating most revenue |
| GET | `/reports/no-bookings` | Q10 — Published events with zero bookings |
| GET | `/reports/monthly-revenue` | Q11 — Month over month revenue 2025 |
| GET | `/reports/top-spender` | Q12 — User who spent the most money |
| GET | `/reports/seats-percent` | Q13 — Seat sold percentage for next 30 days |

---

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

To get a token, send a POST request to `/auth/login` with valid credentials.

---

## Business Rules

- Only the organizer who created an event can update or cancel it
- Cancelling an event automatically makes all its tiers unavailable
- Tiers cannot be edited or deleted after any ticket has been sold
- Bookings cannot be made for cancelled events
- If requested quantity exceeds available seats, the booking fails gracefully
- Booking creation and cancellation use database transactions to ensure seat counts are consistent

---

## Database Schema

```
User
├── id (PK)
├── name
├── email (unique)
├── passwordHash
└── createdAt

Event
├── id (PK)
├── title
├── description
├── venue
├── city
├── startDate
├── endDate
├── status (draft | published | cancelled)
├── createdAt
└── organizerId (FK → User)

Tier
├── id (PK)
├── name
├── price
├── totalCapacity
├── availableSeats
└── eventId (FK → Event)

Booking
├── id (PK)
├── quantity
├── status (active | cancelled)
├── createdAt
├── userId (FK → User)
└── tierId (FK → Tier)
```

---

## Seed Data

The seed file creates:

- 7 users (2 organizers + 5 attendees)
- 9 events across different cities and months
- 17 tiers across all events
- 20+ bookings including active and cancelled ones

This data ensures all 13 analytical report queries return meaningful results.

---

## Postman Collection

Import `evently-collection.json` into Postman to get all 27 pre-configured requests across 5 folders:

```
📂 Auth       → 2 requests
📂 Events     → 5 requests
📂 Tiers      → 4 requests
📂 Bookings   → 3 requests
📂 Reports    → 13 requests
```

The Login request automatically saves the JWT token to the `{{token}}` collection variable so all other requests work without manual copy-pasting.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_PATH` | Path to SQLite database file | `./evently.db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |