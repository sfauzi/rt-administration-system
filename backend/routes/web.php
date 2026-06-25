<?php

use App\Http\Controllers\SsoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// ── SSO Routes ────────────────────────────────────────────────────────────────
// GET /admin/sso/authorize  → entry point dari Next.js
// GET /admin/sso/callback   → dipanggil setelah Filament login sukses

Route::prefix('admin/sso')->name('sso.')->group(function () {
    // Entry point: Next.js redirect user ke sini
    Route::get('authorize', [SsoController::class, 'authorize'])->name('authorize');

    // Callback: dipanggil setelah Filament login berhasil
    Route::get('callback', [SsoController::class, 'callback'])
        ->middleware('auth')  // pastikan sudah login
        ->name('callback');
});