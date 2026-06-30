<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $userRoles = $request->user()->roles->pluck('name')->toArray();

        foreach ($roles as $role) {
            if (in_array(trim($role), $userRoles)) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki hak akses (Role) untuk fitur ini.'
        ], 403);
    }
}
