<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Aggregated workforce metrics: headcount, salary, department
     * breakdown, and a 7-day attendance trend.
     */
    public function overview(): JsonResponse
    {
        $totalEmployees = Employee::count();

        $statusCounts = Employee::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalSalary = (float) Employee::sum('salary');
        $avgSalary = $totalEmployees > 0 ? round($totalSalary / $totalEmployees) : 0;

        $departments = Department::withCount('employees')
            ->withSum('employees as total_salary', 'salary')
            ->orderByDesc('employees_count')
            ->get()
            ->map(function ($department) {
                return [
                    'id'             => $department->id,
                    'name'           => $department->name,
                    'employee_count' => $department->employees_count,
                    'total_salary'   => (float) ($department->total_salary ?? 0),
                ];
            });

        $today = now()->toDateString();
        $startDate = now()->subDays(6)->toDateString();

        $rawTrend = Attendance::whereBetween('date', [$startDate, $today])
            ->selectRaw('date, status, count(*) as count')
            ->groupBy('date', 'status')
            ->get()
            ->groupBy('date');

        $attendanceTrend = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $rows = $rawTrend->get($date, collect());
            $byStatus = $rows->pluck('count', 'status');

            $attendanceTrend->push([
                'date'     => $date,
                'present'  => (int) ($byStatus['present'] ?? 0),
                'absent'   => (int) ($byStatus['absent'] ?? 0),
                'late'     => (int) ($byStatus['late'] ?? 0),
                'on_leave' => (int) ($byStatus['on_leave'] ?? 0),
            ]);
        }

        return response()->json([
            'total_employees'      => $totalEmployees,
            'active_employees'     => (int) ($statusCounts['active'] ?? 0),
            'inactive_employees'   => (int) ($statusCounts['inactive'] ?? 0),
            'terminated_employees' => (int) ($statusCounts['terminated'] ?? 0),
            'total_salary'         => $totalSalary,
            'avg_salary'           => $avgSalary,
            'departments'          => $departments,
            'attendance_trend'     => $attendanceTrend,
        ]);
    }
}
