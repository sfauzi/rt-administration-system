<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

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
    public function store(Request $request)
    {
        // Validate using the request validator
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
            // Throw validation exception instead of returning JsonResponse
            throw ValidationException::withMessages([
                'billing_month' => 'Payment for this house, fee type, and billing month already exists.',
                'fee_type_id' => 'This fee type has already been paid for the selected month.',
            ]);
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
    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'house_id'       => 'sometimes|uuid|exists:houses,id',
            'resident_id'    => 'sometimes|uuid|exists:residents,id',
            'fee_type_id'    => 'sometimes|uuid|exists:fee_types,id',
            'amount'         => 'sometimes|integer|min:0',
            'billing_month'  => 'sometimes|string|regex:/^\d{4}-\d{2}$/',
            'months_covered' => 'integer|min:1|max:12',
            'status'         => 'sometimes|in:paid,unpaid,partial',
            'paid_at'        => 'nullable|date',
            'payment_method' => 'nullable|string|in:cash,bank_transfer,qris',
            'receipt_number' => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        // Check for duplicate if house_id, fee_type_id, or billing_month changed
        if (isset($validated['house_id']) || isset($validated['fee_type_id']) || isset($validated['billing_month'])) {
            $houseId = $validated['house_id'] ?? $payment->house_id;
            $feeTypeId = $validated['fee_type_id'] ?? $payment->fee_type_id;
            $billingMonth = $validated['billing_month'] ?? $payment->billing_month;

            $exists = Payment::where('house_id', $houseId)
                ->where('fee_type_id', $feeTypeId)
                ->where('billing_month', $billingMonth)
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'billing_month' => 'Another payment already exists for this house, fee type, and billing month.',
                ]);
            }
        }

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
