<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssigned;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class TaskController extends Controller
{
    /**
     * Get all tasks (admin) or user's assigned tasks
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isAdmin()) {
            $tasks = Task::with(['assignedUser', 'createdBy'])->latest()->get();
        } else {
            $tasks = $user->assignedTasks()->with(['assignedUser', 'createdBy'])->latest()->get();
        }

        return response()->json($tasks);
    }

    /**
     * Store a new task (admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date|after:today',
            'assigned_to' => 'required|exists:users,id',
        ]);

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'assigned_to' => $request->assigned_to,
            'created_by' => $request->user()->id,
        ]);

        // Send email notification to assigned user
        $assignedUser = User::find($request->assigned_to);
        $assignedUser->notify(new TaskAssigned($task));

        return response()->json([
            'task' => $task->load(['assignedUser', 'createdBy']),
            'message' => 'Task created successfully'
        ], 201);
    }

    /**
     * Show task details
     */
    public function show(Request $request, Task $task)
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($task->load(['assignedUser', 'createdBy']));
    }

    /**
     * Update task (admin only)
     */
    public function update(Request $request, Task $task)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'deadline' => 'sometimes|required|date',
            'assigned_to' => 'sometimes|required|exists:users,id',
        ]);

        $task->update($request->only(['title', 'description', 'deadline', 'assigned_to']));

        return response()->json([
            'task' => $task->load(['assignedUser', 'createdBy']),
            'message' => 'Task updated successfully'
        ]);
    }

    /**
     * Update task status (assigned user or admin)
     */
    public function updateStatus(Request $request, Task $task)
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->update(['status' => $request->status]);

        return response()->json([
            'task' => $task->load(['assignedUser', 'createdBy']),
            'message' => 'Task status updated successfully'
        ]);
    }

    /**
     * Delete task (admin only)
     */
    public function destroy(Request $request, Task $task)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Get all users (admin only)
     */
    public function getUsers(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::where('role', 'user')->get();

        return response()->json($users);
    }
} 