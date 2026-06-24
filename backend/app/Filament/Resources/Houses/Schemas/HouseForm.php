<?php

namespace App\Filament\Resources\Houses\Schemas;

use Filament\Forms\Components\Select as ComponentsSelect;
use Filament\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class HouseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('House Information')->schema([
                    TextInput::make('house_number')
                        ->required()
                        ->unique(ignoreRecord: true)
                        ->label('House Number'),

                    Textarea::make('address')
                        ->required(),

                    ComponentsSelect::make('house_type')
                        ->options([
                            'permanent' => 'Permanent (Always Billed)',
                            'temporary' => 'Temporary (Billed When Occupied)',
                        ])
                        ->required(),

                    ComponentsSelect::make('occupancy_status')
                        ->options([
                            'occupied' => 'Occupied',
                            'vacant' => 'Vacant',
                        ])
                        ->required(),

                    Textarea::make('notes')
                        ->columnSpanFull(),
                ])->columnSpanFull()->columns(2),
            ]);
    }
}
