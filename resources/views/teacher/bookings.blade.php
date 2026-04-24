@extends('layouts.teacher')

@section('title', 'Mi agenda')
@section('main-id', 'teacher-bookings-page')

@section('content')
			<header>
				<h1>Mi agenda</h1>
				<a href="/teacher/home" class="btn btn-outline btn-sm">Volver al panel</a>
			</header>

			<div id="teacher-bookings-message" class="hidden"></div>

			<section class="card">
				<div class="card-header">
					<h2>Agenda de clases</h2>
				</div>
				<div class="card-body table-wrapper">
			<table id="teacher-bookings-table" class="table table-striped table-hover">
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
				</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/teacher-bookings.js') }}" defer></script>
@endsection
