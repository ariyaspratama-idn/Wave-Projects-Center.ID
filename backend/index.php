<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

/*
|--------------------------------------------------------------------------
| Setup Vercel Storage
|--------------------------------------------------------------------------
|
| AWS Lambda (Vercel) only allows writing to the /tmp directory.
| So we must configure Laravel to use /tmp/storage.
|
*/
$app->useStoragePath($_ENV['APP_STORAGE'] ?? '/tmp/storage');

// Create required standard Laravel storage folders if they do not exist
$storageDirs = [
    '/app/public',
    '/framework/cache/data',
    '/framework/sessions',
    '/framework/testing',
    '/framework/views',
    '/logs',
];

foreach ($storageDirs as $dir) {
    if (!is_dir($app->storagePath() . $dir)) {
        mkdir($app->storagePath() . $dir, 0777, true);
    }
}

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
)->send();

$kernel->terminate($request, $response);
