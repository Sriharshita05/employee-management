<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    /**
     * Return a JSON list of all employees.
     */
    public function index(): JsonResponse
    {
        $employees = Employee::all();
        return response()->json($employees);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:employees,email',
            'phone'         => 'required|string|max:20',
            'department_id' => 'required|integer|exists:departments,id',
            'salary'        => 'required|numeric|min:0',
            'status'        => 'required|string|in:active,inactive,terminated',
        ]);

        $employee = Employee::create($validated);
        return response()->json($employee, 201);
    }

    /**
     * Show a single employee.
     */
    public function show($id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        return response()->json($employee);
    }

    /**
     * Update an existing employee.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'email'         => 'sometimes|required|email|unique:employees,email,' . $employee->id,
            'phone'         => 'sometimes|required|string|max:20',
            'department_id' => 'sometimes|required|integer|exists:departments,id',
            'salary'        => 'sometimes|required|numeric|min:0',
            'status'        => 'sometimes|required|string|in:active,inactive,terminated',
        ]);

        $employee->update($validated);
        return response()->json($employee);
    }

    /**
     * Delete an employee.
     */
    public function destroy($id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();
        return response()->json(null, 204);
    }
}
?>
