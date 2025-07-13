<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@taskmanager.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create sample users
        $users = [
            ['name' => 'John Doe', 'email' => 'john@taskmanager.com'],
            ['name' => 'Jane Smith', 'email' => 'jane@taskmanager.com'],
            ['name' => 'Mike Johnson', 'email' => 'mike@taskmanager.com'],
        ];

        foreach ($users as $userData) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'role' => 'user',
            ]);
        }

        // Create sample tasks
        $tasks = [
            [
                'title' => 'Design Homepage',
                'description' => 'Create a modern and responsive homepage design',
                'deadline' => now()->addDays(7),
                'assigned_to' => 2,
                'created_by' => 1,
                'status' => 'pending'
            ],
            [
                'title' => 'Database Optimization',
                'description' => 'Optimize database queries and improve performance',
                'deadline' => now()->addDays(5),
                'assigned_to' => 3,
                'created_by' => 1,
                'status' => 'in_progress'
            ],
            [
                'title' => 'API Documentation',
                'description' => 'Write comprehensive API documentation',
                'deadline' => now()->addDays(10),
                'assigned_to' => 2,
                'created_by' => 1,
                'status' => 'completed'
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::create($taskData);
        }
    }
} 