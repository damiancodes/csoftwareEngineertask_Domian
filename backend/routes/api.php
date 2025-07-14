<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/users', [AuthController::class, 'register']);
    Route::get('/users', [TaskController::class, 'getUsers']);
    Route::get('/users/{user}', [AuthController::class, 'showUser']);
    Route::put('/users/{user}', [AuthController::class, 'updateUser']);
    Route::delete('/users/{user}', [AuthController::class, 'deleteUser']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
});