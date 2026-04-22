<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Poblaciones - Autoescuela</title>
	@vite(['resources/css/app.css'])
</head>
<body>

	<div id="admin-towns-page">
		<header>
			<h1>Gestión de poblaciones</h1>
			<a href="/dashboard">Volver al dashboard</a>
		</header>

		<div id="towns-message" class="hidden"></div>

		<section>
			<h2 id="town-form-title">Crear población</h2>

			<form id="town-form" novalidate>
				<input type="hidden" id="town-id" name="id">

				<div>
					<label for="town-name">Nombre</label>
					<input
						type="text"
						id="town-name"
						name="name"
						placeholder="Nombre de la población"
						required
					>
				</div>

				<button type="submit" id="town-submit">Guardar</button>
				<button type="button" id="town-cancel" class="hidden">Cancelar edición</button>
			</form>
		</section>

		<section>
			<div>
				<h2>Listado de poblaciones</h2>
				<button type="button" id="town-create">Crear</button>
			</div>

			<table id="towns-table" border="1">
				<thead>
					<tr>
						<th>ID</th>
						<th>Nombre</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody id="towns-table-body">
				</tbody>
			</table>
		</section>
	</div>

	@vite([
		'resources/js/auth.js',
		'resources/js/router.js',
		'resources/js/api.js',
		'resources/js/pages/admin-towns.js',
	])

</body>
</html>
