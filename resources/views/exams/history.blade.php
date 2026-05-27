@extends('layouts.teacher') {{-- o layouts.student según el rol --}}

@section('title', 'Historial de exámenes')
@section('main-id', 'exam-history')

@section('content')
<div class="card card-body">
    <h2>Historial de exámenes</h2>

    <canvas id="exam-chart" height="120"></canvas>

    <table class="table table-striped mt-4">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Resultado</th>
                <th>Notas</th>
            </tr>
        </thead>
        <tbody id="exam-history-body"></tbody>
    </table>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/pages/exam-history.js') }}" defer></script>
@endsection
