@extends('layouts.teacher')

@section('title', 'Resultado del examen')
@section('main-id', 'teacher-exam-result')

@section('content')
<div class="card card-body">
    <h2>Resultado del examen</h2>

    <form id="exam-result-form">

        <div class="form-group mb-3">
            <label>Alumno</label>
            <input type="text" class="form-control" value="{{ $student->name }}" disabled>
        </div>

        <div class="form-group mb-3">
            <label>Resultado</label>
            <select name="result" id="result" class="form-control" required>
                <option value="">Selecciona</option>
                <option value="approved">Aprobado</option>
                <option value="failed">Suspendido</option>
            </select>
        </div>

        <div class="form-group mb-3">
            <label>Notas (opcional)</label>
            <textarea name="notes" id="notes" class="form-control" rows="4"></textarea>
        </div>

        <div class="d-flex justify-content-between mt-4 pt-3 border-top">
            <a href="/teacher/panel" class="btn btn-secondary">Volver</a>
            <button type="submit" class="btn btn-primary">Guardar resultado</button>
        </div>

    </form>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/pages/teacher-exam-result.js') }}" defer></script>
@endsection
