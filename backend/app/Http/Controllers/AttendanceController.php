<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    /**
     * Return every employee for the given date, paired with their
     * attendance record if one exists (null when not yet marked).
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        $employees = Employee::with('department')
            ->where('status', '!=', 'terminated')
            ->orderBy('name')
            ->get();

        $records = Attendance::where('date', $date)->get()->keyBy('employee_id');

        $data = $employees->map(function ($employee) use ($records, $date) {
            $record = $records->get($employee->id);

            return [
                'employee_id'   => $employee->id,
                'employee_name' => $employee->name,
                'department'    => $employee->department?->name ?? 'Unassigned',
                'date'          => $date,
                'attendance_id' => $record->id ?? null,
                'status'        => $record->status ?? null,
                'check_in'      => $record->check_in ?? null,
                'check_out'     => $record->check_out ?? null,
            ];
        });

        return response()->json([
            'date' => $date,
            'data' => $data,
        ]);
    }

    /**
     * Mark (create or update) an employee's attendance for a given date.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'date'        => 'required|date',
            'status'      => ['required', Rule::in(['present', 'absent', 'late', 'on_leave'])],
            'check_in'    => 'nullable|date_format:H:i',
            'check_out'   => 'nullable|date_format:H:i',
        ]);

        $attendance = Attendance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'date'        => $validated['date'],
            ],
            [
                'status'    => $validated['status'],
                'check_in'  => $validated['check_in'] ?? null,
                'check_out' => $validated['check_out'] ?? null,
            ]
        );

        return response()->json($attendance->load('employee'), 201);
    }

    /**
     * Remove an attendance record (unmark a day).
     */
    public function destroy($id): JsonResponse
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();
        return response()->json(null, 204);
    }

    /**
     * Return status counts for a given date.
     */
    public function summary(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        $totalEmployees = Employee::where('status', '!=', 'terminated')->count();

        $counts = Attendance::where('date', $date)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $marked = array_sum($counts->toArray());

        return response()->json([
            'date'            => $date,
            'total_employees' => $totalEmployees,
            'present'         => (int) ($counts['present'] ?? 0),
            'absent'          => (int) ($counts['absent'] ?? 0),
            'late'            => (int) ($counts['late'] ?? 0),
            'on_leave'        => (int) ($counts['on_leave'] ?? 0),
            'not_marked'      => max(0, $totalEmployees - $marked),
        ]);
    }
}
