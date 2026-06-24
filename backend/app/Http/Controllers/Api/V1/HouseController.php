<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HouseResidentResource;
use App\Http\Resources\HouseResource;
use App\Http\Resources\PaymentResource;
use App\Models\House;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HouseController extends Controller
{
    // GET /api/v1/houses
    public function index(Request $request): AnonymousResourceCollection
    {
        $houses = House::with(['currentResident', 'currentHouseResident'])
            ->when($request->occupancy_status, fn($q, $v) => $q->where('occupancy_status', $v))
            ->when($request->house_type, fn($q, $v) => $q->where('house_type', $v))
            ->orderBy('house_number')
            ->get();

        return HouseResource::collection($houses);
    }

    // POST /api/v1/houses
    public function store(Request $request): HouseResource
    {
        $validated = $request->validate([
            'house_number' => 'required|string|unique:houses',
            'address' => 'required|string',
            'house_type' => 'required|in:permanent,temporary',
            'occupancy_status' => 'required|in:occupied,vacant',
            'notes' => 'nullable|string',
        ]);

        $house = House::create($validated);
        return new HouseResource($house);
    }

    // GET /api/v1/houses/{house}
    public function show(House $house): HouseResource
    {
        $house->load(['currentResident', 'houseResidents.resident', 'payments.feeType']);
        return new HouseResource($house);
    }

    // PUT /api/v1/houses/{house}
    public function update(Request $request, House $house): HouseResource
    {
        $validated = $request->validate([
            'house_number' => 'string|unique:houses,house_number,' . $house->id,
            'address' => 'string',
            'house_type' => 'in:permanent,temporary',
            'occupancy_status' => 'in:occupied,vacant',
            'notes' => 'nullable|string',
        ]);

        $house->update($validated);
        return new HouseResource($house);
    }

    // GET /api/v1/houses/{house}/residents  (full history)
    public function residents(House $house): AnonymousResourceCollection
    {
        $residents = $house->houseResidents()
            ->with('resident')
            ->orderByDesc('move_in_date')
            ->get();

        return HouseResidentResource::collection($residents);
    }

    // POST /api/v1/houses/{house}/residents  (assign new resident)
    public function assignResident(Request $request, House $house): HouseResidentResource
    {
        $validated = $request->validate([
            'resident_id' => 'required|uuid|exists:residents,id',
            'move_in_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Close out previous occupant
        $house->houseResidents()
            ->where('is_current', true)
            ->update([
                'is_current' => false,
                'move_out_date' => $validated['move_in_date'],
            ]);

        // Create new pivot record
        $houseResident = $house->houseResidents()->create([
            'resident_id' => $validated['resident_id'],
            'move_in_date' => $validated['move_in_date'],
            'is_current' => true,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update house status
        $house->update(['occupancy_status' => 'occupied']);

        return new HouseResidentResource($houseResident->load('resident'));
    }

    // PUT /api/v1/houses/{house}/move-out
    public function moveOut(Request $request, House $house): array
    {
        $validated = $request->validate([
            'move_out_date' => 'required|date',
        ]);

        $house->houseResidents()
            ->where('is_current', true)
            ->update([
                'is_current' => false,
                'move_out_date' => $validated['move_out_date'],
            ]);

        $house->update(['occupancy_status' => 'vacant']);

        return ['message' => 'Resident moved out successfully'];
    }

    // GET /api/v1/houses/{house}/payments
    public function payments(Request $request, House $house): AnonymousResourceCollection
    {
        $payments = $house->payments()
            ->with(['resident', 'feeType'])
            ->when($request->month, fn($q, $v) => $q->where('billing_month', $v))
            ->orderByDesc('billing_month')
            ->get();

        return PaymentResource::collection($payments);
    }
}
