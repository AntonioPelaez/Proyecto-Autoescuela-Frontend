@extends('layouts.admin')

@section('title', 'Profesores')
@section('main-id', 'admin-professors-page')

@section('content')
			<header>
				<h1>Gestión de profesores</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="professors-message" class="hidden"></div>

			<section class="card">
			<div class="card-header">
				<h2 id="professor-form-title">Crear profesor</h2>
			</div>
			<div class="card-body">

			<form id="professor-form" novalidate>
				<input type="hidden" id="professor-id" name="id">

				<div class="input-group">
					<label class="input-label" for="professor-name">Nombre</label>
					<input
						type="text"
						id="professor-name"
						name="name"
						class="input"
						placeholder="Nombre del profesor"
						required
					>
				</div>

				<div class="input-group">
					<label class="input-label" for="professor-email">Email</label>
					<input
						type="email"
						id="professor-email"
						name="email"
						class="input"
						placeholder="correo@autoescuela.com"
						required
					>
				</div>

				<div class="input-group">
					<label class="input-label" for="professor-active">Activo</label>
					<input
						type="checkbox"
						id="professor-active"
						name="active"
					>
				</div>

				<div class="table-actions">
					<button type="submit" id="professor-submit" class="btn btn-primary">Guardar</button>
					<button type="button" id="professor-cancel" class="btn btn-outline hidden">Cancelar edición</button>
				</div>
			</form>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Listado de profesores</h2>
				<button type="button" id="professor-create" class="btn btn-secondary btn-sm">Crear</button>
			</div>
			<div class="card-body table-wrapper">

			<table id="professors-table" class="table table-striped table-hover">
				<thead>
					<tr>
						<th>ID</th>
						<th>Nombre</th>
						<th>Email</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody id="professors-table-body">
				</tbody>
			</table>
			</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-professors.js') }}" defer></script>
@endsection
