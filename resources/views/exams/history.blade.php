@extends('layouts.teacher')
@section('title', 'Historial de exámenes')
@section('main-id', 'student-exam-history')

@section('content')

<div class="mb-3">
    <a href="/teacher/student-evaluations/{{ $id }}" class="btn btn-secondary">
        ← Volver
    </a>
</div>

<h1 class="page-title mb-4">Historial de exámenes</h1>

<div class="card card-body shadow-sm">
    <table class="table table-bordered table-striped text-center align-middle mb-0 w-100">
        <colgroup>
            <col style="width: 15%;">
            <col style="width: 15%;">
            <col style="width: 70%;">
        </colgroup>

        <thead class="table-light">
            <tr>
                <th class="text-center">Fecha</th>
                <th class="text-center">Resultado</th>
                <th class="text-center">Notas</th>
            </tr>
        </thead>

        <tbody id="exam-history-body" class="align-middle text-center">
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
