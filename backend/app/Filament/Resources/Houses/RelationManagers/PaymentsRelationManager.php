<?php

namespace App\Filament\Resources\Houses\RelationManagers;

use App\Models\FeeType;
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
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PaymentsRelationManager extends RelationManager
{
    protected static string $relationship = 'payments';
    protected static ?string $title = 'Payment History';
    protected static ?string $recordTitleAttribute = 'billing_month';


    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('resident_id')
                    ->label('Resident')
                    ->options(function ($livewire) {
                        return $livewire->getOwnerRecord()
                            ->residents()
                            ->pluck('full_name', 'residents.id');
                    })
                    ->searchable()
                    ->required(),

                Select::make('fee_type_id')
                    ->label('Fee Type')
                    ->options(FeeType::where('is_active', true)->pluck('name', 'id'))
                    ->required()
                    ->reactive()
                    ->afterStateUpdated(function ($state, Set $set) {
                        $feeType = FeeType::find($state);
                        if ($feeType) {
                            $set('amount', $feeType->amount);
                        }
                    }),

                TextInput::make('billing_month')
                    ->label('Billing Month (YYYY-MM)')
                    ->placeholder('2025-01')
                    ->required(),

                TextInput::make('months_covered')
                    ->label('Months Covered')
                    ->numeric()
                    ->default(1)
                    ->helperText('1 = monthly, 12 = full year')
                    ->reactive()
                    ->afterStateUpdated(function ($state, Get $get, Set $set) {
                        $feeType = FeeType::find($get('fee_type_id'));
                        if ($feeType) {
                            $set('amount', $feeType->amount * (int) $state);
                        }
                    }),

                TextInput::make('amount')
                    ->label('Amount (Rp)')
                    ->numeric()
                    ->prefix('Rp')
                    ->required(),

                Select::make('status')
                    ->options([
                        'paid' => 'Paid',
                        'unpaid' => 'Unpaid',
                        'partial' => 'Partial',
                    ])
                    ->default('paid')
                    ->required(),

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
                    ->label('Receipt Number'),

                Textarea::make('notes')
                    ->columnSpanFull(),
            ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('billing_month')
            ->columns([
                TextColumn::make('resident.full_name')
                    ->label('Resident')
                    ->searchable(),

                TextColumn::make('feeType.name')
                    ->label('Fee Type'),

                TextColumn::make('amount')
                    ->money('IDR', locale: 'id')
                    ->sortable(),

                TextColumn::make('billing_month')
                    ->label('Period')
                    ->sortable(),

                TextColumn::make('months_covered')
                    ->label('Months')
                    ->suffix(' mo.'),

                BadgeColumn::make('status')
                    ->colors([
                        'success' => 'paid',
                        'danger' => 'unpaid',
                        'warning' => 'partial',
                    ]),

                TextColumn::make('paid_at')
                    ->label('Paid At')
                    ->date('d M Y'),

                TextColumn::make('payment_method')
                    ->label('Method')
                    ->badge()
                    ->color('gray'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make()
                ->mutateFormDataUsing(function (array $data, $livewire): array {
                        // Ensure house_id is set from the owner record
                        $data['house_id'] = $livewire->getOwnerRecord()->id;
                        return $data;
                    }),
                AssociateAction::make(),
            ])
            ->recordActions([
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
