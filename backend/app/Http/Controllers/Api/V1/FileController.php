<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FileController extends Controller
{
    /**
     * Generate Cloudinary Direct Upload Signature
     * POST /api/v1/files/signature
     */
    public function signature(Request $request)
    {
        $timestamp = time();
        $apiSecret = config('services.cloudinary.api_secret', 'MOCK-CLOUDINARY-SECRET');

        // Generate signature for direct-to-cloud upload
        $paramsToSign = [
            'timestamp' => $timestamp,
            'folder' => 'wave-projects',
        ];

        ksort($paramsToSign);
        $stringToSign = http_build_query($paramsToSign) . $apiSecret;
        $signature = sha1($stringToSign);

        return response()->json([
            'success' => true,
            'data' => [
                'signature' => $signature,
                'timestamp' => $timestamp,
                'api_key' => config('services.cloudinary.api_key', 'MOCK-CLOUDINARY-KEY'),
                'cloud_name' => config('services.cloudinary.cloud_name', 'wave-projects'),
                'folder' => 'wave-projects',
            ]
        ]);
    }
}
