# 🔐 Auth Core

A lightweight authentication system built with **Node.js** and **PostgreSQL**, without using any frameworks.  
Implements full registration, login/logout, profile updates, session management, and a simple CAPTCHA.  
All functionality is fully unit-tested with **100% code coverage** across statements, branches, functions, and lines.

---

## ⚙️ Technologies Used

- **Node.js (v20+)** – JavaScript runtime used for the backend.  
- **HTTP core module** – no frameworks; the web server is implemented using `http.createServer()`.  
- **PostgreSQL** – relational database for storing users and sessions.  
- **dotenv** – loads environment variables from a `.env` file.  
- **node:test** and **assert** – built-in Node.js testing tools for unit tests.  
- **crypto (scrypt)** – secure password hashing and verification.  
- **nyc (Istanbul)** – code coverage measurement for tests.  
- **fs** and **path** – used for serving static files from the `public` directory.

---

## ✅ Implemented Functionality

| Feature | Description |
|----------|-------------|
| **User Registration** | `POST /api/register` – validates input, hashes the password, and stores a new user in the database. |
| **Login** | `POST /api/login` – checks credentials, verifies the password hash, and creates a session record. |
| **Logout** | `POST /api/logout` – removes the active session from the database. |
| **Profile Update** | `POST /api/update` – updates first name, last name, and/or password for the user associated with a valid session token. |
| **Session Check** | `GET /api/session?token=...` – returns information about the active session and logged-in user. |
| **Web Interface** | Frontend built with plain HTML, CSS, and JavaScript. Forms use the `fetch` API to communicate with the backend. |
| **CAPTCHA** | Implemented entirely in JavaScript without external services — generates a random code and validates user input. |
| **Unit Tests** | Every function and API endpoint is tested. Overall coverage: ~100% (statements, branches, functions, and lines). |

---

## 🧩 Built-in and Third-Party Functions Used

| Module / Function | Purpose |
|-------------------|----------|
| `http.createServer()` | Creates the main web server without Express or other frameworks. |
| `dotenv.config()` | Loads configuration from the `.env` file. |
| `crypto.scrypt()` | Hashes and verifies passwords securely. |
| `fs`, `path` | Reads and serves static frontend files. |
| `URL`, `URLSearchParams` | Handles query parameters (e.g. `/api/session?token=...`). |
| `node:test`, `assert` | Node’s built-in testing framework and assertion library. |

---

## 🧱 Project Structure

```text
auth-core/
├── src/
│   ├── server.js           # Main HTTP server and API routes
│   ├── db/
│   │   └── index.js        # PostgreSQL connection and query helper
│   ├── services/
│   │   ├── users.js        # Registration, login, and logout logic
│   │   ├── profile.js      # Profile update logic
│   │   ├── sessions.js     # Session creation and validation
│   │   ├── crypto.js       # Password hashing and verification
│   │   └── validation.js   # Input validation (email, name, password)
│   └── public/             # Static frontend files (HTML, CSS, JS, CAPTCHA)
│
├── test/
│   ├── unit/               # Unit tests for modules and API routes
│   └── helpers/            # Utility functions for test HTTP requests
│
├── .env                    # Environment and database configuration
├── package.json
└── README.md

```
## 📜 Main Files

| File | Purpose |
|------|---------|
| `src/server.js` | Core HTTP server that handles all API routes and static file serving |
| `src/db/index.js` | Initializes PostgreSQL connection pool and runs SQL queries |
| `src/services/users.js` | Handles user registration, login, and logout logic |
| `src/services/profile.js` | Updates user information (first name, last name, password) |
| `src/services/sessions.js` | Manages session creation, validation, and deletion |
| `src/services/crypto.js` | Provides password hashing and verification using scrypt |
| `src/services/validation.js` | Validates email, name, and password formats |
| `test/unit/server.test.js` | Tests all API routes (`/api/register`, `/api/login`, `/api/logout`, `/api/update`, `/api/session`) |
| `test/unit/profile.test.js` | Tests the `updateUserProfile()` service logic |
| `public/` | Contains the frontend files: forms, scripts, and the custom CAPTCHA implementation |

## 🗄️ Database Structure

The database is built with **PostgreSQL** and contains two main tables: `users` and `sessions`.

---

### 📋 Overview

| Table | Purpose |
|--------|----------|
| **users** | Stores registered user accounts with hashed passwords and metadata. |
| **sessions** | Stores active login sessions, each linked to a specific user. |

---

### 🧱 Tables

#### 1. `users`

Holds all user registration data.

| Column         | Type                     | Constraints            | Default |
|----------------|--------------------------|------------------------|---------|
| `id`           | `integer`                | `PRIMARY KEY`          | `nextval('users_id_seq')` |
| `email`        | `text`                   | `UNIQUE NOT NULL`      | — |
| `first_name`   | `text`                   | `NOT NULL`             | — |
| `last_name`    | `text`                   | `NOT NULL`             | — |
| `password_hash`| `text`                   | `NOT NULL`             | — |
| `password_salt`| `text`                   | `NOT NULL`             | — |
| `created_at`   | `timestamptz`            |                        | `now()` |
| `updated_at`   | `timestamptz`            |                        | `now()` |

##### Example SQL
```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```
#### 2. `sessions`

Stores all active user sessions.  
Each session belongs to one user and includes a secure token.

| Column | Type | Constraints | Default |
|--------|------|-------------|----------|
| `id` | `text` | `PRIMARY KEY` (session token) | — |
| `user_id` | `integer` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` | — |
| `created_at` | `timestamptz` |  | `now()` |
| `expires_at` | `timestamptz` | `NOT NULL` | `now() + INTERVAL '7 days'` |

#### Example SQL
```sql
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY, -- session token
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
```
---

### 🔗 Relationships

- **One-to-Many:**  
  Each user (`users.id`) can have multiple active sessions (`sessions.user_id`).

- **Cascade Delete:**  
  When a user is deleted, all associated sessions are automatically removed  
  due to the `ON DELETE CASCADE` constraint on `sessions.user_id`.

---
