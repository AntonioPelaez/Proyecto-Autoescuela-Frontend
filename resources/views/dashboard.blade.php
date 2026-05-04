<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard – Autoescuela</title>
    <meta name="description" content="Redirección al dashboard principal según el rol autenticado en la autoescuela.">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body class="page-dashboard-gateway">

    <div class="container role-layout">

        {{-- ── Menú lateral ── --}}
        <aside class="role-sidebar">
            <div class="card card-body">
                <h3>Autoescuela</h3>
                <nav class="role-menu" aria-label="Menu">
                    <ul id="sidebar-menu">
                        {{-- Generado por dashboard.js según el rol --}}
                    </ul>
                </nav>
                <div class="role-sidebar-logout">
                    <button type="button" class="btn btn-danger btn-sm btn-full" id="btn-logout">Cerrar sesión</button>
                </div>
            </div>
        </aside>

        {{-- ── Contenido principal ── --}}
        <main class="role-main" id="dashboard-content">
            <section class="gateway-shell card">
                <div class="card-body gateway-shell-body">
                    <p class="welcome-home-eyebrow">Preparando tu sesión</p>
                    <h1>Redirigiendo a tu panel</h1>
                    <p>Estamos cargando la experiencia adecuada según tu perfil de acceso.</p>
                    <div class="gateway-loader" aria-hidden="true"></div>
                </div>
            </section>
        </main>

    </div>

    {{-- Orden de carga obligatorio: auth → router → dashboard --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/router.js') }}" defer></script>
    <script src="{{ asset('js/pages/dashboard.js') }}" defer></script>

</body>
</html>
