# Cytonn Task Manager

## Overview
Cytonn Task Manager is a modern, easy-to-use task management system for teams and organizations. It enables efficient task assignment, progress tracking, and user management, all within a secure and responsive web interface.

---

## Tech Stack
- **Backend:** Laravel (PHP), MySQL, Laravel Sanctum (API Auth)
- **Frontend:** Vanilla JavaScript, Bootstrap 5, HTML/CSS
- **Infrastructure:** Docker, Docker Compose, Nginx, MailHog (for email testing)

---

## Requirements
- Docker & Docker Compose
- Git
- Modern web browser

---

## Demo Logins
- **Admin:** admin@taskmanager.com / password
- **User:** john@taskmanager.com / password

---

## Infrastructure & Setup
- **Clone the repository:**
  ```bash
  git clone <repository-url> && cd taskmanager
  ```
- **Run setup:**
  ```bash
  ./setup.sh
  ```
- **Access the app:**
  - Frontend: http://localhost
  - Backend API: http://localhost:8000
  - MailHog: http://localhost:8025

---

## API Endpoints
**Authentication**
- `POST   /api/login` — Login
- `POST   /api/logout` — Logout (auth required)
- `GET    /api/user` — Get current user (auth required)

**Users (Admin only)**
- `POST   /api/register` — Register new user
- `GET    /api/users` — List all users
- `GET    /api/users/{user}` — Get user by ID

**Tasks**
- `GET    /api/tasks` — List all tasks
- `POST   /api/tasks` — Create a new task
- `GET    /api/tasks/{task}` — Get task by ID
- `PUT    /api/tasks/{task}` — Update task
- `PATCH  /api/tasks/{task}/status` — Update task status
- `DELETE /api/tasks/{task}` — Delete task

---

## Email Notifications
- Users receive email notifications when tasks are assigned to them.
- All emails are routed to MailHog for local development/testing.
- For production, update mail settings in `backend/.env`.

---

