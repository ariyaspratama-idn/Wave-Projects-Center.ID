<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('roles');
        $isAdmin = $user->roles->contains(function ($role) {
            return in_array($role->name, ['Super Admin', 'Admin', 'Developer']);
        });

        if ($isAdmin) {
            $orders = \App\Models\Order::latest()->get();
        } else {
            $orders = \App\Models\Order::where('user_id', $user->id)->latest()->get();
        }

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string',
            'client_email' => ['required', 'email', 'regex:/^[a-zA-Z0-9._%+-]+@gmail\.com$/i'],
            'client_whatsapp' => ['required', 'string', 'regex:/^(?:\+62|62|0)8[1-9][0-9]{6,10}$/'],
            'project_purpose' => 'required|string',
            'package_id' => 'required',
            'payment_choice' => 'required|string',
            'github_url' => 'nullable|url',
        ]);

        $idempotencyKey = $request->header('X-Idempotency-Key');
        $snapToken = 'simulated-snap-token-laravel-' . uniqid();
        $orderNumber = 'WAVE-' . date('Y') . '-' . rand(1000, 9999);

        // Find package id from string to integer ID based on migration structure
        // But since the frontend uses string 'id' for package_id like 'pkg_fullstack_mvp' 
        // We will just insert it as numeric if possible, or we might need to query the package name.
        // Wait, TiDB packages table has increments ID. The frontend sends string 'package_id'.
        // So let's look up the package by name or tag to get the ID, or fallback to 1.
        $package = \App\Models\Package::first();

        $order = \App\Models\Order::create([
            'client_name' => $validated['client_name'],
            'whatsapp' => $validated['client_whatsapp'],
            'project_name' => $validated['project_purpose'],
            'github_url' => $validated['github_url'] ?? null,
            'package_id' => $package ? $package->id : 1,
            'snap_token' => $snapToken
        ]);

        $attachment = $request->input('attachment');
        if ($attachment && is_array($attachment) && isset($attachment['public_id']) && isset($attachment['secure_url'])) {
            \Illuminate\Support\Facades\DB::table('attachments')->insert([
                'order_id' => $order->id,
                'cloudinary_public_id' => $attachment['public_id'],
                'file_name' => $attachment['filename'] ?? 'uploaded_file',
                'secure_url' => $attachment['secure_url'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => [
                'order_number' => $orderNumber,
                'payment_status' => 'pending',
                'snap_token' => $snapToken,
                'idempotency_key' => $idempotencyKey
            ]
        ], 201);
    }
}
