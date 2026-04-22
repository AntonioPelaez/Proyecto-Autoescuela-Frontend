<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Disponibilidad - Autoescuela</title>
	@vite(['resources/css/app.css'])
</head>
<body>

	<div id="student-availability-page">
		<header>
			<h1>Buscar disponibilidad</h1>
			<a href="/dashboard">Volver al dashboard</a>
		</header>

		<div id="availability-message" class="hidden"></div>

		<section>
			<form id="availability-form" novalidate>
				<div>
					<label for="availability-town">Población</label>
					<select id="availability-town" name="town" required>
						<option value="">Selecciona una población</option>
					</select>
				</div>

				<div>
					<label for="availability-date">Fecha</label>
					<input
						type="date"
						id="availability-date"
						name="date"
						required
					>
				</div>

				<button type="submit" id="availability-submit">Buscar</button>
			</form>
		</section>

		<section>
			<div id="availability-selection-status"></div>
		</section>
	</div>

	@vite([
		'resources/js/auth.js',
		'resources/js/router.js',
		'resources/js/api.js',
		'resources/js/ui.js',
		'resources/js/pages/student-availability.js',
	])

</body>
</html>
