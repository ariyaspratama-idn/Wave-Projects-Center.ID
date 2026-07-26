<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $update = $request->all();

        if (isset($update['message'])) {
            $chatId = $update['message']['chat']['id'];
            $text = $update['message']['text'] ?? '';
            $firstName = $update['message']['from']['first_name'] ?? 'User';

            if (str_starts_with($text, '/start')) {
                // Check if it has a deep link parameter (e.g. /start sync_2)
                $parts = explode(' ', $text);
                if (count($parts) > 1 && str_starts_with($parts[1], 'sync_')) {
                    $userId = str_replace('sync_', '', $parts[1]);
                    $user = User::find($userId);
                    if ($user) {
                        $user->telegram_id = $chatId;
                        $user->save();
                        $replyText = "Halo *{$user->name}*, akun Wave Projects Anda berhasil dihubungkan ke Telegram! Notifikasi sistem akan dikirimkan ke chat ini.";
                    } else {
                        $replyText = "Maaf, link sinkronisasi tidak valid atau pengguna tidak ditemukan di sistem Wave Projects.";
                    }
                } else {
                    $replyText = "Halo, {$firstName}!\n\nTelegram ID (Chat ID) kamu adalah: `{$chatId}`\n\nSilakan masukkan ID ini secara manual ke profil Dashboard Admin jika tidak menggunakan link undangan otomatis.";
                }

                $token = env('TELEGRAM_BOT_TOKEN');
                if ($token) {
                    try {
                        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                            'chat_id' => $chatId,
                            'text' => $replyText,
                            'parse_mode' => 'Markdown'
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Telegram webhook reply failed: " . $e->getMessage());
                    }
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
