<?php

use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FeeTypeController;
use App\Http\Controllers\Api\V1\HouseController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ResidentContoller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {

    // ── Houses ──────────────────────────────────────────────────────
    // GET    /api/v1/houses                   → list all houses
    // POST   /api/v1/houses                   → create house
    // GET    /api/v1/houses/{id}              → show single house
    // PUT    /api/v1/houses/{id}              → update house
    // GET    /api/v1/houses/{id}/residents    → list resident history for house
    // POST   /api/v1/houses/{id}/residents    → assign resident to house
    // PUT    /api/v1/houses/{id}/move-out     → mark current resident as moved out
    // GET    /api/v1/houses/{id}/payments     → payment history for house
    Route::apiResource('houses', HouseController::class);
    Route::get('houses/{house}/residents', [HouseController::class, 'residents']);
    Route::post('houses/{house}/residents', [HouseController::class, 'assignResident']);
    Route::put('houses/{house}/move-out', [HouseController::class, 'moveOut']);
    Route::get('houses/{house}/payments', [HouseController::class, 'payments']);

    // ── Residents ────────────────────────────────────────────────────
    // GET    /api/v1/residents                → list residents
    // POST   /api/v1/residents                → create resident
    // GET    /api/v1/residents/{id}           → show resident
    // PUT    /api/v1/residents/{id}           → update resident
    // DELETE /api/v1/residents/{id}           → soft delete resident
    Route::apiResource('residents', ResidentContoller::class);

    // ── Payments ─────────────────────────────────────────────────────
    // GET    /api/v1/payments                 → list payments (?month=2025-01&house_id=x)
    // POST   /api/v1/payments                 → record payment
    // GET    /api/v1/payments/{id}            → show payment
    // PUT    /api/v1/payments/{id}            → update payment
    // DELETE /api/v1/payments/{id}            → delete payment
    Route::apiResource('payments', PaymentController::class);

    // ── Expenses ─────────────────────────────────────────────────────
    // GET    /api/v1/expenses                 → list expenses (?month=2025-01)
    // POST   /api/v1/expenses                 → record expense
    // GET    /api/v1/expenses/{id}            → show expense
    // PUT    /api/v1/expenses/{id}            → update expense
    // DELETE /api/v1/expenses/{id}            → delete expense
    Route::apiResource('expenses', ExpenseController::class);

    // ── Fee Types ────────────────────────────────────────────────────
    // GET    /api/v1/fee-types                → list active fee types
    Route::apiResource('fee-types', FeeTypeController::class)->only(['index', 'show']);

    // ── Reports ──────────────────────────────────────────────────────
    // GET    /api/v1/reports/monthly-summary?year=2025    → yearly chart data
    // GET    /api/v1/reports/monthly-detail?month=2025-01 → single month breakdown
    // GET    /api/v1/reports/payment-status?month=2025-01 → who paid / who hasn't
    Route::prefix('reports')->group(function () {
        Route::get('monthly-summary', [ReportController::class, 'monthlySummary']);
        Route::get('monthly-detail', [ReportController::class, 'monthlyDetail']);
        Route::get('payment-status', [ReportController::class, 'paymentStatus']);
    });
});