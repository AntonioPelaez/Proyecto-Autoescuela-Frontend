(function() {
    'use strict';

    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Clear error
    emailInput.addEventListener('input', () => {
        if (emailError.textContent) {
            emailError.textContent = '';
            emailInput.classList.remove('input-invalid');
        }
    });

    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        // Validate
        emailError.textContent = '';
        emailInput.classList.remove('input-invalid');

        if (!email) {
            emailError.textContent = 'El email es requerido';
            emailInput.classList.add('input-invalid');
            return;
        }

        if (!validateEmail(email)) {
            emailError.textContent = 'Por favor ingresa un email válido';
            emailInput.classList.add('input-invalid');
            return;
        }

        showLoading();
        try {
            // Llamada real a la API de recuperación (ajusta el método según tu backend)
            // Por ejemplo: await Api.forgotPassword({ email });
            await Api.forgotPassword({ email });
        } catch (err) {
            // Por seguridad, siempre redirigimos igual aunque haya error
        }
        window.location.href = '/password-reset-sent';
    });

    function setLoading(loading) {
        submitBtn.disabled = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    function showLoading() {
        setLoading(true);
    }

})();
