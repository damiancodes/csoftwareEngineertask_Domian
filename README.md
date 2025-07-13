# Task Manager System

A comprehensive task management system built with Laravel, Vanilla JavaScript, Bootstrap, and ShadCN components. Features role-based access control, email notifications, and a modern responsive interface.

## 🚀 Features

### Core Functionality
- **User Management**: Administrators can add, edit, and delete users with role-based access
- **Task Assignment**: Assign tasks to users with deadlines and status tracking
- **Status Management**: Tasks have three statuses: Pending, In Progress, and Completed
- **Email Notifications**: Automatic email notifications when tasks are assigned
- **Responsive Design**: Modern UI that works on all devices

### Technical Features
- **Laravel Backend**: RESTful API with authentication and authorization
- **Vanilla JavaScript**: No framework dependencies for frontend
- **Bootstrap 5**: Modern, responsive UI components
- **Docker Support**: Easy deployment with Docker Compose
- **MySQL Database**: Reliable data storage
- **MailHog**: Email testing and development

## 🏗️ Architecture

```
taskmanager/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Notifications/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/               # Vanilla JS Frontend
│   ├── css/
│   ├── js/
│   └── index.html
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Laravel 10**: PHP framework for API
- **MySQL 8.0**: Database
- **Laravel Sanctum**: API authentication
- **Laravel Notifications**: Email system

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Bootstrap 5**: UI components
- **Bootstrap Icons**: Icon library
- **Custom CSS**: Modern styling

### Infrastructure
- **Docker**: Containerization
- **Nginx**: Web server
- **MailHog**: Email testing

## 📋 Requirements

- Docker and Docker Compose
- Git
- Modern web browser

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd taskmanager
```

### 2. Start the Application
```bash
docker-compose up -d
```

### 3. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **MailHog**: http://localhost:8025 (for email testing)

### 4. Database Setup
The database will be automatically created and seeded with sample data.

## 👥 Demo Credentials

### Admin User
- **Email**: admin@taskmanager.com
- **Password**: password

### Regular Users
- **Email**: john@taskmanager.com
- **Password**: password
- **Email**: jane@taskmanager.com
- **Password**: password
- **Email**: mike@taskmanager.com
- **Password**: password

## 🎯 Features in Detail

### Homepage
- Beautiful landing page with hero section
- Feature highlights and statistics
- Login modal with demo credentials
- Responsive design for all devices

### Dashboard
- **Statistics Cards**: Total, pending, in-progress, and completed tasks
- **Recent Tasks**: Quick overview of latest tasks
- **Sidebar Navigation**: Easy access to all sections
- **Responsive Layout**: Works on desktop and mobile

### Task Management
- **Create Tasks**: Administrators can create new tasks
- **Assign Users**: Select from available users
- **Set Deadlines**: Choose due dates
- **Status Updates**: Track progress with status changes
- **Delete Tasks**: Remove unwanted tasks (admin only)

### User Management (Admin Only)
- **Create Users**: Add new team members
- **Role Assignment**: Set admin or user roles
- **User List**: View all registered users
- **Delete Users**: Remove users from system

### Email Notifications
- **Task Assignment**: Users receive emails when tasks are assigned
- **MailHog Integration**: Test emails in development
- **Professional Templates**: Well-designed email layouts

## 🔧 Development

### Backend Development
```bash
# Access Laravel container
docker-compose exec backend bash

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Generate application key
php artisan key:generate
```

### Frontend Development
The frontend is served by Nginx and automatically reloads when files are changed.

### Database
```bash
# Access MySQL
docker-compose exec mysql mysql -u taskuser -p taskmanager

# Export database
docker-compose exec mysql mysqldump -u taskuser -p taskmanager > database.sql
```

## 📁 Project Structure

### Backend (Laravel)
```
backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php      # Authentication
│   │   └── TaskController.php      # Task management
│   ├── Models/
│   │   ├── User.php               # User model
│   │   └── Task.php               # Task model
│   └── Notifications/
│       └── TaskAssigned.php       # Email notifications
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php # Users table
│   │   └── create_tasks_table.php # Tasks table
│   └── seeders/
│       └── DatabaseSeeder.php     # Sample data
└── routes/
    └── api.php                    # API routes
```

### Frontend
```
frontend/
├── css/
│   ├── style.css                  # Homepage styles
│   └── dashboard.css              # Dashboard styles
├── js/
│   ├── app.js                     # Main application logic
│   └── dashboard.js               # Dashboard functionality
├── index.html                     # Homepage
└── dashboard.html                 # Dashboard
```

## 🔒 Security Features

- **Role-based Access Control**: Admin and user roles
- **API Authentication**: Laravel Sanctum tokens
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Laravel Eloquent ORM
- **XSS Protection**: Content Security Policy

## 📧 Email Configuration

The system uses MailHog for email testing in development:

- **SMTP Host**: mailhog
- **SMTP Port**: 1025
- **Web Interface**: http://localhost:8025

For production, update the mail configuration in `backend/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
```

## 🚀 Deployment

### Production Deployment
1. Update environment variables
2. Set up production database
3. Configure email service
4. Deploy with Docker:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Create `.env` files for production:

```env
# Backend
DB_HOST=your-db-host
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Email
MAIL_HOST=your-smtp-host
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 80, 8000, 3306, and 8025 are available
   - Change ports in `docker-compose.yml` if needed

2. **Database Connection**
   - Wait for MySQL to fully start
   - Check database credentials in `.env`

3. **Email Not Working**
   - Verify MailHog is running on port 8025
   - Check email configuration in Laravel

4. **Permission Issues**
   - Ensure Docker has proper permissions
   - Run `docker-compose down && docker-compose up -d`

## 📝 API Documentation

### Authentication
```
POST /api/login
POST /api/logout
GET  /api/user
```

### Tasks
```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/{id}
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
PATCH  /api/tasks/{id}/status
```

### Users (Admin Only)
```
GET  /api/users
POST /api/register
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please contact:
- **Email**: support@taskmanager.com
- **Documentation**: [Project Wiki](link-to-wiki)

---

**Built with ❤️ using Laravel, Vanilla JavaScript, and Bootstrap** 