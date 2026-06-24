<?php

namespace Database\Seeders;

use App\Models\House;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HouseSeeder extends Seeder
{
    public function run(): void
    {
        // 15 permanent houses (A1-A15)
        foreach (range(1, 15) as $i) {
            House::create([
                'house_number' => "A{$i}",
                'address' => "Jl. Perumahan Elite No. A{$i}",
                'house_type' => 'permanent',
                'occupancy_status' => 'vacant',
            ]);
        }

        // 5 temporary houses (B1-B5)
        foreach (range(1, 5) as $i) {
            House::create([
                'house_number' => "B{$i}",
                'address' => "Jl. Perumahan Elite No. B{$i}",
                'house_type' => 'temporary',
                'occupancy_status' => 'vacant',
            ]);
        }
    }
}
