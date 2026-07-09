<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Restrict a route to one or more roles.
     *
     * Usage in routes: ->middleware('role:admin') or ->middleware('role:admin,hr')
     *
     * Must run after 'auth:sanctum' so $request->user() is already resolved.
     * Returns 401 if there is no authenticated user (shouldn't normally be
     * reached, but guards against misordered middleware) and 403 if the
     * authenticated user's role isn't in the allowed list.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (! empty($roles) && ! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        return $next($request);
    }
}
