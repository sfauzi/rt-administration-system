<?php

namespace App\Filament\Resources\FeeTypes\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FeeTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Fee Type Information')->schema([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(255)
                        ->label('Fee Name')
                        ->placeholder('e.g. Security Guard Fee'),

                    TextInput::make('slug')
                        ->required()
                        ->unique(ignoreRecord: true)
                        ->maxLength(100)
                        ->label('Slug (unique key)')
                        ->placeholder('e.g. security, cleaning')
                        ->helperText('Lowercase, no spaces, used as identifier'),

                    TextInput::make('amount')
                        ->required()
                        ->numeric()
                        ->prefix('Rp')
                        ->label('Monthly Amount (IDR)')
                        ->placeholder('100000'),

                    Select::make('billing_cycle')
                        ->required()
                        ->options([
                            'monthly' => 'Monthly (Bulanan)',
                            'annual_option' => 'Monthly with Annual Option',
                        ])
                        ->default('monthly')
                        ->helperText('"Annual Option" means residents can choose to pay 1 year upfront'),

                    Toggle::make('is_active')
                        ->label('Active')
                        ->default(true)
                        ->helperText('Inactive fee types will not appear in payment forms'),

                    Textarea::make('description')
                        ->label('Description')
                        ->columnSpanFull()
                        ->rows(2),
                ])->columns(2)->columnSpanFull(),
            ]);
    }
}
