<?php
// Updated CORS configuration
return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This file was missing from the project, which meant HandleCors was a
    | no-op (it reads config('cors'), defaults to [] and never matches any
    | path). Publishing it is required for the React SPA (a different
    | origin/port) to call this API at all.
    |
    | We use Bearer-token auth (Authorization header) rather than
    | Sanctum's cookie/session SPA mode, so `supports_credentials` stays
    | false and we don't need SANCTUM_STATEFUL_DOMAINS or CSRF cookies.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map('trim', explode(',', env(
        'FRONTEND_URLS',
        'http://localhost:5173,http://127.0.0.1:5173',
    )))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
