@extends('layouts.admin')

@section('title', 'Panel Admin')
@section('main-id', 'admin-panel-page')

@section('content') 
    <div class="page-shell page-shell-admin">
    <header>
        <h1>Panel de administración</h1>
        <div class="table-actions">
            <a href="/admin/bookings" class="btn btn-primary">Ver clases reservadas</a>
            <a href="/admin/incidents" class="btn btn-outline">Abrir incidencias</a>
        </div>
    </header>

    <div class="page-shell-intro">
        <p>Consulta una vista global del sistema con datos generales de las secciones principales para tomar decisiones rápidas sin entrar en cada pantalla.</p>
    </div>

    <div id="admin-panel-summary-state" class="hidden" tabindex="-1"></div>

    <section class="card">
        <div class="card-header">
            <h2>Resumen de gestión</h2>
        </div>
        <div class="card-body table-wrapper">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Sección</th>
                        <th>Total</th>
                        <th>Estado general</th>
                        <th>Acceso</th>
                    </tr>
                </thead>
                <tbody id="admin-management-body"></tbody>
            </table>
        </div>
    </section>

    <section class="card">
        <div class="card-header">
            <h2>Operación diaria</h2>
        </div>
        <div class="card-body table-wrapper">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Bloque</th>
                        <th>Total</th>
                        <th>Detalle</th>
                        <th>Acceso</th>
                    </tr>
                </thead>
                <tbody id="admin-operations-body"></tbody>
            </table>
        </div>
    </section>

    <section class="card">
        <div class="card-header">
            <h2>Estado de incidencias</h2>
        </div>
        <div class="card-body" id="admin-incidents-summary"></div>
    </section>

    <section class="card">
    <div class="card-header">
        <h2>Rentabilidad del vehículo</h2>
    </div>

    <div class="card-body">
        <label for="vehicle-select">Selecciona un vehículo:</label>
        <select id="vehicle-select" class="form-control mb-3">
            <option value="">-- Selecciona un vehículo --</option>
        </select>
        <div class="row mb-3">
    <div class="col">
        <label for="date-from">Desde:</label>
        <input type="date" id="date-from" class="form-control">
    </div>
    <div class="col">
        <label for="date-to">Hasta:</label>
        <input type="date" id="date-to" class="form-control">
    </div>
</div>

<button id="filter-profitability" class="btn btn-primary mb-3">
    Filtrar rentabilidad
</button>

        <div id="admin-gasoline-monthly"></div>
    </div>
</section>


    <section class="card">
        <div class="card-header">
            <h2>Accesos complementarios</h2>
        </div>
        <div class="card-body">
            <div class="table-actions">
                <a href="/admin/towns" class="btn btn-outline btn-sm">Poblaciones</a>
                <a href="/admin/professors" class="btn btn-outline btn-sm">Profesores</a>
                <a href="/admin/students" class="btn btn-outline btn-sm">Alumnos</a>
                <a href="/admin/vehicles" class="btn btn-outline btn-sm">Vehículos</a>
                <a href="/admin/slots" class="btn btn-outline btn-sm">Huecos ofertados</a>
                <a href="/admin/help" class="btn btn-outline btn-sm">Ayuda</a>
            </div>
        </div>
    </section>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('js/pages/admin-panel.js') }}" defer></script>
    <style>
    #admin-panel-summary-state {
        margin-bottom: 1rem;
    }
    #admin-incidents-summary ul {
        margin: 0;
        padding-left: 1.1rem;
        color: #334155;
    }
    #admin-incidents-summary li {
        margin: 0.25rem 0;
    }
    </style>
@endsection
