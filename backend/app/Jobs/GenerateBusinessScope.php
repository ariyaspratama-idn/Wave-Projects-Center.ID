<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateBusinessScope implements ShouldQueue
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

        $prompt = "Ini transkrip klien:\n\n" . $generation->chat_transcript .
            "\n\nTulis Bab 1 sampai 6 untuk PRD. Fokus pada detail Latar Belakang, Goals (OKR), Functional Requirements, dan User Stories. Buat format Markdown.";

        try {
            $response = \EchoLabs\Prism\Prism::using('gemini', 'gemini-2.5-flash')
                ->generateText()
                ->withSystemMessage("Kamu adalah Product Manager ahli.")
                ->withPrompt($prompt)();

            \App\Models\PrdChunk::create([
                'prd_generation_id' => $generation->id,
                'chunk_order' => 1,
                'content' => $response->text
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('GenerateBusinessScope Job Failed: ' . $e->getMessage());
            // Retry logic could be handled by Laravel queue retry or fallback
            throw $e;
        }
    }
}
