@extends('layouts.student')

@section('title', 'Panel del alumno')
@section('main-id', 'student-home-page')

@section('content')
			<div class="page-shell page-shell-student">
			<header>
				<h1>Panel del alumno</h1>
				<div class="table-actions">
					<a href="/student/availability" class="btn btn-primary">Reservar nueva clase</a>
					<a href="/student/my-classes" class="btn btn-outline">Ver mis clases</a>
				</div>
			</header>

			<div class="page-shell-intro">
				<p>Consulta tu próxima clase, revisa el historial y reserva nuevas sesiones con menos pasos.</p>
			</div>

			<div id="student-home-state" class="hidden"></div>

			<section class="card">
			<div class="card-header">
				<h2>Proxima clase</h2>
			</div>
			<div class="card-body" id="student-next-class">
				<p>Cargando informacion...</p>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Resumen de reservas</h2>
			</div>
			<div class="card-body">
				<div id="student-summary" class="table-actions"></div>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Disponibilidad rapida</h2>
			</div>
			<div class="card-body">
				<form id="student-quick-form" class="table-actions" novalidate>
					<div class="input-group">
						<label class="input-label" for="quick-town">Poblacion</label>
						<select id="quick-town" class="input" required>
							<option value="">Selecciona una poblacion</option>
						</select>
					</div>
					<div class="input-group">
						<label class="input-label" for="quick-date">Fecha</label>
						<input id="quick-date" type="date" class="input" required>
					</div>
					<button type="submit" class="btn btn-secondary">Buscar huecos</button>
				</form>
				<div id="student-quick-results" class="table-wrapper"></div>
			</div>
			</section>

			<section class="card">
			<div class="card-header">
				<h2>Historial de clases</h2>
			</div>
			<div class="card-body">
				<div class="table-wrapper">
					<table class="table table-striped table-hover">
						<thead>
							<tr>
								<th>Fecha</th>
								<th>Hora</th>
								<th>Profesor</th>
								<th>Vehiculo</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody id="student-history-body"></tbody>
					</table>
				</div>
			</div>
			</section>
			</div>
			<div id="report-modal" class="modal-overlay hidden">
    <div class="modal-box">
        <button class="modal-close" id="report-modal-close">&times;</button>
        <div id="report-modal-content">
            <p>Cargando informe...</p>
        </div>
    </div>
</div>

<style>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}
.modal-overlay.hidden {
    display: none;
}
.modal-box {
    background: #fff;
    padding: 20px;
    width: 95%;
    max-width: 600px;
    border-radius: 8px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
}
.modal-close {
    position: absolute;
    top: 8px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 26px;
    cursor: pointer;
}
</style>

@endsection

@section('scripts')
	<script src="{{ asset('js/pages/student-home.js') }}" defer></script>
@endsection
