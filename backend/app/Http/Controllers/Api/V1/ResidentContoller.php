<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResidentResource;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ResidentContoller extends Controller
{
    // GET /api/v1/residents
    public function index(Request $request): AnonymousResourceCollection
    {
        $residents = Resident::query()
            ->when(
                $request->resident_type,
                fn($q, $v) => $q->where('resident_type', $v)
            )
            ->when(
                $request->has('is_active'),
                fn($q) => $q->where('is_active', $request->boolean('is_active'))
            )
            ->when(
                $request->search,
                fn($q, $v) => $q->where('full_name', 'like', "%{$v}%")
                    ->orWhere('phone_number', 'like', "%{$v}%")
            )
            ->orderBy('full_name')
            ->get();

        return ResidentResource::collection($residents);
    }

    // POST /api/v1/residents
    public function store(Request $request): ResidentResource
    {
        $validated = $request->validate([
            'full_name'           => 'required|string|max:255',
            'phone_number'        => 'nullable|string|max:20',
            'resident_type'       => 'required|in:permanent,contract',
            'is_married'          => 'boolean',
            'is_active'           => 'boolean',
            'contract_start_date' => 'nullable|date|required_if:resident_type,contract',
            'contract_end_date'   => 'nullable|date|after:contract_start_date',
            'notes'               => 'nullable|string',
            'id_card_photo'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Handle KTP photo upload
        if ($request->hasFile('id_card_photo')) {
            $validated['id_card_photo'] = $request->file('id_card_photo')
                ->store('ktp-photos', 'public');
        }

        $resident = Resident::create($validated);

        return new ResidentResource($resident);
    }

    // GET /api/v1/residents/{resident}
    public function show(Resident $resident): ResidentResource
    {
        $resident->load([
            'houseResidents.house',
        ]);

        return new ResidentResource($resident);
    }

    // PUT /api/v1/residents/{resident}
    // Note: use POST + _method=PUT from frontend when sending FormData (file upload)
    public function update(Request $request, Resident $resident): ResidentResource
    {
        $validated = $request->validate([
            'full_name'           => 'string|max:255',
            'phone_number'        => 'nullable|string|max:20',
            'resident_type'       => 'in:permanent,contract',
            'is_married'          => 'boolean',
            'is_active'           => 'boolean',
            'contract_start_date' => 'nullable|date',
            'contract_end_date'   => 'nullable|date',
            'notes'               => 'nullable|string',
            'id_card_photo'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Replace KTP photo if new one uploaded
        if ($request->hasFile('id_card_photo')) {
            // Delete old photo
            if ($resident->id_card_photo) {
                Storage::disk('public')->delete($resident->id_card_photo);
            }
            $validated['id_card_photo'] = $request->file('id_card_photo')
                ->store('ktp-photos', 'public');
        }

        $resident->update($validated);

        return new ResidentResource($resident);
    }

    // DELETE /api/v1/residents/{resident}
    public function destroy(Resident $resident): \Illuminate\Http\JsonResponse
    {
        // Soft delete — history is preserved
        $resident->delete();

        return response()->json(['message' => 'Resident deleted successfully']);
    }
}
