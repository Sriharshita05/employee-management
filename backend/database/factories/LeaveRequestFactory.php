<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    /**
     * A pending, Monday-to-Wednesday annual leave request in the future.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = now()->addWeeks(2)->startOfWeek();

        return [
            'employee_id' => Employee::factory(),
            'leave_type'  => 'annual',
            'start_date'  => $start->toDateString(),
            'end_date'    => $start->copy()->addDays(2)->toDateString(),
            'days'        => 3,
            'reason'      => fake()->sentence(),
            'status'      => LeaveRequest::STATUS_PENDING,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status'     => LeaveRequest::STATUS_APPROVED,
            'decided_at' => now(),
        ]);
    }
}
