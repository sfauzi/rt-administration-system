<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HouseResidentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'house_id'      => $this->house_id,
            'resident_id'   => $this->resident_id,

            // Loaded relation: full resident detail
            'resident' => $this->whenLoaded('resident', fn () =>
                new ResidentResource($this->resident)
            ),

            // Loaded relation: house info (useful when listing from resident side)
            'house' => $this->whenLoaded('house', fn () => [
                'id'           => $this->house->id,
                'house_number' => $this->house->house_number,
                'address'      => $this->house->address,
            ]),

            'move_in_date'  => $this->move_in_date?->format('Y-m-d'),
            'move_out_date' => $this->move_out_date?->format('Y-m-d'),
            'is_current'    => $this->is_current,
            'notes'         => $this->notes,
            'created_at'    => $this->created_at,
        ];
    }
}
