<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'house_id' => $this->house_id,
            'house_number' => $this->whenLoaded('house', fn() => $this->house->house_number),
            'resident_id' => $this->resident_id,
            'resident_name' => $this->whenLoaded('resident', fn() => $this->resident->full_name),
            'fee_type_id' => $this->fee_type_id,
            'fee_type_name' => $this->whenLoaded('feeType', fn() => $this->feeType->name),
            'amount' => $this->amount,
            'billing_month' => $this->billing_month,
            'months_covered' => $this->months_covered,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->format('Y-m-d'),
            'payment_method' => $this->payment_method,
            'receipt_number' => $this->receipt_number,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
        ];
    }
}
