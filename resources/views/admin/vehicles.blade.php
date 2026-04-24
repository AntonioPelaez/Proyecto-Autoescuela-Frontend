@extends('layouts.admin')

@section('title', 'Vehículos')
@section('main-id', 'admin-vehicles-page')

@section('content')
			<header>
				<h1>Gestión de vehículos</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="vehicles-state" class="hidden"></div>

			<section class="card">
			<div class="card-header">
				<h2 id="vehicle-form-title">Añadir vehículo</h2>
			</div>
			<div class="card-body">
				<form id="vehicle-form" novalidate>
					<input type="hidden" id="vehicle-id" name="id">

					<div class="input-group">
						<label for="vehicle-name" class="input-label">Vehículo</label>
						<input
							type="text"
							id="vehicle-name"
							name="name"
							class="input"
							placeholder="Ej. Seat Ibiza"
							required
						>
					</div>

					<div class="input-group">
						<label for="vehicle-plate" class="input-label">Matrícula</label>
						<input
							type="text"
							id="vehicle-plate"
							name="plate"
							class="input"
							placeholder="Ej. 1234ABC"
							required
						>
					</div>

					<div class="card-footer">
						<button type="submit" id="vehicle-submit" class="btn btn-primary">Guardar</button>
						<button type="button" id="vehicle-cancel" class="btn btn-outline hidden">Cancelar edición</button>
					</div>
				</form>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Listado de vehículos</h2>
				<button type="button" id="vehicle-create" class="btn btn-secondary btn-sm">Añadir vehículo</button>
			</div>
			<div class="card-body">
				<table id="vehicles-table" class="table table-striped table-hover">
					<thead>
						<tr>
							<th>ID</th>
							<th>Vehículo</th>
							<th>Matrícula</th>
							<th>Estado</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody id="vehicles-table-body"></tbody>
				</table>
			</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-vehicles.js') }}" defer></script>
@endsection
