<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Notifications\LeaveRequestDecided;
use App\Notifications\LeaveRequestSubmitted;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    private Employee $employee;
    private User $admin;
    private User $hr;
    private User $manager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->employee = Employee::factory()->create();
        $this->admin = User::factory()->admin()->create();
        $this->hr = User::factory()->hr()->create();
        $this->manager = User::factory()->manager()->create();
    }

    /** A Monday two weeks from now, so dates are always in the future. */
    private function monday(int $extraWeeks = 0): CarbonImmutable
    {
        return CarbonImmutable::now()->addWeeks(2 + $extraWeeks)->startOfWeek();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        $monday = $this->monday();

        return array_merge([
            'employee_id' => $this->employee->id,
            'leave_type'  => 'annual',
            'start_date'  => $monday->toDateString(),
            'end_date'    => $monday->addDays(2)->toDateString(), // Mon–Wed
            'reason'      => 'Family trip',
        ], $overrides);
    }

    private function pending(array $attributes = []): LeaveRequest
    {
        return LeaveRequest::factory()->create(array_merge(['employee_id' => $this->employee->id], $attributes));
    }

    // ── Filing a request ─────────────────────────────────────────────

    public function test_hr_can_file_a_request_and_weekends_are_not_counted(): void
    {
        Notification::fake();
        Sanctum::actingAs($this->hr);

        $monday = $this->monday();

        // Monday to the following Monday: 8 calendar days, 6 working days.
        $response = $this->postJson('/api/leave-requests', $this->payload([
            'end_date' => $monday->addDays(7)->toDateString(),
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.days', 6)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.requested_by', $this->hr->name)
            ->assertJsonPath('data.employee.name', $this->employee->name);

        $this->assertDatabaseHas('leave_requests', [
            'employee_id'  => $this->employee->id,
            'days'         => 6,
            'requested_by' => $this->hr->id,
        ]);
    }

    public function test_approvers_are_notified_but_the_requester_is_not(): void
    {
        Notification::fake();
        Sanctum::actingAs($this->hr);

        $this->postJson('/api/leave-requests', $this->payload())->assertCreated();

        Notification::assertSentTo([$this->admin, $this->manager], LeaveRequestSubmitted::class);
        Notification::assertNotSentTo($this->hr, LeaveRequestSubmitted::class);
    }

    public function test_manager_cannot_file_a_request(): void
    {
        Sanctum::actingAs($this->manager);

        $this->postJson('/api/leave-requests', $this->payload())->assertForbidden();
        $this->assertDatabaseCount('leave_requests', 0);
    }

    public function test_validation_rules(): void
    {
        Sanctum::actingAs($this->hr);
        $monday = $this->monday();

        // End before start.
        $this->postJson('/api/leave-requests', $this->payload([
            'end_date' => $monday->subDay()->toDateString(),
        ]))->assertJsonValidationErrors('end_date');

        // Weekend only.
        $saturday = $monday->subDays(2);
        $this->postJson('/api/leave-requests', $this->payload([
            'start_date' => $saturday->toDateString(),
            'end_date'   => $saturday->addDay()->toDateString(),
        ]))->assertJsonValidationErrors('start_date');

        // Unknown leave type.
        $this->postJson('/api/leave-requests', $this->payload(['leave_type' => 'sabbatical']))
            ->assertJsonValidationErrors('leave_type');

        // Unknown employee.
        $this->postJson('/api/leave-requests', $this->payload(['employee_id' => 9999]))
            ->assertJsonValidationErrors('employee_id');

        $this->assertDatabaseCount('leave_requests', 0);
    }

    public function test_a_request_cannot_span_two_calendar_years(): void
    {
        Sanctum::actingAs($this->hr);

        $this->postJson('/api/leave-requests', $this->payload([
            'start_date' => '2030-12-30',
            'end_date'   => '2031-01-03',
        ]))->assertJsonValidationErrors('end_date');
    }

    public function test_terminated_employees_cannot_request_leave(): void
    {
        Sanctum::actingAs($this->hr);
        $terminated = Employee::factory()->terminated()->create();

        $this->postJson('/api/leave-requests', $this->payload(['employee_id' => $terminated->id]))
            ->assertJsonValidationErrors('employee_id');
    }

    public function test_overlapping_requests_are_rejected_but_adjacent_ones_are_fine(): void
    {
        Sanctum::actingAs($this->hr);
        $monday = $this->monday();

        $this->postJson('/api/leave-requests', $this->payload())->assertCreated(); // Mon–Wed

        // Wed–Fri overlaps on Wednesday.
        $this->postJson('/api/leave-requests', $this->payload([
            'start_date' => $monday->addDays(2)->toDateString(),
            'end_date'   => $monday->addDays(4)->toDateString(),
        ]))->assertStatus(422)->assertJsonValidationErrors('start_date');

        // Thu–Fri is adjacent, not overlapping.
        $this->postJson('/api/leave-requests', $this->payload([
            'start_date' => $monday->addDays(3)->toDateString(),
            'end_date'   => $monday->addDays(4)->toDateString(),
        ]))->assertCreated();
    }

    public function test_cancelled_and_rejected_requests_do_not_block_new_ones(): void
    {
        Sanctum::actingAs($this->hr);

        $this->pending(['status' => LeaveRequest::STATUS_CANCELLED]);
        $this->pending(['status' => LeaveRequest::STATUS_REJECTED]);

        $this->postJson('/api/leave-requests', $this->payload())->assertCreated();
    }

    public function test_yearly_allowance_is_enforced(): void
    {
        Sanctum::actingAs($this->hr);
        $monday = $this->monday();

        // Casual allowance is 7 days. Take 5 (Mon–Fri).
        $this->postJson('/api/leave-requests', $this->payload([
            'leave_type' => 'casual',
            'end_date'   => $monday->addDays(4)->toDateString(),
        ]))->assertCreated();

        // 3 more days would exceed it (only 2 left).
        $next = $this->monday(1);
        $this->postJson('/api/leave-requests', $this->payload([
            'leave_type' => 'casual',
            'start_date' => $next->toDateString(),
            'end_date'   => $next->addDays(2)->toDateString(),
        ]))->assertStatus(422)->assertJsonValidationErrors('leave_type');

        // Exactly 2 days still fits.
        $this->postJson('/api/leave-requests', $this->payload([
            'leave_type' => 'casual',
            'start_date' => $next->toDateString(),
            'end_date'   => $next->addDay()->toDateString(),
        ]))->assertCreated();
    }

    public function test_unpaid_leave_has_no_allowance_limit(): void
    {
        Sanctum::actingAs($this->hr);
        $monday = $this->monday();

        $this->postJson('/api/leave-requests', $this->payload([
            'leave_type' => 'unpaid',
            'end_date'   => $monday->addDays(27)->toDateString(), // 4 weeks, 20 working days
        ]))->assertCreated()->assertJsonPath('data.days', 20);
    }

    public function test_balance_endpoint_reports_used_and_remaining_days(): void
    {
        $this->pending(['leave_type' => 'annual', 'days' => 4, 'start_date' => $this->monday()->toDateString(), 'end_date' => $this->monday()->addDays(3)->toDateString()]);

        Sanctum::actingAs($this->manager);

        $response = $this->getJson("/api/leave-balances/{$this->employee->id}?year={$this->monday()->year}")
            ->assertOk();

        $annual = collect($response->json('balances'))->firstWhere('leave_type', 'annual');

        $this->assertSame(['leave_type' => 'annual', 'allowance' => 20, 'used' => 4, 'remaining' => 16], $annual);

        $unpaid = collect($response->json('balances'))->firstWhere('leave_type', 'unpaid');
        $this->assertNull($unpaid['allowance']);
        $this->assertNull($unpaid['remaining']);
    }

    // ── Approving ────────────────────────────────────────────────────

    public function test_manager_approves_and_attendance_is_marked_on_leave(): void
    {
        Notification::fake();
        $leave = $this->pending(); // Mon–Wed, 3 days
        $monday = $this->monday();

        // The employee was already marked present on the Tuesday; approval overrides it.
        Attendance::create([
            'employee_id' => $this->employee->id,
            'date'        => $monday->addDay()->toDateString(),
            'status'      => 'present',
            'check_in'    => '09:00',
        ]);

        Sanctum::actingAs($this->manager);

        $this->postJson("/api/leave-requests/{$leave->id}/approve", ['decision_note' => 'Enjoy'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.decided_by', $this->manager->name)
            ->assertJsonPath('data.decision_note', 'Enjoy');

        $rows = Attendance::where('employee_id', $this->employee->id)->orderBy('date')->get();

        $this->assertCount(3, $rows);
        $this->assertSame(['on_leave', 'on_leave', 'on_leave'], $rows->pluck('status')->all());
        $this->assertSame(
            [$monday->toDateString(), $monday->addDay()->toDateString(), $monday->addDays(2)->toDateString()],
            $rows->map(fn ($r) => $r->date->toDateString())->all()
        );
        $this->assertNull($rows[1]->check_in, 'check-in from the overridden record is cleared');

        Notification::assertSentOnDemand(LeaveRequestDecided::class);
    }

    public function test_approval_skips_weekends_in_attendance(): void
    {
        $monday = $this->monday();
        $leave = $this->pending([
            'end_date' => $monday->addDays(7)->toDateString(), // Mon to next Mon
            'days'     => 6,
        ]);

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/leave-requests/{$leave->id}/approve")->assertOk();

        $this->assertSame(6, Attendance::where('employee_id', $this->employee->id)->count());
    }

    public function test_hr_cannot_approve_or_reject(): void
    {
        $leave = $this->pending();
        Sanctum::actingAs($this->hr);

        $this->postJson("/api/leave-requests/{$leave->id}/approve")->assertForbidden();
        $this->postJson("/api/leave-requests/{$leave->id}/reject", ['decision_note' => 'No'])->assertForbidden();

        $this->assertSame('pending', $leave->fresh()->status);
    }

    // ── Rejecting ────────────────────────────────────────────────────

    public function test_rejection_requires_a_note(): void
    {
        $leave = $this->pending();
        Sanctum::actingAs($this->manager);

        $this->postJson("/api/leave-requests/{$leave->id}/reject")
            ->assertStatus(422)
            ->assertJsonValidationErrors('decision_note');

        $this->assertSame('pending', $leave->fresh()->status);
    }

    public function test_rejection_notifies_the_employee_and_leaves_attendance_alone(): void
    {
        Notification::fake();
        $leave = $this->pending();
        Sanctum::actingAs($this->manager);

        $this->postJson("/api/leave-requests/{$leave->id}/reject", ['decision_note' => 'Short-staffed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertSame(0, Attendance::count());
        Notification::assertSentOnDemand(LeaveRequestDecided::class);
    }

    public function test_decision_email_renders_and_is_addressed_to_the_employee(): void
    {
        $leave = $this->pending();
        Sanctum::actingAs($this->manager);

        $this->postJson("/api/leave-requests/{$leave->id}/reject", ['decision_note' => 'Short-staffed'])->assertOk();

        $messages = app('mail.manager')->mailer('array')->getSymfonyTransport()->messages();
        $mail = $messages->first(
            fn ($sent) => str_contains($sent->getOriginalMessage()->getSubject(), 'rejected')
        );

        $this->assertNotNull($mail, 'a rejection email was sent');
        $this->assertSame(
            $this->employee->email,
            $mail->getOriginalMessage()->getTo()[0]->getAddress()
        );
        $this->assertStringContainsString('Short-staffed', $mail->getOriginalMessage()->getHtmlBody());
    }

    // ── Double decisions and cancelling ──────────────────────────────

    public function test_a_request_can_only_be_decided_once(): void
    {
        Notification::fake();
        $leave = $this->pending();
        Sanctum::actingAs($this->manager);

        $this->postJson("/api/leave-requests/{$leave->id}/approve")->assertOk();

        $this->postJson("/api/leave-requests/{$leave->id}/approve")->assertStatus(409);
        $this->postJson("/api/leave-requests/{$leave->id}/reject", ['decision_note' => 'Changed my mind'])
            ->assertStatus(409)
            ->assertJsonPath('message', 'This request has already been approved.');

        $this->assertSame('approved', $leave->fresh()->status);
        Notification::assertSentOnDemandTimes(LeaveRequestDecided::class, 1);
    }

    public function test_hr_can_cancel_a_pending_request_but_not_a_decided_one(): void
    {
        $pending = $this->pending();
        $approved = $this->pending([
            'status'     => LeaveRequest::STATUS_APPROVED,
            'start_date' => $this->monday(3)->toDateString(),
            'end_date'   => $this->monday(3)->addDay()->toDateString(),
            'days'       => 2,
        ]);

        Sanctum::actingAs($this->hr);

        $this->postJson("/api/leave-requests/{$pending->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->postJson("/api/leave-requests/{$approved->id}/cancel")->assertStatus(409);
        $this->postJson("/api/leave-requests/{$pending->id}/cancel")->assertStatus(409);
    }

    public function test_manager_cannot_cancel(): void
    {
        $leave = $this->pending();
        Sanctum::actingAs($this->manager);

        $this->postJson("/api/leave-requests/{$leave->id}/cancel")->assertForbidden();
    }

    // ── Listing ──────────────────────────────────────────────────────

    public function test_listing_filters_by_status_and_paginates(): void
    {
        $this->pending();
        LeaveRequest::factory()->count(2)->approved()->create();

        Sanctum::actingAs($this->manager);

        $this->getJson('/api/leave-requests')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.total', 3);

        $this->getJson('/api/leave-requests?status=approved')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/leave-requests?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.last_page', 3);

        $this->getJson('/api/leave-requests?status=bogus')->assertStatus(422);
    }

    public function test_listing_filters_by_employee_and_type(): void
    {
        $this->pending(['leave_type' => 'sick']);
        LeaveRequest::factory()->create(); // a different employee, annual

        Sanctum::actingAs($this->hr);

        $this->getJson("/api/leave-requests?employee_id={$this->employee->id}")->assertJsonCount(1, 'data');
        $this->getJson('/api/leave-requests?leave_type=sick')->assertJsonCount(1, 'data');
    }
}
