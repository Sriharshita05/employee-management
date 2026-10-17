<?php

namespace Tests\Unit;

use App\Services\LeaveService;
use PHPUnit\Framework\TestCase;

class LeaveServiceTest extends TestCase
{
    public function test_single_weekday_counts_as_one_day(): void
    {
        // 2030-03-04 is a Monday.
        $this->assertSame(1, (new LeaveService)->countWorkingDays('2030-03-04', '2030-03-04'));
    }

    public function test_weekend_days_are_excluded(): void
    {
        $service = new LeaveService;

        // Monday 4th to Monday 11th: Mon–Fri + Mon = 6 working days.
        $this->assertSame(6, $service->countWorkingDays('2030-03-04', '2030-03-11'));

        // Saturday and Sunday only.
        $this->assertSame(0, $service->countWorkingDays('2030-03-09', '2030-03-10'));
    }

    public function test_working_dates_lists_each_weekday(): void
    {
        $this->assertSame(
            ['2030-03-08', '2030-03-11'], // Friday, then the next Monday
            (new LeaveService)->workingDates('2030-03-08', '2030-03-11')
        );
    }
}
