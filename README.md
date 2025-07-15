# Task Manager System

A modern, easy-to-use task management system for teams and organizations. Built with Laravel, Vanilla JavaScript, and Bootstrap. Features include role-based access, email notifications, and a responsive interface.

## Features

- User management with admin/user roles
- Assign and track tasks with deadlines and statuses
- Email notifications for task assignments
- RESTful API backend (Laravel)
- Clean, responsive frontend (Vanilla JS + Bootstrap)
- Dockerized for easy setup
- MySQL database
- MailHog for email testing

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd taskmanager
   ```
   > Replace `<your-repository-url>` with the actual URL if you are sharing via GitHub or another platform.
2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```
   This will start all services, set up the database, and seed demo data.

3. **Access the app:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - MailHog (email testing): http://localhost:8025

4. **Demo logins:**
   - Admin: admin@taskmanager.com / password
   - User: john@taskmanager.com / password

## Project Structure

- `backend/` — Laravel API
- `frontend/` — Static frontend (HTML, JS, CSS)
- `docker-compose.yml` — Orchestrates all services
- `setup.sh` — One-step setup script

## API Endpoints

### Authentication
- `POST   /api/login` — Login
- `POST   /api/logout` — Logout (requires auth)
- `GET    /api/user` — Get current user (requires auth)

### Users (Admin only)
- `POST   /api/register` — Register new user
- `POST   /api/users` — Register new user (alias)
- `GET    /api/users` — List all users
- `GET    /api/users/{user}` — Get user by ID
- `PUT    /api/users/{user}` — Update user
- `DELETE /api/users/{user}` — Delete user

### Tasks
- `GET    /api/tasks` — List all tasks
- `POST   /api/tasks` — Create a new task
- `GET    /api/tasks/{task}` — Get task by ID
- `PUT    /api/tasks/{task}` — Update task
- `PATCH  /api/tasks/{task}/status` — Update task status
- `DELETE /api/tasks/{task}` — Delete task

## Development

- **Backend:**
  - Enter the backend container: `docker-compose exec backend bash`
  - Run migrations: `php artisan migrate`
  - Seed database: `php artisan db:seed`
  - Generate app key: `php artisan key:generate`

- **Frontend:**
  - Served by Nginx, auto-reloads on file changes.

- **Database:**
  - Access MySQL: `docker-compose exec mysql mysql -u taskuser -p taskmanager`

## Email Testing

- All emails are sent to MailHog (http://localhost:8025) in development.
- For production, update mail settings in `backend/.env`.

## Troubleshooting

- Make sure Docker and Docker Compose are installed.
- If ports are in use, change them in `docker-compose.yml`.
- If you see database errors, wait a few seconds and try again (MySQL may take time to start).
- For email issues, check MailHog is running.

## Database Import Instructions

If you want to restore the sample data:

1. Start the containers:
   ```bash
   docker-compose up -d
   ```
2. Import the SQL dump:
   ```bash
   docker-compose exec -T mysql mysql -u taskuser -ptaskpass taskmanager < taskmanager.sql
   ```

This will restore the database to the state captured in `taskmanager.sql`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes and test
4. Submit a pull request

## License

MIT License

## Support

For questions or support, email: support@taskmanager.com 