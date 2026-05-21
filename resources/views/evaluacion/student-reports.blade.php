@extends('layouts.teacher')
@section('title', 'Reportes del alumno')
@section('main-id', 'teacher-student-reports')

@section('content')

<div class="mb-3">
    <a href="/teacher/student-evaluations/{{ $id ?? '' }}" class="btn btn-secondary">
        ← Volver
    </a>
</div>

<h1 class="page-title">Reportes del alumno</h1>

<div id="reports-container" class="card card-body">
    <p>Cargando reportes...</p>
</div>

@endsection

@section('scripts')
<script>
    const urlParts = window.location.pathname.split('/');
    window.STUDENT_ID = urlParts[urlParts.length - 2]; // porque termina en /reports
</script>

<script src="{{ asset('js/pages/student-reports.js') }}" defer></script>
@endsection
