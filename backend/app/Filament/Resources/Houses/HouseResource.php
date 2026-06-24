<?php

namespace App\Filament\Resources\Houses;

use App\Filament\Resources\Houses\Pages\CreateHouse;
use App\Filament\Resources\Houses\Pages\EditHouse;
use App\Filament\Resources\Houses\Pages\ListHouses;
use App\Filament\Resources\Houses\RelationManagers\HouseResidentsRelationManager;
use App\Filament\Resources\Houses\RelationManagers\PaymentsRelationManager;
use App\Filament\Resources\Houses\Schemas\HouseForm;
use App\Filament\Resources\Houses\Tables\HousesTable;
use App\Models\House;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class HouseResource extends Resource
{
    protected static ?string $model = House::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'House';

    public static function form(Schema $schema): Schema
    {
        return HouseForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return HousesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            HouseResidentsRelationManager::class,
            PaymentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListHouses::route('/'),
            'create' => CreateHouse::route('/create'),
            'edit' => EditHouse::route('/{record}/edit'),
        ];
    }
}
