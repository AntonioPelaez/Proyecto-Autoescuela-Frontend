@extends('layouts.teacher')
@section('title', 'Quitar alumno')
@section('main-id', 'teacher-exam-remove')

@section('content')

<h1 class="page-title mb-4">Quitar alumno</h1>

<div class="card card-body shadow-sm mb-4">
    <a href="/teacher/exam-calls" class="btn btn-secondary mb-3">← Volver convocatorias</a>

    <div id="remove-info" class="mb-4">
        Cargando datos del alumno...
    </div>

    <form id="remove-form">
        <input type="hidden" id="remove-exam-call-id" value="{{ $examCallId }}">
        <input type="hidden" id="remove-student-id" value="{{ $studentId }}">

        <div class="form-group mb-3">
            <label for="remove-reason" class="form-label">Razón para quitar al alumno</label>
            <textarea id="remove-reason" class="form-control" rows="4" placeholder="Escribe la razón por la que el alumno debe ser retirado de la convocatoria"></textarea>
        </div>

        <div class="table-actions">
            <button type="submit" class="btn btn-danger">Guardar y quitar alumno</button>
            <a href="/teacher/exam-calls" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/student-remove.js') }}" defer></script>
@endsection