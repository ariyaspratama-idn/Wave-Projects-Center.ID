<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PrdCompletedNotification extends Notification
{
    use Queueable;

    public $project;
    public $packageType;

    /**
     * Create a new notification instance.
     */
    public function __construct($project, $packageType)
    {
        $this->project = $project;
        $this->packageType = $packageType;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [];
        if (!empty($notifiable->email)) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $projectName = $this->project->project_name ?? 'Unknown Project';

        return (new MailMessage)
            ->subject("🚀 PRD Selesai: {$projectName}")
            ->greeting("Halo {$notifiable->name},")
            ->line("AI Agent kami (Wave Projects) telah berhasil menyusun dokumen PRD untuk proyek **{$projectName}** (Paket: {$this->packageType}).")
            ->line("Sistem sekarang sedang mengarahkan status proyek ke fase Designing.")
            ->action('Buka Dashboard Admin', url(env('APP_URL', 'http://localhost') . '/admin/prd/' . $this->project->uuid))
            ->line('Terima kasih telah menggunakan autonotifikasi Wave Projects!');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
