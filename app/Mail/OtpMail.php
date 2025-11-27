<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public string $type;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $type)
    {
        $this->code = $code;
        $this->type = $type;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->type) {
            'login' => 'Your Login Verification Code',
            'register' => 'Verify Your Email Address',
            'password_reset' => 'Your Password Reset Code',
            default => 'Your Verification Code',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $messageText = match($this->type) {
            'login' => 'Use this code to complete your login:',
            'register' => 'Please verify your email address with this code:',
            'password_reset' => 'Use this code to reset your password:',
            default => 'Your verification code is:',
        };

        return new Content(
            view: 'emails.otp',
            with: [
                'code' => (string) $this->code,
                'messageText' => (string) $messageText,
                'type' => (string) $this->type,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

