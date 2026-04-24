import { expect, test } from '@playwright/test';

async function doLogin(page, email, password) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();
}

test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
});

test('bloquea acceso sin sesión a rutas privadas', async ({ page }) => {
    await page.goto('/admin/towns');
    await expect(page).toHaveURL(/\/login$/);
});

test('login admin redirige a panel de admin', async ({ page }) => {
    await doLogin(page, 'admin@autoescuela.com', 'admin123');
    await expect(page).toHaveURL(/\/admin\/towns$/);
    await expect(page.getByRole('heading', { name: 'Gestión de poblaciones' })).toBeVisible();
});

test('login alumno redirige a panel de alumno', async ({ page }) => {
    await doLogin(page, 'alumno@autoescuela.com', 'alumno123');
    await expect(page).toHaveURL(/\/student\/home$/);
    await expect(page.getByRole('heading', { name: 'Panel del alumno' })).toBeVisible();
});

test('login profesor redirige a panel de profesor', async ({ page }) => {
    await doLogin(page, 'profesor@autoescuela.com', 'profesor123');
    await expect(page).toHaveURL(/\/teacher\/home$/);
    await expect(page.getByRole('heading', { name: 'Panel del profesor' })).toBeVisible();
});

test('muestra error con credenciales inválidas', async ({ page }) => {
    await doLogin(page, 'admin@autoescuela.com', 'incorrecta');
    await expect(page.getByText('Credenciales incorrectas.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
});

test('logout vuelve a login', async ({ page }) => {
    await doLogin(page, 'admin@autoescuela.com', 'admin123');
    await expect(page).toHaveURL(/\/admin\/towns$/);

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login$/);
});
