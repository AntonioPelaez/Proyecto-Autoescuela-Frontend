@extends('layouts.admin')

@section('title', 'Gasto de gasolina por periodo')
@section('main-id', 'admin-fuel-logs-index')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Gasto de gasolina por periodo</h2>

    {{-- FILTRO POR PERIODO --}}
    <div class="card card-body mb-4">
        <h5 class="mb-3">Filtrar por periodo</h5>

        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label">Desde</label>
                <input type="datetime-local" id="date-from" class="form-control">
            </div>

            <div class="col-md-6">
                <label class="form-label">Hasta</label>
                <input type="datetime-local" id="date-to" class="form-control">
            </div>
        </div>

        <button id="btn-filter" class="btn btn-primary mt-3 w-100">
            Aplicar filtro
        </button>
    </div>

    {{-- TABLA --}}
    <div class="card card-body mb-4">

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Registros</h5>

            <a href="{{ route('admin.fuel.create') }}" class="btn btn-primary btn-sm">
                Crear registro
            </a>
        </div>

        <div id="loader-table" class="text-muted small d-none mb-2">
            Cargando registros...
        </div>

        <div class="table-responsive">
            <table class="table table-sm align-middle">
                <thead>
                    <tr>
                        <th>Vehículo</th>
                        <th>Fecha</th>
                        <th>Litros</th>
                        <th>Kilómetros</th>
                        <th>Dinero (€)</th>
                        <th class="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="fuel-logs-table">
                    <tr>
                        <td colspan="6" class="text-muted text-center">
                            Selecciona un periodo y pulsa "Aplicar filtro".
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    {{-- GRÁFICA 1: Litros por vehículo en el periodo --}}
    <div class="card card-body mb-4">
        <h5 class="mb-3">Litros por vehículo (periodo seleccionado)</h5>
        <canvas id="chart-cars-period" height="120"></canvas>
    </div>

    {{-- GRÁFICA 2: Consumo total histórico --}}
    <div class="card card-body">
        <h5 class="mb-3">Consumo total por vehículo (histórico)</h5>
        <canvas id="chart-cars-global" height="120"></canvas>
    </div>

</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/pages/admin-fuel-logs-index.js') }}"></script>
@endsection
