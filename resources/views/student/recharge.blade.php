@extends('layouts.student')

@section('title', 'Recargar Saldo')
@section('main-id', 'student-recharge-page')

@section('content')
<div class="student-panel">
    <h2>Recargar Saldo</h2>

    <!-- Mensajes -->
    <div id="message-state" class="message-state" style="display:none;"></div>

    <!-- Sección de saldo actual -->
    <section class="card" style="margin-bottom: 30px; max-width: 600px;">
        <div class="card-header">
            <h3 style="margin: 0;">💰 Mi Saldo</h3>
        </div>
        <div class="card-body">
            <div id="student-balance-info" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f0f8ff; border-radius: 6px;">
                <div>
                    <p style="margin: 0; font-size: 14px; color: #666;">Saldo disponible</p>
                    <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #28a745;" id="balance-amount">€0.00</p>
                </div>
                <button id="start-recharge-btn" class="btn btn-primary" style="height: fit-content; padding: 15px 30px; font-size: 16px;">
                    Comenzar Recarga
                </button>
            </div>
        </div>
    </section>
</div>

@endsection

@section('scripts')
<script type="module" src="{{ asset('js/pages/student-recharge.js') }}"></script>

<style>
.btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>

@endsection

