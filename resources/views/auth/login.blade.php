<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión – Autoescuela</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

    <div id="login-wrapper" class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="card w-full max-w-sm">
        <div class="card-body">

        <h1 style="text-align:center; margin-bottom: var(--space-xs);">Autoescuela</h1>
        <h2 style="text-align:center; margin-bottom: var(--space-l);">Iniciar sesión</h2>

        {{-- Contenedor de errores --}}
        <div id="login-error" class="toast toast-error hidden" style="margin-bottom: var(--space-m);"></div>

        {{-- Formulario de login --}}
        <form id="login-form" novalidate>

            <div class="input-group">
                <label for="login-email">Email</label>
                <input
                    type="email"
                    id="login-email"
                    name="email"
                    placeholder="tucorreo@ejemplo.com"
                    autocomplete="email"
                    required
                >
            </div>

            <div class="input-group">
                <label for="login-password">Contraseña</label>
                <input
                    type="password"
                    id="login-password"
                    name="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    required
                >
            </div>

            {{-- Spinner (oculto por defecto) --}}
            <div id="login-spinner" class="hidden">Cargando...</div>

            <button type="submit" id="login-submit" class="btn btn-primary btn-full btn-lg">Entrar</button>

        </form>

        </div>{{-- /card-body --}}
        </div>{{-- /card --}}
    </div>

    {{-- Orden de carga obligatorio: auth → api → login --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/login.js') }}" defer></script>

</body>
</html>
