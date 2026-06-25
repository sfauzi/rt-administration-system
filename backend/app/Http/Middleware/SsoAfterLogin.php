<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SsoAfterLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Setelah login berhasil dan ada SSO redirect pending
        if (Auth::check() && session()->has('sso_redirect_uri')) {
            return redirect()->route('sso.callback');
        }

        return $response;
    }
}
