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

    {{-- Gráfica 1: consumo por meses --}}
    <div class="card card-body mb-4">
        <h5>Consumo de gasolina por meses</h5>
        <canvas id="chart-months" height="120"></canvas>
    </div>

    {{-- Gráfica 2: consumo por coche del mes --}}
    <div class="card card-body">
        <h5>Consumo por coche del mes seleccionado</h5>
        <canvas id="chart-cars" height="120"></canvas>
    </div>

</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/pages/admin-fuel-logs-index.js') }}"></script>
@endsection
