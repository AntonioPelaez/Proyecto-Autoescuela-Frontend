@extends('layouts.admin')

@section('title', 'Profesores')
@section('main-id', 'admin-professors-page')

@section('content')
			<header>
				<h1>Gestión de profesores y usuario</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="professors-message" class="hidden" tabindex="-1"></div>

			<section class="card">
			<div class="card-header">
				<h2 id="professor-form-title">Crear profesor y usuario</h2>
				<div class="professor-mode-toolbar" aria-label="Selector de profesor existente">
					<div class="professor-mode-copy">
						<span class="professor-mode-eyebrow">Consulta rapida</span>
						<label for="professor-picker">Profesor existente</label>
						<p id="professor-picker-help" class="professor-mode-help">Selecciona un profesor ya creado para consultar sus datos en el mismo formulario.</p>
					</div>
					<div class="professor-mode-controls">
						<select id="professor-picker" class="input">
							<option value="">Seleccionar para consultar...</option>
						</select>
						<button type="button" id="professor-picker-reset" class="btn btn-outline btn-sm">Nuevo</button>
					</div>
					<span id="professor-mode-badge" class="professor-mode-badge hidden">Modo consulta</span>
				</div>
			</div>
			<div class="card-body">
						<form id="professor-form" class="professor-form-shell" novalidate role="form" aria-label="Formulario de gestión de profesores" style="max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 2rem 2.5rem;">
							<input type="hidden" id="professor-id" name="id">

							<div class="professor-identity-group">
								<div class="professor-identity-grid">
									<div class="input-group floating-label">
										<input type="text" id="professor-name" name="name" class="input" placeholder="Nombre" required style="width:100%">
										<label for="professor-name"><i class="fa fa-user"></i> Nombre</label>
									</div>
									<div class="input-group floating-label">
										<input type="text" id="professor-surname1" name="surname1" class="input" placeholder="Primer apellido" required style="width:100%">
										<label for="professor-surname1"><i class="fa fa-user"></i> Primer apellido</label>
									</div>
									<div class="input-group floating-label">
										<input type="text" id="professor-surname2" name="surname2" class="input" placeholder="Segundo apellido" required style="width:100%">
										<label for="professor-surname2"><i class="fa fa-user"></i> Segundo apellido</label>
									</div>
								</div>
								<p class="professor-identity-help">Rellena los apellidos por separado para que queden correctamente en el listado y en documentos.</p>
							</div>

							<div class="input-group floating-label" style="margin-bottom: 1.2rem;">
								<input type="email" id="professor-email" name="email" class="input" placeholder=" " required style="width:100%">
								<label for="professor-email"><i class="fa fa-envelope"></i> Email</label>
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
		.professor-mode-toolbar {
			display: flex;
			align-items: center;
			gap: 1rem;
			flex-wrap: wrap;
			margin-left: auto;
			padding: 0.85rem 1rem;
			border: 1px solid #dbe6f3;
			border-radius: 14px;
			background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
			box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
			min-width: min(100%, 620px);
		}
		.professor-mode-copy {
			display: flex;
			flex-direction: column;
			gap: 0.2rem;
			min-width: 190px;
			flex: 1;
		}
		.professor-mode-eyebrow {
			font-size: 0.72rem;
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: #4b6b93;
		}
		.professor-mode-toolbar label {
			font-size: 0.9rem;
			font-weight: 600;
			color: #324860;
		}
		.professor-mode-help {
			margin: 0;
			font-size: 0.82rem;
			color: #5f738b;
			line-height: 1.35;
		}
		.professor-mode-controls {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			flex-wrap: wrap;
			flex: 1 1 260px;
		}
		.professor-mode-toolbar .input {
			min-width: 260px;
			max-width: 420px;
			flex: 1;
			background: #ffffff;
		}
		.professor-mode-badge {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 0.38rem 0.7rem;
			border-radius: 999px;
			background: #dbeafe;
			color: #1d4ed8;
			font-size: 0.78rem;
			font-weight: 700;
			letter-spacing: 0.01em;
		}
		.professor-form-shell.is-readonly {
			background: linear-gradient(180deg, #f8fbff 0%, #fefefe 100%);
			border: 1px solid #d9e5f4;
			box-shadow: 0 8px 24px rgba(15, 57, 115, 0.08);
		}
		.professor-identity-group {
			margin-bottom: 1.2rem;
			padding: 1rem;
			border: 1px solid #eef1f5;
			border-radius: 10px;
			background: linear-gradient(180deg, #fafbfd 0%, #ffffff 100%);
		}
		.professor-identity-grid {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 1rem;
		}
		.professor-identity-grid .input {
			transition: border-color 0.2s ease, box-shadow 0.2s ease;
		}
		.professor-identity-grid .input:focus {
			border-color: #007bff;
			box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.14);
		}
		.professor-identity-help {
			margin: 0.3rem 0 0;
			font-size: 0.84rem;
			color: #6b7480;
		}
		@media (max-width: 980px) {
			.professor-identity-grid {
				grid-template-columns: 1fr 1fr;
			}
		}
		@media (max-width: 640px) {
			.professor-mode-toolbar {
				width: 100%;
				margin-left: 0;
				padding: 0.8rem;
			}
			.professor-mode-copy,
			.professor-mode-controls {
				width: 100%;
			}
			.professor-mode-toolbar .input {
				min-width: 100%;
				max-width: 100%;
			}
			.professor-mode-badge {
				align-self: flex-start;
			}
			.professor-identity-grid {
				grid-template-columns: 1fr;
			}
		}
		</style>
@endsection
