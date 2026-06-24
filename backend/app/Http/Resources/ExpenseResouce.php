<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResouce extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'category'      => $this->category,
            'amount'        => $this->amount,
            'expense_date'  => $this->expense_date?->format('Y-m-d'),
            'expense_month' => $this->expense_month,
            'description'   => $this->description,
            'receipt_photo' => $this->receipt_photo
                ? asset('storage/' . $this->receipt_photo)
                : null,
            'is_recurring'  => $this->is_recurring,
            'created_at'    => $this->created_at,
        ];
    }
}
