<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientTransferHistory extends Model
{
    use HasFactory;

    protected $table = 'patient_transfer_history';

    protected $fillable = [
        'patient_id',
        'transfer_id',
        'action',
        'action_by_role',
        'action_by_user',
        'notes',
        'transfer_data',
        'action_date',
    ];

    protected $casts = [
        'transfer_data' => 'array',
        'action_date' => 'datetime',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function transfer(): BelongsTo
    {
        return $this->belongsTo(PatientTransfer::class, 'transfer_id');
    }

    public function actionByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'action_by_user');
    }

    // Scopes
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('action_by_role', $role);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('action_date', [$startDate, $endDate]);
    }

    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('action_date', $year)
                    ->whereMonth('action_date', $month);
    }

    public function scopeByYear($query, $year)
    {
        return $query->whereYear('action_date', $year);
    }
}
