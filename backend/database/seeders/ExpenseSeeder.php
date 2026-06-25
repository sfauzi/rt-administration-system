<?php

namespace Database\Seeders;

use App\Models\Expense;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $expenses = [

            // ── Januari 2026 ────────────────────────────────────────────────
            [
                'title'         => 'Gaji Satpam - Januari 2026',
                'category'      => 'salary',
                'amount'        => 1500000,
                'expense_date'  => '2026-01-31',
                'expense_month' => '2026-01',
                'description'   => 'Gaji bulanan satpam Pak Slamet',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Token Listrik Pos Satpam - Januari 2026',
                'category'      => 'electricity',
                'amount'        => 150000,
                'expense_date'  => '2026-01-10',
                'expense_month' => '2026-01',
                'description'   => 'Token listrik pos satpam dan lampu jalan',
                'is_recurring'  => true,
            ],

            // ── Februari 2026 ────────────────────────────────────────────────
            [
                'title'         => 'Gaji Satpam - Februari 2026',
                'category'      => 'salary',
                'amount'        => 1500000,
                'expense_date'  => '2026-02-28',
                'expense_month' => '2026-02',
                'description'   => 'Gaji bulanan satpam Pak Slamet',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Token Listrik Pos Satpam - Februari 2026',
                'category'      => 'electricity',
                'amount'        => 150000,
                'expense_date'  => '2026-02-08',
                'expense_month' => '2026-02',
                'description'   => 'Token listrik pos satpam dan lampu jalan',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Perbaikan Paving Block Jalan Utama',
                'category'      => 'maintenance',
                'amount'        => 850000,
                'expense_date'  => '2026-02-15',
                'expense_month' => '2026-02',
                'description'   => 'Penggantian paving block yang rusak di jalan utama depan blok A',
                'is_recurring'  => false,
            ],

            // ── Maret 2026 ───────────────────────────────────────────────────
            [
                'title'         => 'Gaji Satpam - Maret 2026',
                'category'      => 'salary',
                'amount'        => 1500000,
                'expense_date'  => '2026-03-31',
                'expense_month' => '2026-03',
                'description'   => 'Gaji bulanan satpam Pak Slamet',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Token Listrik Pos Satpam - Maret 2026',
                'category'      => 'electricity',
                'amount'        => 175000,
                'expense_date'  => '2026-03-07',
                'expense_month' => '2026-03',
                'description'   => 'Token listrik pos satpam dan lampu jalan',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Pembelian Sapu dan Alat Kebersihan',
                'category'      => 'other',
                'amount'        => 320000,
                'expense_date'  => '2026-03-20',
                'expense_month' => '2026-03',
                'description'   => 'Sapu, pengki, kantong sampah untuk kebersihan lingkungan',
                'is_recurring'  => false,
            ],

            // ── April 2026 ───────────────────────────────────────────────────
            [
                'title'         => 'Gaji Satpam - April 2026',
                'category'      => 'salary',
                'amount'        => 1500000,
                'expense_date'  => '2026-04-30',
                'expense_month' => '2026-04',
                'description'   => 'Gaji bulanan satpam Pak Slamet',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Token Listrik Pos Satpam - April 2026',
                'category'      => 'electricity',
                'amount'        => 150000,
                'expense_date'  => '2026-04-09',
                'expense_month' => '2026-04',
                'description'   => 'Token listrik pos satpam dan lampu jalan',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Perbaikan Selokan Blok B',
                'category'      => 'maintenance',
                'amount'        => 1200000,
                'expense_date'  => '2026-04-18',
                'expense_month' => '2026-04',
                'description'   => 'Pembersihan dan perbaikan selokan tersumbat di area blok B',
                'is_recurring'  => false,
            ],
            [
                'title'         => 'Pengecatan Palang Portal Masuk',
                'category'      => 'maintenance',
                'amount'        => 450000,
                'expense_date'  => '2026-04-25',
                'expense_month' => '2026-04',
                'description'   => 'Cat ulang palang portal dan pos satpam',
                'is_recurring'  => false,
            ],

            // ── Mei 2026 ─────────────────────────────────────────────────────
            [
                'title'         => 'Gaji Satpam - Mei 2026',
                'category'      => 'salary',
                'amount'        => 1500000,
                'expense_date'  => '2026-05-31',
                'expense_month' => '2026-05',
                'description'   => 'Gaji bulanan satpam Pak Slamet',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Token Listrik Pos Satpam - Mei 2026',
                'category'      => 'electricity',
                'amount'        => 160000,
                'expense_date'  => '2026-05-06',
                'expense_month' => '2026-05',
                'description'   => 'Token listrik pos satpam dan lampu jalan',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Penggantian Lampu Jalan PJU',
                'category'      => 'maintenance',
                'amount'        => 680000,
                'expense_date'  => '2026-05-14',
                'expense_month' => '2026-05',
                'description'   => 'Penggantian 4 unit lampu PJU yang mati di area perumahan',
                'is_recurring'  => false,
            ],

            // ── Juni 2026 ────────────────────────────────────────────────────
            [
                'title'         => 'Gaji Satpam - Juni 2026',
                'category'      => 'salary',
                'amount'        => 1500000,
                'expense_date'  => '2026-06-30',
                'expense_month' => '2026-06',
                'description'   => 'Gaji bulanan satpam Pak Slamet',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Token Listrik Pos Satpam - Juni 2026',
                'category'      => 'electricity',
                'amount'        => 155000,
                'expense_date'  => '2026-06-05',
                'expense_month' => '2026-06',
                'description'   => 'Token listrik pos satpam dan lampu jalan',
                'is_recurring'  => true,
            ],
            [
                'title'         => 'Perbaikan Pagar Blok A Timur',
                'category'      => 'maintenance',
                'amount'        => 950000,
                'expense_date'  => '2026-06-20',
                'expense_month' => '2026-06',
                'description'   => 'Las dan cat ulang pagar besi blok A sisi timur yang berkarat',
                'is_recurring'  => false,
            ],
            [
                'title'         => 'Konsumsi Rapat RT Semester 1',
                'category'      => 'other',
                'amount'        => 275000,
                'expense_date'  => '2026-06-28',
                'expense_month' => '2026-06',
                'description'   => 'Konsumsi rapat evaluasi semester 1 tahun 2026',
                'is_recurring'  => false,
            ],
        ];

        foreach ($expenses as $data) {
            Expense::create(array_merge($data, [
                'id'            => Str::uuid(),
                'receipt_photo' => null,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]));
        }
    }
}
