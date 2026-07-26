<?php

require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = \Illuminate\Http\Request::create('/api/v1/telegram/webhook', 'POST', [
    'message' => [
        'chat' => ['id' => 999998888],
        'text' => '/start sync_1',
        'from' => ['first_name' => 'Tester']
    ]
]);

// Ini akan mencoba mencari user ID 1 dan menyimpannya
$response = app()->handle($request);
echo "Result:\n";
echo $response->getContent() . "\n";

// Cek apakah database benar-benar terupdate
$user = \App\Models\User::find(1);
if ($user) {
    echo "User 1 telegram_id : " . $user->telegram_id . "\n";
} else {
    echo "User 1 not found.\n";
}
