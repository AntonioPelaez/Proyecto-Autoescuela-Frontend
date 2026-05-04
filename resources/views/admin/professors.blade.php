@extends('layouts.admin')

@section('title', 'Profesores')
@section('main-id', 'admin-professors-page')

@section('content')
			<header>
				<h1>Gestión de profesores</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="professors-message" class="hidden" tabindex="-1"></div>

			<section class="card">
			<div class="card-header">
				<h2 id="professor-form-title">Crear profesor</h2>
			</div>
			<div class="card-body">

						<form id="professor-form" novalidate role="form" aria-label="Formulario de gestión de profesores" style="max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 2rem 2.5rem;">
							<input type="hidden" id="professor-id" name="id">

							<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.2rem;">
								<div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.5rem; margin-bottom: 1.2rem;">
									<div class="input-group floating-label">
										<input type="text" id="professor-name" name="name" class="input" placeholder="Nombre" required style="width:100%">
										<label for="professor-name"><i class="fa fa-user"></i> Nombre</label>
									</div>
									<div class="input-group floating-label">
										<input type="text" id="professor-surname" name="surname" class="input" placeholder="Apellidos" required style="width:100%">
										<label for="professor-surname"><i class="fa fa-user"></i> Apellidos</label>
									</div>
								</div>

								<hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #eee;">
								<div class="input-group floating-label">
									<input type="email" id="professor-email" name="email" class="input" placeholder=" " required style="width:100%">
									<label for="professor-email"><i class="fa fa-envelope"></i> Email</label>
								</div>
							</div>

							<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.2rem;">
								<div class="input-group floating-label">
									<input type="text" id="professor-dni" name="dni" class="input" placeholder=" " style="width:100%">
									<label for="professor-dni"><i class="fa fa-id-card"></i> DNI</label>
								</div>
								<div class="input-group floating-label">
									<input type="text" id="professor-license" name="license" class="input" placeholder=" " style="width:100%">
									<label for="professor-license"><i class="fa fa-id-badge"></i> Licencia</label>
								</div>
							</div>

							<div class="input-group floating-label" style="margin-bottom: 1.2rem;">
								<textarea id="professor-notes" name="notes" class="input" placeholder=" " rows="2" style="width:100%; min-height: 48px;"></textarea>
								<label for="professor-notes"><i class="fa fa-sticky-note"></i> Notas</label>
							</div>

							<div class="input-group input-group-checkbox" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.7rem;">
								<input type="checkbox" id="professor-active" name="active" style="accent-color: #007bff; width: 20px; height: 20px;">
								<label for="professor-active" style="margin: 0; font-weight: 500; cursor: pointer;">
									<i class="fa fa-check-circle" style="color: #007bff;"></i> Activo
									<small class="input-help" style="display:block; color:#888; font-weight:400;">Marca para que el profesor esté disponible en el sistema.</small>
								</label>
							</div>

				<div class="table-actions">
							<button type="submit" id="professor-submit" class="btn btn-primary" aria-label="Guardar profesor">Guardar</button>
							<button type="button" id="professor-cancel" class="btn btn-outline hidden" aria-label="Cancelar edición">Cancelar edición</button>
				</div>
			</form>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Listado de profesores</h2>
						<button type="button" id="professor-create" class="btn btn-secondary btn-sm" aria-label="Crear nuevo profesor">Crear</button>
			</div>
			<div class="card-body table-wrapper">

			<table id="professors-table" class="table table-striped table-hover" role="table" aria-label="Listado de profesores">
				<thead>
					<tr>
						<th scope="col">ID</th>
						<th scope="col">Nombre</th>
						<th scope="col">Email</th>
						<th scope="col">Vehículos</th>
						<th scope="col">Estado</th>
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
		<script type="module" src="{{ asset('js/pages/admin-professors.js') }}" defer></script>
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
