<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class House extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'house_number',
        'address',
        'house_type',
        'occupancy_status',
        'notes',
    ];

    // All historical residents (pivot records)
    public function houseResidents(): HasMany
    {
        return $this->hasMany(HouseResident::class);
    }

    // Only the current occupant's pivot record
    public function currentHouseResident(): HasOne
    {
        return $this->hasOne(HouseResident::class)->where('is_current', true);
    }

    // Current resident (through pivot)
    public function currentResident()
    {
        return $this->hasOneThrough(
            Resident::class,
            HouseResident::class,
            'house_id',
            'id',
            'id',
            'resident_id'
        )->where('house_residents.is_current', true);
    }

    // All residents (historical)
    public function residents(): BelongsToMany
    {
        return $this->belongsToMany(Resident::class, 'house_residents')
            ->withPivot(['move_in_date', 'move_out_date', 'is_current', 'notes'])
            ->withTimestamps()
            ->orderByPivot('move_in_date', 'desc');
    }

    // Payment records for this house
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
