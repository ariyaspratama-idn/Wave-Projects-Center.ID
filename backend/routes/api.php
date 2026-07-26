<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    Route::get('/packages', [\App\Http\Controllers\Api\V1\PackageController::class, 'index']);
    Route::post('/orders/checkout', [\App\Http\Controllers\Api\V1\OrderController::class, 'checkout']);
    Route::post('/payments/callback', [\App\Http\Controllers\Api\V1\PaymentController::class, 'callback']);
    Route::post('/files/signature', [\App\Http\Controllers\Api\V1\FileController::class, 'signature']);
    Route::post('/telegram/webhook', [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'handleWebhook']);

    // Universal Auth Routes
    Route::post('/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [\App\Http\Controllers\Api\V1\AuthController::class, 'me']);
        Route::get('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'index']);
        Route::post('/logout', [\App\Http\Controllers\Api\V1\AuthController::class, 'logout']);

        // PRD Micro-Jobs API
        Route::post('/admin/prd/generate', [\App\Http\Controllers\Api\V1\PrdController::class, 'generate']);

        // Super Admin only route for creating other users
        Route::middleware(\App\Http\Middleware\CheckRole::class . ':Super Admin')->group(function () {
            Route::post('/admin/users/create', [\App\Http\Controllers\Api\V1\AdminController::class, 'createUser']);
        });
    });

    Route::get('/migrate-now', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
            return response()->json(['success' => true, 'output' => \Illuminate\Support\Facades\Artisan::output()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    });
});
