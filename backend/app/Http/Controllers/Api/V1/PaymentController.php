<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Midtrans Webhook Callback
     * POST /api/v1/payments/callback
     */
    public function callback(Request $request)
    {
        // Validate Midtrans Signature Key
        $orderId = $request->input('order_id');
        $statusCode = $request->input('status_code');
        $grossAmount = $request->input('gross_amount');
        $serverKey = config('services.midtrans.server_key', 'MOCK-SERVER-KEY');

        $localSignature = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);

        if ($localSignature !== $request->input('signature_key')) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Signature Key. Callback denied.'
            ], 403);
        }

        // Process payment status update
        // TODO: Update order status in TiDB database
        // TODO: Trigger OneSignal notification to marketing team

        return response()->json([
            'success' => true,
            'message' => 'Payment callback processed successfully'
        ], 202);
    }
}
