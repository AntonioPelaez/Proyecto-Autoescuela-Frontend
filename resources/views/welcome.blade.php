<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autoescuela</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
    <main class="welcome-home">
        <div class="container">
            <section class="card welcome-home-hero">
                <div class="card-body">
                    <p class="welcome-home-eyebrow">Proyecto Autoescuela</p>
                    <h1>Panel de gestión de clases y reservas</h1>
                    <p class="welcome-home-lead">
                        Frontend en Laravel con arquitectura de assets clásicos, componentes UI reutilizables y pantallas por rol.
                    </p>

                    <div class="welcome-home-actions">
                        <a href="/login" class="btn btn-primary btn-lg">Iniciar sesión</a>
                        <a href="/dashboard" class="btn btn-outline btn-lg">Ir al dashboard</a>
                    </div>
                </div>
            </section>

            <section class="welcome-home-grid">
                <article class="card">
                    <div class="card-body">
                        <h2>Administración</h2>
                        <p>Gestiona poblaciones, profesores y vehículos desde un flujo unificado.</p>
                    </div>
                </article>

                <article class="card">
                    <div class="card-body">
                        <h2>Profesorado</h2>
                        <p>Consulta agenda y clases asignadas con estados de carga y refresco inmediato.</p>
                    </div>
                </article>

                <article class="card">
                    <div class="card-body">
                        <h2>Alumnado</h2>
                        <p>Reserva clases y revisa disponibilidad con una interfaz consistente.</p>
                    </div>
                </article>
            </section>

            <footer class="welcome-home-footer">
                Laravel v{{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})
            </footer>
        </div>
    </main>
</body>
</html>
