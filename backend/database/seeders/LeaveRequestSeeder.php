<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seed a few leave requests in each state so the Leave Requests page has
 * something to show. Assumes AdminSeeder and EmployeeSeeder have run.
 */
class LeaveRequestSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::where('status', 'active')->orderBy('id')->get();
        $hr = User::where('role', User::ROLE_HR)->first();
        $manager = User::where('role', User::ROLE_MANAGER)->first();

        if ($employees->isEmpty() || ! $hr || ! $manager) {
            return;
        }

        $monday = now()->addWeeks(2)->startOfWeek();

        // Each row sits in its own week, so requests never overlap even
        // when there are fewer active employees than rows.
        $rows = [
            // Pending, waiting for a decision.
            ['annual', 0, 3, LeaveRequest::STATUS_PENDING, 'Family trip', null],
            ['sick', 1, 2, LeaveRequest::STATUS_PENDING, 'Medical appointment', null],
            // Already decided, to show the decision details.
            ['casual', 2, 1, LeaveRequest::STATUS_APPROVED, 'Personal errand', 'Enjoy the break.'],
            ['annual', 3, 5, LeaveRequest::STATUS_REJECTED, 'Holiday', 'Team is short-staffed that week.'],
        ];

        foreach ($rows as $index => [$type, $employeeIndex, $days, $status, $reason, $note]) {
            $employee = $employees[$employeeIndex % $employees->count()];
            $start = $monday->copy()->addWeeks($index);
            $decided = $status !== LeaveRequest::STATUS_PENDING;

            LeaveRequest::create([
                'employee_id'   => $employee->id,
                'leave_type'    => $type,
                'start_date'    => $start->toDateString(),
                'end_date'      => $start->copy()->addWeekdays($days - 1)->toDateString(),
                'days'          => $days,
                'reason'        => $reason,
                'status'        => $status,
                'requested_by'  => $hr->id,
                'decided_by'    => $decided ? $manager->id : null,
                'decided_at'    => $decided ? now() : null,
                'decision_note' => $note,
            ]);
        }
    }
}
