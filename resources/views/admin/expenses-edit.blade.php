@extends('layouts.admin')

@section('title', 'Editar gastos')
@section('main-id', 'admin-expenses-edit')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Editar gastos de la clase</h2>

    <div class="card card-body">

        <div class="table-responsive">
            <table class="table table-striped align-middle">
                <thead>
                    <tr>
                        <th>Tipo de gasto</th>
                        <th>Cantidad (€)</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody id="expense-rows">
                    {{-- El JS rellenará esta tabla --}}
                </tbody>
            </table>
        </div>

        <button id="save-expenses" class="btn btn-success w-100 mt-3">Guardar cambios</button>

    </div>

</div>

@endsection

@section('scripts')
<script>
    window.classSessionId = @json($id);
</script>
<script src="{{ asset('js/pages/admin-expenses-edit.js') }}"></script>
@endsection

