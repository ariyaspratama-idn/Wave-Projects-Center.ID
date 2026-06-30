<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_admin_id')->nullable()->references('id')->on('users');

            $table->boolean('is_ai_enabled')->default(true);

            $table->enum('status', ['open', 'resolved', 'closed'])->default('open');
            $table->text('ai_summary_preference')->nullable();
            $table->foreignId('recommended_package_id')->nullable()->references('id')->on('packages');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
