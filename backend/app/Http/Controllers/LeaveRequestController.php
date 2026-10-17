<?php

namespace App\Http\Controllers;

use App\Http\Resources\LeaveRequestResource;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Notifications\LeaveRequestDecided;
use App\Notifications\LeaveRequestSubmitted;
use App\Services\LeaveService;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LeaveRequestController extends Controller
{
    private const RELATIONS = ['employee.department', 'requester', 'decider'];

    public function __construct(private readonly LeaveService $leaves)
    {
    }

    /**
     * Paginated list of leave requests, newest first, with optional filters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status'      => ['nullable', Rule::in(LeaveRequest::STATUSES)],
            'leave_type'  => ['nullable', Rule::in(LeaveRequest::TYPES)],
            'employee_id' => 'nullable|integer',
            'from'        => 'nullable|date_format:Y-m-d',
            'to'          => 'nullable|date_format:Y-m-d',
            'per_page'    => 'nullable|integer|min:1|max:100',
        ]);

        $requests = LeaveRequest::with(self::RELATIONS)
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['leave_type'] ?? null, fn ($q, $v) => $q->where('leave_type', $v))
            ->when($filters['employee_id'] ?? null, fn ($q, $v) => $q->where('employee_id', $v))
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('end_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('start_date', '<=', $v))
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 15);

        return LeaveRequestResource::collection($requests);
    }

    /**
     * File a leave request on behalf of an employee.
     *
     * The employee row is locked for the duration of the transaction so two
     * simultaneous requests cannot both pass the overlap and balance checks.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'leave_type'  => ['required', Rule::in(LeaveRequest::TYPES)],
            'start_date'  => 'required|date_format:Y-m-d',
            'end_date'    => 'required|date_format:Y-m-d|after_or_equal:start_date',
            'reason'      => 'nullable|string|max:500',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);

        if ($start->year !== $end->year) {
            $this->fail('end_date', 'A request cannot span two calendar years. Please file one request per year.');
        }

        if ($start->diffInDays($end) + 1 > config('leave.max_range_days')) {
            $this->fail('end_date', 'A request cannot be longer than ' . config('leave.max_range_days') . ' days.');
        }

        $days = $this->leaves->countWorkingDays($validated['start_date'], $validated['end_date']);

        if ($days === 0) {
            $this->fail('start_date', 'The selected dates contain no working days (weekends only).');
        }

        $leaveRequest = DB::transaction(function () use ($validated, $days, $request, $start) {
            $employee = Employee::lockForUpdate()->findOrFail($validated['employee_id']);

            if ($employee->status === 'terminated') {
                $this->fail('employee_id', 'Leave cannot be requested for a terminated employee.');
            }

            $overlaps = LeaveRequest::active()
                ->where('employee_id', $employee->id)
                ->overlapping($validated['start_date'], $validated['end_date'])
                ->exists();

            if ($overlaps) {
                $this->fail('start_date', 'This employee already has a pending or approved request overlapping these dates.');
            }

            $remaining = $this->leaves->remaining($employee->id, $validated['leave_type'], $start->year);

            if ($remaining !== null && $days > $remaining) {
                $this->fail('leave_type', "Only {$remaining} {$validated['leave_type']} leave day(s) remaining for {$start->year}; this request needs {$days}.");
            }

            return LeaveRequest::create([
                'employee_id'  => $employee->id,
                'leave_type'   => $validated['leave_type'],
                'start_date'   => $validated['start_date'],
                'end_date'     => $validated['end_date'],
                'days'         => $days,
                'reason'       => $validated['reason'] ?? null,
                'status'       => LeaveRequest::STATUS_PENDING,
                'requested_by' => $request->user()->id,
            ]);
        });

        $approvers = User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_MANAGER])
            ->where('id', '!=', $request->user()->id)
            ->get();

        Notification::send($approvers, new LeaveRequestSubmitted($leaveRequest));

        return (new LeaveRequestResource($leaveRequest->load(self::RELATIONS)))
            ->response()
            ->setStatusCode(201);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): LeaveRequestResource
    {
        $validated = $request->validate(['decision_note' => 'nullable|string|max:500']);

        return $this->decide($request, $leaveRequest, LeaveRequest::STATUS_APPROVED, $validated['decision_note'] ?? null);
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): LeaveRequestResource
    {
        $validated = $request->validate(['decision_note' => 'required|string|max:500']);

        return $this->decide($request, $leaveRequest, LeaveRequest::STATUS_REJECTED, $validated['decision_note']);
    }

    /**
     * Withdraw a request that has not been decided yet.
     */
    public function cancel(Request $request, LeaveRequest $leaveRequest): LeaveRequestResource
    {
        $cancelled = DB::transaction(function () use ($leaveRequest) {
            $locked = LeaveRequest::lockForUpdate()->findOrFail($leaveRequest->id);

            $this->ensurePending($locked);
            $locked->update(['status' => LeaveRequest::STATUS_CANCELLED]);

            return $locked;
        });

        return new LeaveRequestResource($cancelled->load(self::RELATIONS));
    }

    /**
     * Allowance, used and remaining days per leave type for one employee.
     */
    public function balance(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate(['year' => 'nullable|integer|min:2000|max:2100']);
        $year = (int) ($validated['year'] ?? now()->year);

        return response()->json([
            'employee_id' => $employee->id,
            'year'        => $year,
            'balances'    => $this->leaves->balances($employee, $year),
        ]);
    }

    /**
     * Approve or reject a pending request.
     *
     * The row is locked and re-checked inside the transaction, so when two
     * approvers act at the same moment only the first decision is applied
     * and the second receives a 409. Approval also marks the employee as
     * "on leave" in attendance for each working day in the range.
     */
    private function decide(Request $request, LeaveRequest $leaveRequest, string $status, ?string $note): LeaveRequestResource
    {
        $decided = DB::transaction(function () use ($request, $leaveRequest, $status, $note) {
            $locked = LeaveRequest::lockForUpdate()->findOrFail($leaveRequest->id);

            $this->ensurePending($locked);

            $locked->update([
                'status'        => $status,
                'decided_by'    => $request->user()->id,
                'decided_at'    => now(),
                'decision_note' => $note,
            ]);

            if ($status === LeaveRequest::STATUS_APPROVED) {
                $this->markOnLeave($locked);
            }

            return $locked;
        });

        $decided->load(self::RELATIONS);

        Notification::route('mail', [$decided->employee->email => $decided->employee->name])
            ->notify(new LeaveRequestDecided($decided));

        return new LeaveRequestResource($decided);
    }

    /**
     * Mark each working day of an approved request as on_leave.
     */
    private function markOnLeave(LeaveRequest $leaveRequest): void
    {
        $dates = $this->leaves->workingDates(
            $leaveRequest->start_date->toDateString(),
            $leaveRequest->end_date->toDateString()
        );

        foreach ($dates as $date) {
            $attendance = Attendance::where('employee_id', $leaveRequest->employee_id)
                ->whereDate('date', $date)
                ->first()
                ?? new Attendance(['employee_id' => $leaveRequest->employee_id, 'date' => $date]);

            $attendance->fill([
                'status'    => 'on_leave',
                'check_in'  => null,
                'check_out' => null,
            ])->save();
        }
    }

    private function ensurePending(LeaveRequest $leaveRequest): void
    {
        if (! $leaveRequest->isPending()) {
            throw new HttpResponseException(response()->json([
                'message' => "This request has already been {$leaveRequest->status}.",
            ], 409));
        }
    }

    private function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => [$message]]);
    }
}
