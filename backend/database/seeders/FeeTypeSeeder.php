<?php

namespace Database\Seeders;

use App\Models\FeeType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FeeTypeSeeder extends Seeder
{
    public function run(): void
    {
        FeeType::insert([
            [
                'id' => Str::uuid(),
                'name' => 'Security Guard Fee',
                'slug' => 'security',
                'amount' => 100000,
                'billing_cycle' => 'monthly',
                'description' => 'Monthly security guard (satpam) fee',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Cleaning Fee',
                'slug' => 'cleaning',
                'amount' => 15000,
                'billing_cycle' => 'monthly',
                'description' => 'Monthly cleaning (kebersihan) fee',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
