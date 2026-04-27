@extends('layouts.admin')

@section('title', 'Clases reservadas')
@section('main-id', 'admin-bookings-page')

@section('content')
			<header>
				<h1>Gestión de clases reservadas</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="bookings-message" class="hidden"></div>

			<section class="card">
				<div class="card-header">
					<h2>Filtros</h2>
				</div>
				<div class="card-body">
					<form id="bookings-filters-form" novalidate>
						<div class="input-group">
							<label class="input-label" for="booking-filter-date">Fecha</label>
							<input type="date" id="booking-filter-date" name="date" class="input">
						</div>

						<div class="input-group">
							<label class="input-label" for="booking-filter-town">Población</label>
							<select id="booking-filter-town" name="townId" class="input">
								<option value="">Todas</option>
							</select>
						</div>

						<div class="input-group">
							<label class="input-label" for="booking-filter-professor">Profesor</label>
							<select id="booking-filter-professor" name="professorId" class="input">
								<option value="">Todos</option>
							</select>
						</div>

						<div class="input-group">
							<label class="input-label" for="booking-filter-status">Estado</label>
							<select id="booking-filter-status" name="status" class="input">
								<option value="">Todos</option>
								<option value="confirmada">Confirmada</option>
								<option value="cancelada">Cancelada</option>
							</select>
						</div>

						<div class="table-actions">
							<button type="submit" class="btn btn-primary">Aplicar filtros</button>
							<button type="button" id="booking-clear-filters" class="btn btn-outline">Limpiar</button>
						</div>
					</form>
				</div>
			</section>

			<section class="card">
				<div class="card-header">
					<h2 id="booking-reassign-title">Reasignación rápida</h2>
				</div>
				<div class="card-body">
					<form id="booking-reassign-form" novalidate>
						<input type="hidden" id="booking-id" name="bookingId">

						<div class="input-group">
							<label class="input-label" for="booking-reassign-professor">Profesor</label>
							<select id="booking-reassign-professor" name="professorId" class="input" required>
								<option value="">Selecciona un profesor</option>
							</select>
						</div>

						<div class="input-group">
							<label class="input-label" for="booking-reassign-vehicle">Vehículo</label>
							<input type="text" id="booking-reassign-vehicle" name="vehicle" class="input" placeholder="Ej. Seat Ibiza" required>
						</div>

						<div class="table-actions">
							<button type="submit" id="booking-reassign-submit" class="btn btn-primary" disabled>Guardar reasignación</button>
							<button type="button" id="booking-reassign-cancel" class="btn btn-outline" disabled>Cancelar</button>
						</div>
					</form>
				</div>
			</section>

			<section class="card">
				<div class="card-header">
					<h2>Listado de clases</h2>
				</div>
				<div class="card-body table-wrapper">
					<table id="bookings-table" class="table table-striped table-hover">
						<thead>
							<tr>
								<th>ID</th>
								<th>Fecha</th>
								<th>Hora</th>
								<th>Alumno</th>
								<th>Población</th>
								<th>Profesor</th>
								<th>Vehículo</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody id="bookings-table-body"></tbody>
					</table>
				</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-bookings.js') }}" defer></script>
@endsection
