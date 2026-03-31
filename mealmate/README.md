# 🍽️ MealMate — Mess Management System

A full-stack MERN application for college mess management, connecting students with mess owners through real-time menu updates, ratings, and subscriptions.

---

## 📁 Project Structure

```
mealmate/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, authorization
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── seed/           # Sample data script
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # React context (Auth, Theme)
        ├── pages/      # Page components by role
        ├── services/   # Axios API client
        ├── App.jsx
        └── index.css
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd mealmate/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env:
# MONGODB_URI=mongodb://localhost:27017/mealmate
# JWT_SECRET=your_secure_random_string_here
# PORT=5000
```

### 3. Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin, 3 Mess Owners, 4 Students
- 3 Messes (2 approved, 1 pending)
- 7 days of menus for all meal types
- Sample feedback and announcements

**Demo Credentials:**
| Role    | Email                   | Password   |
|---------|-------------------------|------------|
| Admin   | admin@mealmate.com      | admin123   |
| Owner 1 | rajesh@mealmate.com     | owner123   |
| Owner 2 | priya@mealmate.com      | owner123   |
| Student | arjun@student.com       | student123 |

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # uses nodemon

# Terminal 2 — Frontend
cd frontend
npm start        # opens http://localhost:3000
```

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### Auth Routes

| Method | Endpoint                        | Access  | Description            |
|--------|---------------------------------|---------|------------------------|
| POST   | /auth/register                  | Public  | Register user/owner    |
| POST   | /auth/login                     | Public  | Login                  |
| GET    | /auth/me                        | Private | Get current user       |
| PUT    | /auth/profile                   | Private | Update profile         |
| PUT    | /auth/change-password           | Private | Change password        |
| PUT    | /auth/notifications/:id/read    | Private | Mark notification read |

**Register Request:**
```json
{
  "name": "Arjun Singh",
  "email": "arjun@student.com",
  "password": "student123",
  "role": "student",
  "college": "MIT Pune",
  "phone": "9876543210"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "...", "role": "student", ... }
}
```

### Mess Routes

| Method | Endpoint              | Access       | Description              |
|--------|-----------------------|--------------|--------------------------|
| GET    | /messes               | Public       | List approved messes     |
| GET    | /messes/:id           | Public       | Get single mess          |
| GET    | /messes/my-mess       | Owner        | Get owner's mess         |
| GET    | /messes/admin/all     | Admin        | All messes (incl pending)|
| POST   | /messes               | Owner        | Create mess              |
| PUT    | /messes/:id           | Owner/Admin  | Update mess              |
| PUT    | /messes/:id/approve   | Admin        | Approve/reject mess      |
| DELETE | /messes/:id           | Admin        | Delete mess              |

**Query params for GET /messes:**
- `search` — text search
- `city` — filter by city
- `isVeg` — true/false
- `mealType` — breakfast/lunch/dinner
- `minRating` — minimum avg rating
- `sort` — field to sort by (e.g. `-rating.average`)
- `page`, `limit` — pagination

### Menu Routes

| Method | Endpoint         | Access      | Description              |
|--------|------------------|-------------|--------------------------|
| GET    | /menus/today     | Public      | All menus for today      |
| GET    | /menus/my-menus  | Owner       | Owner's menus (filtered) |
| GET    | /menus           | Public      | Get menus with filters   |
| GET    | /menus/:id       | Public      | Single menu              |
| POST   | /menus           | Owner       | Create menu              |
| PUT    | /menus/:id       | Owner/Admin | Update menu              |
| DELETE | /menus/:id       | Owner/Admin | Delete menu              |

**Query params for GET /menus:**
- `messId` — filter by mess
- `date` — specific date (YYYY-MM-DD)
- `mealType` — breakfast/lunch/dinner
- `startDate`, `endDate` — date range
- `week=true` — full week containing `date`

**Create Menu Request:**
```json
{
  "date": "2024-01-15",
  "mealType": "lunch",
  "items": [
    { "name": "Dal Tadka", "isVeg": true },
    { "name": "Jeera Rice", "isVeg": true },
    { "name": "Roti", "isVeg": true }
  ],
  "price": 120,
  "isSpecial": false
}
```

### Feedback Routes

| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| GET    | /feedback             | Admin   | All feedback         |
| POST   | /feedback             | Student | Add review           |
| GET    | /feedback/mess/:id    | Public  | Mess reviews         |
| PUT    | /feedback/:id/reply   | Owner   | Reply to review      |
| DELETE | /feedback/:id         | Admin   | Delete review        |

### Subscription Routes

| Method | Endpoint                | Access  | Description       |
|--------|-------------------------|---------|-------------------|
| GET    | /subscriptions          | Student | My subscriptions  |
| POST   | /subscriptions/:messId  | Student | Follow a mess     |
| DELETE | /subscriptions/:messId  | Student | Unfollow a mess   |

### User Routes (Admin Only)

| Method | Endpoint                    | Access | Description        |
|--------|-----------------------------|--------|--------------------|
| GET    | /users                      | Admin  | List all users     |
| GET    | /users/analytics            | Admin  | Dashboard stats    |
| PUT    | /users/:id/approve          | Admin  | Approve/reject     |
| PUT    | /users/:id/toggle-status    | Admin  | Enable/disable     |

### Announcement Routes

| Method | Endpoint                   | Access | Description            |
|--------|----------------------------|--------|------------------------|
| GET    | /announcements/mess/:id    | Public | Mess announcements     |
| POST   | /announcements             | Owner  | Post announcement      |
| DELETE | /announcements/:id         | Owner  | Delete announcement    |

---

## 👥 User Roles & Permissions

| Feature                   | Student | Owner | Admin |
|---------------------------|---------|-------|-------|
| Browse messes & menus     | ✅      | ✅    | ✅    |
| Follow/unfollow messes    | ✅      | ❌    | ❌    |
| Write reviews             | ✅      | ❌    | ❌    |
| Create/edit mess profile  | ❌      | ✅    | ✅    |
| Post daily menus          | ❌      | ✅    | ✅    |
| Reply to reviews          | ❌      | ✅    | ✅    |
| Post announcements        | ❌      | ✅    | ✅    |
| Approve owners/messes     | ❌      | ❌    | ✅    |
| Manage all users          | ❌      | ❌    | ✅    |
| View all feedback         | ❌      | ❌    | ✅    |
| Analytics dashboard       | ❌      | ❌    | ✅    |

---

## 🎨 Frontend Pages

| Page               | Route                    | Access    |
|--------------------|--------------------------|-----------|
| Home               | /                        | Public    |
| Mess Listings      | /messes                  | Public    |
| Mess Detail        | /messes/:id              | Public    |
| Weekly Menu        | /weekly-menu             | Public    |
| Login              | /login                   | Public    |
| Register           | /register                | Public    |
| Admin Dashboard    | /admin                   | Admin     |
| Admin Users        | /admin/users             | Admin     |
| Admin Messes       | /admin/messes            | Admin     |
| Admin Feedback     | /admin/feedback          | Admin     |
| Owner Dashboard    | /owner                   | Owner     |
| Menu Manager       | /owner/menus             | Owner     |
| Mess Profile       | /owner/profile           | Owner     |
| Owner Feedback     | /owner/feedback          | Owner     |
| Student Dashboard  | /student                 | Student   |
| Subscriptions      | /student/subscriptions   | Student   |
| Profile            | /student/profile         | All Auth  |

---

## 🚀 Deployment

### Backend → Render

1. Push backend to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — strong random string
   - `NODE_ENV` — production
   - `CLIENT_URL` — your Vercel frontend URL

### Frontend → Vercel

1. Push frontend to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variable:
   - `REACT_APP_API_URL` — your Render backend URL + `/api`
4. Deploy!

### MongoDB Atlas Setup

1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create DB user with read/write permissions
3. Whitelist all IPs (0.0.0.0/0) for Render
4. Copy connection string → set as `MONGODB_URI`

---

## 🔧 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6           |
| Styling   | Pure CSS with CSS Variables         |
| Icons     | React Icons (Feather + Material)    |
| HTTP      | Axios                               |
| Dates     | date-fns                            |
| Toast     | react-hot-toast                     |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB with Mongoose               |
| Auth      | JWT (jsonwebtoken) + bcryptjs       |
| Dev       | nodemon                             |

---

## 🌟 Features Summary

- ✅ JWT Authentication with role-based access control
- ✅ 3 roles: Admin, Mess Owner, Student
- ✅ Full CRUD for messes and daily menus
- ✅ Color-coded meal types (Breakfast 🟠 / Lunch 🟢 / Dinner 🔵)
- ✅ Star ratings and written feedback
- ✅ Owner replies to reviews
- ✅ Subscription/follow system with notifications
- ✅ Admin approval workflow for owners and messes
- ✅ Announcements from mess owners
- ✅ Weekly calendar menu view
- ✅ Search & filter messes
- ✅ Dark mode support
- ✅ Mobile responsive UI
- ✅ Seed data with realistic sample content
- ✅ Analytics dashboard for admin
