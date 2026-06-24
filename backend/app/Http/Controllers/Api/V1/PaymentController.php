<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    // GET /api/v1/payments
    // Filters: ?month=2025-01 &house_id=xxx &resident_id=xxx &status=paid &fee_type_id=xxx
    public function index(Request $request): AnonymousResourceCollection
    {
        $payments = Payment::with(['house', 'resident', 'feeType'])
            ->when(
                $request->month,
                fn($q, $v) => $q->where('billing_month', $v)
            )
            ->when(
                $request->house_id,
                fn($q, $v) => $q->where('house_id', $v)
            )
            ->when(
                $request->resident_id,
                fn($q, $v) => $q->where('resident_id', $v)
            )
            ->when(
                $request->status,
                fn($q, $v) => $q->where('status', $v)
            )
            ->when(
                $request->fee_type_id,
                fn($q, $v) => $q->where('fee_type_id', $v)
            )
            ->orderByDesc('billing_month')
            ->orderBy('created_at')
            ->get();

        return PaymentResource::collection($payments);
    }

    // POST /api/v1/payments
    public function store(Request $request): PaymentResource
    {
        $validated = $request->validate([
            'house_id'       => 'required|uuid|exists:houses,id',
            'resident_id'    => 'required|uuid|exists:residents,id',
            'fee_type_id'    => 'required|uuid|exists:fee_types,id',
            'amount'         => 'required|integer|min:0',
            'billing_month'  => 'required|string|regex:/^\d{4}-\d{2}$/',
            'months_covered' => 'integer|min:1|max:12',
            'status'         => 'required|in:paid,unpaid,partial',
            'paid_at'        => 'nullable|date',
            'payment_method' => 'nullable|string|in:cash,bank_transfer,qris',
            'receipt_number' => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        // Prevent duplicate: same house + fee_type + billing_month
        $exists = Payment::where('house_id', $validated['house_id'])
            ->where('fee_type_id', $validated['fee_type_id'])
            ->where('billing_month', $validated['billing_month'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Payment for this house, fee type, and billing month already exists.',
            ], 422);
        }

        $payment = Payment::create($validated);
        $payment->load(['house', 'resident', 'feeType']);

        return new PaymentResource($payment);
    }

    // GET /api/v1/payments/{payment}
    public function show(Payment $payment): PaymentResource
    {
        $payment->load(['house', 'resident', 'feeType']);

        return new PaymentResource($payment);
    }

    // PUT /api/v1/payments/{payment}
    public function update(Request $request, Payment $payment): PaymentResource
    {
        $validated = $request->validate([
            'amount'         => 'integer|min:0',
            'billing_month'  => 'string|regex:/^\d{4}-\d{2}$/',
            'months_covered' => 'integer|min:1|max:12',
            'status'         => 'in:paid,unpaid,partial',
            'paid_at'        => 'nullable|date',
            'payment_method' => 'nullable|string|in:cash,bank_transfer,qris',
            'receipt_number' => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $payment->update($validated);
        $payment->load(['house', 'resident', 'feeType']);

        return new PaymentResource($payment);
    }

    // DELETE /api/v1/payments/{payment}
    public function destroy(Payment $payment): \Illuminate\Http\JsonResponse
    {
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
