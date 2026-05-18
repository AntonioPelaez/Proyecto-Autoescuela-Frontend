@extends('layouts.student')

@section('title', 'Confirmar Reserva')
@section('main-id', 'student-confirm-booking-page')

@section('content')
<div class="student-panel">
    <h2>Confirmar Reserva</h2>

    <!-- Mensajes -->
    <div id="message-state" class="message-state" style="display:none;"></div>

    <!-- Contenedor principal -->
    <div class="payment-container">
        <!-- Columna izquierda: Datos de la clase -->
        <div class="payment-section class-details">
            <h3>📋 Datos de la Clase</h3>
            <div id="class-info" class="info-box">
                <!-- Se llena dinámicamente con JavaScript -->
            </div>
        </div>

        <!-- Columna derecha: Resumen de precio y saldo -->
        <div class="payment-section payment-form-wrapper">
            <h3>💳 Resumen de Pago</h3>
            
            <div id="payment-summary" class="info-box">
                <p>
                    <strong>Precio de la clase:</strong> 
                    <span id="class-price" style="font-size: 16px; color: #28a745; font-weight: bold;">€0.00</span>
                </p>
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <strong>Saldo disponible:</strong> 
                    <span id="current-balance" style="font-size: 16px; color: #007bff; font-weight: bold;">€0.00</span>
                </p>
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <strong>Saldo después de la compra:</strong> 
                    <span id="balance-after" style="font-size: 16px; color: #333; font-weight: bold;">€0.00</span>
                </p>
            </div>

            <div class="form-actions" style="margin-top: 20px;">
                <button id="confirm-booking" class="btn btn-success">Confirmar Reserva</button>
                <button id="cancel-booking" class="btn btn-secondary">Cancelar</button>
            </div>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script type="module" src="{{ asset('js/pages/student-confirm-booking.js') }}"></script>

<style>
.payment-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-top: 20px;
}

.payment-section {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}

.payment-section h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 16px;
}

.info-box {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 15px;
    line-height: 1.8;
}

.info-box p {
    margin: 10px 0;
    font-size: 14px;
}

.info-box strong {
    color: #2c3e50;
}

.form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #218838;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #5a6268;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .payment-container {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        grid-template-columns: 1fr;
    }
}
</style>

@endsection
