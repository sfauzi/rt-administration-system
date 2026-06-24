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
                        ->afterStateUpdated(fn($state, Set $set) => $set('resident_id', null)),

                    Select::make('resident_id')
                        ->label('Resident')
                        ->options(function (Get $get) {
                            $houseId = $get('house_id');
                            if (!$houseId) return [];
                            $house = House::find($houseId);
                            return $house?->residents()->pluck('full_name', 'residents.id') ?? [];
                        })
                        ->required()
                        ->searchable(),

                    Select::make('fee_type_id')
                        ->label('Fee Type')
                        ->options(FeeType::where('is_active', true)->pluck('name', 'id'))
                        ->required(),

                    TextInput::make('amount')
                        ->numeric()
                        ->prefix('Rp')
                        ->required(),

                    TextInput::make('billing_month')
                        ->label('Billing Month (YYYY-MM)')
                        ->placeholder('2025-01')
                        ->required(),

                    TextInput::make('months_covered')
                        ->numeric()
                        ->default(1)
                        ->label('Months Covered')
                        ->helperText('1 = monthly, 12 = full year'),

                    Select::make('status')
                        ->options(['paid' => 'Paid', 'unpaid' => 'Unpaid', 'partial' => 'Partial'])
                        ->required(),

                    DatePicker::make('paid_at')->label('Payment Date'),

                    Select::make('payment_method')
                        ->options([
                            'cash' => 'Cash',
                            'bank_transfer' => 'Bank Transfer',
                            'qris' => 'QRIS',
                        ]),

                    TextInput::make('receipt_number'),

                    Textarea::make('notes')->columnSpanFull(),
                ])->columns(2)->columnSpanFull(),
            ]);
    }
}
