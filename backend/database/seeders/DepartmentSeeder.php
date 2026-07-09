<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seed the departments table with a few dummy records.
 */
class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing records to avoid duplicate entries when re‑running.
        DB::table('departments')->delete();

        $departments = [
            ['name' => 'Human Resources', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sales',           'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Engineering',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Marketing',      'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Finance',        'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('departments')->insert($departments);
    }
}
