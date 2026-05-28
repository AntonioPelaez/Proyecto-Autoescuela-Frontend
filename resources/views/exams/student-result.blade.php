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

        <div class="form-group mb-4">
            <label class="form-label d-block mb-2">Resultado</label>

            <div class="resultado-wrapper">

                <label class="resultado-item">
                    <input type="radio" name="resultado" value="apto">
                    <span>Apto</span>
                </label>

                <label class="resultado-item">
                    <input type="radio" name="resultado" value="no_apto">
                    <span>No apto</span>
                </label>

                <label class="resultado-item">
                    <input type="radio" name="resultado" value="no_presentado">
                    <span>No presentado</span>
                </label>

            </div>
        </div>

        {{-- 🔥 AQUÍ SE AÑADE LA SEPARACIÓN REAL --}}
        <div class="mt-4"></div>

        <div class="table-actions">
            <button type="submit" class="btn btn-primary">Siguiente</button>
            <a href="/teacher/exam-calls" class="btn btn-secondary">Cancelar</a>
        </div>

    </form>
</div>

@endsection

@section('scripts')

<style>
    /* 🔥 Alineación perfecta de radios */
    .resultado-wrapper {
        display: flex;
        gap: 2rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .resultado-item {
        display: flex !important;
        align-items: center !important;
        gap: .5rem !important;
        line-height: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .resultado-item input[type="radio"] {
        position: static !important;
        margin: 0 !important;
        transform: none !important;
        top: 0 !important;
    }

    .table-actions {
        padding-top: 1rem;
    }

</style>

<script src="{{ asset('js/pages/student-result.js') }}" defer></script>
@endsection
