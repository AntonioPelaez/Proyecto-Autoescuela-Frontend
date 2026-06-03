@extends('layouts.admin')

@section('title', 'Añadir nota a la convocatoria')
@section('main-id', 'admin-convocatoria-note')

@section('content')

<div class="card card-body">
    <h2>Añadir nota a la convocatoria</h2>

    <form id="convocatoria-note-form">

        <div class="form-group mb-3">
            <label for="notes">Nota de la convocatoria</label>
            <textarea id="notes" name="notes" class="form-control" rows="5" placeholder="Escribe aquí la nota..."></textarea>
        </div>

        <div class="d-flex justify-content-between">
            <a href="/admin/convocatorias/crear" class="btn btn-secondary">Volver</a>
            <button type="submit" class="btn btn-primary">Guardar y crear convocatoria</button>
        </div>

    </form>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/convocatorias-note.js') }}" defer></script>
@endsection
