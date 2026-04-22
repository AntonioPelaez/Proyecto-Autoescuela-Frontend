<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard – Autoescuela</title>
    @vite(['resources/css/app.css'])
</head>
<body>

    <div id="app-layout">

        {{-- ── Cabecera ── --}}
        <header id="app-header">
            <span>Autoescuela</span>
            <div id="header-user">
                <span id="user-name"></span>
                <span id="user-role"></span>
                <button type="button" id="btn-logout">Cerrar sesión</button>
            </div>
        </header>

        <div id="app-body">

            {{-- ── Menú lateral ── --}}
            <aside id="app-sidebar">
                <nav>
                    <ul id="sidebar-menu">
                        {{-- Generado por dashboard.js según el rol --}}
                    </ul>
                </nav>
            </aside>

            {{-- ── Contenido principal ── --}}
            <main id="app-main">
                <div id="dashboard-content">
                    {{-- Generado por dashboard.js según el rol --}}
                </div>
            </main>

        </div>

    </div>

    {{-- Orden de carga obligatorio: auth → router → dashboard --}}
    @vite([
        'resources/js/auth.js',
        'resources/js/router.js',
        'resources/js/pages/dashboard.js',
    ])

</body>
</html>
