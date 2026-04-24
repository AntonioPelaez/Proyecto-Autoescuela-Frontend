# Sprint D - Checklist de Accesibilidad y Smoke

## Alcance
Este checklist cubre validaciones manuales y automáticas minimas para cerrar Sprint D.

## 1. Accesibilidad (manual)
- [ ] Todas las paginas tienen un titulo claro y unico.
- [ ] Todos los inputs tienen label asociado con for/id.
- [ ] Los mensajes de error usan role o aria-live cuando aplica.
- [ ] El foco de teclado es visible en botones, enlaces e inputs.
- [ ] Se puede navegar solo con teclado en login y paneles por rol.
- [ ] El contraste de texto principal y botones es legible (AA).
- [ ] Imagenes informativas tienen alt descriptivo.
- [ ] La semantica de encabezados h1/h2 sigue jerarquia logica.

## 2. Smoke de navegacion (manual)
- [ ] Entrar con admin y abrir: /admin/towns, /admin/professors, /admin/vehicles.
- [ ] Entrar con alumno y abrir: /student/home, /student/availability, /student/my-classes.
- [ ] Entrar con profesor y abrir: /teacher/home, /teacher/bookings, /teacher/classes.
- [ ] Logout devuelve siempre a /login.
- [ ] Sin sesion, entrar a una ruta privada redirige a /login.

## 3. Suite automatizada incluida
- Smoke backend de rutas: tests/Feature/NavigationSmokeTest.php
- E2E frontend: e2e/auth-navigation.spec.js

## 4. Comandos
- Tests backend: php artisan test
- E2E headless: npm run test:e2e
- E2E UI: npm run test:e2e:ui

## 5. Credenciales de pruebas mock
- Admin: admin@autoescuela.com / admin123
- Alumno: alumno@autoescuela.com / alumno123
- Profesor: profesor@autoescuela.com / profesor123
