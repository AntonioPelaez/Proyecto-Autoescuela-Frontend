<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>@yield('title') - Autoescuela</title>
	<link rel="preconnect" href="https://fonts.bunny.net">
	<link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

	<div class="container role-layout">
		<aside class="role-sidebar">
			<div class="card card-body">
				<h3>Admin</h3>
				<nav class="role-menu" aria-label="Menu admin">
					<a href="/dashboard" class="role-menu-link {{ request()->is('dashboard') ? 'is-active' : '' }}">Panel</a>
					<a href="/admin/towns" class="role-menu-link {{ request()->is('admin/towns') ? 'is-active' : '' }}">Poblaciones</a>
					<a href="/admin/professors" class="role-menu-link {{ request()->is('admin/professors') ? 'is-active' : '' }}">Profesores</a>
					<a href="/admin/vehicles" class="role-menu-link {{ request()->is('admin/vehicles') ? 'is-active' : '' }}">Vehículos</a>
				</nav>
				<button type="button" class="btn btn-danger btn-sm btn-full" data-action="logout">Cerrar sesión</button>
			</div>
		</aside>

		<main class="role-main" id="@yield('main-id')">
			@yield('content')
		</main>
	</div>

	<script src="{{ asset('js/auth.js') }}" defer></script>
	<script src="{{ asset('js/router.js') }}" defer></script>
	<script src="{{ asset('js/api.js') }}" defer></script>
	<script src="{{ asset('js/ui.js') }}" defer></script>
	<script src="{{ asset('js/logout.js') }}" defer></script>
	@yield('scripts')

</body>
</html>
