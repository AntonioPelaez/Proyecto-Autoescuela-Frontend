<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Mis clases - Autoescuela</title>
	<link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

	<div id="student-my-classes-page">
		<header>
			<h1>Mis clases</h1>
			<a href="/dashboard">Volver al dashboard</a>
		</header>

		<div id="my-classes-message" class="hidden"></div>

		<section>
			<table id="my-classes-table" border="1">
				<thead>
					<tr>
						<th>Fecha</th>
						<th>Hora</th>
						<th>Profesor</th>
						<th>Vehículo</th>
						<th>Estado</th>
					</tr>
				</thead>
				<tbody id="my-classes-table-body">
				</tbody>
			</table>
		</section>
	</div>

	<script src="{{ asset('js/ui.js') }}" defer></script>
	<script src="{{ asset('js/pages/student-my-classes.js') }}" defer></script>

</body>
</html>
