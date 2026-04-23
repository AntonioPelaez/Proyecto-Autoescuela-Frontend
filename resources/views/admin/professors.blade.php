<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Profesores - Autoescuela</title>
	<link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

	<div id="admin-professors-page">
		<header>
			<h1>Gestión de profesores</h1>
			<a href="/dashboard">Volver al dashboard</a>
		</header>

		<div id="professors-message" class="hidden"></div>

		<section>
			<h2 id="professor-form-title">Crear profesor</h2>

			<form id="professor-form" novalidate>
				<input type="hidden" id="professor-id" name="id">

				<div>
					<label for="professor-name">Nombre</label>
					<input
						type="text"
						id="professor-name"
						name="name"
						placeholder="Nombre del profesor"
						required
					>
				</div>

				<div>
					<label for="professor-email">Email</label>
					<input
						type="email"
						id="professor-email"
						name="email"
						placeholder="correo@autoescuela.com"
						required
					>
				</div>

				<div>
					<label for="professor-active">Activo</label>
					<input
						type="checkbox"
						id="professor-active"
						name="active"
					>
				</div>

				<button type="submit" id="professor-submit">Guardar</button>
				<button type="button" id="professor-cancel" class="hidden">Cancelar edición</button>
			</form>
		</section>

		<section>
			<div>
				<h2>Listado de profesores</h2>
				<button type="button" id="professor-create">Crear</button>
			</div>

			<table id="professors-table" border="1">
				<thead>
					<tr>
						<th>ID</th>
						<th>Nombre</th>
						<th>Email</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody id="professors-table-body">
				</tbody>
			</table>
		</section>
	</div>

	<script src="{{ asset('js/auth.js') }}" defer></script>
	<script src="{{ asset('js/router.js') }}" defer></script>
	<script src="{{ asset('js/api.js') }}" defer></script>
	<script src="{{ asset('js/pages/admin-professors.js') }}" defer></script>

</body>
</html>
