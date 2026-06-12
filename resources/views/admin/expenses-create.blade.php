@extends('layouts.admin')

@section('title', 'Crear gasto')
@section('main-id', 'admin-expenses-create')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Crear gasto</h2>

    <div class="card card-body">

        <div class="mb-3">
            <label class="form-label">Vehículo</label>
            <select id="vehicle_id" class="form-control">
                <option value="">-- Selecciona un vehículo --</option>
            </select>
        </div>

        <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="date" id="date" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Importe (€)</label>
            <input type="number" step="0.01" id="amount" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Descripción</label>
            <input type="text" id="description" class="form-control">
        </div>

        <button id="save-expense" class="btn btn-primary w-100">Guardar gasto</button>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-create.js') }}"></script>
@endsection
