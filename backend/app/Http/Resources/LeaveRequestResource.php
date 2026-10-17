<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\LeaveRequest
 */
class LeaveRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'employee'      => [
                'id'         => $this->employee_id,
                'name'       => $this->employee?->name,
                'department' => $this->employee?->department?->name ?? 'Unassigned',
            ],
            'leave_type'    => $this->leave_type,
            'start_date'    => $this->start_date?->toDateString(),
            'end_date'      => $this->end_date?->toDateString(),
            'days'          => $this->days,
            'reason'        => $this->reason,
            'status'        => $this->status,
            'requested_by'  => $this->requester?->name,
            'decided_by'    => $this->decider?->name,
            'decided_at'    => $this->decided_at?->toIso8601String(),
            'decision_note' => $this->decision_note,
            'created_at'    => $this->created_at?->toIso8601String(),
        ];
    }
}
