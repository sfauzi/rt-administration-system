<?php

namespace App\Filament\Resources\Residents\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class ResidentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Personal Information')->schema([
                    TextInput::make('full_name')->required(),
                    TextInput::make('phone_number'),
                    Select::make('resident_type')
                        ->options(['permanent' => 'Permanent', 'contract' => 'Contract'])
                        ->required()
                        ->reactive(),
                    Toggle::make('is_married')->label('Married'),
                    Toggle::make('is_active')->label('Active')->default(true),
                ])->columns(2),

                Section::make('Contract Period')
                    ->schema([
                        DatePicker::make('contract_start_date'),
                        DatePicker::make('contract_end_date'),
                    ])
                    ->columns(2)
                    ->visible(fn(Get $get) => $get('resident_type') === 'contract'),

                Section::make('ID Card (KTP)')->schema([
                    FileUpload::make('id_card_photo')
                        ->image()
                        ->disk('public')
                        ->directory('ktp-photos')
                        ->visibility('public')
                        ->label('KTP Photo')
                        ->columnSpanFull(),
                ]),

                Section::make('Notes')->schema([
                    Textarea::make('notes')->columnSpanFull(),
                ]),
            ]);
    }
}
