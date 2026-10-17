<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'          => fake()->name(),
            'email'         => fake()->unique()->safeEmail(),
            'phone'         => fake()->numerify('555-####'),
            'department_id' => Department::factory(),
            'salary'        => fake()->numberBetween(30000, 120000),
            'status'        => 'active',
        ];
    }

    public function terminated(): static
    {
        return $this->state(fn () => ['status' => 'terminated']);
    }
}
