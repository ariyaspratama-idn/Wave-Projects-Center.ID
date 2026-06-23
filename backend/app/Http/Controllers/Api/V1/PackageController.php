<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        $packages = [
            [
                'id' => 'pkg_fullstack_mvp',
                'name' => 'Fullstack MVP',
                'price' => 5000000,
                'features' => ['PWA', 'Admin Panel', 'TiDB Storage']
            ],
            // Tambahkan daftar paket dummy lainnya untuk testing k6
        ];

        return response()->json([
            'success' => true,
            'data' => $packages
        ]);
    }
}
