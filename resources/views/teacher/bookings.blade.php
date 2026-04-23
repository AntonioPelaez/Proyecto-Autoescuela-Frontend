<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Mi agenda - Autoescuela</title>
	<link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

	<div id="teacher-bookings-page">
		<header>
			<h1>Mi agenda</h1>
			<a href="/dashboard">Volver al dashboard</a>
		</header>

		<div id="teacher-bookings-message" class="hidden"></div>

		<section>
			<table id="teacher-bookings-table" border="1">
				<thead>
					<tr>
						<th>Alumno</th>
						<th>Población</th>
						<th>Vehículo</th>
						<th>Hora</th>
						<th>Estado</th>
					</tr>
				</thead>
				<tbody id="teacher-bookings-table-body">
				</tbody>
			</table>
		</section>
	</div>

	<script src="{{ asset('js/pages/teacher-bookings.js') }}" defer></script>

</body>
</html>
