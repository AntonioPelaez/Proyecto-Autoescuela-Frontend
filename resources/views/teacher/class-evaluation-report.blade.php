@extends('layouts.teacher')

@section('title', 'Reporte del alumno')
@section('main-id', 'teacher-class-evaluation-report')

@section('content')
<div class="teacher-panel">
    <h2>Reporte del alumno</h2>

    <div class="card card-body">

        <p class="mb-2">Clase ID <strong id="class-id"></strong></p>

        <form id="report-form">

            <!-- TEXTAREA -->
            <div class="form-group mb-2">
                <label for="report-text">Escribe el reporte *</label>
                <textarea id="report-text" class="form-control" rows="6" required></textarea>
            </div>

            <!-- CHECKBOX -->
            <div class="checkbox-row">
                <label for="ready-checkbox" class="checkbox-label">
                    Está listo para examen
                </label>
                <input type="checkbox" id="ready-checkbox" class="checkbox-input">
            </div>

            <!-- BOTÓN -->
            <div class="mt-3">
                <button type="submit" class="btn btn-primary">
                    Guardar evaluación
                </button>
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
.checkbox-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 14px 0 !important; /* ← SEPARACIÓN PERFECTA */
}

.checkbox-label {
    margin: 0;
    padding: 0;
    line-height: 20px;
    display: flex;
    align-items: center;
}

.checkbox-input {
    width: 20px;
    height: 20px;
    margin: 0;
}
</style>

<script src="{{ asset('js/pages/class-evaluation-report.js') }}"></script>
@endsection
