# HRMS (Human Resource Management System)

A modern, full-stack HRMS platform for managing employees, attendance, goals, departments, onboarding, and more.

---

## 🚀 Project Overview
HRMS is a professional, scalable platform for organizations to manage their workforce efficiently. It provides dashboards, attendance tracking, goal management, department insights, onboarding progress, and more—all with a clean, modern UI.

---

## ✨ Features
- **Dashboard:** Rich, role-aware dashboard with stats, charts, department overview, recent activity, and onboarding progress.
- **Attendance:** Check-in/out, leave requests, regularization, and org-wide attendance summary .
- **Goals & Performance:** Set, track, and review goals with progress bars and analytics.
- **Departments:** Manage departments, department heads, and employee lists.
- **Onboarding:** Track onboarding status for new employees.
- **User Management:** Roles (HR, Manager, Employee), profile, and team management.
- **Organization Info:** View org details, industry, and compliance info.

---

## 🛠️ Tech Stack
- **Backend:** [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/)
- **Frontend:** [React](https://react.dev/), [Next.js](https://nextjs.org/), [Recharts](https://recharts.org/), [Axios](https://axios-http.com/)
- **Auth:** JWT (handled via cookies)

---

## ⚡ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/hrms.git
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and fill in your DB and JWT secrets
cp .env.example .env
# Start the backend server
npm run start:dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
# Copy .env.example to .env.local and fill in your API base URL if needed
cp .env.example .env.local
# Start the frontend server
npm run dev
```

### 4. Database
- Uses PostgreSQL. Ensure your DB is running and credentials are set in `.env`.
- Run migrations if needed (TypeORM will auto-sync entities by default, but for production use migrations).

---
