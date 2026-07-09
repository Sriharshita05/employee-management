<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Supported RBAC roles. 'admin' keeps full access, 'hr' can manage
     * employees but not delete them or manage users, and 'manager' has
     * read-only access to the employee directory.
     */
    public const ROLE_ADMIN = 'admin';
    public const ROLE_HR = 'hr';
    public const ROLE_MANAGER = 'manager';

    public const ROLES = [self::ROLE_ADMIN, self::ROLE_HR, self::ROLE_MANAGER];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Whether this user holds the given role (or one of the given roles).
     */
    public function hasRole(string|array $roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        return in_array($this->role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(self::ROLE_ADMIN);
    }

    public function isHr(): bool
    {
        return $this->hasRole(self::ROLE_HR);
    }

    public function isManager(): bool
    {
        return $this->hasRole(self::ROLE_MANAGER);
    }
}
