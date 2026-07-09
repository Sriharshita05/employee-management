<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds a `role` column used for Role-Based Access Control (RBAC).
     * The existing `is_admin` flag is left untouched so nothing that
     * already depends on it breaks; `role` becomes the new source of
     * truth for authorization going forward and is kept in sync with
     * `is_admin` for any pre-existing accounts.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('manager')->after('is_admin');
        });

        // Backfill: any account previously flagged as admin becomes the
        // 'admin' role so existing admin logins keep their access level.
        DB::table('users')->where('is_admin', true)->update(['role' => 'admin']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
