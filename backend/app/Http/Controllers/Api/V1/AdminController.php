<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name'
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'uuid' => (string) Str::uuid(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'status' => 'active'
            ]);

            $role = Role::where('name', $validated['role'])->first();
            $user->roles()->attach($role->id);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dibuat',
                'data' => $user->load('roles')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
