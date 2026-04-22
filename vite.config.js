import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/auth.js',
                'resources/js/router.js',
                'resources/js/api.js',
                'resources/js/ui.js',
                'resources/js/pages/login.js',
                'resources/js/pages/dashboard.js',
                'resources/js/pages/admin-towns.js',
                'resources/js/pages/admin-professors.js',
                'resources/js/pages/student-availability.js',
                'resources/js/pages/student-my-classes.js',
                'resources/js/pages/teacher-bookings.js',
            ],
            refresh: true,
        }),
    ],
});
