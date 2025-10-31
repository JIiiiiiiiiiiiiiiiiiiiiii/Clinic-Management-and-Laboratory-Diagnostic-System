<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewAppointmentNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $userId;

    /**
     * Create a new event instance.
     */
    public function __construct(Notification $notification, $userId)
    {
        $this->notification = $notification;
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        // Get user to determine role for channel naming
        $user = \App\Models\User::find($this->userId);
        
        if ($user) {
            // Use role-specific channel naming
            $roleChannel = match($user->role) {
                'admin' => 'admin.notifications.',
                'doctor' => 'doctor.notifications.',
                'nurse' => 'nurse.notifications.',
                default => 'admin.notifications.',
            };
            
            return [
                new PrivateChannel($roleChannel . $this->userId),
            ];
        }
        
        // Fallback to admin channel
        return [
            new PrivateChannel('admin.notifications.' . $this->userId),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'notification' => $this->notification,
            'type' => 'new_appointment',
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'new.appointment.notification';
    }
}
