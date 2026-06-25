<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SsoController extends Controller
{
    // GET /admin/sso/authorize?redirect_uri=https://app.vercel.app/auth/callback&state=xxx
    //
    // Dipanggil oleh Next.js — redirect user ke sini untuk login.
    // Kalau user sudah login di Filament session, langsung generate token dan redirect balik.
    // Kalau belum, tampilkan Filament login page dulu.
    public function authorize(Request $request)
    {
        $redirectUri = $request->query('redirect_uri');
        $state       = $request->query('state');

        $allowedOrigins = [
            config('app.frontend_url'),
            'http://localhost:3000',
        ];

        $isAllowed = collect($allowedOrigins)->contains(
            fn($origin) => str_starts_with($redirectUri, $origin)
        );

        if (!$isAllowed) {
            abort(403, 'Invalid redirect_uri');
        }

        // Simpan ke session — JANGAN dihapus di sini
        session([
            'sso_redirect_uri' => $redirectUri,
            'sso_state'        => $state,
        ]);

        if (Auth::check()) {
            return $this->generateTokenAndRedirect(Auth::user(), $redirectUri, $state);
        }

        // BUGFIX: pakai redirect biasa, bukan redirect()->guest()
        // guest() menyimpan "intended URL" ke /admin/sso/authorize → loop
        return redirect()->route('filament.admin.auth.login');
    }

    // GET /admin/sso/callback
    //
    // Dipanggil setelah user berhasil login di Filament.
    // Generate SSO token dan redirect ke Next.js.
    public function callback(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('filament.admin.auth.login');
        }

        $redirectUri = session('sso_redirect_uri');
        $state       = session('sso_state');

        // Hapus dari session supaya tidak bisa dipakai dua kali
        session()->forget(['sso_redirect_uri', 'sso_state']);

        if (!$redirectUri) {
            // Tidak ada SSO flow yang pending — arahkan ke admin dashboard
            return redirect(config('filament.path', '/admin'));
        }

        return $this->generateTokenAndRedirect(Auth::user(), $redirectUri, $state);
    }

    // Helper: generate signed token dan redirect ke Next.js
    private function generateTokenAndRedirect($user, string $redirectUri, ?string $state)
    {
        // Hapus token lama untuk user ini
        $user->tokens()->where('name', 'sso-nextjs')->delete();

        // Buat Sanctum token baru — berlaku 7 hari
        $token = $user->createToken('sso-nextjs', ['*'], now()->addDays(7));

        // Build redirect URL ke Next.js dengan token sebagai query param
        // Next.js akan segera tukar ini dengan API call dan hapus dari URL
        $separator   = str_contains($redirectUri, '?') ? '&' : '?';
        $callbackUrl = $redirectUri
            . $separator
            . http_build_query([
                'token' => $token->plainTextToken,
                'state' => $state,
            ]);

        return redirect()->away($callbackUrl);
    }

}
