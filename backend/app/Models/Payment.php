<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'house_id',
        'resident_id',
        'fee_type_id',
        'amount',
        'billing_month',
        'billing_year',
        'months_covered',
        'status',
        'paid_at',
        'payment_method',
        'receipt_number',
        'notes',
    ];

    protected $casts = [
        'paid_at' => 'date',
        'months_covered' => 'integer',
        'amount' => 'integer',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }
}
