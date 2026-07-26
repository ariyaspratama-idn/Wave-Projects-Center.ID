<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PrdController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'chat_transcript' => 'required|string',
            'package_type' => 'nullable|string'
        ]);

        $packageType = $request->input('package_type');
        $chatTranscript = $request->input('chat_transcript');

        if (!$packageType) {
            try {
                $prompt = "Baca chat ini. Tentukan HANYA SATU KATA paket apa yang paling cocok untuk klien ini: Starter, Standard, atau Ultimate.\n\nChat: " . $chatTranscript;
                $response = \EchoLabs\Prism\Prism::using('gemini', 'gemini-2.5-flash')
                    ->generateText()
                    ->withPrompt($prompt)();

                $detected = trim(strtolower($response->text));

                if (str_contains($detected, 'starter'))
                    $packageType = 'Starter';
                elseif (str_contains($detected, 'standard'))
                    $packageType = 'Standard';
                elseif (str_contains($detected, 'ultimate'))
                    $packageType = 'Ultimate';
                else
                    $packageType = 'Standard'; // fallback
            } catch (\Exception $e) {
                $packageType = 'Standard'; // fallback on error
            }
        }

        $generation = \App\Models\PrdGeneration::create([
            'project_id' => $request->input('project_id'),
            'chat_transcript' => $chatTranscript,
            'package_type' => $packageType,
            'status' => 'processing'
        ]);

        \Illuminate\Support\Facades\Bus::chain([
            new \App\Jobs\GenerateBusinessScope($generation->id),
            new \App\Jobs\GenerateArchitectureDB($generation->id),
            new \App\Jobs\GenerateUIDesign($generation->id),
            new \App\Jobs\GenerateDevOpsLegal($generation->id),
            new \App\Jobs\CompileFinalPrdJob($generation->id),
        ])->dispatch();

        return response()->json([
            'success' => true,
            'message' => 'Baik, Kak. Semua kebutuhan sistem dan fitur sudah saya catat dengan detail. Tim internal kami sedang menyusun analisis teknisnya. Admin kami akan segera menghubungi Kakak untuk tahap selanjutnya.',
            'generation_id' => $generation->id
        ]);
    }
}
