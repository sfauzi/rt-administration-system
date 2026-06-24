<?php

namespace App\Filament\Resources\Expenses\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ExpenseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Expense Details')->schema([
                    TextInput::make('title')->required()->columnSpanFull(),

                    Select::make('category')
                        ->options([
                            'salary' => 'Salary (Gaji)',
                            'electricity' => 'Electricity (Token Listrik)',
                            'maintenance' => 'Maintenance (Perbaikan)',
                            'other' => 'Other',
                        ])
                        ->required(),

                    TextInput::make('amount')
                        ->numeric()
                        ->prefix('Rp')
                        ->required(),

                    DatePicker::make('expense_date')->required(),

                    TextInput::make('expense_month')
                        ->label('Expense Month (YYYY-MM)')
                        ->placeholder('2025-01'),

                    Toggle::make('is_recurring')
                        ->label('Recurring Monthly Expense'),

                    Textarea::make('description')->columnSpanFull(),

                    FileUpload::make('receipt_photo')
                        ->image()
                        ->directory('expense-receipts')
                        ->columnSpanFull(),
                ])->columns(2)->columnSpanFull(),
            ]);
    }
}
