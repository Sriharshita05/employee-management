<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeaveService
{
    /**
     * Working dates (Monday to Friday) in the inclusive range, as Y-m-d strings.
     *
     * Public holidays are not modelled; only weekends are excluded.
     *
     * @return list<string>
     */
    public function workingDates(string $start, string $end): array
    {
        $dates = [];

        foreach (CarbonPeriod::create(Carbon::parse($start), Carbon::parse($end)) as $day) {
            if ($day->isWeekday()) {
                $dates[] = $day->toDateString();
            }
        }

        return $dates;
    }

    public function countWorkingDays(string $start, string $end): int
    {
        return count($this->workingDates($start, $end));
    }

    /**
     * Yearly allowance for a leave type, or null when unlimited.
     */
    public function allowance(string $type): ?int
    {
        return config("leave.allowances.{$type}");
    }

    /**
     * Working days already used or reserved (pending + approved) in a year.
     * Requests are attributed to the calendar year they start in.
     */
    public function usedDays(int $employeeId, string $type, int $year): int
    {
        return (int) LeaveRequest::active()
            ->where('employee_id', $employeeId)
            ->where('leave_type', $type)
            ->whereYear('start_date', $year)
            ->sum('days');
    }

    /**
     * Days left for a leave type in a year, or null when unlimited.
     */
    public function remaining(int $employeeId, string $type, int $year): ?int
    {
        $allowance = $this->allowance($type);

        if ($allowance === null) {
            return null;
        }

        return max(0, $allowance - $this->usedDays($employeeId, $type, $year));
    }

    /**
     * Balance for every leave type, for display.
     *
     * @return list<array{leave_type: string, allowance: int|null, used: int, remaining: int|null}>
     */
    public function balances(Employee $employee, int $year): array
    {
        return collect(LeaveRequest::TYPES)->map(fn (string $type) => [
            'leave_type' => $type,
            'allowance'  => $this->allowance($type),
            'used'       => $this->usedDays($employee->id, $type, $year),
            'remaining'  => $this->remaining($employee->id, $type, $year),
        ])->all();
    }
}
