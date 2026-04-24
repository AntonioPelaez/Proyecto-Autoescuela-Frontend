<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión – Autoescuela</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

    <div id="login-wrapper" class="auth-login">
        <div class="card auth-login-card">
            <div class="card-body">
                <header class="auth-login-header">
                    <h1>Autoescuela</h1>
                    <p>Iniciar sesión</p>
                </header>

                <div id="login-error" class="toast toast-error hidden auth-login-error" role="alert" aria-live="assertive"></div>

                <form id="login-form" novalidate>
                    <div class="input-group">
                        <label for="login-email" class="input-label">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            name="email"
                            class="input"
                            placeholder="tucorreo@ejemplo.com"
                            autocomplete="email"
                            required
                        >
                    </div>

                    <div class="input-group">
                        <label for="login-password" class="input-label">Contraseña</label>
                        <input
                            type="password"
                            id="login-password"
                            name="password"
                            class="input"
                            placeholder="********"
                            autocomplete="current-password"
                            required
                        >
                    </div>

                    <div id="login-spinner" class="loader loader-inline loader-sm hidden" aria-live="polite">Validando credenciales...</div>

                    <button type="submit" id="login-submit" class="btn btn-primary btn-full btn-lg">Entrar</button>
                </form>
            </div>
        </div>
    </div>

    {{-- Orden de carga obligatorio: auth → api → login --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/login.js') }}" defer></script>

</body>
</html>
