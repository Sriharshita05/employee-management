<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all dashboard user accounts. Admin-only (see routes/api.php).
     */
    public function index(): JsonResponse
    {
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at']);
        return response()->json($users);
    }

    /**
     * Create a new dashboard user account with a given role.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => ['required', Rule::in(User::ROLES)],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
            'is_admin' => $validated['role'] === User::ROLE_ADMIN,
        ]);

        return response()->json($user->only('id', 'name', 'email', 'role', 'created_at'), 201);
    }

    /**
     * Update a user's role (and optionally name/email). Admin-only.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role'  => ['sometimes', 'required', Rule::in(User::ROLES)],
        ]);

        if (isset($validated['role'])) {
            $validated['is_admin'] = $validated['role'] === User::ROLE_ADMIN;
        }

        $user->update($validated);

        return response()->json($user->only('id', 'name', 'email', 'role', 'created_at'));
    }

    /**
     * Remove a dashboard user account. Admin-only. An admin cannot delete
     * their own account, so there's always at least one admin left.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        if ((int) $id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account while logged in.',
            ], 409);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }
}
