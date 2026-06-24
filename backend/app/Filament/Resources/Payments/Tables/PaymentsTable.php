<?php

namespace App\Filament\Resources\Payments\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PaymentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('house.house_number')->label('House')->sortable(),
                TextColumn::make('resident.full_name')->label('Resident')->searchable(),
                TextColumn::make('feeType.name')->label('Fee Type'),
                TextColumn::make('amount')
                    ->money('IDR', locale: 'id'),
                TextColumn::make('billing_month')->sortable(),
                TextColumn::make('months_covered')->label('Months'),
                BadgeColumn::make('status')
                    ->colors([
                        'success' => 'paid',
                        'danger' => 'unpaid',
                        'warning' => 'partial',
                    ]),
                TextColumn::make('paid_at')->date(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
