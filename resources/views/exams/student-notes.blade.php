@extends('layouts.teacher')
@section('title', 'Notas del examen')
@section('main-id', 'teacher-exam-notes')

@section('content')

<h1 class="page-title mb-4">Notas del examen</h1>

<div class="card card-body shadow-sm mb-4">
    <a href="/teacher/exam-calls" class="btn btn-secondary mb-3">← Volver convocatorias</a>

    <div id="notes-info" class="mb-4">
        Cargando datos del alumno...
    </div>

    <form id="notes-form">
        <input type="hidden" id="notes-exam-call-id" value="{{ $examCallId }}">
        <input type="hidden" id="notes-student-id" value="{{ $studentId }}">

        <div class="form-group mb-3">
            <label for="notes-text" class="form-label">Notas (opcional)</label>
            <textarea id="notes-text" class="form-control" rows="4" placeholder="Comentarios sobre el examen"></textarea>
        </div>

        <div class="table-actions">
            <button type="submit" class="btn btn-primary">Guardar notas</button>
            <a href="/teacher/exam-calls" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/student-notes.js') }}" defer></script>
@endsection
