<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fee_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');                    // e.g. "Security Guard Fee"
            $table->string('slug')->unique();          // e.g. "security", "cleaning"
            $table->unsignedInteger('amount');         // in IDR, e.g. 100000
            $table->string('billing_cycle');           // 'monthly' | 'annual_option'
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_types');
    }
};
