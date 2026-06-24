<?php

namespace App\Filament\Resources\Houses\RelationManagers;

use App\Models\Resident;
use Filament\Actions\Action;
use Filament\Actions\AssociateAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\DissociateAction;
use Filament\Actions\DissociateBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class HouseResidentsRelationManager extends RelationManager
{
    protected static string $relationship = 'houseResidents';
    protected static ?string $title = 'Resident History';
    protected static ?string $recordTitleAttribute = 'id';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('resident_id')
                    ->label('Resident')
                    ->options(Resident::where('is_active', true)->pluck('full_name', 'id'))
                    ->searchable()
                    ->required(),

                DatePicker::make('move_in_date')
                    ->label('Move-in Date')
                    ->required()
                    ->default(now()),

                DatePicker::make('move_out_date')
                    ->label('Move-out Date')
                    ->nullable(),

                Toggle::make('is_current')
                    ->label('Currently Living Here')
                    ->default(true)
                    ->helperText('Only one resident can be current at a time'),

                Textarea::make('notes')
                    ->label('Notes')
                    ->columnSpanFull(),
            ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                TextColumn::make('resident.full_name')
                    ->label('Resident Name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('resident.resident_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'permanent' => 'success',
                        'contract' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('move_in_date')
                    ->label('Move-in')
                    ->date('d M Y')
                    ->sortable(),

                TextColumn::make('move_out_date')
                    ->label('Move-out')
                    ->date('d M Y')
                    ->placeholder('Still Here'),

                IconColumn::make('is_current')
                    ->label('Current')
                    ->boolean(),

                TextColumn::make('notes')
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                // Assign a new resident directly from the house page
                CreateAction::make()
                    ->label('Assign Resident')
                    ->before(function (array $data, $livewire) {
                        // When setting is_current=true, close out the old current resident
                        if ($data['is_current'] ?? false) {
                            $livewire->getOwnerRecord()
                                ->houseResidents()
                                ->where('is_current', true)
                                ->update([
                                    'is_current' => false,
                                    'move_out_date' => $data['move_in_date'],
                                ]);

                            // Also mark the house as occupied
                            $livewire->getOwnerRecord()->update([
                                'occupancy_status' => 'occupied',
                            ]);
                        }
                    }),
            ])
            ->recordActions([
                Action::make('move_out')
                    ->label('Move Out')
                    ->icon('heroicon-o-arrow-right-start-on-rectangle')
                    ->color('warning')
                    ->visible(fn ($record) => $record->is_current)
                    ->requiresConfirmation()
                    ->form([
                        DatePicker::make('move_out_date')
                            ->label('Move-out Date')
                            ->required()
                            ->default(now()),
                    ])
                    ->action(function ($record, array $data, $livewire) {
                        $record->update([
                            'is_current' => false,
                            'move_out_date' => $data['move_out_date'],
                        ]);

                        // Mark house as vacant
                        $livewire->getOwnerRecord()->update([
                            'occupancy_status' => 'vacant',
                        ]);
                    }),
                EditAction::make(),
                DissociateAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DissociateBulkAction::make(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
