@extends('layouts.teacher')
@section('title', 'Evaluar resultado')
@section('main-id', 'teacher-exam-result')

@section('content')

<h1 class="page-title mb-4">Evaluar resultado</h1>

<div class="card card-body shadow-sm mb-4">
    <a href="/teacher/exam-calls" class="btn btn-secondary mb-3">← Volver convocatorias</a>

    <div id="result-info" class="mb-4">
        Cargando datos del alumno...
    </div>

    <form id="result-form">
        <input type="hidden" id="result-exam-call-id" value="{{ $examCallId }}">
        <input type="hidden" id="result-student-id" value="{{ $studentId }}">

        <div class="form-group mb-3">
            <label class="form-label">Resultado</label>
            <div class="radio-group" role="group" aria-labelledby="resultado-label">
                <label class="radio-inline me-3">
    <input type="radio" name="resultado" value="apto"> Apto
</label>
<label class="radio-inline me-3">
    <input type="radio" name="resultado" value="no_apto"> No apto
</label>
<label class="radio-inline">
    <input type="radio" name="resultado" value="no_presentado"> No presentado
</label>

            </div>
        </div>

        <div class="table-actions">
            <button type="submit" class="btn btn-primary">Siguiente</button>
            <a href="/teacher/exam-calls" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/student-result.js') }}" defer></script>
@endsection
