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
        Schema::create('houses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('house_number')->unique();  // e.g. "A1", "B3"
            $table->string('address');
            $table->enum('house_type', ['permanent', 'temporary']);
            // permanent = always billed; temporary = billed only when occupied
            $table->enum('occupancy_status', ['occupied', 'vacant'])->default('vacant');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('houses');
    }
};
