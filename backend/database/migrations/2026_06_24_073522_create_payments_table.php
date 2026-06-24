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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('house_id')->constrained();
            $table->foreignUuid('resident_id')->constrained();
            $table->foreignUuid('fee_type_id')->constrained();
            $table->unsignedInteger('amount');                 // actual amount paid
            $table->string('billing_month');                   // "2025-01" format
            $table->string('billing_year')->nullable();        // for annual payments: "2025"
            $table->integer('months_covered')->default(1);     // 1 = monthly, 12 = full year
            $table->enum('status', ['paid', 'unpaid', 'partial'])->default('unpaid');
            $table->date('paid_at')->nullable();
            $table->string('payment_method')->nullable();      // cash, transfer, etc.
            $table->string('receipt_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Prevent duplicate payment entry for same house+fee+month
            $table->unique(['house_id', 'fee_type_id', 'billing_month'], 'unique_payment_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
