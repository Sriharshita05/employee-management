<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_log_in_and_receives_a_token(): void
    {
        $user = User::factory()->hr()->create(['email' => 'hr@example.com']);

        $response = $this->postJson('/api/login', [
            'email'    => 'hr@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', 'hr');
    }

    public function test_wrong_password_is_rejected(): void
    {
        User::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/login', [
            'email'    => 'hr@example.com',
            'password' => 'not-the-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_protected_routes_require_a_token(): void
    {
        $this->getJson('/api/employees')->assertUnauthorized();
        $this->getJson('/api/leave-requests')->assertUnauthorized();
    }

    public function test_issued_token_grants_access_and_logout_revokes_it(): void
    {
        User::factory()->admin()->create(['email' => 'admin@example.com']);

        $token = $this->postJson('/api/login', [
            'email'    => 'admin@example.com',
            'password' => 'password',
        ])->json('token');

        $this->withToken($token)->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'admin@example.com');

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        // The revoked token no longer authenticates. Forget the guard the
        // previous request resolved so the next one re-checks the token.
        $this->app['auth']->forgetGuards();

        $this->withToken($token)->getJson('/api/user')->assertUnauthorized();
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'hr@example.com']);

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', ['email' => 'hr@example.com', 'password' => 'wrong']);
        }

        $this->postJson('/api/login', ['email' => 'hr@example.com', 'password' => 'wrong'])
            ->assertStatus(429);
    }
}
