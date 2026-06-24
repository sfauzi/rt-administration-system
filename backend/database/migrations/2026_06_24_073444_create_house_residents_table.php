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
        Schema::create('house_residents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('house_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('resident_id')->constrained()->cascadeOnDelete();
            $table->date('move_in_date');
            $table->date('move_out_date')->nullable();          // null = currently living there
            $table->boolean('is_current')->default(true);      // quick filter for current occupant
            $table->text('notes')->nullable();
            $table->timestamps();

            // Only one current occupant per house at a time
            $table->unique(['house_id', 'is_current'], 'unique_current_occupant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('house_residents');
    }
};
