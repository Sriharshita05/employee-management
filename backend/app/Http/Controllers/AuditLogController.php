<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class AuditLogController extends Controller
{
    /**
     * Paginated audit trail, newest first. Admin-only (see routes/api.php).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'action'   => ['nullable', Rule::in(['created', 'updated', 'deleted'])],
            'entity'   => 'nullable|string|max:100',
            'user_id'  => 'nullable|integer',
            'from'     => 'nullable|date_format:Y-m-d',
            'to'       => 'nullable|date_format:Y-m-d',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $logs = AuditLog::with('user:id,name')
            ->when($filters['action'] ?? null, fn ($q, $v) => $q->where('action', $v))
            ->when($filters['entity'] ?? null, fn ($q, $v) => $q->where('auditable_type', $v))
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 25);

        return AuditLogResource::collection($logs);
    }
}
