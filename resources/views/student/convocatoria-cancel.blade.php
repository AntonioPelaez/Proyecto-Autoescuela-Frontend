<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cancelar inscripción – Autoescuela</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body class="page-auth">

    <div class="auth-login">
        <div class="card auth-login-card">
            <div class="card-body">

                <div class="auth-login-badge">Cancelar inscripción</div>

                <header class="auth-login-header">
                    <h1>Motivo de cancelación</h1>
                    <p>Indica el motivo por el que deseas cancelar tu inscripción.</p>
                </header>

                <form id="cancel-form" data-exam-call-id="{{ $id }}">
                    <div class="input-group">
                        <label class="input-label">Motivo</label>
                        <textarea id="reason" class="input" rows="5" placeholder="Escribe el motivo..." required></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:20px;">
                        Confirmar cancelación
                    </button>
                </form>

                <div style="margin-top:20px;">
                    <a href="/student/convocatorias" class="link">Volver sin cancelar</a>
                </div>

            </div>
        </div>
    </div>

    {{-- Scripts --}}
    <script src="{{ asset('js/auth.js') }}" defer></script>
    <script src="{{ asset('js/api.js') }}" defer></script>
    <script src="{{ asset('js/pages/student-convocatoria-cancel.js') }}" defer></script>

</body>
</html>
