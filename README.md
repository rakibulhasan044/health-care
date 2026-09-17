# BookMyDoc - Healthcare API (Backend)

The backend service for the BookMyDoc healthcare platform. This RESTful API powers the client application, handling user authentication, appointment scheduling, role-based data access, and payment integrations.

## ✨ Features
- **Relational Data Modeling:** Built with **Prisma ORM** mapping perfectly to **PostgreSQL**.
- **Role-Based API Security:** Secure routes restricted by roles (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`).
- **Payment Integrations:** Complete backend support for both **Stripe** (webhook handling) and **SSLCommerz**.
- **Automated Tasks:** Node-Cron jobs configured to safely cancel unpaid appointments without draining database limits.
- **Serverless Optimized:** Auto-ping keep-alive script integrated directly into the server to prevent cold starts on Render free tiers.
- **Media Uploads:** Integrated with **Cloudinary** for profile photos and medical records.

## 🚀 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL (Neon Serverless)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

## 🛠️ Local Setup Instructions

### 1. Clone the repository
Ensure you are in the `healthcare-server` directory.

### 2. Install Dependencies
Run the following command to install all required packages:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory. You will need:
```env
NODE_ENV=development
PORT=4000

# Your PostgreSQL Database URL (e.g., from Neon.tech)
DATABASE_URL="postgresql://user:password@hostname/db_name?sslmode=require"

# JWT Secrets (Must match Frontend exactly)
JWT_SECRET="your_secure_random_string"
EXPIRES_IN="30m"
REFRESH_TOKEN_SECRET="another_secure_random_string"
REFRESH_TOKEN_EXPIRES_IN="90d"

# Payment APIs
STRIPE_SECRET_KEY="your_stripe_secret"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# Cloudinary
CLOUD_NAME="your_cloud_name"
API_KEY="your_api_key"
API_SECRET="your_api_secret"
```

### 4. Database Setup & Seeding
Push the Prisma schema to your database and generate the Prisma client:
```bash
npx prisma db push
```

Seed the database with the initial `SUPER_ADMIN` account:
```bash
npx prisma db seed
```

### 5. Run the Server
Start the development server using `ts-node-dev`:
```bash
npm run dev
```
The API will be available at [http://localhost:4000](http://localhost:4000).

## 🌍 Deployment
This backend is optimized for **Render** deployment. The server automatically includes a keep-alive polling mechanism to prevent the free-tier container from spinning down.