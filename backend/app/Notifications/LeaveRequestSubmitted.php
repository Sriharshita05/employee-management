<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

/**
 * Tells admins and managers that a leave request is waiting for a decision.
 * Queued so the API response is not held up by the mail server.
 */
class LeaveRequestSubmitted extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public LeaveRequest $leaveRequest)
    {
        // Only send once the request is committed to the database.
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
        $leave = $this->leaveRequest->loadMissing('employee');

        return (new MailMessage)
            ->subject("Leave request awaiting approval: {$leave->employee->name}")
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . ',')
            ->line("{$leave->employee->name} has a new {$leave->leave_type} leave request.")
            ->line("Dates: {$leave->start_date->toDateString()} to {$leave->end_date->toDateString()} ({$leave->days} working day(s))")
            ->line('Reason: ' . ($leave->reason ?: 'Not provided'))
            ->action('Review request', rtrim((string) config('app.frontend_url', config('app.url')), '/') . '/leaves');
    }
}
