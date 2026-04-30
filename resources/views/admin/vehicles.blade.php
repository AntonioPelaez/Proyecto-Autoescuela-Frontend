@extends('layouts.admin')

@section('title', 'Vehículos')
@section('main-id', 'admin-vehicles-page')

@section('content')
			<header>
				<h1>Gestión de vehículos</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="vehicles-state" class="hidden" tabindex="-1"></div>

			<section class="card">
			<div class="card-header">
				<h2 id="vehicle-form-title">Añadir vehículo</h2>
			</div>
			<div class="card-body">
					<form id="vehicle-form" novalidate role="form" aria-label="Formulario de gestión de vehículos" style="max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 2rem 2.5rem;">
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

					<div class="input-group">
						<label for="vehicle-model" class="input-label">Modelo</label>
						<input
							type="text"
							id="vehicle-model"
							name="model"
							class="input"
							placeholder="Ej. Ibiza 1.4 TDI"
						>
					</div>

					<div class="input-group floating-label">
						<select id="vehicle-professor" name="professor_id" class="input" style="width:100%">
							<option value="">-- Selecciona profesor --</option>
							{{-- Opciones dinámicas por JS --}}
						</select>
						<label for="vehicle-professor"><i class="fa fa-user"></i> Profesor asignado</label>
					</div>

					<div class="input-group">
						<label for="vehicle-notes" class="input-label">Notas</label>
						<textarea
							id="vehicle-notes"
							name="notes"
							class="input"
							placeholder="Notas adicionales sobre el vehículo"
						></textarea>
					</div>

					<div class="card-footer">
							<button type="submit" id="vehicle-submit" class="btn btn-primary" aria-label="Guardar vehículo">Guardar</button>
							<button type="button" id="vehicle-cancel" class="btn btn-outline hidden" aria-label="Cancelar edición">Cancelar edición</button>
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
				<table id="vehicles-table" class="table table-striped table-hover" role="table" aria-label="Listado de vehículos">
					<thead>
						<tr>
							<th scope="col">ID</th>
							<th scope="col">Vehículo</th>
							<th scope="col">Matrícula</th>
							<th scope="col">Modelo</th>
							<th scope="col">Profesor</th>
							<th scope="col">Estado</th>
							<th scope="col">Acciones</th>
						</tr>
					</thead>
					<tbody id="vehicles-table-body"></tbody>
				</table>
			</div>
			</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-vehicles.js') }}" defer></script>
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
