<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;

Route::get('/', function () {
    return response()->json(['message' => 'Employee Management System API']);
});
 