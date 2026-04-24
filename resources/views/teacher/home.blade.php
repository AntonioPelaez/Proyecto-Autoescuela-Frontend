@extends('layouts.teacher')

@section('title', 'Panel del profesor')
@section('main-id', 'teacher-home-page')

@section('content')
			<header>
				<h1>Panel del profesor</h1>
				<div class="table-actions">
					<a href="/teacher/classes" class="btn btn-primary">Ver clases</a>
					<a href="/teacher/bookings" class="btn btn-outline">Abrir agenda completa</a>
				</div>
			</header>

			<div id="teacher-home-state" class="hidden"></div>

			<section class="card">
			<div class="card-header">
				<h2>Clases de hoy</h2>
			</div>
			<div class="card-body table-wrapper">
				<table class="table table-striped table-hover">
					<thead>
						<tr>
							<th>Hora</th>
							<th>Alumno</th>
							<th>Poblacion</th>
							<th>Vehiculo</th>
						</tr>
					</thead>
					<tbody id="teacher-today-body"></tbody>
				</table>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Agenda semanal (7 dias)</h2>
			</div>
			<div class="card-body" id="teacher-week-summary"></div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Proximas clases</h2>
			</div>
			<div class="card-body table-wrapper">
				<table class="table table-striped table-hover">
					<thead>
						<tr>
							<th>Fecha</th>
							<th>Hora</th>
							<th>Alumno</th>
							<th>Poblacion</th>
						</tr>
					</thead>
					<tbody id="teacher-upcoming-body"></tbody>
				</table>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Historial impartido</h2>
			</div>
			<div class="card-body table-wrapper">
				<table class="table table-striped table-hover">
					<thead>
						<tr>
							<th>Fecha</th>
							<th>Hora</th>
							<th>Alumno</th>
							<th>Estado</th>
						</tr>
					</thead>
					<tbody id="teacher-history-body"></tbody>
				</table>
			</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/teacher-home.js') }}" defer></script>
@endsection
