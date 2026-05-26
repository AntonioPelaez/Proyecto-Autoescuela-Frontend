@extends('layouts.teacher')
@section('title', 'Histórico de clases')
@section('main-id', 'teacher-student-evaluation-history')

@section('content')

<div class="mb-3">
    <a href="/teacher/student-evaluations/{{ $id ?? '' }}" class="btn btn-secondary">
        ← Volver
    </a>
</div>

<h1 class="page-title">Historial de clases</h1>

<!-- BOTONES DE VISTA -->
<div class="mb-3 d-flex gap-2">
    <button id="btn-listado" class="btn view-btn active">Listado</button>
    <button id="btn-grafica" class="btn view-btn inactive">Gráfica</button>
</div>

<!-- CONTENEDOR LISTADO -->
<div id="history-container" class="card card-body">
    <p>Cargando histórico...</p>
</div>

<!-- CONTENEDOR GRÁFICA -->
<div id="chart-container" class="card card-body" style="display:none;">
    <canvas id="historyChart" height="120"></canvas>
</div>

<!-- MODAL DETALLE -->
<div id="skills-modal" class="modal" style="display:none;">
    <div class="modal-content card card-body">
        <h3>Detalle de habilidades</h3>
        <div id="skills-content"></div>
        <button id="close-modal" class="btn btn-secondary mt-3">Cerrar</button>
    </div>
</div>

@endsection

@section('scripts')
<script>
    const urlParts = window.location.pathname.split('/');
    window.STUDENT_ID = urlParts[urlParts.length - 2];
</script>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/pages/student-evaluation-history.js') }}" defer></script>

<style>
/* BOTONES ACTIVO / INACTIVO */
.view-btn {
    min-width: 120px;
}

.view-btn.active {
    background-color: #0d6efd !important;
    color: white !important;
    border-color: #0d6efd !important;
}

.view-btn.inactive {
    background-color: #e9ecef !important;
    color: #333 !important;
    border-color: #ced4da !important;
}

/* MODAL */
.modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}
.modal-content {
    width: 400px;
    max-width: 90%;
}
</style>

@endsection
