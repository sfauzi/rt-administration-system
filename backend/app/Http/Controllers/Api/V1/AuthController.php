<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/v1/auth/login
    public function login(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        // Hanya role admin/staff yang boleh login ke Next.js
        if (!in_array($user->role, ['admin', 'staff'])) {
            Auth::logout();
            return response()->json([
                'message' => 'Unauthorized. Only RT administrators can access this system.',
            ], 403);
        }

        // Hapus token lama supaya tidak numpuk
        $user->tokens()->delete();

        // Buat token baru dengan nama device
        $token = $user->createToken('rt-admin-nextjs', ['*'], now()->addDays(7));

        return response()->json([
            'token' => $token->plainTextToken,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
            'expires_at' => now()->addDays(7)->toISOString(),
        ]);
    }

    // POST /api/v1/auth/logout
    public function logout(Request $request): \Illuminate\Http\JsonResponse
    {
        // Hapus hanya token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // GET /api/v1/auth/me
    public function me(Request $request): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'user' => [
                'id'    => $request->user()->id,
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
                'role'  => $request->user()->role,
            ],
        ]);
    }
}
