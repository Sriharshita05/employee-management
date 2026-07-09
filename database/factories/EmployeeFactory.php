<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'department_id' => $this->faker->numberBetween(1, 5),
            'salary' => $this->faker->randomFloat(2, 30000, 120000),
            'status' => $this->faker->randomElement(['active', 'inactive', 'terminated']),
        ];
    }
}
?>
