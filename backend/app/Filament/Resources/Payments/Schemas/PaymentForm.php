<?php

namespace App\Filament\Resources\Payments\Schemas;

use App\Models\FeeType;
use App\Models\House;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;

class PaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Payment Details')->schema([
                    Select::make('house_id')
                        ->label('House')
                        ->options(House::all()->pluck('house_number', 'id'))
                        ->required()
                        ->searchable()
                        ->reactive()
                        ->afterStateUpdated(function ($state, Set $set) {
                            // Reset resident_id when house changes
                            $set('resident_id', null);

                            // Auto-fill resident if only one active resident in the house
                            if ($state) {
                                $house = House::find($state);
                                if ($house) {
                                    $currentResident = $house->residents()
                                        ->wherePivot('is_current', true)
                                        ->first();

                                    if ($currentResident) {
                                        $set('resident_id', $currentResident->id);
                                    }
                                }
                            }
                        }),

                    Select::make('resident_id')
                        ->label('Resident')
                        ->options(function (Get $get) {
                            $houseId = $get('house_id');
                            if (!$houseId) {
                                return [];
                            }

                            $house = House::find($houseId);
                            if (!$house) {
                                return [];
                            }

                            // Get all residents with their current status for better UX
                            return $house->residents()
                                ->select('residents.id', 'residents.full_name')
                                ->get()
                                ->mapWithKeys(function ($resident) use ($house) {
                                    // Check if this resident is current using the pivot relationship
                                    $isCurrent = $resident->pivot->is_current ?? false;
                                    $label = $resident->full_name;
                                    if ($isCurrent) {
                                        $label .= ' (Current)';
                                    }
                                    return [$resident->id => $label];
                                })
                                ->toArray();
                        })
                        ->required()
                        ->searchable()
                        ->reactive(),

                    Select::make('fee_type_id')
                        ->label('Fee Type')
                        ->options(FeeType::where('is_active', true)->pluck('name', 'id'))
                        ->required()
                        ->reactive()
                        ->afterStateUpdated(function ($state, Get $get, Set $set) {
                            // Auto-fill amount when fee type is selected
                            if ($state) {
                                $feeType = FeeType::find($state);
                                if ($feeType) {
                                    $monthsCovered = (int) $get('months_covered') ?: 1;
                                    $set('amount', $feeType->amount * $monthsCovered);
                                }
                            }
                        }),

                    TextInput::make('amount')
                        ->numeric()
                        ->prefix('Rp')
                        ->required()
                        ->reactive(),

                    TextInput::make('billing_month')
                        ->label('Billing Month (YYYY-MM)')
                        ->placeholder('2025-01')
                        ->required()
                        ->default(now()->format('Y-m')),

                    Select::make('months_covered')
                        ->label('Months Covered')
                        ->options([
                            1 => '1 month',
                            3 => '3 months',
                            6 => '6 months',
                            12 => '12 months (1 year)',
                        ])
                        ->default(1)
                        ->required()
                        ->reactive()
                        ->afterStateUpdated(function ($state, Get $get, Set $set) {
                            // Update amount when months covered changes
                            $feeTypeId = $get('fee_type_id');
                            if ($feeTypeId) {
                                $feeType = FeeType::find($feeTypeId);
                                if ($feeType) {
                                    $set('amount', $feeType->amount * (int) $state);
                                }
                            }
                        }),

                    Select::make('status')
                        ->options(['paid' => 'Paid', 'unpaid' => 'Unpaid', 'partial' => 'Partial'])
                        ->required()
                        ->default('paid'),

                    DatePicker::make('paid_at')
                        ->label('Payment Date')
                        ->default(now()),

                    Select::make('payment_method')
                        ->options([
                            'cash' => 'Cash',
                            'bank_transfer' => 'Bank Transfer',
                            'qris' => 'QRIS',
                        ])
                        ->default('cash'),

                    TextInput::make('receipt_number')
                        ->placeholder('Optional receipt number'),

                    Textarea::make('notes')
                        ->placeholder('Optional notes')
                        ->columnSpanFull(),
                ])->columns(2)->columnSpanFull(),
            ]);
    }
}
