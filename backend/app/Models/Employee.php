<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'department_id',
        'salary',
        'status',
    ];

    /**
     * The department this employee belongs to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Attendance records for this employee.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
