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

						<form id="professor-form" novalidate style="max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 2rem 2.5rem;">
							<input type="hidden" id="professor-id" name="id">

							<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.2rem;">
								<div class="input-group floating-label">
									<input type="text" id="professor-name" name="name" class="input" placeholder=" " required style="width:100%">
									<label for="professor-name"><i class="fa fa-user"></i> Nombre completo</label>
								</div>
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
						<th>Vehículos</th>
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
