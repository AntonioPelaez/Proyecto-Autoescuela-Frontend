@extends('layouts.student')

@section('title', 'Mis clases')
@section('main-id', 'student-my-classes-page')

@section('content')
			<header>
				<h1>Mis clases</h1>
				<a href="/student/home" class="btn btn-outline btn-sm">Volver al panel</a>
			</header>

			<div id="my-classes-message" class="hidden"></div>

			<section class="card">
				<div class="card-header">
					<h2>Historial de clases</h2>
				</div>
				<div class="card-body table-wrapper">
			<table id="my-classes-table" class="table table-striped table-hover">
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
				</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/student-my-classes.js') }}" defer></script>
@endsection
