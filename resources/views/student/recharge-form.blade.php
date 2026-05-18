@extends('layouts.student')

@section('title', 'Formulario de Recarga')
@section('main-id', 'student-recharge-form-page')

@section('content')
<div class="student-panel">
    <h2>Recargar Saldo</h2>

    <!-- Mensajes -->
    <div id="message-state" class="message-state" style="display:none;"></div>

    <!-- Paso 1: Seleccionar cantidad -->
    <div id="amount-selection" class="filter-section">
        <h3>💳 Paso 1: Selecciona la cantidad a recargar</h3>
        
        <div class="amount-options">
            <button type="button" class="amount-btn" data-amount="10">€10.00</button>
            <button type="button" class="amount-btn" data-amount="25">€25.00</button>
            <button type="button" class="amount-btn" data-amount="50">€50.00</button>
            <button type="button" class="amount-btn" data-amount="100">€100.00</button>
        </div>

        <div class="form-group" style="margin-top: 20px;">
            <label for="custom-amount">O introduce una cantidad personalizada *</label>
            <div style="display: flex; gap: 10px;">
                <input 
                    type="number" 
                    id="custom-amount" 
                    class="form-control" 
                    placeholder="Ej: 75.50"
                    min="1"
                    step="0.01"
                >
                <button type="button" id="custom-amount-btn" class="btn btn-primary" style="width: 120px;">Seleccionar</button>
            </div>
        </div>

        <button type="button" id="cancel-recharge" class="btn btn-secondary" style="margin-top: 20px;">Cancelar</button>
    </div>

    <!-- Paso 2: Formulario de pago (se muestra después de seleccionar cantidad) -->
    <div id="payment-section" class="filter-section" style="display:none;">
        <h3>💳 Paso 2: Datos de la Tarjeta</h3>

        <div id="recharge-summary" style="background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <p><strong>Cantidad a recargar:</strong> <span id="summary-amount" style="font-size: 18px; color: #28a745; font-weight: bold;">€0.00</span></p>
        </div>

        <form id="recharge-form" class="payment-form">
            <div class="form-group">
                <label for="recharge-card-holder">Titular de la Tarjeta *</label>
                <input 
                    type="text" 
                    id="recharge-card-holder" 
                    class="form-control" 
                    placeholder="Nombre completo"
                    required
                >
            </div>

            <div class="form-group">
                <label for="recharge-card-number">Número de Tarjeta *</label>
                <input 
                    type="text" 
                    id="recharge-card-number" 
                    class="form-control" 
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    required
                >
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="recharge-card-expiry">Vencimiento *</label>
                    <input 
                        type="text" 
                        id="recharge-card-expiry" 
                        class="form-control" 
                        placeholder="MM/YY"
                        maxlength="5"
                        required
                    >
                </div>
                <div class="form-group">
                    <label for="recharge-card-cvv">CVV *</label>
                    <input 
                        type="text" 
                        id="recharge-card-cvv" 
                        class="form-control" 
                        placeholder="123"
                        maxlength="4"
                        required
                    >
                </div>
            </div>

            <div class="form-actions" style="margin-top: 20px;">
                <button type="submit" class="btn btn-success">Confirmar Recarga</button>
                <button type="button" id="back-to-amount" class="btn btn-secondary">Volver</button>
            </div>
        </form>
    </div>
</div>

@endsection

@section('scripts')
<script type="module" src="{{ asset('js/pages/student-recharge-form.js') }}"></script>

<style>
.amount-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.amount-btn {
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.amount-btn:hover {
    border-color: #007bff;
    background: #f0f8ff;
}

.amount-btn.selected {
    background: #007bff;
    color: white;
    border-color: #007bff;
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

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
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
    .amount-options {
        grid-template-columns: 1fr 1fr;
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
