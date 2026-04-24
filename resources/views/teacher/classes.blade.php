@extends('layouts.teacher')

@section('title', 'Mis clases')
@section('main-id', 'teacher-classes-page')

@section('content')
			<header>
				<h1>Mis clases asignadas</h1>
				<a href="/teacher/home" class="btn btn-outline btn-sm">Volver al panel</a>
			</header>

			<div id="classes-state" class="hidden"></div>

			<section class="card">
			<div class="card-header">
				<h2>Próximas clases</h2>
				<button type="button" id="classes-refresh" class="btn btn-secondary btn-sm">Actualizar</button>
			</div>
			<div class="card-body">
				<table id="classes-table" class="table table-striped table-hover">
					<thead>
						<tr>
							<th>Fecha</th>
							<th>Hora</th>
							<th>Alumno</th>
							<th>Vehículo</th>
							<th>Población</th>
						</tr>
					</thead>
					<tbody id="classes-table-body"></tbody>
				</table>
			</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/teacher-classes.js') }}" defer></script>
@endsection
