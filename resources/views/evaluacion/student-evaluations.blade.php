@extends('layouts.teacher')
@section('title', 'Evaluación alumnos')
@section('main-id', 'teacher-student-evaluations')

@section('content')

<h1 class="page-title">Evaluación de alumnos</h1>

<div id="students-list" class="students-list">
    <p>Cargando alumnos...</p>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/student-evaluations.js') }}" defer></script>
@endsection
