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
    }
}
