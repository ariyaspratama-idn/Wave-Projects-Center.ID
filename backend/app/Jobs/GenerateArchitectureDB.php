<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateArchitectureDB implements ShouldQueue
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

        $previousChunk = \App\Models\PrdChunk::where('prd_generation_id', $generation->id)->where('chunk_order', 1)->first();
        $prevContext = $previousChunk ? $previousChunk->content : '';

        $prompt = "Ini transkrip klien:\n\n" . $generation->chat_transcript .
            "\n\nBerdasarkan Bab 1-6 sebelumnya:\n" . $prevContext .
            "\n\nBuat Bab 7 sampai 9. Buat diagram arsitektur teks, skema database lengkap dengan tipe data, dan spesifikasi API untuk fitur yang disebutkan.";

        try {
            $response = \EchoLabs\Prism\Prism::using('gemini', 'gemini-2.5-flash')
                ->generateText()
                ->withSystemMessage("Kamu adalah Software Architect ahli.")
                ->withPrompt($prompt)();

            \App\Models\PrdChunk::create([
                'prd_generation_id' => $generation->id,
                'chunk_order' => 2,
                'content' => $response->text
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('GenerateArchitectureDB Job Failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
