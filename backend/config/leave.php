<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Leave types and yearly allowances
    |--------------------------------------------------------------------------
    |
    | Allowance is the number of working days an employee may take per
    | calendar year for each type. `null` means unlimited (e.g. unpaid leave).
    | Pending and approved requests both count against the allowance so two
    | requests filed back to back cannot exceed it.
    |
    */
    'allowances' => [
        'annual' => 20,
        'sick'   => 10,
        'casual' => 7,
        'unpaid' => null,
    ],

    // Longest single request, in calendar days.
    'max_range_days' => 60,

];
