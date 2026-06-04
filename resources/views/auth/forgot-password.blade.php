<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña – Autoescuela</title>
    <meta name="description" content="Recupera el acceso a tu cuenta de la autoescuela mediante un enlace seguro enviado a tu correo.">
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
                    <h1>¿Olvidaste tu contraseña?</h1>
                    <p>Introduce tu correo y te enviaremos un enlace para restablecerla.</p>
                </header>

                <div id="email-error" class="toast toast-error hidden auth-login-error" role="alert" aria-live="assertive"></div>

                <form id="forgot-password-form" novalidate role="form" aria-label="Formulario de recuperación de contraseña">

                    <div class="input-group">
                        <label for="email" class="input-label">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            class="input"
                            placeholder="tucorreo@ejemplo.com"
                            autocomplete="email"
                            required
                        >
                    </div>

                    <button type="submit" class="btn btn-primary btn-full btn-lg d-flex align-items-center justify-content-center gap-2">
                        <span class="btn-text">Enviar enlace</span>
                        <span class="btn-loader loader loader-inline loader-sm hidden"></span>
                    </button>

                </form>

                <div class="auth-login-help" style="margin-top: var(--space-s)">
                    <p><a href="/login" class="link">Volver al inicio de sesión</a></p>
                </div>

            </div>
        </div>

        <aside class="auth-login-aside" aria-label="Ventajas del sistema">
            <div class="auth-feature-card">
                <span class="auth-feature-kicker">Seguridad</span>
                <h2>Recuperación rápida y segura</h2>
                <p>Te enviaremos un enlace temporal para que puedas restablecer tu contraseña sin complicaciones.</p>
            </div>

            <div class="auth-feature-list">
                <div class="auth-feature-item">
                    <strong>Protección</strong>
                    <span>Tu cuenta siempre estará protegida.</span>
                </div>
                <div class="auth-feature-item">
                    <strong>Privacidad</strong>
                    <span>Tu correo solo se usa para este proceso.</span>
                </div>
                <div class="auth-feature-item">
                    <strong>Soporte</strong>
                    <span>Si tienes problemas, contacta con administración.</span>
                </div>
            </div>
        </aside>
    </div>

    {{-- Orden de carga obligatorio: auth → api → forgot-password --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/forgot-password.js') }}" defer></script>

</body>
</html>
