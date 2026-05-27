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

    {{-- CUADRO SUPERIOR DE DATOS GENERALES --}}
    <div class="card card-body shadow-sm mb-4">

        <h2 id="student-name" class="text-center mb-4">Cargando alumno...</h2>

        <table class="table table-bordered text-center align-middle">
            <tbody>
                <tr>
                    <th>Media última clase</th>
                    <td id="latest-average">—</td>
                </tr>
                <tr>
                    <th>Media general</th>
                    <td id="global-average">—</td>
                </tr>
                <tr>
                    <th>Preparación</th>
                    <td id="ready-status">—</td>
                </tr>

                {{-- BOTÓN VER REPORTES (ES BUTTON PORQUE EL JS NO LE CAMBIA HREF) --}}
                <tr>
                    <th>Reportes escritos</th>
                    <td>
                        <button id="reports-button" class="btn btn-primary btn-sm">
                            Ver reportes
                        </button>
                    </td>
                </tr>

                {{-- 🔵 HISTORIAL DE CLASES (TIENE QUE SER <a> POR EL JS) --}}
                <tr>
                    <th>Histórico de clases</th>
                    <td>
                        <a id="history-button" class="btn btn-primary btn-sm" href="#">
                            Ver historial
                        </a>
                    </td>
                </tr>

                {{-- 🟠 HISTORIAL DE EXÁMENES (LO HACEMOS <a> PARA QUE SEA IGUAL) --}}
                <tr>
                    <th>Historial de exámenes</th>
                    <td>
                        <a class="btn btn-primary btn-sm"
                           href="/teacher/student-evaluations/{{ $id ?? '' }}/exams">
                            Ver historial de exámenes
                        </a>
                    </td>
                </tr>

            </tbody>
        </table>

    </div>

    {{-- TABLA DE NOTAS POR CLASE Y POR HABILIDAD --}}
    <div class="table-responsive">
        <table class="table table-striped table-bordered text-center align-middle w-auto" id="skills-table">
            <thead id="skills-table-head"></thead>
            <tbody id="skills-table-body">
                <tr id="loader-row">
                    <td colspan="20" class="text-center py-4">
                        <div class="loader loader-inline loader-sm" aria-live="polite">Cargando…</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

@endsection

@section('scripts')
    <script>
        const urlParts = window.location.pathname.split('/');
        window.STUDENT_ID = urlParts[urlParts.length - 1];
    </script>

    <script src="{{ asset('js/pages/student-evaluation-show.js') }}" defer></script>
@endsection
