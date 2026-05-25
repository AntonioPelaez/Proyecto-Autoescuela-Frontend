@extends('layouts.teacher')
@section('title', 'Progreso del alumno')
@section('main-id', 'teacher-student-evaluation-show')

@section('content')

{{-- BOTÓN VOLVER --}}
<div class="mb-3">
    <a href="/teacher/student-evaluations" class="btn btn-secondary">
        ← Volver
    </a>
</div>

{{-- CUADRO SUPERIOR DE DATOS GENERALES --}}
<div class="card card-body shadow-sm mb-4">

    <h2 id="student-name" class="text-center mb-4">Cargando alumno...</h2>

    <table class="table table-bordered text-center align-middle">
        <tbody>
            <tr>
                <th>Media última clase</th>
                <td id="latest-average">—</td>
            </tr>
            <tr>
                <th>Media general</th>
                <td id="global-average">—</td>
            </tr>
            <tr>
                <th>Preparación</th>
                <td id="ready-status">—</td>
            </tr>
            <tr>
                <th>Reportes escritos</th>
                <td>
                    <a id="reports-button" href="#" class="btn btn-primary btn-sm">Ver reportes</a>
                </td>
            </tr>
            <tr>
                <th>Histórico de clases</th>
                <td>
                    <a id="history-button" href="#" class="btn btn-info btn-sm">Ver historial</a>
                </td>
            </tr>
        </tbody>
    </table>

</div>

{{-- TABLA DE NOTAS POR CLASE Y POR HABILIDAD --}}
<div class="table-responsive" style="overflow-x: auto; white-space: nowrap;">
    <table class="table table-striped table-bordered text-center align-middle w-auto" id="skills-table">
        <thead id="skills-table-head">
            <tr>
                <th>ID Clase</th>
                {{-- columnas dinámicas de habilidades --}}
                <th>Áreas débiles</th>
            </tr>
        </thead>
        <tbody id="skills-table-body">
            <tr>
                <td colspan="20">Cargando datos...</td>
            </tr>
        </tbody>
    </table>
</div>


@endsection

@section('scripts')
<script>
    const urlParts = window.location.pathname.split('/');
    window.STUDENT_ID = urlParts[urlParts.length - 1];
</script>

<script src="{{ asset('js/pages/student-evaluation-show.js') }}" defer></script>
@endsection
