<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        // Validasi payload pesanan dari API
        $validated = $request->validate([
            'client_name' => 'required|string',
            'client_email' => 'required|email',
            'package_id' => 'required|string',
            'github_url' => 'nullable|url',
        ]);

        $idempotencyKey = $request->header('X-Idempotency-Key');

        // Simulasi integrasi Midtrans Snap API
        $snapToken = 'simulated-snap-token-laravel-' . uniqid();

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => [
                'order_number' => 'WAVE-' . date('Y') . '-' . rand(1000, 9999),
                'payment_status' => 'pending',
                'snap_token' => $snapToken,
                'idempotency_key' => $idempotencyKey
            ]
        ], 201);
    }
}
