<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'category',
        'amount',
        'expense_date',
        'expense_month',
        'description',
        'receipt_photo',
        'is_recurring',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'integer',
        'is_recurring' => 'boolean',
    ];
}
