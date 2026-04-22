<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión – Autoescuela</title>
    @vite(['resources/css/app.css'])
</head>
<body>

    <div id="login-wrapper">

        <h1>Autoescuela</h1>
        <h2>Iniciar sesión</h2>

        {{-- Contenedor de errores --}}
        <div id="login-error" class="hidden"></div>

        {{-- Formulario de login --}}
        <form id="login-form" novalidate>

            <div>
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

            <div>
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

            <button type="submit" id="login-submit">Entrar</button>

        </form>

    </div>

    {{-- Orden de carga obligatorio: auth → api → login --}}
    @vite([
        'resources/js/auth.js',
        'resources/js/api.js',
        'resources/js/pages/login.js',
    ])

</body>
</html>
