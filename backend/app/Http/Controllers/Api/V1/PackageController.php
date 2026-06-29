<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Package::all()
        ]);
    }
}
