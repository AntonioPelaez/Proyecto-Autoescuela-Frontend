@extends('layouts.admin')

@section('title', 'Gastos de vehículos')
@section('main-id', 'admin-expenses-index')

@section('content')

<div class="admin-panel">

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Gastos de vehículos</h2>
        <a href="{{ route('admin.expenses.create') }}" class="btn btn-primary btn-sm">
            Añadir gasto
        </a>
    </div>

    <div class="card card-body">

        <div id="expenses-table-container">
            <p class="text-muted">Cargando gastos...</p>
        </div>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-index.js') }}"></script>
@endsection
