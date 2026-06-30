<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->nullable()->constrained('users');

            $table->enum('sender_type', ['customer', 'admin', 'ai']);
            $table->longText('message');
            $table->boolean('is_read')->default(false);
            $table->enum('source', ['internal', 'whatsapp', 'telegram', 'email'])->default('internal');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
