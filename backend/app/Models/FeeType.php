<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'amount',
        'billing_cycle',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'amount' => 'integer',
    ];

    // Relationship: FeeType has many Payments
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
