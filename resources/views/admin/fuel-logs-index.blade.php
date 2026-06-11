@extends('layouts.admin')

@section('title', 'Gastos gasolina')
@section('main-id', 'admin-fuel-logs-index')

@section('content')

<div class="admin-panel">

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Gasto de gasolina por mes</h2>

        <a href="{{ route('admin.fuel.create') }}" class="btn btn-primary">
            Crear registro
        </a>
    </div>

    {{-- Selector de mes --}}
    <div class="card card-body mb-4">
        <h5>Selecciona mes</h5>
        <input type="month" id="month-select" class="form-control">
    </div>

    {{-- Tabla de coches del mes --}}
    <div class="card card-body mb-4">
        <h5 class="mb-3">Coches con consumo este mes</h5>

        <div id="loader-table" class="text-center py-3 d-none">
            Cargando datos...
        </div>

        <div class="table-responsive">
            <table class="table table-striped align-middle">
                <thead>
                    <tr>
                        <th>Vehículo</th>
                        <th>Litros gastados</th>
                        <th>Kilómetros</th>
                        <th class="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="fuel-logs-table">
                    <tr>
                        <td colspan="4" class="text-muted">Selecciona un mes.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    {{-- Gráfica 1: consumo del mes seleccionado --}}
    <div class="card card-body mb-4 d-none" id="chart-months-wrapper">
        <h5>Consumo de gasolina del mes seleccionado</h5>

        <div id="loader-months" class="text-center py-3 d-none">
            Cargando gráfica...
        </div>

        <canvas id="chart-months"></canvas>
    </div>

    {{-- Gráfica 2: consumo total por vehículo (histórico) --}}
    <div class="card card-body">
        <h5>Consumo total por vehículo (histórico)</h5>

        <div id="loader-cars" class="text-center py-3">
            Cargando gráfica...
        </div>

        <canvas id="chart-cars"></canvas>
    </div>

</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/pages/admin-fuel-logs-index.js') }}"></script>
@endsection
