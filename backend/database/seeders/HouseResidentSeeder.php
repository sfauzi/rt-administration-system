<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\Resident;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HouseResidentSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil semua rumah dan resident yang sudah di-seed
        // Houses: A1–A15 permanent, B1–B5 temporary
        // Residents: 15 permanent + 3 contract

        $permanentHouses  = House::where('house_type', 'permanent')
            ->orderBy('house_number')
            ->get();

        $temporaryHouses  = House::where('house_type', 'temporary')
            ->orderBy('house_number')
            ->get();

        $permanentResidents = Resident::where('resident_type', 'permanent')
            ->orderBy('created_at')
            ->get();

        $contractResidents  = Resident::where('resident_type', 'contract')
            ->orderBy('created_at')
            ->get();

        // ── 1. Assign 15 permanent residents ke 15 permanent houses ────────────
        foreach ($permanentHouses as $index => $house) {
            $resident = $permanentResidents[$index] ?? null;
            if (!$resident) continue;

            HouseResident::create([
                'id'           => Str::uuid(),
                'house_id'     => $house->id,
                'resident_id'  => $resident->id,
                'move_in_date' => '2023-01-01',  // Sudah lama tinggal
                'move_out_date'=> null,
                'is_current'   => true,
                'notes'        => 'Penghuni awal perumahan',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // Update house jadi occupied
            $house->update(['occupancy_status' => 'occupied']);
        }

        // ── 2. Assign 3 contract residents ke 3 temporary houses (B1, B2, B3) ──
        foreach ($contractResidents as $index => $resident) {
            $house = $temporaryHouses[$index] ?? null;
            if (!$house) continue;

            HouseResident::create([
                'id'           => Str::uuid(),
                'house_id'     => $house->id,
                'resident_id'  => $resident->id,
                'move_in_date' => $resident->contract_start_date,
                'move_out_date'=> null,
                'is_current'   => true,
                'notes'        => 'Penghuni kontrak',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // Update house jadi occupied
            $house->update(['occupancy_status' => 'occupied']);
        }

        // B4 dan B5 tetap vacant (tidak ada resident yang assign)
    }
}
