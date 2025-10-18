# Eibelabangla	 News Backend API (v1.0)

This is the backend API for a Bangla news channel website, rebuilt for scalability and modern development practices. It's built with Node.js, Express, and MongoDB, and now features ES6 Modules and native clustering for high performance.

## Core Features

- **Scalable by Default:** Uses Node.js cluster module to balance load across all available CPU cores.
- **Modern ES6 Syntax:** Clean and maintainable codebase using import/export.
- **Secure Admin System:**
  - One-time admin registration to prevent unauthorized access.
  - Secure JWT-based authentication for all protected actions.
  - Endpoint to securely transfer admin ownership.
- **Full Content Management:**
  - CRUD for News Categories.
  - CRUD for News Articles with added SEO meta fields.
- **Public Engagement:**
  - API for anonymous users to post and view comments on articles.
  - Admin endpoint to moderate and delete comments.
- **Efficient & Paginated API:** Public endpoints for fetching news are paginated to ensure fast response times.

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB

### Installation

1. Create a project directory and place all the provided `.js`, `.json`, and `.md` files inside it, maintaining the folder structure (e.g., create a `config` folder for `db.js` and `config.env`).
2. Install NPM packages:
   ```
   npm install
   ```
3. Create a `config/config.env` file and add your environment variables. This is a critical step:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
   JWT_SECRET=<YOUR_LONG_AND_SECRET_RANDOM_STRING>
   JWT_EXPIRE=1h # Use a short duration like 1h or 30m for production
   ```

### Run the Server

- For development (with auto-restarting):
  ```
  npm run dev
  ```
- For production:
  ```
  npm start
  ```

---

## Instructions for Frontend Developers

This API uses a stateless JWT (JSON Web Token) authentication model. The frontend is responsible for managing the user's session by storing and using the token.

### 1. Login Flow

Make a POST request to `/api/v1/auth/login` with the admin's email and password. If the login is successful, the API will respond with a JSON object containing a token:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYx..."
}
```

### 2. Session Management (Storing the Token)

Store this token on the client-side. The recommended location is the browser's `localStorage`. The user is considered "logged in" as long as this token exists in `localStorage`.

### 3. Making Authenticated API Calls

For any request to a Private endpoint, you must include an Authorization header. The header value must be `Bearer` followed by the token you stored:

```
Authorization: Bearer <THE_TOKEN_FROM_LOCAL_STORAGE>
```

---

## Authentication Note

Protected routes require an `Authorization` header:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

## API Endpoints

Base: `/api/v1`

### 1. Authentication — `/api/v1/auth`

- `POST /register`Registers the first (and only) admin — locked after first registration.Body:
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "yoursecurepassword"
  }
  ```
- `POST /login`Logs in admin and returns JWT.Body:
  ```json
  {
    "email": "admin@example.com",
    "password": "yoursecurepassword"
  }
  ```
- `GET /me`Get current admin details. (Private)
- `POST /transfer-ownership`
  Transfer ownership to a new admin — old account is deleted. (Private)
  Body:
  ```json
  {
    "name": "New Admin Name",
    "email": "newadmin@example.com",
    "password": "newsecurepassword"
  }
  ```

### 2. Categories — `/api/v1/categories`

- `GET /` — Get all categories (Public)
- `GET /:id` — Get a category by ID (Public)
- `POST /` — Create category (Private)Body:
  ```json
  {
    "name": "Politics",
    "description": "News related to politics and government."
  }
  ```
- `PUT /:id` — Update category (Private)
- `DELETE /:id` — Delete category (Private)

### 3. News — `/api/v1/news`

- `GET /` — Get news list with filtering and pagination (Public)Query params:
  - `page` (default 1)
  - `limit` (default 10)
  - `sort` (e.g., `-createdAt`)
  - `select` (e.g., `title,createdAt`)
- `GET /:id` — Get single news item (Public)
- `GET /category/:categoryId` — Get news by category (Public)
- `POST /` — Create news (Private)Body:
  ```json
  {
    "title": "Breaking News: Major Event Unfolds",
    "content": "Detailed content of the news article...",
    "category": "60c72b2f5f1b2c001c8e4d8e",
    "featuredImage": "image_url.jpg",
    "metaTitle": "SEO Title for Breaking News",
    "metaDescription": "A concise and engaging meta description for SEO.",
    "metaKeywords": ["breaking news", "event", "update"]
  }
  ```
- `PUT /:id` — Update news (Private)
- `DELETE /:id` — Delete news (Private)

### 4. Comments — `/api/v1/comments`

- `GET /news/:newsId` — Get comments for a news article (Public)
- `POST /` — Add a comment (Public)Body:
  ```json
  {
    "text": "This is a great article!",
    "authorName": "John Doe",
    "news": "60c72b2f5f1b2c001c8e4d9f"
  }
  ```
- `DELETE /:id` — Delete comment (Private)

---

## Notes & Tips

- Ensure `JWT_SECRET` is long and kept secret.
- Use pagination for public endpoints to avoid large responses.
- Admin-only actions require a valid JWT token in the Authorization header.

---

For contributions, issues, or questions, open an issue in the repository.
