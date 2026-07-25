<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateUIDesign implements ShouldQueue
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

        $prevChunk2 = \App\Models\PrdChunk::where('prd_generation_id', $generation->id)->where('chunk_order', 2)->first();
        $prevContext = $prevChunk2 ? $prevChunk2->content : '';

        $prompt = "Ini transkrip klien:\n\n" . $generation->chat_transcript .
            "\n\nBerdasarkan rancangan teknis sebelumnya:\n" . $prevContext .
            "\n\nLanjutkan. Tulis Bab 10 sampai 13. Jelaskan UI/UX guidelines, hak akses per role, integrasi pihak ketiga, dan strategi SEO. Buat format Markdown.";

        try {
            $response = \EchoLabs\Prism\Prism::using('gemini', 'gemini-2.5-flash')
                ->generateText()
                ->withSystemMessage("Kamu adalah UI/UX & System Integration Specialist ahli.")
                ->withPrompt($prompt)();

            \App\Models\PrdChunk::create([
                'prd_generation_id' => $generation->id,
                'chunk_order' => 3,
                'content' => $response->text
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('GenerateUIDesign Job Failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
