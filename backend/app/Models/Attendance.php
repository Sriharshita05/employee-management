<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = [
        'employee_id',
        'date',
        'status',
        'check_in',
        'check_out',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
        ];
    }

    /**
     * The employee this attendance record belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
