<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear nueva contraseña – Autoescuela</title>
    <meta name="description" content="Crea una nueva contraseña segura para acceder a tu cuenta de la autoescuela.">
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
                    <h1>Crear nueva contraseña</h1>
                    <p>Ingresa una contraseña fuerte y segura.</p>
                </header>

                <form id="reset-password-form" class="auth-form" role="form" aria-label="Formulario para crear nueva contraseña">
                    <div class="form-group">
                        <label for="password">
                            Nueva contraseña
                            <span class="req">*</span>
                        </label>
                        <div class="input-password-wrap">
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="input" 
                                placeholder="Mín. 8 caracteres"
                                required
                            >
                            <button type="button" class="input-password-toggle" data-target="password">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-open">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-closed" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="password-strength">
                            <div class="strength-bar">
                                <div class="strength-bar-fill" id="password-strength-bar"></div>
                            </div>
                            <div class="strength-label" id="password-strength-label"></div>
                        </div>
                        <span class="input-error" id="password-error"></span>
                        <span class="input-hint">Usa mayúsculas, minúsculas, números y símbolos para una contraseña fuerte.</span>
                    </div>

                    <div class="form-group">
                        <label for="password-confirm">
                            Confirmar contraseña
                            <span class="req">*</span>
                        </label>
                        <div class="input-password-wrap">
                            <input 
                                type="password" 
                                id="password-confirm" 
                                name="password_confirmation" 
                                class="input" 
                                placeholder="Repite tu contraseña"
                                required
                            >
                            <button type="button" class="input-password-toggle" data-target="password-confirm">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-open">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-closed" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                        <span class="input-error" id="password-confirm-error"></span>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full btn-lg" aria-label="Actualizar contraseña">
                        <span class="btn-text">Actualizar contraseña</span>
                        <span class="btn-loader loader loader-inline loader-sm hidden">
                            <div class="loader-spinner"></div>
                        </span>
                    </button>
                </form>

                <div class="auth-login-help" style="margin-top: var(--space-m);">
                    <p>¿Recuerdas tu contraseña? <a href="/login" class="link">Inicia sesión aquí</a>.</p>
                </div>

            </div>
        </div>

        <aside class="auth-login-aside" aria-label="Ventajas del sistema">
            <div class="auth-feature-card">
                <span class="auth-feature-kicker">Seguridad</span>
                <h2>Protege tu cuenta</h2>
                <p>Una contraseña fuerte ayuda a mantener tu información y tus reservas a salvo.</p>
            </div>
            <div class="auth-feature-list">
                <div class="auth-feature-item">
                    <strong>Confidencialidad</strong>
                    <span>Solo tú conoces tu nueva contraseña.</span>
                </div>
                <div class="auth-feature-item">
                    <strong>Control</strong>
                    <span>Puedes cambiarla siempre que lo necesites.</span>
                </div>
            </div>
        </aside>
    </div>

    {{-- Orden de carga: auth → api (si la usas) → reset-password --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/reset-password.js') }}" defer></script>

</body>
</html>
