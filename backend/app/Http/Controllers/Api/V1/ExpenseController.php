<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseResouce;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    // GET /api/v1/expenses
    // Filters: ?month=2025-01 &category=salary &is_recurring=true
    public function index(Request $request): AnonymousResourceCollection
    {
        $expenses = Expense::query()
            ->when(
                $request->month,
                fn ($q, $v) => $q->where('expense_month', $v)
            )
            ->when(
                $request->category,
                fn ($q, $v) => $q->where('category', $v)
            )
            ->when(
                $request->has('is_recurring'),
                fn ($q) => $q->where('is_recurring', $request->boolean('is_recurring'))
            )
            ->orderByDesc('expense_date')
            ->get();

        return ExpenseResouce::collection($expenses);
    }

    // POST /api/v1/expenses
    public function store(Request $request): ExpenseResouce
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'category'      => 'required|in:salary,electricity,maintenance,other',
            'amount'        => 'required|integer|min:0',
            'expense_date'  => 'required|date',
            'expense_month' => 'nullable|string|regex:/^\d{4}-\d{2}$/',
            'description'   => 'nullable|string',
            'is_recurring'  => 'boolean',
            'receipt_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Auto-derive expense_month from expense_date if not provided
        if (empty($validated['expense_month'])) {
            $validated['expense_month'] = \Carbon\Carbon::parse($validated['expense_date'])
                ->format('Y-m');
        }

        // Handle receipt photo upload
        if ($request->hasFile('receipt_photo')) {
            $validated['receipt_photo'] = $request->file('receipt_photo')
                ->store('expense-receipts', 'public');
        }

        $expense = Expense::create($validated);

        return new ExpenseResource($expense);
    }

    // GET /api/v1/expenses/{expense}
    public function show(Expense $expense): ExpenseResource
    {
        return new ExpenseResource($expense);
    }

    // PUT /api/v1/expenses/{expense}
    public function update(Request $request, Expense $expense): ExpenseResource
    {
        $validated = $request->validate([
            'title'         => 'string|max:255',
            'category'      => 'in:salary,electricity,maintenance,other',
            'amount'        => 'integer|min:0',
            'expense_date'  => 'date',
            'expense_month' => 'nullable|string|regex:/^\d{4}-\d{2}$/',
            'description'   => 'nullable|string',
            'is_recurring'  => 'boolean',
            'receipt_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('receipt_photo')) {
            if ($expense->receipt_photo) {
                Storage::disk('public')->delete($expense->receipt_photo);
            }
            $validated['receipt_photo'] = $request->file('receipt_photo')
                ->store('expense-receipts', 'public');
        }

        $expense->update($validated);

        return new ExpenseResource($expense);
    }

    // DELETE /api/v1/expenses/{expense}
    public function destroy(Expense $expense): \Illuminate\Http\JsonResponse
    {
        if ($expense->receipt_photo) {
            Storage::disk('public')->delete($expense->receipt_photo);
        }

        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully']);
    }
}
