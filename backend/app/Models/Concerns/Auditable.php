<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Records created / updated / deleted events for a model in audit_logs.
 *
 * Hidden attributes (passwords, remember tokens) and timestamps are never
 * written to the log. Updates that change nothing meaningful are skipped.
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            static::writeAudit($model, 'created', null, static::auditableValues($model->getAttributes(), $model));
        });

        static::updated(function (Model $model) {
            $changed = static::auditableValues($model->getChanges(), $model);

            if ($changed === []) {
                return;
            }

            $old = array_intersect_key(
                static::auditableValues($model->getRawOriginal(), $model),
                $changed
            );

            static::writeAudit($model, 'updated', $old, $changed);
        });

        static::deleted(function (Model $model) {
            static::writeAudit($model, 'deleted', static::auditableValues($model->getAttributes(), $model), null);
        });
    }

    /**
     * Strip hidden attributes and timestamps from a set of attributes.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    protected static function auditableValues(array $attributes, Model $model): array
    {
        $excluded = array_merge($model->getHidden(), ['created_at', 'updated_at']);

        return array_diff_key($attributes, array_flip($excluded));
    }

    /**
     * @param  array<string, mixed>|null  $old
     * @param  array<string, mixed>|null  $new
     */
    protected static function writeAudit(Model $model, string $action, ?array $old, ?array $new): void
    {
        AuditLog::create([
            'user_id'        => Auth::id(),
            'action'         => $action,
            'auditable_type' => class_basename($model),
            'auditable_id'   => $model->getKey(),
            'old_values'     => $old,
            'new_values'     => $new,
            'ip_address'     => request()?->ip(),
        ]);
    }
}
