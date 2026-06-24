<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeeTypeResource;
use App\Models\FeeType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FeeTypeController extends Controller
{
    // GET /api/v1/fee-types
    // Returns only active fee types by default; pass ?all=true for admin
    public function index(Request $request): AnonymousResourceCollection
    {
        $feeTypes = FeeType::query()
            ->when(
                !$request->boolean('all'),
                fn($q) => $q->where('is_active', true)
            )
            ->orderBy('name')
            ->get();

        return FeeTypeResource::collection($feeTypes);
    }

    // GET /api/v1/fee-types/{feeType}
    public function show(FeeType $feeType): FeeTypeResource
    {
        return new FeeTypeResource($feeType);
    }
}
