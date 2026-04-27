@extends('layouts.student')

@section('title', 'Mi perfil')
@section('main-id', 'student-profile-main')

@section('content')
<div class="page-shell">

    <header class="page-shell-intro">
        <p class="welcome-home-eyebrow">Alumno</p>
        <h1>Mi perfil</h1>
        <p>Consulta y actualiza tus datos personales y preferencias de sede.</p>
    </header>

    {{-- ── Feedback ──────────────────────────────── --}}
    <div id="profile-feedback" class="hidden" role="alert" aria-live="polite"></div>

    {{-- ── Datos personales ─────────────────────── --}}
    <section class="card" aria-labelledby="profile-personal-heading">
        <div class="card-body">
            <h2 id="profile-personal-heading">Datos personales</h2>

            <form id="profile-personal-form" novalidate>
                <div class="register-row">
                    <div class="input-group">
                        <label for="profile-name" class="input-label">Nombre</label>
                        <input type="text" id="profile-name" name="name" class="input"
                               autocomplete="given-name" required>
                    </div>
                    <div class="input-group">
                        <label for="profile-surname" class="input-label">Apellidos</label>
                        <input type="text" id="profile-surname" name="surname" class="input"
                               autocomplete="family-name" required>
                    </div>
                </div>

                <div class="input-group">
                    <label for="profile-email" class="input-label">Email</label>
                    <input type="email" id="profile-email" name="email" class="input"
                           autocomplete="email" required>
                </div>

                <div class="input-group">
                    <label for="profile-phone" class="input-label">Teléfono</label>
                    <input type="tel" id="profile-phone" name="phone" class="input"
                           autocomplete="tel" placeholder="6XX XXX XXX">
                </div>

                <div class="input-group">
                    <label for="profile-town" class="input-label">Sede / Población preferida</label>
                    <select id="profile-town" name="town_id" class="input">
                        <option value="1">Carmona</option>
                        <option value="2">Sevilla</option>
                        <option value="3">Écija</option>
                    </select>
                </div>

                <div class="profile-form-footer">
                    <button type="submit" class="btn btn-primary">Guardar cambios</button>
                </div>
            </form>
        </div>
    </section>

    {{-- ── Cambio de contraseña ─────────────────── --}}
    <section class="card" aria-labelledby="profile-password-heading">
        <div class="card-body">
            <h2 id="profile-password-heading">Cambiar contraseña</h2>

            <form id="profile-password-form" novalidate>
                <div class="input-group">
                    <label for="profile-current-password" class="input-label">Contraseña actual</label>
                    <div class="input-password-wrap">
                        <input type="password" id="profile-current-password" name="current_password" class="input"
                               autocomplete="current-password" placeholder="Tu contraseña actual">
                        <button type="button" class="input-password-toggle" aria-label="Mostrar"
                                data-target="profile-current-password">👁</button>
                    </div>
                </div>

                <div class="input-group">
                    <label for="profile-new-password" class="input-label">Nueva contraseña</label>
                    <div class="input-password-wrap">
                        <input type="password" id="profile-new-password" name="new_password" class="input"
                               autocomplete="new-password" placeholder="Mínimo 8 caracteres" minlength="8">
                        <button type="button" class="input-password-toggle" aria-label="Mostrar"
                                data-target="profile-new-password">👁</button>
                    </div>
                    <div class="password-strength" id="profile-password-strength" aria-live="polite"></div>
                </div>

                <div class="input-group">
                    <label for="profile-new-password-confirm" class="input-label">Confirmar nueva contraseña</label>
                    <div class="input-password-wrap">
                        <input type="password" id="profile-new-password-confirm" name="new_password_confirm" class="input"
                               autocomplete="new-password" placeholder="Repite la nueva contraseña">
                        <button type="button" class="input-password-toggle" aria-label="Mostrar"
                                data-target="profile-new-password-confirm">👁</button>
                    </div>
                </div>

                <div class="profile-form-footer">
                    <button type="submit" class="btn btn-secondary">Actualizar contraseña</button>
                </div>
            </form>
        </div>
    </section>

    {{-- ── Resumen de actividad ─────────────────── --}}
    <section class="card" aria-labelledby="profile-stats-heading">
        <div class="card-body">
            <h2 id="profile-stats-heading">Mi actividad</h2>
            <div class="profile-stats-grid" id="profile-stats">
                <div class="loader loader-inline loader-sm" aria-live="polite">Cargando…</div>
            </div>
        </div>
    </section>

</div>
@endsection

@section('scripts')
<script src="{{ asset('js/pages/student-profile.js') }}" defer></script>
@endsection
