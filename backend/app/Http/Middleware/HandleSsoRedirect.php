<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HandleSsoRedirect
{
    public function handle(Request $request, Closure $next)
    {
        // BUGFIX: jangan intercept route sso.callback itu sendiri → infinite loop
        if ($request->routeIs('sso.callback') || $request->routeIs('sso.authorize')) {
            return $next($request);
        }

        if (Auth::check() && session()->has('sso_redirect_uri')) {
            return redirect()->route('sso.callback');
        }

        return $next($request);
    }
}