<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained();
            $table->foreignId('client_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('developer_id')->nullable()->references('id')->on('users');

            $table->string('project_name');
            $table->string('domain_url')->nullable();
            $table->string('repository_url')->nullable();

            $table->enum('status', ['briefing', 'designing', 'development', 'testing', 'live', 'maintenance'])->default('briefing');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
