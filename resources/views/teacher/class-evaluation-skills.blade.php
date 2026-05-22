@extends('layouts.teacher')

@section('title', 'Evaluar habilidades')
@section('main-id', 'teacher-class-evaluation-skills')

@section('content')
<div class="teacher-panel">
    <h2>Evaluar habilidades</h2>

    <div class="card card-body">

        <p>Clase ID <strong id="class-id"></strong></p>
        <p id="class-info">Cargando información...</p>

        <form id="skills-form">

            <div id="skills-container" class="row"></div>

            <div class="mt-4">
                <button type="submit" class="btn btn-primary">Siguiente</button>
            </div>

        </form>
    </div>
</div>
@endsection

@section('scripts')
<script>
    const url = window.location.pathname.split('/').filter(Boolean);
    window.CLASS_SESSION_ID = url[url.length - 2];
    document.getElementById('class-id').textContent = window.CLASS_SESSION_ID;
</script>

<style>
    #skills-container .col-md-3 {
        margin-bottom: 20px !important;
    }
    #skills-form button {
        margin-top: 20px;
    }
</style>

<script src="{{ asset('js/pages/class-evaluation-skills.js') }}"></script>
@endsection
