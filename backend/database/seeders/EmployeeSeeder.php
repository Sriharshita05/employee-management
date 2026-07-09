<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seed the employees table with dummy records.
 * Assumes DepartmentSeeder has run and created IDs 1‑5.
 */
class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clean previous data to keep seeding idempotent.

        $employees = [
            [
                'name'          => 'Alice Johnson',
                'email'         => 'alice.johnson@example.com',
                'phone'         => '555-0101',
                'department_id' => 1, // Human Resources
                'salary'        => 58000.00,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'name'          => 'Bob Smith',
                'email'         => 'bob.smith@example.com',
                'phone'         => '555-0202',
                'department_id' => 2, // Sales
                'salary'        => 72000.00,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'name'          => 'Carol Lee',
                'email'         => 'carol.lee@example.com',
                'phone'         => '555-0303',
                'department_id' => 3, // Engineering
                'salary'        => 95000.00,
                'status'        => 'active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'name'          => 'David Patel',
                'email'         => 'david.patel@example.com',
                'phone'         => '555-0404',
                'department_id' => 4, // Marketing
                'salary'        => 62000.00,
                'status'        => 'inactive',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'name'          => 'Eva García',
                'email'         => 'eva.garcia@example.com',
                'phone'         => '555-0505',
                'department_id' => 5, // Finance
                'salary'        => 88000.00,
                'status'        => 'terminated',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('employees')->insert($employees);
    }
}
