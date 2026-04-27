(function() {
    'use strict';

    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    const passwordError = document.getElementById('password-error');
    const passwordConfirmError = document.getElementById('password-confirm-error');
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthLabel = document.getElementById('password-strength-label');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Password strength calculator
    function calculatePasswordStrength(pwd) {
        let score = 0;
        
        if (!pwd) return { score: 0, level: 'weak' };
        
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (/[a-z]/.test(pwd)) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

        if (score <= 2) return { score, level: 'weak' };
        if (score <= 4) return { score, level: 'ok' };
        return { score, level: 'strong' };
    }

    // Update strength indicator
    function updatePasswordStrength() {
        const pwd = passwordInput.value;
        const strength = calculatePasswordStrength(pwd);

        const percentage = (strength.score / 6) * 100;
        strengthBar.style.width = percentage + '%';
        strengthBar.className = 'strength-bar-fill strength-' + strength.level;

        const labels = { weak: 'Débil', ok: 'Aceptable', strong: 'Fuerte' };
        strengthLabel.textContent = labels[strength.level] || '';
        strengthLabel.className = 'strength-label strength-' + strength.level;
    }

    // Clear errors
    passwordInput.addEventListener('input', () => {
        updatePasswordStrength();
        if (passwordError.textContent) {
            passwordError.textContent = '';
            passwordInput.classList.remove('input-invalid');
        }
    });

    passwordConfirmInput.addEventListener('input', () => {
        if (passwordConfirmError.textContent) {
            passwordConfirmError.textContent = '';
            passwordConfirmInput.classList.remove('input-invalid');
        }
    });

    // Toggle password visibility
    document.querySelectorAll('.input-password-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const eyeOpen = btn.querySelector('.eye-open');
            const eyeClosed = btn.querySelector('.eye-closed');

            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'inline';
            } else {
                input.type = 'password';
                eyeOpen.style.display = 'inline';
                eyeClosed.style.display = 'none';
            }
        });
    });

    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        // Clear errors
        passwordError.textContent = '';
        passwordConfirmError.textContent = '';
        passwordInput.classList.remove('input-invalid');
        passwordConfirmInput.classList.remove('input-invalid');

        // Validation
        if (!password) {
            passwordError.textContent = 'La contraseña es requerida';
            passwordInput.classList.add('input-invalid');
            return;
        }

        if (password.length < 8) {
            passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres';
            passwordInput.classList.add('input-invalid');
            return;
        }

        if (password !== passwordConfirm) {
            passwordConfirmError.textContent = 'Las contraseñas no coinciden';
            passwordConfirmInput.classList.add('input-invalid');
            return;
        }

        // Mock API call to reset password
        setLoading(true);

        try {
            // Simulate API delay
            await new Promise(r => setTimeout(r, 500));

            // Mock: find user and update password (in real app, backend handles this)
            const token = new URLSearchParams(window.location.search).get('token');
            if (!token) {
                passwordError.textContent = 'Token inválido o expirado';
                setLoading(false);
                return;
            }

            // In mock API, we'd update the user password
            // For now, just simulate success
            showToast('Contraseña actualizada exitosamente', 'success');
            
            // Redirect to login after 2s
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

        } catch (err) {
            passwordError.textContent = 'Error al actualizar la contraseña. Intenta nuevamente.';
            setLoading(false);
        }
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

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

})();
