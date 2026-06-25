<?php

namespace Database\Seeders;

use App\Models\FeeType;
use App\Models\House;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\Resident;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $feeTypes = FeeType::all()->keyBy('slug');
        $security = $feeTypes['security'];   // Rp 100.000
        $cleaning = $feeTypes['cleaning'];   // Rp 15.000

        // Ambil semua house yang occupied beserta current resident
        $occupiedHouseResidents = HouseResident::with(['house', 'resident'])
            ->where('is_current', true)
            ->get();

        // Generate payment untuk 6 bulan terakhir: Jan–Jun 2026
        $months = [
            '2026-01', '2026-02', '2026-03',
            '2026-04', '2026-05', '2026-06',
        ];

        foreach ($occupiedHouseResidents as $hr) {
            $house    = $hr->house;
            $resident = $hr->resident;

            // Skip kalau rumah temporary dan resident baru masuk setelah bulan tersebut
            $moveInMonth = substr($hr->move_in_date, 0, 7); // "YYYY-MM"

            foreach ($months as $month) {
                // Jangan buat payment untuk bulan sebelum resident masuk
                if ($month < $moveInMonth) continue;

                // ── Security Fee (Satpam) ──────────────────────────────────
                // Variasi: beberapa bulan belum bayar, beberapa sudah
                $securityStatus = $this->determineStatus($month, $house->house_number, 'security');

                Payment::create([
                    'id'             => Str::uuid(),
                    'house_id'       => $house->id,
                    'resident_id'    => $resident->id,
                    'fee_type_id'    => $security->id,
                    'amount'         => $security->amount,
                    'billing_month'  => $month,
                    'billing_year'   => substr($month, 0, 4),
                    'months_covered' => 1,
                    'status'         => $securityStatus['status'],
                    'paid_at'        => $securityStatus['paid_at'],
                    'payment_method' => $securityStatus['method'],
                    'receipt_number' => $securityStatus['status'] === 'paid'
                        ? 'RCP-' . strtoupper(Str::random(6))
                        : null,
                    'notes'          => null,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                // ── Cleaning Fee (Kebersihan) ──────────────────────────────
                $cleaningStatus = $this->determineStatus($month, $house->house_number, 'cleaning');

                Payment::create([
                    'id'             => Str::uuid(),
                    'house_id'       => $house->id,
                    'resident_id'    => $resident->id,
                    'fee_type_id'    => $cleaning->id,
                    'amount'         => $cleaning->amount,
                    'billing_month'  => $month,
                    'billing_year'   => substr($month, 0, 4),
                    'months_covered' => 1,
                    'status'         => $cleaningStatus['status'],
                    'paid_at'        => $cleaningStatus['paid_at'],
                    'payment_method' => $cleaningStatus['method'],
                    'receipt_number' => $cleaningStatus['status'] === 'paid'
                        ? 'RCP-' . strtoupper(Str::random(6))
                        : null,
                    'notes'          => null,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }
    }

    /**
     * Tentukan status payment berdasarkan bulan dan nomor rumah.
     * Simulasi realistic: bulan lama sudah lunas, bulan baru ada yang belum.
     */
    private function determineStatus(string $month, string $houseNumber, string $feeSlug): array
    {
        $paid = [
            'status'  => 'paid',
            'paid_at' => $month . '-05',  // Biasanya bayar tanggal 5
            'method'  => $this->randomMethod(),
        ];
        $unpaid = [
            'status'  => 'unpaid',
            'paid_at' => null,
            'method'  => null,
        ];

        // Bulan Jan–Apr: semua sudah bayar (data historis)
        if ($month <= '2026-04') return $paid;

        // Bulan Mei: hampir semua bayar kecuali beberapa rumah
        if ($month === '2026-05') {
            // Rumah B1, B3 belum bayar kebersihan di Mei
            if ($feeSlug === 'cleaning' && in_array($houseNumber, ['B1', 'B3'])) {
                return $unpaid;
            }
            return $paid;
        }

        // Bulan Juni (bulan terkini): campuran paid dan unpaid
        if ($month === '2026-06') {
            // Rumah A-number genap sudah bayar, ganjil belum
            $number = (int) filter_var($houseNumber, FILTER_SANITIZE_NUMBER_INT);
            if ($number % 2 === 0) return $paid;

            // Satpam: rumah B bayar, rumah A ganjil belum
            if ($feeSlug === 'security' && str_starts_with($houseNumber, 'B')) return $paid;

            return $unpaid;
        }

        return $paid;
    }

    private function randomMethod(): string
    {
        $methods = ['cash', 'cash', 'cash', 'bank_transfer', 'qris'];
        return $methods[array_rand($methods)];
    }
}
