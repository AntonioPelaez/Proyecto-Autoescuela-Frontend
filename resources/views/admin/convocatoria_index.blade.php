@extends('layouts.admin')

@section('title', 'Convocatorias')
@section('main-id', 'admin-convocatorias-index')

@section('content')

<div class="card card-body">
    <div class="role-main-header">
        <h2>Convocatorias de examen</h2>

        <a href="{{ route('exam-calls.create') }}" class="btn btn-primary">
            Crear convocatoria
        </a>
    </div>

    <table class="table table-bordered table-striped mt-3" id="convocatorias-table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Población</th>
                <th>Nº Profesores</th>
                <th>Nº Vehículos</th>
                <th>Nº Alumnos</th>
                <th>Estado</th>
                <th style="width: 200px;">Acciones</th>
            </tr>
        </thead>

        <tbody>
            <!-- Se rellenará por JS -->
        </tbody>
    </table>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/convocatorias-index.js') }}" defer></script>
@endsection
