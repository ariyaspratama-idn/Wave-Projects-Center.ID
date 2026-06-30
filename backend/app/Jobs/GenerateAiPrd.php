<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use EchoLabs\Prism\Prism;
use App\Models\ProjectRequirement;
use App\Models\Consultation;
use Exception;

class GenerateAiPrd implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $consultationId;
    public $projectId;

    public function __construct($consultationId, $projectId)
    {
        $this->consultationId = $consultationId;
        $this->projectId = $projectId;
    }

    public function handle(): void
    {
        $consultation = Consultation::with('messages')->find($this->consultationId);

        if (!$consultation)
            return;

        // Extract chat logs
        $chatHistory = $consultation->messages->pluck('message')->implode("\n");

        $systemPrompt = "Kamu adalah System Architect. Analisis chat berikut dan isi template JSON di bawah. Kamu WAJIB mengembalikan output HANYA dalam format JSON berikut tanpa teks basa-basi:\n\n{\n  \"project_name\": \"...\",\n  \"developer_section\": {\n    \"database_migrations\": [\"...\"],\n    \"tech_stack\": [\"...\"],\n    \"api_endpoints\": [\"...\"]\n  },\n  \"admin_section\": {\n    \"user_stories\": [\"...\"],\n    \"scope_of_work\": [\"...\"],\n    \"milestones\": [\"...\"]\n  },\n  \"finance_section\": {\n    \"estimated_third_party_cost\": 0,\n    \"package_compliance\": \"...\"\n  }\n}";

        try {
            // Primary AI: Groq
            $response = Prism::using('groq', 'llama3-70b-8192')
                ->generateText()
                ->withSystemMessage($systemPrompt)
                ->withPrompt($chatHistory)();

            $this->savePrd($response->text);
        } catch (Exception $e) {
            // Fallback AI: Gemini
            try {
                $response = Prism::using('gemini', 'gemini-1.5-pro')
                    ->generateText()
                    ->withSystemMessage($systemPrompt)
                    ->withPrompt($chatHistory)();

                $this->savePrd($response->text);
            } catch (Exception $fallbackEx) {
                // Ignore for now
            }
        }
    }

    private function savePrd($jsonText)
    {
        // try to parse JSON
        $decoded = null;
        try {
            $decoded = json_decode($jsonText, true, 512, JSON_THROW_ON_ERROR);
        } catch (Exception $e) {
            $decoded = ['raw' => $jsonText];
        }

        ProjectRequirement::updateOrCreate(
            ['project_id' => $this->projectId],
            ['prd_document' => $decoded]
        );
    }
}
