# CourseHub – Group 8 Final Project

A cloud-native microservice-based web app that lets users log in and manage a course catalog. Features both Google OAuth and traditional username/password authentication, and is deployed on IBM Cloud.

---

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Google OAuth & JWT (passport.js)
- **Deployment**: IBM Cloud (Cloud Foundry + Toolchain)

---

## Architecture & Components

### 1. Backend - `server/app.js`

- Uses **Express** to handle HTTP requests.
- Connects to **MongoDB Atlas** via Mongoose using `MONGO_URI`.
- Seeds initial courses from `initialCourses.json` if DB is empty.
- **Middleware**:
  - `cors` with dynamic `FRONTEND_URL`
  - `express-session` (for Google OAuth sessions)
  - `passport` for authentication
- **Routes**:
  - `/auth`: Handles login/signup & Google OAuth
  - `/api`: Handles course-related endpoints
- In production, serves React frontend from `dist/`.

### 2. Authentication - `routes/auth.js`, `config/passport.js`

- **Username/Password Auth**:
  - `POST /signup`: Registers user, hashes password, returns JWT
  - `POST /login`: Authenticates and returns JWT
- **Google OAuth**:
  - `GET /auth/google`: Redirects to Google login
  - `GET /auth/google/callback`: Handles callback, issues JWT, redirects to frontend
- **JWT Auth**:
  - Tokens signed with `JWT_SECRET`, expire in 1 hour
- **Passport Strategy**:
  - Configured for Google, stores user in MongoDB

### 3. Course Management - `routes/courses.js`

- Handles core app functionality:
  - `GET /api/items`: Fetch all courses
  - `POST /api/item`: Add a course
  - `PUT /api/item`: Edit a course
  - `DELETE /api/item`: Remove a course

### 4. Frontend (React via Vite)

- Local Dev: `http://localhost:5173` using `npm run dev`
- Production: Compiled to `dist`, served by backend
- API calls use relative routes with `credentials: "include"`
- Features include:
  - Course listing
  - Login/signup
  - User profile & possibly enrolled courses (if implemented)

### 5. MongoDB Models

- `User.js`: Stores user credentials, cart, dark mode, etc.
- `Admin.js`: Similar to User but with `role: "admin"`
- `Course.js`: Defines schema for course objects

---

## End-to-End Flow

1. **User Logs In**

   - Google or username/password
   - JWT issued, frontend redirects

2. **Course Actions**

   - Frontend calls `/api` routes to fetch/add/edit/delete

3. **Backend Handles Requests**

   - Verifies JWT/auth
   - Interacts with MongoDB
   - Returns JSON responses

4. **Frontend Updates View**
   - Displays data dynamically

---

## Local Deployment

# Install dependencies

npm install

# Run frontend (Vite)

npm run dev

# Run backend (if separated)

cd server
node app.js
