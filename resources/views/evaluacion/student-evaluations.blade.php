@extends('layouts.teacher')
@section('title', 'Evaluación de alumnos')
@section('main-id', 'teacher-student-evaluations')

@section('content')

<h1 class="page-title mb-4">Evaluación de alumnos</h1>

<div class="card card-body shadow-sm">

    <table class="table table-striped table-bordered text-center align-middle">
        <thead class="table-light">
            <tr>
                <th>Alumno</th>
                <th>Clases evaluadas</th>
                <th>Preparado</th>
                <th>Acciones</th>
            </tr>
        </thead>

        <tbody id="students-table-body">
            <tr>
                <td colspan="4">Cargando alumnos...</td>
            </tr>
        </tbody>
    </table>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/student-evaluations.js') }}" defer></script>
@endsection
