<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'deadline',
        'assigned_to',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'deadline' => 'date',
    ];

    /**
     * Get the user assigned to this task
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created this task
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if task is overdue
     */
    public function isOverdue(): bool
    {
        return $this->deadline < now() && $this->status !== 'completed';
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClass(): string
    {
        return match($this->status) {
            'pending' => 'badge-warning',
            'in_progress' => 'badge-info',
            'completed' => 'badge-success',
            default => 'badge-secondary'
        };
    }
} 