<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate a user and issue a Sanctum personal access token.
     *
     * Any account with a valid RBAC role (admin, hr, manager) may sign in;
     * what they can see and do once inside is enforced by the `role`
     * middleware on individual routes and mirrored in the frontend.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! in_array($user->role, User::ROLES, true)) {
            throw ValidationException::withMessages([
                'email' => ['This account does not have dashboard access.'],
            ]);
        }

        // Invalidate any previous tokens for this device/session name so a
        // user can't accumulate unlimited valid tokens from repeated logins.
        $user->tokens()->where('name', 'admin-dashboard')->delete();

        $token = $user->createToken('admin-dashboard')->plainTextToken;

        return response()->json([
            'user'  => $user->only('id', 'name', 'email', 'is_admin', 'role'),
            'token' => $token,
        ]);
    }

    /**
     * Revoke the token used to authenticate the current request.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the currently authenticated admin.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->only('id', 'name', 'email', 'is_admin', 'role')
        );
    }
}
