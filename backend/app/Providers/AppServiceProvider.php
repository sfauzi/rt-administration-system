<?php

namespace App\Providers;

use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Illuminate\Support\ServiceProvider;
use Filament\Http\Responses\Auth\Contracts\LoginResponse as LoginResponseContract;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(LoginResponse::class, function () {
            return new class implements LoginResponse {
                public function toResponse($request)
                {
                    if (session()->has('sso_redirect_uri')) {
                        return redirect()->route('sso.callback');
                    }

                    return redirect(filament()->getHomeUrl());
                }
            };
        });
    }

    public function boot(): void
    {
        // Event listener sudah tidak perlu, LoginResponse di atas yang handle
    }
}
