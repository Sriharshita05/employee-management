<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\AuditLogController;

// ── Public auth routes ──────────────────────────────────────────────
// Throttled to slow down password guessing: 10 attempts per minute per IP.
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// ── Protected routes (require a valid Sanctum bearer token) ────────
// RBAC: the role:... middleware below mirrors the permission table —
// admin has full access, hr can add/edit but not delete or manage
// users, manager is read-only.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'me']);

    // Employees: all three roles may view; only admin/hr may create or
    // edit; only admin may delete.
    Route::middleware('role:admin,hr,manager')->group(function () {
        Route::get('employees', [EmployeeController::class, 'index']);
        Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    });
    Route::middleware('role:admin,hr')->group(function () {
        Route::post('employees', [EmployeeController::class, 'store']);
        Route::put('employees/{employee}', [EmployeeController::class, 'update']);
        Route::patch('employees/{employee}', [EmployeeController::class, 'update']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::delete('employees/{employee}', [EmployeeController::class, 'destroy']);
    });

    // Departments: admin and hr may view; only admin may create, edit,
    // or delete.
    Route::middleware('role:admin,hr')->group(function () {
        Route::get('departments', [DepartmentController::class, 'index']);
        Route::get('departments/{department}', [DepartmentController::class, 'show']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::post('departments', [DepartmentController::class, 'store']);
        Route::put('departments/{department}', [DepartmentController::class, 'update']);
        Route::patch('departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('departments/{department}', [DepartmentController::class, 'destroy']);
    });

    // Attendance: viewable by all roles (dashboard cards rely on the
    // summary); marking/removing entries is an admin/hr action.
    Route::middleware('role:admin,hr,manager')->group(function () {
        Route::get('attendance/summary', [AttendanceController::class, 'summary']);
        Route::get('attendance', [AttendanceController::class, 'index']);
    });
    Route::middleware('role:admin,hr')->group(function () {
        Route::post('attendance', [AttendanceController::class, 'store']);
        Route::delete('attendance/{id}', [AttendanceController::class, 'destroy']);
    });

    // Leave requests: every role can view requests and balances. Admin/hr
    // file a request on an employee's behalf (employees have no login) and
    // may withdraw one that is still pending. Admin/manager make the
    // approve/reject decision, so filing and approving are separate duties.
    Route::middleware('role:admin,hr,manager')->group(function () {
        Route::get('leave-requests', [LeaveRequestController::class, 'index']);
        Route::get('leave-balances/{employee}', [LeaveRequestController::class, 'balance']);
    });
    Route::middleware('role:admin,hr')->group(function () {
        Route::post('leave-requests', [LeaveRequestController::class, 'store']);
        Route::post('leave-requests/{leaveRequest}/cancel', [LeaveRequestController::class, 'cancel']);
    });
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve']);
        Route::post('leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject']);
    });

    // Reports and audit trail: admin-only per the permission table.
    Route::middleware('role:admin')->group(function () {
        Route::get('reports/overview', [ReportController::class, 'overview']);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
    });

    // User management: admin-only.
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class)->except(['show']);
    });
});
