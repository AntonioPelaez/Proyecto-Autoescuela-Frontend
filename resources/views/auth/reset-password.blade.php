@extends('layouts.app')

@section('content')
<div class="page-auth auth-reset">
    <div class="auth-card">
        <a href="/login" class="auth-back">← Volver al login</a>

        <div class="auth-header">
            <h1>Crear nueva contraseña</h1>
            <p>Ingresa una contraseña fuerte y segura.</p>
        </div>

        <form id="reset-password-form" class="auth-form" role="form" aria-label="Formulario para crear nueva contraseña">
            <div class="form-group">
                <label for="password">
                    Nueva contraseña
                    <span class="req">*</span>
                </label>
                <div class="input-password-wrap">
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="input" 
                        placeholder="Mín. 8 caracteres"
                        required
                    >
                    <button type="button" class="input-password-toggle" data-target="password">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-open">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-closed" style="display: none;">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </button>
                </div>
                <div class="password-strength">
                    <div class="strength-bar">
                        <div class="strength-bar-fill" id="password-strength-bar"></div>
                    </div>
                    <div class="strength-label" id="password-strength-label"></div>
                </div>
                <span class="input-error" id="password-error"></span>
                <span class="input-hint">Usa mayúsculas, minúsculas, números y símbolos para una contraseña fuerte.</span>
            </div>

            <div class="form-group">
                <label for="password-confirm">
                    Confirmar contraseña
                    <span class="req">*</span>
                </label>
                <div class="input-password-wrap">
                    <input 
                        type="password" 
                        id="password-confirm" 
                        name="password_confirmation" 
                        class="input" 
                        placeholder="Repite tu contraseña"
                        required
                    >
                    <button type="button" class="input-password-toggle" data-target="password-confirm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-open">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-closed" style="display: none;">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </button>
                </div>
                <span class="input-error" id="password-confirm-error"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-block" aria-label="Actualizar contraseña">
                <span class="btn-text">Actualizar contraseña</span>
                <span class="btn-loader" style="display: none;">
                    <div class="loader-spinner"></div>
                </span>
            </button>
        </form>

        <div class="auth-footer">
            <p>¿Recuerdas tu contraseña? <a href="/login" class="link">Inicia sesión aquí</a>.</p>
        </div>
    </div>
</div>

<script src="/js/pages/reset-password.js"></script>
@endsection
