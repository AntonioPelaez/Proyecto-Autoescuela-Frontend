@extends('layouts.teacher')
@section('title', 'Historial de exámenes')
@section('main-id', 'student-exam-history')

@section('content')

<div class="mb-3">
    <a href="/teacher/student-evaluations/{{ $id }}" class="btn btn-secondary">
        ← Volver
    </a>
</div>

<h1 class="page-title">Historial de exámenes</h1>

<div class="card card-body">
    <table class="table table-bordered text-center">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Resultado</th>
                <th>Notas</th>
            </tr>
        </thead>
        <tbody id="exam-history-body">
            <tr>
                <td colspan="3">Cargando…</td>
            </tr>
        </tbody>
    </table>
</div>

@endsection

@section('scripts')
<script>
    const urlParts = window.location.pathname.split('/');
    window.STUDENT_ID = urlParts[urlParts.length - 2];
</script>

<script src="{{ asset('js/pages/exam-history.js') }}" defer></script>
@endsection
