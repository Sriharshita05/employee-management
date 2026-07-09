<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\EmployeeSeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\AttendanceSeeder;
use Database\Seeders\AdminSeeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable foreign key checks to safely truncate related tables
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // Truncate tables to avoid duplicate entries on re‑run
        DB::table('users')->truncate();
        DB::table('attendance')->truncate();
        DB::table('employees')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create the default admin login (admin@example.com / password)
        $this->call(AdminSeeder::class);

        // Seed departments before employees, then attendance for those employees
        $this->call(DepartmentSeeder::class);
        $this->call(EmployeeSeeder::class);
        $this->call(AttendanceSeeder::class);
    }
}
