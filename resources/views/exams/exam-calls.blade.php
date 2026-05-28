@extends('layouts.teacher')
@section('title', 'Evaluar convocatoria')
@section('main-id', 'teacher-exam-calls')

@section('content')

<h1 class="page-title mb-4">Evaluar convocatoria</h1>

<div class="card card-body shadow-sm mb-4">
    <div class="form-group">
        <label for="exam-call-select" class="form-label">Selecciona convocatoria</label>
        <select id="exam-call-select" class="form-control" aria-label="Selecciona convocatoria">
            <option value="">Cargando convocatorias...</option>
        </select>
    </div>
</div>

<div class="card card-body shadow-sm mb-4">
    <table class="table table-striped table-bordered align-middle">
        <thead class="table-light">
            <tr>
                <th>Alumno</th>
                <th>Profesor</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Vehículo</th>
                <th>Resultado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody id="exam-call-students-body">
            <tr>
                <td colspan="7">Selecciona una convocatoria para ver los alumnos.</td>
            </tr>
        </tbody>
    </table>
</div>

<div id="evaluate-panel" class="card card-body shadow-sm" style="display:none;">
    <h2 class="mb-3">Evaluar alumno</h2>
    <form id="evaluate-form">
        <input type="hidden" id="evaluate-exam-call-id" name="exam_call_id">
        <input type="hidden" id="evaluate-student-id" name="student_id">

        <div class="form-group mb-3">
            <label class="form-label">Alumno</label>
            <p id="evaluate-student-name" class="mb-0 fw-semibold">-</p>
        </div>

        <div class="form-group mb-3">
            <label class="form-label">Resultado</label>
            <div class="radio-group" role="group" aria-labelledby="resultado-label">
                <label class="radio-inline me-3">
                    <input type="radio" name="resultado" value="apto"> Apto
                </label>
                <label class="radio-inline me-3">
                    <input type="radio" name="resultado" value="no apto"> No apto
                </label>
                <label class="radio-inline">
                    <input type="radio" name="resultado" value="no presentado"> No presentado
                </label>
            </div>
        </div>

        <div class="form-group mb-3">
            <label for="evaluate-notes" class="form-label">Notas (opcional)</label>
            <textarea id="evaluate-notes" class="form-control" rows="3" placeholder="Comentarios sobre el examen"></textarea>
        </div>

        <div class="table-actions">
            <button type="submit" class="btn btn-primary">Guardar evaluación</button>
            <button type="button" class="btn btn-secondary" id="evaluate-cancel">Cancelar</button>
        </div>
    </form>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/exam-calls.js') }}" defer></script>
@endsection
