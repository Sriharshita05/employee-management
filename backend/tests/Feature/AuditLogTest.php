<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_an_employee_through_the_api_is_logged_with_the_acting_user(): void
    {
        $hr = User::factory()->hr()->create();
        $department = Department::factory()->create();
        Sanctum::actingAs($hr);

        $this->postJson('/api/employees', [
            'name'          => 'Priya Sharma',
            'email'         => 'priya@example.com',
            'phone'         => '555-0100',
            'department_id' => $department->id,
            'salary'        => 50000,
            'status'        => 'active',
        ])->assertCreated();

        $log = AuditLog::where('auditable_type', 'Employee')->where('action', 'created')->firstOrFail();

        $this->assertSame($hr->id, $log->user_id);
        $this->assertSame('Priya Sharma', $log->new_values['name']);
        $this->assertNull($log->old_values);
        $this->assertArrayNotHasKey('created_at', $log->new_values);
    }

    public function test_updates_log_only_the_changed_fields(): void
    {
        $employee = Employee::factory()->create(['name' => 'Old Name', 'salary' => 40000]);
        AuditLog::query()->delete();

        Sanctum::actingAs(User::factory()->hr()->create());
        $this->putJson("/api/employees/{$employee->id}", ['name' => 'New Name'])->assertOk();

        $log = AuditLog::where('action', 'updated')->firstOrFail();

        $this->assertSame(['name' => 'Old Name'], $log->old_values);
        $this->assertSame(['name' => 'New Name'], $log->new_values);
        $this->assertSame($employee->id, $log->auditable_id);
    }

    public function test_an_update_that_changes_nothing_is_not_logged(): void
    {
        $employee = Employee::factory()->create(['name' => 'Same Name']);
        AuditLog::query()->delete();

        $employee->update(['name' => 'Same Name']);

        $this->assertSame(0, AuditLog::count());
    }

    public function test_deleting_logs_the_removed_values(): void
    {
        $employee = Employee::factory()->create(['name' => 'Leaving Soon']);
        AuditLog::query()->delete();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->deleteJson("/api/employees/{$employee->id}")->assertNoContent();

        $log = AuditLog::where('action', 'deleted')->firstOrFail();

        $this->assertSame('Employee', $log->auditable_type);
        $this->assertSame('Leaving Soon', $log->old_values['name']);
        $this->assertNull($log->new_values);
    }

    public function test_passwords_are_never_written_to_the_log(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/users', [
            'name'     => 'New Manager',
            'email'    => 'new.manager@example.com',
            'password' => 'super-secret-password',
            'role'     => 'manager',
        ])->assertCreated();

        $user = User::where('email', 'new.manager@example.com')->firstOrFail();
        $user->update(['password' => 'another-secret-password']);

        $everything = AuditLog::where('auditable_type', 'User')->get()->toJson();

        $this->assertStringNotContainsString('super-secret-password', $everything);
        $this->assertStringNotContainsString('another-secret-password', $everything);
        $this->assertStringNotContainsString('"password"', $everything);
        $this->assertStringContainsString('new.manager@example.com', $everything);
    }

    public function test_approving_leave_logs_the_status_change_and_attendance(): void
    {
        $manager = User::factory()->manager()->create();
        $leave = LeaveRequest::factory()->create();
        AuditLog::query()->delete();

        Sanctum::actingAs($manager);
        $this->postJson("/api/leave-requests/{$leave->id}/approve")->assertOk();

        $statusChange = AuditLog::where('auditable_type', 'LeaveRequest')
            ->where('action', 'updated')
            ->firstOrFail();

        $this->assertSame('pending', $statusChange->old_values['status']);
        $this->assertSame('approved', $statusChange->new_values['status']);
        $this->assertSame($manager->id, $statusChange->user_id);

        $this->assertSame(3, AuditLog::where('auditable_type', 'Attendance')->where('action', 'created')->count());
    }

    public function test_admin_can_list_and_filter_the_audit_trail(): void
    {
        $admin = User::factory()->admin()->create();
        Employee::factory()->count(2)->create();
        Department::factory()->create();

        Sanctum::actingAs($admin);

        $this->getJson('/api/audit-logs')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'action', 'entity', 'entity_id', 'user', 'old_values', 'new_values', 'created_at']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $employeesOnly = $this->getJson('/api/audit-logs?entity=Employee&action=created')->assertOk();
        $this->assertSame(2, $employeesOnly->json('meta.total'));
        $this->assertSame(['Employee'], array_unique(array_column($employeesOnly->json('data'), 'entity')));

        $this->getJson('/api/audit-logs?action=exploded')->assertStatus(422);
    }

    public function test_system_changes_without_a_user_show_as_system(): void
    {
        Employee::factory()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $first = $this->getJson('/api/audit-logs?entity=Employee')->json('data.0');

        $this->assertSame('System', $first['user']);
    }

    public function test_non_admins_cannot_read_the_audit_trail(): void
    {
        Sanctum::actingAs(User::factory()->hr()->create());

        $this->getJson('/api/audit-logs')->assertForbidden();
    }
}
