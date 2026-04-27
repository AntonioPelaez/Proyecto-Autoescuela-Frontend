@extends('layouts.app')

@section('content')
<div class="page-auth auth-forgot">
    <div class="auth-card">
        <a href="/login" class="auth-back">← Volver al inicio</a>

        <div class="auth-header">
            <h1>Recuperar contraseña</h1>
            <p>Ingresa tu email y te enviaremos instrucciones para resetear tu contraseña.</p>
        </div>

        <form id="forgot-password-form" class="auth-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="input" 
                    placeholder="tu@email.com"
                    required
                >
                <span class="input-error" id="email-error"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-block">
                <span class="btn-text">Enviar instrucciones</span>
                <span class="btn-loader" style="display: none;">
                    <div class="loader-spinner"></div>
                </span>
            </button>
        </form>

        <div class="auth-footer">
            <p>¿Recuerdas tu contraseña? <a href="/login" class="link">Inicia sesión aquí</a>.</p>
            <p>¿Nuevo en la plataforma? <a href="/register" class="link">Crea tu cuenta aquí</a>.</p>
        </div>
    </div>
</div>

<script src="/js/pages/forgot-password.js"></script>
@endsection
