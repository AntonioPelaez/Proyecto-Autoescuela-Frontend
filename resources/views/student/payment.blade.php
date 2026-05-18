@extends('layouts.student')

@section('title', 'Pago de Clase')
@section('main-id', 'student-payment-page')

@section('content')
<div class="student-panel">
    <h2>Proceder con el Pago</h2>

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

        <!-- Columna derecha: Formulario de pago -->
        <div class="payment-section payment-form-wrapper">
            <h3>💳 Datos de la Tarjeta</h3>
            <form id="payment-form" class="payment-form">
                <div class="form-group">
                    <label for="card-holder">Titular de la Tarjeta *</label>
                    <input 
                        type="text" 
                        id="card-holder" 
                        class="form-control" 
                        placeholder="Nombre completo"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="card-number">Número de Tarjeta *</label>
                    <input 
                        type="text" 
                        id="card-number" 
                        class="form-control" 
                        placeholder="1234 5678 9012 3456"
                        maxlength="19"
                        required
                    >
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="card-expiry">Vencimiento *</label>
                        <input 
                            type="text" 
                            id="card-expiry" 
                            class="form-control" 
                            placeholder="MM/YY"
                            maxlength="5"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="card-cvv">CVV *</label>
                        <input 
                            type="text" 
                            id="card-cvv" 
                            class="form-control" 
                            placeholder="123"
                            maxlength="4"
                            required
                        >
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-success">Confirmar Pago</button>
                    <button type="button" id="cancel-payment" class="btn btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script type="module" src="{{ asset('js/pages/student-payment.js') }}"></script>

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

.payment-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 5px;
    color: #333;
    font-size: 14px;
}

.form-control {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 20px;
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
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        grid-template-columns: 1fr;
    }
}
</style>

@endsection
