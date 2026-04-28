// ─────────────────────────────────────────────
// API real: integración con backend Laravel
// ─────────────────────────────────────────────

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Cambia esto si tu backend está en otro host

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error en la petición API');
    }
    return response.json();
}

const Api = {
    // ─────────── AUTENTICACIÓN ───────────
    login(email, password) {
        return fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        }).then(handleResponse);
    },
    register(data) {
        return fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    logout() {
        return fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    forgotPassword(email) {
        return fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include'
        }).then(handleResponse);
    },
    resetPassword(data) {
        return fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },

    // ─────────── USUARIO AUTENTICADO ───────────
    getMe() {
        return fetch(`${API_BASE_URL}/me`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },

    // ─────────── CRUD PUEBLOS ───────────
    getTowns() {
        return fetch(`${API_BASE_URL}/towns`, {}).then(handleResponse);
    },
    getTown(id) {
        return fetch(`${API_BASE_URL}/towns/${id}`, {}).then(handleResponse);
    },
    createTown(data) {
        return fetch(`${API_BASE_URL}/towns`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    updateTown(id, data) {
        return fetch(`${API_BASE_URL}/towns/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    deleteTown(id) {
        return fetch(`${API_BASE_URL}/towns/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        }).then(handleResponse);
    },

    // ─────────── CRUD USUARIOS ───────────
    getUsers() {
        return fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getUser(id) {
        return fetch(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    createUser(data) {
        return fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateUser(id, data) {
        return fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    deleteUser(id) {
        return fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },

    // ─────────── CRUD PROFESORES ───────────
    getTeachers() {
        return fetch(`${API_BASE_URL}/teachers`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getTeacher(id) {
        return fetch(`${API_BASE_URL}/teachers/${id}`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    createTeacher(data) {
        return fetch(`${API_BASE_URL}/teachers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateTeacher(id, data) {
        return fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    deleteTeacher(id) {
        return fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    getTeacherNotes(id) {
        return fetch(`${API_BASE_URL}/teachers/${id}/notes`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    saveTeacherNotes(id, notes) {
        return fetch(`${API_BASE_URL}/teachers/${id}/notes`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(notes),
            credentials: 'include'
        }).then(handleResponse);
    },
    getTeacherVehicles(id) {
        return fetch(`${API_BASE_URL}/teachers/${id}/vehicles`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    assignTeacherVehicle(id, data) {
        return fetch(`${API_BASE_URL}/teachers/${id}/vehicles/assign`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    removeTeacherVehicle(id, vehicleId) {
        return fetch(`${API_BASE_URL}/teachers/${id}/vehicles/${vehicleId}/remove`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    getTeacherReservas() {
        return fetch(`${API_BASE_URL}/teachers/reservas`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },

    // ─────────── CRUD VEHÍCULOS ───────────
    getVehicles() {
        return fetch(`${API_BASE_URL}/vehicles`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getVehicle(id) {
        return fetch(`${API_BASE_URL}/vehicles/${id}`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    createVehicle(data) {
        return fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateVehicle(id, data) {
        return fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    deleteVehicle(id) {
        return fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },

    // ─────────── CRUD ESTUDIANTES ───────────
    getStudents() {
        return fetch(`${API_BASE_URL}/students`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getStudent(id) {
        return fetch(`${API_BASE_URL}/students/${id}`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    createStudent(data) {
        return fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateStudent(id, data) {
        return fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    deleteStudent(id) {
        return fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    getStudentNotes(id) {
        return fetch(`${API_BASE_URL}/students/${id}/notes`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    saveStudentNotes(id, notes) {
        return fetch(`${API_BASE_URL}/students/${id}/notes`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(notes),
            credentials: 'include'
        }).then(handleResponse);
    },

    // ─────────── CLASES Y RESERVAS ───────────
    getMyClasses() {
        return fetch(`${API_BASE_URL}/my-classes`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getAdminClasses(params = {}) {
        const query = new URLSearchParams(params).toString();
        return fetch(`${API_BASE_URL}/admin/classes${query ? '?' + query : ''}`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getDayClassSessions() {
        return fetch(`${API_BASE_URL}/class-sessions/day`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getAvailabilityHours() {
        return fetch(`${API_BASE_URL}/availability-hours`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getAvailabilitySlots() {
        return fetch(`${API_BASE_URL}/availability-slots`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    createClassSession(data) {
        return fetch(`${API_BASE_URL}/class-sessions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    cancelClassSession(data) {
        return fetch(`${API_BASE_URL}/class-sessions/cancel`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    confirmClassSession(data) {
        return fetch(`${API_BASE_URL}/class-sessions/confirm`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },

    // ─────────── EXCEPCIONES DE DISPONIBILIDAD ───────────
    getTeacherAvailabilityExceptions() {
        return fetch(`${API_BASE_URL}/teachers/availability-exceptions`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getTeacherAvailabilityException(id) {
        return fetch(`${API_BASE_URL}/teachers/availability-exceptions/${id}`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    createTeacherAvailabilityException(data) {
        return fetch(`${API_BASE_URL}/teachers/availability-exceptions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateTeacherAvailabilityException(id, data) {
        return fetch(`${API_BASE_URL}/teachers/availability-exceptions/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    deleteTeacherAvailabilityException(id) {
        return fetch(`${API_BASE_URL}/teachers/availability-exceptions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
};
