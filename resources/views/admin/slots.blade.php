@extends('layouts.admin')

@section('title', 'Huecos ofertados')
@section('main-id', 'admin-slots-page')

@section('content')
			<header>
				<h1>Gestión de huecos ofertados</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="slots-message" class="hidden"></div>

			<section class="card">
				<div class="card-header">
					<h2 id="slot-form-title">Crear hueco</h2>
				</div>
				<div class="card-body">
					<form id="slot-form" novalidate>
						<input type="hidden" id="slot-id" name="id">

						<div class="input-group">
							<label class="input-label" for="slot-town">Población</label>
							<select id="slot-town" name="townId" class="input" required>
								<option value="">Selecciona una población</option>
							</select>
						</div>

						<div class="input-group">
							<label class="input-label" for="slot-date">Fecha</label>
							<input type="date" id="slot-date" name="date" class="input" required>
						</div>

						<div class="input-group">
							<label class="input-label" for="slot-time">Hora</label>
							<input type="time" id="slot-time" name="time" class="input" required>
						</div>

						<div class="input-group">
							<label class="input-label" for="slot-professor">Profesor</label>
							<select id="slot-professor" name="professorId" class="input" required>
								<option value="">Selecciona un profesor</option>
							</select>
						</div>

						<div class="input-group">
							<label class="input-label" for="slot-vehicle">Vehículo</label>
							<input
								type="text"
								id="slot-vehicle"
								name="vehicle"
								class="input"
								placeholder="Ej. Seat Ibiza"
								required
							>
						</div>

						<div class="table-actions">
							<button type="submit" id="slot-submit" class="btn btn-primary">Guardar</button>
							<button type="button" id="slot-cancel" class="btn btn-outline hidden">Cancelar edición</button>
						</div>
					</form>
				</div>
			</section>

			<section class="card">
				<div class="card-header">
					<h2>Listado de huecos</h2>
					<button type="button" id="slot-create" class="btn btn-secondary btn-sm">Crear</button>
				</div>
				<div class="card-body table-wrapper">
					<table id="slots-table" class="table table-striped table-hover">
						<thead>
							<tr>
								<th>ID</th>
								<th>Población</th>
								<th>Fecha</th>
								<th>Hora</th>
								<th>Profesor</th>
								<th>Vehículo</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody id="slots-table-body"></tbody>
					</table>
				</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-slots.js') }}" defer></script>
@endsection
