<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear cuenta – Autoescuela Pro</title>
    <meta name="description" content="Regístrate como alumno en la plataforma de AutoEscuela Pro y reserva tus primeras clases de conducir.">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body class="page-auth">

    <div class="auth-register">

        {{-- ── Back to landing ────────────────────────────── --}}
        <a href="/" class="auth-register-back" aria-label="Volver a la página principal">
            ← Volver al inicio
        </a>

        {{-- ── Card central ────────────────────────────────── --}}
        <div class="card auth-register-card">
            <div class="card-body">

                <div class="auth-login-badge">Crear cuenta gratuita</div>

                <header class="auth-login-header">
                    <h1>AutoEscuela Pro</h1>
                    <p>Rellena tus datos y empieza a reservar clases en minutos.</p>
                </header>

                {{-- Feedback global --}}
                <div id="register-error"   class="toast toast-error   hidden" role="alert" aria-live="assertive"></div>
                <div id="register-success" class="toast toast-success hidden" role="status"  aria-live="polite"></div>

                <form id="register-form" novalidate autocomplete="off" role="form" aria-label="Formulario de registro de alumno">

                    {{-- Fila 1: nombre + apellidos --}}
                    <div class="register-row">
                        <div class="input-group">
                            <label for="reg-name" class="input-label">Nombre <span class="req" aria-hidden="true">*</span></label>
                            <input type="text" id="reg-name" name="name" class="input"
                                   placeholder="María" autocomplete="given-name" required>
                            <span class="input-error" id="err-name"></span>
                        </div>
                        <div class="input-group">
                            <label for="reg-surname" class="input-label">Apellidos <span class="req" aria-hidden="true">*</span></label>
                            <input type="text" id="reg-surname" name="surname" class="input"
                                   placeholder="García López" autocomplete="family-name" required>
                            <span class="input-error" id="err-surname"></span>
                        </div>
                    </div>

                    {{-- Email --}}
                    <div class="input-group">
                        <label for="reg-email" class="input-label">Email <span class="req" aria-hidden="true">*</span></label>
                        <input type="email" id="reg-email" name="email" class="input"
                               placeholder="tucorreo@ejemplo.com" autocomplete="email" required>
                        <span class="input-error" id="err-email"></span>
                    </div>

                    {{-- Teléfono --}}
                    <div class="input-group">
                        <label for="reg-phone" class="input-label">Teléfono <span class="req" aria-hidden="true">*</span></label>
                        <input type="tel" id="reg-phone" name="phone" class="input"
                               placeholder="6XX XXX XXX" autocomplete="tel" required
                               pattern="[6-9][0-9]{8}">
                        <span class="input-error" id="err-phone"></span>
                    </div>

                    {{-- Población --}}
                    <div class="input-group">
                        <label for="reg-town" class="input-label">Población preferida <span class="req" aria-hidden="true">*</span></label>
                        <select id="reg-town" name="town_id" class="input" required>
                            <option value="" disabled selected>Selecciona una sede</option>
                            <option value="1">Carmona</option>
                            <option value="2">Sevilla</option>
                            <option value="3">Écija</option>
                        </select>
                        <span class="input-error" id="err-town"></span>
                    </div>

                    {{-- Contraseña --}}
                    <div class="input-group">
                        <label for="reg-password" class="input-label">Contraseña <span class="req" aria-hidden="true">*</span></label>
                        <div class="input-password-wrap">
                            <input type="password" id="reg-password" name="password" class="input"
                                   placeholder="Mínimo 8 caracteres" autocomplete="new-password"
                                   required minlength="8">
                            <button type="button" class="input-password-toggle" aria-label="Mostrar contraseña"
                                    data-target="reg-password">👁</button>
                        </div>
                        <span class="input-error" id="err-password"></span>
                        <div class="password-strength" id="password-strength" aria-live="polite"></div>
                    </div>

                    {{-- Confirmar contraseña --}}
                    <div class="input-group">
                        <label for="reg-password-confirm" class="input-label">Confirmar contraseña <span class="req" aria-hidden="true">*</span></label>
                        <div class="input-password-wrap">
                            <input type="password" id="reg-password-confirm" name="password_confirm" class="input"
                                   placeholder="Repite la contraseña" autocomplete="new-password" required>
                            <button type="button" class="input-password-toggle" aria-label="Mostrar contraseña"
                                    data-target="reg-password-confirm">👁</button>
                        </div>
                        <span class="input-error" id="err-password-confirm"></span>
                    </div>

                    {{-- Términos --}}
                    <div class="input-group register-terms">
                        <label class="register-terms-label">
                            <input type="checkbox" id="reg-terms" name="terms" required>
                            <span>He leído y acepto la <a href="#" class="link">política de privacidad</a> y los <a href="#" class="link">términos de uso</a>.</span>
                        </label>
                        <span class="input-error" id="err-terms"></span>
                    </div>

                    {{-- Loader --}}
                    <div id="register-spinner" class="loader loader-inline loader-sm hidden" aria-live="polite">
                        Creando cuenta…
                    </div>

                    {{-- Submit --}}
                    <button type="submit" id="register-submit" class="btn btn-primary btn-full btn-lg" aria-label="Crear cuenta">
                        Crear cuenta
                    </button>

                </form>

                <div class="auth-login-help" style="margin-top: var(--space-m)">
                    <p>¿Ya tienes cuenta? <a href="/login" class="link">Inicia sesión aquí</a>.</p>
                </div>

            </div>
        </div>

        {{-- ── Panel lateral informativo ─────────────────── --}}
        <aside class="auth-register-aside" aria-label="Proceso de registro">
            <div class="auth-feature-card">
                <span class="auth-feature-kicker">Reservas en 3 pasos</span>
                <h2>¿Cómo funciona después de registrarte?</h2>
                <p>En menos de 2 minutos puedes tener tu primera clase de conducir reservada.</p>
            </div>
            <ol class="auth-register-steps">
                <li class="auth-register-step">
                    <span class="auth-register-step-num" aria-hidden="true">1</span>
                    <div>
                        <strong>Crea tu cuenta</strong>
                        <span>Rellena el formulario con tus datos básicos.</span>
                    </div>
                </li>
                <li class="auth-register-step">
                    <span class="auth-register-step-num" aria-hidden="true">2</span>
                    <div>
                        <strong>Elige fecha y horario</strong>
                        <span>Consulta los huecos disponibles en tu sede.</span>
                    </div>
                </li>
                <li class="auth-register-step">
                    <span class="auth-register-step-num" aria-hidden="true">3</span>
                    <div>
                        <strong>Reserva tu clase</strong>
                        <span>Selecciona profesor y confirma en un clic.</span>
                    </div>
                </li>
            </ol>
        </aside>

    </div>

    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/register.js') }}" defer></script>

</body>
</html>
