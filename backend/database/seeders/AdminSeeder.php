<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed a default admin account for the dashboard.
     *
     * Login: admin@example.com / password
     * Change this password immediately in any non-local environment.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'role'     => User::ROLE_ADMIN,
            ]
        );

        // Demo accounts for the other two RBAC roles so the permission
        // matrix can be exercised without manually editing the database.
        User::updateOrCreate(
            ['email' => 'hr@example.com'],
            [
                'name'     => 'HR User',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'role'     => User::ROLE_HR,
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name'     => 'Manager User',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'role'     => User::ROLE_MANAGER,
            ]
        );
    }
}
