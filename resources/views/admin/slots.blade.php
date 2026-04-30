@extends('layouts.admin')

@section('title', 'Huecos ofertados')
@section('main-id', 'admin-slots-page')

@section('content')
			<header>
				<h1>Gestión de huecos ofertados</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="slots-message" class="hidden" tabindex="-1"></div>

			<section class="card">
				<div class="card-header">
					<h2 id="slot-form-title">Crear hueco</h2>
				</div>
				<div class="card-body">
					<form id="slot-form" novalidate role="form" aria-label="Formulario de gestión de huecos de clase">
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
							<label class="input-label" for="slot-professor">Profesor</label>
							<select id="slot-professor" name="professorId" class="input" required>
								<option value="">Selecciona un profesor</option>
							</select>
						</div>
						<div class="input-group" id="slot-time-grid-wrapper">
							<div id="slot-time-grid" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;"></div>
							<input type="hidden" id="slot-time" name="time" required>
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
							<button type="submit" id="slot-submit" class="btn btn-primary" aria-label="Guardar hueco">Guardar</button>
							<button type="button" id="slot-cancel" class="btn btn-outline hidden" aria-label="Cancelar edición">Cancelar edición</button>
						</div>
					</form>
				</div>
			</section>

			<section class="card">
				<div class="card-header">
					<h2>Listado de huecos</h2>
					<button type="button" id="slot-create" class="btn btn-secondary btn-sm" aria-label="Crear nuevo hueco">Crear</button>
				</div>
				<div class="card-body table-wrapper">
					<table id="slots-table" class="table table-striped table-hover" role="table" aria-label="Listado de huecos ofertados">
						<thead>
							<tr>
								<th scope="col">ID</th>
								<th scope="col">Población</th>
								<th scope="col">Fecha</th>
								<th scope="col">Hora</th>
								<th scope="col">Profesor</th>
								<th scope="col">Vehículo</th>
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
