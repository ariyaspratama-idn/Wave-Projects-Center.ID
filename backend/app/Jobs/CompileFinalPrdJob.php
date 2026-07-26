<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CompileFinalPrdJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $prdGenerationId;

    public function __construct($prdGenerationId)
    {
        $this->prdGenerationId = $prdGenerationId;
    }

    public function handle(): void
    {
        $generation = \App\Models\PrdGeneration::find($this->prdGenerationId);
        if (!$generation)
            return;

        $chunks = \App\Models\PrdChunk::where('prd_generation_id', $generation->id)
            ->orderBy('chunk_order', 'asc')
            ->get();

        $finalMarkdown = "";
        foreach ($chunks as $chunk) {
            $finalMarkdown .= $chunk->content . "\n\n";
        }

        $generation->update(['status' => 'completed']);

        \App\Models\ProjectRequirement::updateOrCreate(
            ['project_id' => $generation->project_id],
            [
                'prd_document' => ['raw' => $finalMarkdown], // Save as JSON to match original schema
                'features_requested' => ['package' => $generation->package_type]
            ]
        );

        // Update projects table status for Admin Dashboard Real-Time View
        $project = \App\Models\Project::find($generation->project_id);
        if ($project) {
            $project->status = 'designing'; // Moved from briefing to designing
            $project->save();
        }

        // Send Targeted Notification to Admins & Assigned Developer
        if ($project) {
            $adminUsers = \App\Models\User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['super_admin', 'admin', 'owner']);
            })->get();

            $notifyUsers = $adminUsers;
            if ($project->developer_id) {
                $developer = \App\Models\User::find($project->developer_id);
                if ($developer && !$notifyUsers->contains('id', $developer->id)) {
                    $notifyUsers->push($developer);
                }
            }

            // Route standard notifications (e.g., Mail via Brevo)
            \Illuminate\Support\Facades\Notification::send(
                $notifyUsers,
                new \App\Notifications\PrdCompletedNotification($project, $generation->package_type)
            );

            // Log WA/Telegram dummy endpoint since Provider SDK isn't installed yet
            foreach ($notifyUsers as $user) {
                if (!empty($user->phone_number)) {
                    \Illuminate\Support\Facades\Log::info("Mengirim Notif PRD via WhatsApp ke {$user->name} ({$user->phone_number})");
                }
                if (!empty($user->telegram_id)) {
                    $token = env('TELEGRAM_BOT_TOKEN');
                    if ($token) {
                        try {
                            \Illuminate\Support\Facades\Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                                'chat_id' => $user->telegram_id,
                                'text' => "Halo {$user->name}, dokumen PRD untuk Project \"{$project->name}\" telah selesai digenerate dan siap untuk direview di Dashboard Admin."
                            ]);
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error("Failed to send Telegram Notif PRD to {$user->name}: " . $e->getMessage());
                        }
                    }
                    \Illuminate\Support\Facades\Log::info("Mengirim Notif PRD via Telegram ke {$user->name} ({$user->telegram_id})");
                }
            }
        }
    }
}
