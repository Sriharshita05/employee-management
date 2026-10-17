<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

/**
 * Emails the employee when their leave request is approved or rejected.
 * Sent to the employee's address via an on-demand route, since employees
 * do not have dashboard accounts.
 */
class LeaveRequestDecided extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public LeaveRequest $leaveRequest)
    {
        $this->afterCommit();
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $leave = $this->leaveRequest->loadMissing(['employee', 'decider']);
        $outcome = $leave->status === LeaveRequest::STATUS_APPROVED ? 'approved' : 'rejected';

        $message = (new MailMessage)
            ->subject("Your leave request was {$outcome}")
            ->greeting("Hello {$leave->employee->name},")
            ->line("Your {$leave->leave_type} leave request for {$leave->start_date->toDateString()} to {$leave->end_date->toDateString()} ({$leave->days} working day(s)) was {$outcome}.");

        if ($leave->decision_note) {
            $message->line("Note from {$leave->decider?->name}: {$leave->decision_note}");
        }

        return $message->line('Contact HR if you have any questions.');
    }
}
