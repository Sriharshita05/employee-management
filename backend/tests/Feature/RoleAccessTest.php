<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Locks in the RBAC permission table enforced by the `role:` middleware.
 */
class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string, string, string, bool}>
     */
    public static function permissionMatrix(): array
    {
        return [
            // role, method, uri, allowed
            'manager can view employees'      => ['manager', 'GET', '/api/employees', true],
            'manager cannot create employees' => ['manager', 'POST', '/api/employees', false],
            'manager cannot delete employees' => ['manager', 'DELETE', '/api/employees/1', false],
            'manager cannot view departments' => ['manager', 'GET', '/api/departments', false],
            'manager cannot manage users'     => ['manager', 'GET', '/api/users', false],
            'manager cannot view reports'     => ['manager', 'GET', '/api/reports/overview', false],
            'manager cannot read audit logs'  => ['manager', 'GET', '/api/audit-logs', false],

            'hr can create employees'         => ['hr', 'POST', '/api/employees', true],
            'hr cannot delete employees'      => ['hr', 'DELETE', '/api/employees/1', false],
            'hr can view departments'         => ['hr', 'GET', '/api/departments', true],
            'hr cannot create departments'    => ['hr', 'POST', '/api/departments', false],
            'hr cannot manage users'          => ['hr', 'GET', '/api/users', false],
            'hr cannot read audit logs'       => ['hr', 'GET', '/api/audit-logs', false],

            'admin can delete employees'      => ['admin', 'DELETE', '/api/employees/1', true],
            'admin can manage users'          => ['admin', 'GET', '/api/users', true],
            'admin can read audit logs'       => ['admin', 'GET', '/api/audit-logs', true],
        ];
    }

    #[DataProvider('permissionMatrix')]
    public function test_permission_matrix(string $role, string $method, string $uri, bool $allowed): void
    {
        Employee::factory()->create(); // gives id 1 something to resolve to

        Sanctum::actingAs(User::factory()->{$role}()->create());

        $response = $this->json($method, $uri);

        if ($allowed) {
            $this->assertNotContains($response->getStatusCode(), [401, 403], "{$role} should be allowed to {$method} {$uri}");
        } else {
            $response->assertForbidden();
        }
    }
}
