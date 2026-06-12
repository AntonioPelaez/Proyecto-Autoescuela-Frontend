@extends('layouts.admin')

@section('title', 'Gastos de vehículos')
@section('main-id', 'admin-expenses-index')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Gastos de vehículos</h2>

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Listado de gastos</h5>
        <a href="{{ route('admin.expenses.create') }}" class="btn btn-primary btn-sm">
            Crear gasto
        </a>
    </div>

    <div class="card card-body">

        <div id="loader-expenses" class="text-muted small d-none mb-2">
            Cargando gastos...
        </div>

        <div class="table-responsive">
            <table class="table table-striped align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vehículo</th>
                        <th>Fecha</th>
                        <th>Importe (€)</th>
                        <th>Descripción</th>
                        <th class="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="expenses-table-body">
                    <tr>
                        <td colspan="6" class="text-muted text-center">
                            Cargando datos...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-index.js') }}"></script>
@endsection
