<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'house_number' => $this->house_number,
            'address' => $this->address,
            'house_type' => $this->house_type,
            'occupancy_status' => $this->occupancy_status,
            'notes' => $this->notes,
            'current_resident' => $this->whenLoaded(
                'currentResident',
                fn() =>
                new ResidentResource($this->currentResident)
            ),
            'residents_history' => $this->whenLoaded(
                'houseResidents',
                fn() =>
                HouseResidentResource::collection($this->houseResidents)
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
