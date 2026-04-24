@extends('layouts.admin')

@section('title', 'Poblaciones')
@section('main-id', 'admin-towns-page')

@section('content')
			<header>
				<h1>Gestión de poblaciones</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="towns-message" class="hidden"></div>

			<section class="card">
			<div class="card-header">
				<h2 id="town-form-title">Crear población</h2>
			</div>
			<div class="card-body">

			<form id="town-form" novalidate>
				<input type="hidden" id="town-id" name="id">

				<div class="input-group">
					<label class="input-label" for="town-name">Nombre</label>
					<input
						type="text"
						id="town-name"
						name="name"
						class="input"
						placeholder="Nombre de la población"
						required
					>
				</div>

				<div class="table-actions">
					<button type="submit" id="town-submit" class="btn btn-primary">Guardar</button>
					<button type="button" id="town-cancel" class="btn btn-outline hidden">Cancelar edición</button>
				</div>
			</form>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Listado de poblaciones</h2>
				<button type="button" id="town-create" class="btn btn-secondary btn-sm">Crear</button>
			</div>
			<div class="card-body table-wrapper">

			<table id="towns-table" class="table table-striped table-hover">
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
			</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-towns.js') }}" defer></script>
@endsection
