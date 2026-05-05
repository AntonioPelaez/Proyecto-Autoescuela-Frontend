@extends('layouts.admin')

@section('title', 'Alumnos')
@section('main-id', 'admin-students-page')

@section('content')
	<header>
		<h1>Gestión de alumnos y usuario</h1>
		<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
	</header>

	<div id="students-message" class="hidden" tabindex="-1"></div>

	<section class="card">
		<div class="card-header">
			<h2 id="student-form-title">Crear alumno</h2>
			<div class="student-mode-toolbar" aria-label="Selector de alumno existente">
				<div class="student-mode-copy">
					<span class="student-mode-eyebrow">Consulta rapida</span>
					<label for="student-picker">Alumno existente</label>
					<p id="student-picker-help" class="student-mode-help">Selecciona un alumno ya creado para consultar sus datos en el mismo formulario.</p>
				</div>
				<div class="student-mode-controls">
					<select id="student-picker" class="input">
						<option value="">Seleccionar para consultar...</option>
					</select>
					<button type="button" id="student-picker-reset" class="btn btn-outline btn-sm">Nuevo</button>
				</div>
				<span id="student-mode-badge" class="student-mode-badge hidden">Modo consulta</span>
			</div>
		</div>
		<div class="card-body">
			<form id="student-form" class="student-form-shell" novalidate role="form" aria-label="Formulario de gestión de alumnos" style="max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 2rem 2.5rem;">
				<input type="hidden" id="student-id" name="id">

				<div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.2rem;">
					<div class="input-group floating-label">
						<input type="text" id="student-name" name="name" class="input" placeholder="Nombre" required style="width:100%">
						<label for="student-name">Nombre</label>
					</div>
					<div class="input-group floating-label">
						<input type="text" id="student-surname1" name="surname1" class="input" placeholder="Primer apellido" required style="width:100%">
						<label for="student-surname1">Primer apellido</label>
					</div>
					<div class="input-group floating-label">
						<input type="text" id="student-surname2" name="surname2" class="input" placeholder="Segundo apellido" required style="width:100%">
						<label for="student-surname2">Segundo apellido</label>
					</div>
				</div>

				<div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.2rem;">
					<div class="input-group floating-label">
						<input type="email" id="student-email" name="email" class="input" placeholder=" " required style="width:100%">
						<label for="student-email">Email</label>
					</div>
					<div class="input-group floating-label">
						<input type="tel" id="student-phone" name="phone" class="input" placeholder=" " required style="width:100%">
						<label for="student-phone">Teléfono</label>
					</div>
				</div>

				<div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.2rem;">
					<div class="input-group">
						<label class="input-label" for="student-dni">DNI / NIE</label>
						<input type="text" id="student-dni" name="dni" class="input" maxlength="20" style="width:100%">
					</div>
					<div class="input-group">
						<label class="input-label" for="student-birth-date">Fecha de nacimiento</label>
						<input type="date" id="student-birth-date" name="birth_date" class="input" style="width:100%">
					</div>
				</div>

				<div class="input-group" style="margin-bottom: 1.2rem;">
					<label class="input-label" for="student-town">Población preferida</label>
					<select id="student-town" name="town_id" class="input">
						<option value="">Sin población asignada</option>
					</select>
				</div>

				<div id="student-notes-block" style="margin-bottom: 1.2rem;">
					<label class="input-label" for="student-notes">Notas internas</label>
					<textarea id="student-notes" name="notes" class="input" rows="3" placeholder="Ej: Recoger al alumno en la plaza de toros de Antequera..." style="width: 100%; resize: vertical; font-family: inherit; font-size: 0.97rem;"></textarea>
					<p style="margin: 0.35rem 0 0; color: #5b6672; font-size: 0.85rem;">Notas visibles solo para el equipo. El alumno no puede leerlas.</p>
				</div>

				<div id="student-password-block" style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.2rem;">
					<div class="input-group">
						<label class="input-label" for="student-password">Contraseña</label>
						<input type="password" id="student-password" name="password" class="input" minlength="8" autocomplete="new-password">
					</div>
					<div class="input-group">
						<label class="input-label" for="student-password-confirm">Confirmar contraseña</label>
						<input type="password" id="student-password-confirm" name="password_confirm" class="input" minlength="8" autocomplete="new-password">
					</div>
				</div>

				<p id="student-password-help" style="margin: 0 0 1.2rem; color: #5b6672; font-size: 0.95rem;">La contraseña solo se solicita al crear el alumno. El cambio de contraseña no se gestiona desde esta pantalla.</p>

				<div class="table-actions">
					<button type="submit" id="student-submit" class="btn btn-primary">Crear alumno</button>
					<button type="button" id="student-cancel" class="btn btn-outline hidden">Cancelar edición</button>
				</div>
			</form>
		</div>
	</section>

	<section class="card">
		<div class="card-header">
			<h2>Listado de alumnos</h2>
			<button type="button" id="student-create" class="btn btn-secondary btn-sm">Crear</button>
		</div>
		<div class="card-body">
			<form id="students-filters-form" class="table-actions" novalidate role="form" aria-label="Filtros del listado de alumnos" style="margin-bottom: 1rem; align-items: end;">
				<div class="input-group" style="min-width: 240px; flex: 1 1 280px;">
					<label class="input-label" for="student-filter-search">Buscar</label>
					<input type="search" id="student-filter-search" class="input" placeholder="Nombre, email o teléfono">
				</div>
				<div class="input-group" style="min-width: 220px; flex: 0 1 260px;">
					<label class="input-label" for="student-filter-town">Población</label>
					<select id="student-filter-town" class="input">
						<option value="">Todas</option>
					</select>
				</div>
				<div class="table-actions" style="margin-left: auto;">
					<button type="submit" class="btn btn-primary">Filtrar</button>
					<button type="button" id="student-clear-filters" class="btn btn-outline">Limpiar</button>
				</div>
			</form>
			<div class="table-wrapper">
			<table id="students-table" class="table table-striped table-hover" role="table" aria-label="Listado de alumnos">
				<thead>
					<tr>
						<th scope="col">ID</th>
						<th scope="col">Nombre</th>
						<th scope="col">Email</th>
						<th scope="col">Teléfono</th>
						<th scope="col">Población</th>
						<th scope="col">Alta</th>
						<th scope="col">Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody id="students-table-body"></tbody>
			</table>
			</div>
		</div>
	</section>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/admin-students.js') }}" defer></script>
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
	.student-mode-toolbar {
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
	.student-mode-copy {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 190px;
		flex: 1;
	}
	.student-mode-eyebrow {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #4b6b93;
	}
	.student-mode-toolbar label {
		font-size: 0.9rem;
		font-weight: 600;
		color: #324860;
	}
	.student-mode-help {
		margin: 0;
		font-size: 0.82rem;
		color: #5f738b;
		line-height: 1.35;
	}
	.student-mode-controls {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		flex: 1 1 260px;
	}
	.student-mode-toolbar .input {
		min-width: 260px;
		max-width: 420px;
		flex: 1;
		background: #ffffff;
	}
	.student-mode-badge {
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
	.student-form-shell.is-readonly {
		background: linear-gradient(180deg, #f8fbff 0%, #fefefe 100%);
		border: 1px solid #d9e5f4;
		box-shadow: 0 8px 24px rgba(15, 57, 115, 0.08);
	}
	@media (max-width: 800px) {
		#student-form {
			padding: 1.25rem !important;
		}
		#student-form > div {
			grid-template-columns: 1fr !important;
		}
		#student-password-block {
			grid-template-columns: 1fr !important;
		}
		.student-mode-toolbar {
			width: 100%;
			margin-left: 0;
			padding: 0.8rem;
		}
		.student-mode-copy,
		.student-mode-controls {
			width: 100%;
		}
		.student-mode-toolbar .input {
			min-width: 100%;
			max-width: 100%;
		}
		.student-mode-badge {
			align-self: flex-start;
		}
	}
	</style>
@endsection