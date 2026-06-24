<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@rt.local'],
            [
                'name'     => 'Ketua RT',
                'email'    => 'admin@rt.local',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );
    }
}
