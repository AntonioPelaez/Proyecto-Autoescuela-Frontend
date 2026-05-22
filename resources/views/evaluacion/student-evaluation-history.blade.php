@extends('layouts.teacher')
@section('title', 'Histórico de clases')
@section('main-id', 'teacher-student-evaluation-history')

@section('content')

<div class="mb-3">
    <a href="/teacher/student-evaluations/{{ $id ?? '' }}" class="btn btn-secondary">
        ← Volver
    </a>
</div>

<h1 class="page-title">Histórial de clases</h1>

<div id="history-container" class="card card-body">
    <p>Cargando histórico...</p>
</div>

@endsection

@section('scripts')
<script>
    const urlParts = window.location.pathname.split('/');
    window.STUDENT_ID = urlParts[urlParts.length - 2]; // porque la URL termina en /history
</script>

<script src="{{ asset('js/pages/student-evaluation-history.js') }}" defer></script>
@endsection
