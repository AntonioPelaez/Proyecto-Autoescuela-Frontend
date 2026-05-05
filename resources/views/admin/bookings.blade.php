@extends('layouts.admin')

@section('title', 'Clases reservadas')
@section('main-id', 'admin-bookings-page')

@section('content')
			<header>
				<h1>Gestión de clases reservadas</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="bookings-message" class="hidden" tabindex="-1"></div>

			<!-- Modal de reasignación -->
			<div id="reassign-modal" role="dialog" aria-modal="true" aria-labelledby="booking-reassign-title"
				 style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.5);
						align-items:center;justify-content:center;">
				<div style="background:#fff;border-radius:12px;padding:2rem;width:100%;max-width:460px;
							box-shadow:0 8px 32px rgba(0,0,0,0.2);position:relative;margin:1rem;">
					<button type="button" id="modal-close-btn" aria-label="Cerrar"
							style="position:absolute;top:0.75rem;right:1rem;background:none;border:none;
								   font-size:1.6rem;cursor:pointer;line-height:1;color:#666;">&times;</button>
					<h2 id="booking-reassign-title" style="margin-bottom:1.2rem;">Reasignar clase</h2>
					<div id="reassign-message" class="hidden" style="margin-bottom:1rem;"></div>
					<form id="booking-reassign-form" novalidate>
						<input type="hidden" id="booking-id" name="bookingId">
						<div class="input-group" style="margin-bottom:1rem;">
							<label class="input-label" for="booking-reassign-professor">Profesor</label>
							<select id="booking-reassign-professor" name="professorId" class="input" required>
								<option value="">Selecciona un profesor</option>
							</select>
						</div>
						<div class="input-group" style="margin-bottom:1.5rem;">
							<label class="input-label" for="booking-reassign-vehicle">Vehículo</label>
							<select id="booking-reassign-vehicle" name="vehicleId" class="input">
								<option value="">— Sin cambiar vehículo —</option>
							</select>
						</div>
						<div class="table-actions">
							<button type="submit" id="booking-reassign-submit" class="btn btn-primary">Guardar reasignación</button>
							<button type="button" id="booking-reassign-cancel" class="btn btn-outline">Cancelar</button>
						</div>
					</form>
				</div>
			</div>

			<section class="card">
				<div class="card-header">
					<h2>Filtros</h2>
				</div>
				<div class="card-body">
					<form id="bookings-filters-form" novalidate role="form" aria-label="Formulario de filtros de clases reservadas">
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
							<button type="submit" class="btn btn-primary" aria-label="Aplicar filtros">Aplicar filtros</button>
							<button type="button" id="booking-clear-filters" class="btn btn-outline" aria-label="Limpiar filtros">Limpiar</button>
						</div>
					</form>
				</div>
			</section>

			<section class="card">
				<div class="card-header">
					<h2>Listado de clases</h2>
				</div>
				<div class="card-body table-wrapper">
					<table id="bookings-table" class="table table-striped table-hover" role="table" aria-label="Listado de clases reservadas">
						<thead>
							<tr>
								<th scope="col">ID</th>
								<th scope="col">Fecha</th>
								<th scope="col">Hora</th>
								<th scope="col">Alumno</th>
								<th scope="col">Población</th>
								<th scope="col">Profesor</th>
								<th scope="col">Vehículo</th>
								<th scope="col">Estado</th>
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
	<style>
	.state-message {
	  margin: 1.2rem 0 0.7rem 0;
	  font-size: 1.08rem;
	  font-weight: 500;
	  border-radius: 8px;
	  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	  outline: none;
	}
	.state-success {
	  background: #eafbe7;
	  color: #1a4d1a;
	  border: 1.5px solid #b6e2c6;
	}
	.state-error {
	  background: #fff0f0;
	  color: #a30000;
	  border: 1.5px solid #f5bcbc;
	}
	</style>
@endsection
