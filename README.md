# Server (Express) for Radio Reporter Portfolio

Overview
- Express API with MongoDB (Mongoose) models for User, Article, Event, Message.
- Local image uploads saved to `/uploads` (durable storage requires a VPS or persistent disk in production).
- Contact form stores messages and attempts to send email using provided SMTP credentials.

Quick start (Windows PowerShell)

```powershell
cd server
npm install
# create a .env file (copy .env.example and fill values)
# seed admin
$env:MONGO_URI = 'your_mongo_uri'; $env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PASSWORD='changeme'; npm run seed
# start server in dev (requires nodemon)
npm run dev
```

Endpoints (examples)
- POST `/api/auth/login` { email, password } -> { token }
- GET `/api/articles` -> list published articles
- GET `/api/articles/:slug` -> article by slug
- POST `/api/articles` (Auth) -> create article
- POST `/api/uploads/image` (form-data, field `image`) -> { url }
- POST `/api/contact` { name, email, message } -> stores message, tries to send email

Notes
- For production image hosting consider S3 or Cloudinary. Local uploads are fine for development and small self-hosted VPS.
