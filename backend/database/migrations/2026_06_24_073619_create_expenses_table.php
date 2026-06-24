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
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');                           // e.g. "Gaji Satpam Januari"
            $table->string('category');                        // 'salary', 'electricity', 'maintenance', 'other'
            $table->unsignedInteger('amount');
            $table->date('expense_date');
            $table->string('expense_month');                   // "2025-01" for quick filtering
            $table->text('description')->nullable();
            $table->string('receipt_photo')->nullable();
            $table->boolean('is_recurring')->default(false);   // flag for monthly recurring items
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
