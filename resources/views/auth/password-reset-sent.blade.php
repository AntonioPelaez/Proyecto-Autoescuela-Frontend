<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email enviado – Autoescuela</title>
    <meta name="description" content="Te hemos enviado un enlace para restablecer tu contraseña de forma segura.">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body class="page-auth">

    <div id="login-wrapper" class="auth-login">
        <div class="card auth-login-card">
            <div class="card-body">

                <div class="auth-login-badge">Recuperación de acceso</div>

                <header class="auth-login-header">
                    <h1>Email enviado</h1>
                    <p>Revisa tu bandeja de entrada (y la carpeta de spam si es necesario).</p>
                </header>

                <div class="reset-sent-visual" style="text-align:center; margin-top: var(--space-m);">
                    <div class="reset-sent-icon" style="font-size:48px; margin-bottom: var(--space-s);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="56" height="56">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h2>¡Listo!</h2>
                    <p>Hemos enviado un enlace de recuperación a tu email.</p>
                    <p class="reset-sent-hint">El enlace es válido durante 24 horas.</p>
                </div>

                <div class="reset-sent-actions" style="margin-top: var(--space-m); display:flex; flex-direction:column; gap: var(--space-s);">
                    <a href="/login" class="btn btn-primary btn-full btn-lg">Ir al login</a>
                    <a href="/forgot-password" class="btn btn-ghost btn-full">¿No recibiste el email?</a>
                </div>

                <div class="auth-login-help" style="margin-top: var(--space-m); text-align:center;">
                    <p class="text-small">
                        ¿Preguntas? Contacta a
                        <a href="mailto:soporte@autoescuela.es" class="link">soporte@autoescuela.es</a>
                    </p>
                </div>

            </div>
        </div>

        <aside class="auth-login-aside" aria-label="Ventajas del sistema">
            <div class="auth-feature-card">
                <span class="auth-feature-kicker">Seguridad</span>
                <h2>Recuperación protegida</h2>
                <p>Solo tú, desde tu correo, puedes restablecer la contraseña de tu cuenta.</p>
            </div>
            <div class="auth-feature-list">
                <div class="auth-feature-item">
                    <strong>Enlace temporal</strong>
                    <span>Caduca en 24 horas para mayor seguridad.</span>
                </div>
                <div class="auth-feature-item">
                    <strong>Control</strong>
                    <span>Si no fuiste tú, ignora el email.</span>
                </div>
            </div>
        </aside>
    </div>

    {{-- Orden de carga: auth → api (si la necesitas) --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
</body>
</html>
