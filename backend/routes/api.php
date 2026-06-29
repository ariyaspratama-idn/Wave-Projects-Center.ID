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
});

$migrateClosure = function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        return response()->json(['success' => true, 'output' => \Illuminate\Support\Facades\Artisan::output()]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()]);
    }
};

Route::get('/migrate-now', $migrateClosure);
Route::get('/backend/api/migrate-now', $migrateClosure);
Route::get('/api/backend/api/migrate-now', $migrateClosure);
