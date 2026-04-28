<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión – Autoescuela</title>
    <meta name="description" content="Accede al panel de gestión de la autoescuela para administrar reservas, clases y agenda por rol.">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body class="page-auth">

    <div id="login-wrapper" class="auth-login">
        <div class="card auth-login-card">
            <div class="card-body">
                <div class="auth-login-badge">Acceso seguro</div>
                <header class="auth-login-header">
                    <h1>Autoescuela</h1>
                    <p>Accede a tu panel para gestionar reservas, clases y disponibilidad con una interfaz más clara y rápida.</p>
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

                <div class="auth-login-help" style="margin-top: var(--space-s)">
                    <p><a href="/forgot-password" class="link">¿Olvidaste tu contraseña?</a></p>
                </div>

                <div class="auth-login-help" style="margin-top: var(--space-s)">
                    <p>¿Nuevo en la plataforma? <a href="/register" class="link">Crea tu cuenta aquí</a>.</p>
                </div>
            </div>
        </div>

        <aside class="auth-login-aside" aria-label="Ventajas del sistema">
            <div class="auth-feature-card">
                <span class="auth-feature-kicker">Reservas</span>
                <h2>Agenda visual y disponibilidad real</h2>
                <p>Consulta huecos, asigna profesorado y organiza clases desde una experiencia mucho más ordenada.</p>
            </div>
            <div class="auth-feature-list">
                <div class="auth-feature-item">
                    <strong>Alumno</strong>
                    <span>Reserva por día, hora y profesor.</span>
                </div>
                <div class="auth-feature-item">
                    <strong>Profesor</strong>
                    <span>Gestiona agenda, disponibilidad y estados.</span>
                </div>
                <div class="auth-feature-item">
                    <strong>Admin</strong>
                    <span>Controla recursos, incidencias y soporte.</span>
                </div>
            </div>
        </aside>
    </div>

    {{-- Orden de carga obligatorio: auth → api → login --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/login.js') }}" defer></script>

</body>
</html>
