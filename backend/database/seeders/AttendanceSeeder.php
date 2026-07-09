<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seed the attendance table with 7 days of demo records for every
 * seeded employee, so the Attendance and Reports pages have data
 * to show out of the box.
 */
class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('attendance')->truncate();

        $employeeIds = DB::table('employees')->pluck('id');
        $statuses = ['present', 'present', 'present', 'late', 'absent', 'on_leave'];

        $records = [];

        foreach ($employeeIds as $employeeId) {
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);

                // Skip weekends for a more realistic pattern.
                if ($date->isWeekend()) {
                    continue;
                }

                $status = $statuses[array_rand($statuses)];

                $records[] = [
                    'employee_id' => $employeeId,
                    'date'        => $date->toDateString(),
                    'status'      => $status,
                    'check_in'    => $status === 'present' || $status === 'late' ? '09:0' . rand(0, 9) : null,
                    'check_out'   => $status === 'present' || $status === 'late' ? '18:0' . rand(0, 9) : null,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }
        }

        if (!empty($records)) {
            DB::table('attendance')->insert($records);
        }
    }
}
