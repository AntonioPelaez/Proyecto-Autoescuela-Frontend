@extends('layouts.app')

@section('content')
<div class="page-auth auth-reset-sent">
    <div class="auth-card">
        <a href="/login" class="auth-back">← Volver al login</a>

        <div class="auth-header">
            <h1>Email enviado</h1>
            <p>Revisa tu bandeja de entrada (y spam si es necesario).</p>
        </div>

        <div class="reset-sent-visual">
            <div class="reset-sent-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            </div>
            <h2>¡Listo!</h2>
            <p>Hemos enviado un enlace de recuperación a tu email.</p>
            <p class="reset-sent-hint">El enlace es válido durante 24 horas.</p>
        </div>

        <div class="reset-sent-actions">
            <a href="/login" class="btn btn-primary btn-block">Ir al login</a>
            <a href="/forgot-password" class="btn btn-ghost btn-block">¿No recibiste el email?</a>
        </div>

        <div class="auth-footer">
            <p class="text-center text-small">¿Preguntas? Contacta a <a href="mailto:soporte@autoescuela.es" class="link">soporte@autoescuela.es</a></p>
        </div>
    </div>
</div>
@endsection
