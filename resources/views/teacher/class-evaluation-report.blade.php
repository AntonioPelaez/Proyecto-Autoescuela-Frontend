@extends('layouts.teacher')

@section('title', 'Reporte del alumno')
@section('main-id', 'teacher-class-evaluation-report')

@section('content')
<div class="teacher-panel">
    <h2>Reporte del alumno</h2>

    <div class="card card-body">

        <p>Clase ID <strong id="class-id"></strong></p>

        <form id="report-form">

            <div class="form-group">
                <label for="report-text">Escribe el reporte *</label>
                <textarea id="report-text" class="form-control" rows="6" required></textarea>
            </div>

            <div class="form-group mt-3 d-flex align-items-center">
                <input type="checkbox" id="ready-checkbox" class="form-check-input me-2">
                <label for="ready-checkbox" class="form-check-label">
                    ¿Está listo para examen?
                </label>
            </div>

            <div class="mt-4">
                <button type="submit" class="btn btn-success">Guardar evaluación</button>
            </div>

        </form>
    </div>
</div>
@endsection

@section('scripts')
<script>
    const url = window.location.pathname.split('/').filter(Boolean);
    window.CLASS_SESSION_ID = url[url.length - 2];
    document.getElementById('class-id').textContent = window.CLASS_SESSION_ID;
</script>

<style>
    #ready-checkbox {
        transform: scale(1.2);
    }
</style>

<script src="{{ asset('js/pages/class-evaluation-report.js') }}"></script>
@endsection
