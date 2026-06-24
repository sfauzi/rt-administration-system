<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resident extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'full_name',
        'phone_number',
        'id_card_photo',
        'resident_type',
        'is_married',
        'contract_start_date',
        'contract_end_date',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_married' => 'boolean',
        'is_active' => 'boolean',
        'contract_start_date' => 'date',
        'contract_end_date' => 'date',
    ];

    // All house records (history)
    public function houseResidents(): HasMany
    {
        return $this->hasMany(HouseResident::class);
    }

    // Houses this resident has lived in
    public function houses(): BelongsToMany
    {
        return $this->belongsToMany(House::class, 'house_residents')
            ->withPivot(['move_in_date', 'move_out_date', 'is_current'])
            ->withTimestamps();
    }

    // Payment records
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Accessor: KTP photo full URL
    public function getIdCardPhotoUrlAttribute(): ?string
    {
        return $this->id_card_photo
            ? asset('storage/' . $this->id_card_photo)
            : null;
    }
}
