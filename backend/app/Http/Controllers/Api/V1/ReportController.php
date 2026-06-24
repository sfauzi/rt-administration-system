<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\FeeType;
use App\Models\House;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // GET /api/v1/reports/monthly-summary?year=2025
    // Returns 12-month chart data: income vs expenses per month
    public function monthlySummary(Request $request): array
    {
        $year = $request->get('year', now()->year);

        $months = collect(range(1, 12))->map(function ($month) use ($year) {
            $monthStr = sprintf('%d-%02d', $year, $month);

            $income = Payment::where('billing_month', $monthStr)
                ->where('status', 'paid')
                ->sum('amount');

            $expenses = Expense::where('expense_month', $monthStr)
                ->sum('amount');

            return [
                'month' => $monthStr,
                'month_label' => Carbon::create($year, $month)->format('M'),
                'income' => $income,
                'expenses' => $expenses,
                'balance' => $income - $expenses,
            ];
        });

        $totalIncome = $months->sum('income');
        $totalExpenses = $months->sum('expenses');

        return [
            'year' => $year,
            'data' => $months,
            'summary' => [
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'net_balance' => $totalIncome - $totalExpenses,
            ],
        ];
    }

    // GET /api/v1/reports/monthly-detail?month=2025-01
    // Returns detailed breakdown for a specific month
    public function monthlyDetail(Request $request): array
    {
        $month = $request->get('month', now()->format('Y-m'));

        $payments = Payment::with(['house', 'resident', 'feeType'])
            ->where('billing_month', $month)
            ->get();

        $expenses = Expense::where('expense_month', $month)->get();

        $totalIncome = $payments->where('status', 'paid')->sum('amount');
        $totalExpenses = $expenses->sum('amount');

        return [
            'month' => $month,
            'income' => [
                'total' => $totalIncome,
                'paid_count' => $payments->where('status', 'paid')->count(),
                'unpaid_count' => $payments->where('status', 'unpaid')->count(),
                'items' => $payments->map(fn ($p) => [
                    'id' => $p->id,
                    'house_number' => $p->house->house_number,
                    'resident_name' => $p->resident->full_name,
                    'fee_type' => $p->feeType->name,
                    'amount' => $p->amount,
                    'status' => $p->status,
                    'paid_at' => $p->paid_at?->format('Y-m-d'),
                ]),
            ],
            'expenses' => [
                'total' => $totalExpenses,
                'items' => $expenses->map(fn ($e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'category' => $e->category,
                    'amount' => $e->amount,
                    'expense_date' => $e->expense_date->format('Y-m-d'),
                ]),
            ],
            'balance' => $totalIncome - $totalExpenses,
        ];
    }

    // GET /api/v1/reports/payment-status?month=2025-01
    // Shows which houses/residents have paid or not for a month
    public function paymentStatus(Request $request): array
    {
        $month = $request->get('month', now()->format('Y-m'));
        $feeTypes = FeeType::where('is_active', true)->get();

        $houses = House::with(['currentResident'])
            ->where('occupancy_status', 'occupied')
            ->orderBy('house_number')
            ->get();

        $result = $houses->map(function ($house) use ($month, $feeTypes) {
            $feeStatuses = $feeTypes->map(function ($feeType) use ($house, $month) {
                $payment = Payment::where('house_id', $house->id)
                    ->where('fee_type_id', $feeType->id)
                    ->where('billing_month', $month)
                    ->first();

                return [
                    'fee_type_id' => $feeType->id,
                    'fee_type_name' => $feeType->name,
                    'amount_due' => $feeType->amount,
                    'status' => $payment?->status ?? 'unpaid',
                    'paid_amount' => $payment?->amount ?? 0,
                    'paid_at' => $payment?->paid_at?->format('Y-m-d'),
                    'payment_id' => $payment?->id,
                ];
            });

            return [
                'house_id' => $house->id,
                'house_number' => $house->house_number,
                'resident_name' => $house->currentResident?->full_name ?? '—',
                'fee_statuses' => $feeStatuses,
                'all_paid' => $feeStatuses->every(fn ($f) => $f['status'] === 'paid'),
            ];
        });

        return [
            'month' => $month,
            'houses' => $result,
        ];
    }
}
