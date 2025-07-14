<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // User registration (admin only) - THIS WAS MISSING A DEDICATED ROUTE
    Route::post('/register', [AuthController::class, 'register']);
    
    // Add dedicated users route for creating users
    Route::post('/users', [AuthController::class, 'register']); // This creates the missing POST /api/users route
    
    // Task routes
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    
    // User management routes
    Route::get('/users', [TaskController::class, 'getUsers']);
    
    // Add these missing user CRUD routes
    Route::get('/users/{user}', [AuthController::class, 'showUser']); // Get single user
    Route::put('/users/{user}', [AuthController::class, 'updateUser']); // Update user
    Route::delete('/users/{user}', [AuthController::class, 'deleteUser']); // Delete user
});