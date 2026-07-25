<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateDevOpsLegal implements ShouldQueue
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

        $skipClause = $generation->package_type === 'Starter' ? "Karena paket adalah Starter, abaikan/kosongkan poin 16 (DevOps & Monitoring)." : "";

        $prompt = "Ini transkrip klien:\n\n" . $generation->chat_transcript .
            "\n\nTulis sisa Bab (14-27). Fokus pada Testing, Security, Timeline, Breakdown Biaya, Kepatuhan UU PDP, dan SLA. Gunakan format profesional Markdown.\n" . $skipClause;

        try {
            $response = \EchoLabs\Prism\Prism::using('gemini', 'gemini-2.5-flash')
                ->generateText()
                ->withSystemMessage("Kamu adalah DevOps, Legal, & Project Management ahli.")
                ->withPrompt($prompt)();

            \App\Models\PrdChunk::create([
                'prd_generation_id' => $generation->id,
                'chunk_order' => 4,
                'content' => $response->text
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('GenerateDevOpsLegal Job Failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
