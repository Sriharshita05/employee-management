<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * Return a JSON list of all departments with employee counts and
     * total salary spend for each department.
     */
    public function index(): JsonResponse
    {
        $departments = Department::withCount('employees')
            ->withSum('employees as total_salary', 'salary')
            ->orderBy('name')
            ->get()
            ->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'description' => $department->description,
                    'employee_count' => $department->employees_count,
                    'total_salary' => (float) ($department->total_salary ?? 0),
                    'created_at' => $department->created_at,
                    'updated_at' => $department->updated_at,
                ];
            });

        return response()->json($departments);
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string|max:1000',
        ]);

        $department = Department::create($validated);
        $department->loadCount('employees');
        $department->total_salary = 0;

        return response()->json($department, 201);
    }

    /**
     * Show a single department, including its employees.
     */
    public function show($id): JsonResponse
    {
        $department = Department::withCount('employees')
            ->withSum('employees as total_salary', 'salary')
            ->with('employees')
            ->findOrFail($id);

        return response()->json($department);
    }

    /**
     * Update an existing department.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $department->update($validated);
        $department->loadCount('employees');
        $department->loadSum('employees', 'salary');

        return response()->json($department);
    }

    /**
     * Delete a department. Refuses to delete if employees are still
     * assigned to it, so data isn't silently cascaded away.
     */
    public function destroy($id): JsonResponse
    {
        $department = Department::withCount('employees')->findOrFail($id);

        if ($department->employees_count > 0) {
            return response()->json([
                'message' => 'Cannot delete a department that still has employees assigned to it. Reassign or remove those employees first.',
            ], 409);
        }

        $department->delete();
        return response()->json(null, 204);
    }
}
