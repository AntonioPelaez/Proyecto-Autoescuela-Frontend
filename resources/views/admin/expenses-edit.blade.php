@extends('layouts.admin')

@section('title', 'Editar gasto')
@section('main-id', 'admin-expenses-edit')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Editar gasto #{{ $id }}</h2>

    <div class="card card-body">

        {{-- Tipo de gasto --}}
        <div class="mb-3">
            <label class="form-label">Tipo de gasto</label>
            <select id="expense-type" class="form-select">
                <option disabled selected>Selecciona tipo</option>
            </select>
        </div>

        {{-- Cantidad --}}
        <div class="mb-3">
            <label class="form-label">Cantidad (€)</label>
            <input type="number" step="0.01" class="form-control" id="amount">
        </div>

        {{-- Notas --}}
        <div class="mb-3">
            <label class="form-label">Notas</label>
            <textarea class="form-control" id="notes"></textarea>
        </div>

        <button class="btn btn-success w-100">Guardar cambios</button>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-edit.js') }}"></script>
@endsection
