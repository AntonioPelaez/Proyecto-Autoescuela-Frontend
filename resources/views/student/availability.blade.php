@extends('layouts.student')

@section('title', 'Disponibilidad')
@section('main-id', 'student-availability-page')

@section('content')
			<header>
				<h1>Buscar disponibilidad</h1>
				<a href="/student/home" class="btn btn-outline btn-sm">Volver al panel</a>
			</header>

			<div id="availability-message" class="hidden"></div>

			<section class="card">
				<div class="card-header">
					<h2>Buscar huecos</h2>
				</div>
				<div class="card-body">
			<form id="availability-form" novalidate>
				<div class="input-group">
					<label class="input-label" for="availability-town">Población</label>
					<select id="availability-town" name="town" class="input" required>
						<option value="">Selecciona una población</option>
					</select>
				</div>

				<div class="input-group">
					<label class="input-label" for="availability-date">Fecha</label>
					<input
						type="date"
						id="availability-date"
						name="date"
						class="input"
						required
					>
				</div>

				<button type="submit" id="availability-submit" class="btn btn-primary">Buscar</button>
			</form>
				</div>
			</section>

			<section class="card">
				<div class="card-header">
					<h2>Resultados</h2>
				</div>
				<div class="card-body">
			<div id="availability-selection-status"></div>
				</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/student-availability.js') }}" defer></script>
@endsection
