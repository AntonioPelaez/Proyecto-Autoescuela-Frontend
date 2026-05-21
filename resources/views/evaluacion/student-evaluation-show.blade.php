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

{{-- CUADRO DE ESTADÍSTICAS --}}
<div class="card card-body shadow-sm">

    {{-- NOMBRE DEL ALUMNO --}}
    <h2 id="student-name" class="text-center mb-4">
        Cargando alumno...
    </h2>

    <div class="stats-grid">

        <div class="stats-item">
            <h4>Media clase más reciente</h4>
            <p id="latest-average" class="fs-4 fw-bold">—</p>
        </div>

        <div class="stats-item">
            <h4>Media general</h4>
            <p id="global-average" class="fs-4 fw-bold">—</p>
        </div>

        <div class="stats-item">
            <h4>Reportes escritos</h4>
            <a id="reports-button" href="#" class="btn btn-primary btn-sm">
                Ver reportes
            </a>
        </div>

        <div class="stats-item">
            <h4>Histórico de clases</h4>
            <a id="history-button" href="#" class="btn btn-info btn-sm">
                Ver historial
            </a>
        </div>

    </div>

    <hr>

    {{-- RESUMEN DE HABILIDADES --}}
    <h3>Resumen de habilidades</h3>
    <div id="skills-summary" class="p-2">
        <p>Cargando resumen...</p>
    </div>

    <hr>

    {{-- ÁREAS DÉBILES --}}
    <h3>Áreas débiles</h3>
    <div id="weak-areas" class="p-2">
        <p>Cargando áreas débiles...</p>
    </div>

    <hr>

    {{-- ESTADO DE PREPARACIÓN --}}
    <h3>Preparación para examen</h3>
    <div id="ready-status" class="p-2">
        <p>Cargando estado...</p>
    </div>

</div>

@endsection

@section('scripts')
<script>
    const urlParts = window.location.pathname.split('/');
    window.STUDENT_ID = urlParts[urlParts.length - 1];
</script>

<script src="{{ asset('js/pages/student-evaluation-show.js') }}" defer></script>
@endsection
