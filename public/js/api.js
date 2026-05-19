// ─────────────────────────────────────────────
// API real: integración con backend Laravel
// ─────────────────────────────────────────────

const API_BASE_URL = `http://localhost:8000/api`;

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
        if (window.__DEBUG_API) {
            console.log('[API] Token enviado:', token.substring(0, 20) + '...');
        }
    } else {
        console.warn('[API] No hay token en localStorage. Usuario no autenticado.');
    }
    return headers;
}

/**
 * Manejo centralizado de respuestas y errores HTTP para toda la app.
 * Devuelve siempre un objeto consistente para errores y datos.
 */
async function handleResponse(response) {
    let data;
    let rawText = '';
    try {
        rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        data = rawText || {};
    }

    if (!response.ok) {
        const validationDetails = data && typeof data === 'object' && data.errors
            ? Object.values(data.errors).flat().join(' ')
            : '';
        const normalizedMessage = data && typeof data === 'object'
            ? (data.message || data.error || validationDetails)
            : '';

        // Extrae mensaje de error y detalles si existen
        const error = {
            status: response.status,
            statusText: response.statusText,
            message: normalizedMessage || rawText || 'Error en la petición API',
            errors: data && typeof data === 'object' ? data.errors || null : null,
            error: data && typeof data === 'object' ? data.error || null : null,
            raw: data,
            rawText
        };
        // Permite capturar el error como objeto
        throw error;
    }
    return data;
}

function buildDefaultTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 21; hour += 1) {
        const hh = String(hour).padStart(2, '0');
        const value = `${hh}:00`;
        slots.push({ time: value, display: value });
    }
    return slots;
}

function normalizeTimeSlots(raw) {
    const source = Array.isArray(raw)
        ? raw
        : (Array.isArray(raw && raw.data) ? raw.data : []);

    const normalized = source
        .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') {
                return { time: item, display: item };
            }

            const time = item.time || item.start_time || item.hour || item.value || null;
            if (!time) return null;

            const display = item.display || item.label || time;
            return { time, display };
        })
        .filter(Boolean)
        .sort((a, b) => String(a.time).localeCompare(String(b.time)));

    return normalized.length ? normalized : buildDefaultTimeSlots();
}

const Api = {
    // ─────────── AUTENTICACIÓN ───────────
    login(email, password) {
        return fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),

        }).then(handleResponse);
    },
    register(data) {
        return fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),

        }).then(handleResponse);
    },
    logout() {
        return fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),

        }).then(handleResponse);
    },
    forgotPassword(email) {
        return fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),

        }).then(handleResponse);
    },
    resetPassword(data) {
        return fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),

        }).then(handleResponse);
    },

    // ─────────── USUARIO AUTENTICADO ───────────
    getMe() {
        return fetch(`${API_BASE_URL}/me`, {
            headers: getAuthHeaders(),

        }).then(handleResponse);
    },

    // ─────────── CRUD PUEBLOS ───────────
    getTowns() {
        return fetch(`${API_BASE_URL}/towns`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
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
    toggleTown(id) {
        return fetch(`${API_BASE_URL}/towns/${id}/toggle`, {
            method: 'POST',
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

        }).then(handleResponse);
    },
    updateUser(id, data) {
        return fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),

        }).then(handleResponse);
    },
    deleteUser(id) {
        return fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),

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

        }).then(handleResponse);
    },
    updateTeacher(id, data) {
        return fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),

        }).then(handleResponse);
    },
    deleteTeacher(id) {
        return fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),

        }).then(handleResponse);
    },
    toggleProfessor(id) {
        return fetch(`${API_BASE_URL}/teachers/${id}/toggle`, {
            method: 'POST',
            headers: getAuthHeaders(),

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

        }).then(handleResponse);
    },
    removeTeacherVehicle(id, vehicleId) {
        return fetch(`${API_BASE_URL}/teachers/${id}/vehicles/${vehicleId}/remove`, {
            method: 'DELETE',
            headers: getAuthHeaders(),

        }).then(handleResponse);
    },
    getTeacherBookings(params = {}) {
        const query = new URLSearchParams(params).toString();
        return fetch(`${API_BASE_URL}/teachers/reservas${query ? '?' + query : ''}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    /**
     * Obtiene los horarios disponibles para el profesor autenticado en una fecha
     * @param {Object} params - { date: 'YYYY-MM-DD' }
     */
    getTimeSlots(params = {}) {
        try {
            // Obtener teacher_id del usuario autenticado
            const user = (window.Auth && typeof window.Auth.getUser === 'function') ? window.Auth.getUser() : (typeof Auth !== 'undefined' ? Auth.getUser() : null);
            const teacher_id = user && Number(user.teacher_profile_id);
            const date = params.date || null;
            if (!teacher_id || isNaN(teacher_id) || teacher_id <= 0) {
                // Validación silenciosa: no mostrar mensajes, solo usar horarios por defecto
                return Promise.resolve(buildDefaultTimeSlots());
            }
            if (!date) {
                return Promise.resolve(buildDefaultTimeSlots());
            }
            const url = new URL(`${API_BASE_URL}/availability-hours`);
            url.searchParams.append('teacher_id', teacher_id);
            url.searchParams.append('date', date);
            return fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include'
            })
                .then(handleResponse)
                .then(normalizeTimeSlots)
                .catch(() => buildDefaultTimeSlots());
        } catch (e) {
            return Promise.resolve(buildDefaultTimeSlots());
        }
    },
    getTeacherReservas(params = {}) {
        return this.getTeacherBookings(params);
    },

    updateTeacherPassword(id, data) {
    return fetch(`${API_BASE_URL}/teachers/${id}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    }).then(handleResponse);
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

        }).then(handleResponse);
    },
    updateVehicle(id, data) {
        return fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),

        }).then(handleResponse);
    },
    deleteVehicle(id) {
        return fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),

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

        }).then(handleResponse);
    },
    updateStudent(id, data) {
        return fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),

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

    changeStudentPassword(id, data) {
    return fetch(`${API_BASE_URL}/students/${id}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
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
    cancelAdminBooking(id) {
        return fetch(`${API_BASE_URL}/class-sessions/cancel`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id }),
            credentials: 'include'
        }).then(handleResponse);
    },
    reassignAdminBooking(classSessionId, teacherId, vehicleId) {
        const body = { class_session_id: classSessionId, teacher_id: teacherId };
        if (vehicleId) body.vehicle_id = vehicleId;
        return fetch(`${API_BASE_URL}/class-sessions/reassign-teacher`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
            credentials: 'include'
        }).then(handleResponse);
    },
    getDayClassSessions() {
        return fetch(`${API_BASE_URL}/class-sessions/day`, { headers: getAuthHeaders(), credentials: 'include' }).then(handleResponse);
    },
    getAvailabilityHours(params = {}) {
        const { town_id, teacher_id, date } = params;
        const url = new URL(`${API_BASE_URL}/availability-hours`);

        if (town_id) url.searchParams.append('town_id', town_id);
        if (teacher_id) url.searchParams.append('teacher_id', teacher_id);
        if (date) url.searchParams.append('date', date);

        return fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    getAvailabilitySlots(params = {}) {
        const { town_id, date } = params;
        const url = new URL(`${API_BASE_URL}/availability-slots`);

        if (town_id) {
            url.searchParams.append('town_id', town_id);
        }
        if (date) {
            url.searchParams.append('date', date);
        }

        return fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
            cache: 'no-store',
            credentials: 'include'
        }).then(handleResponse);
    },
    getAvailabilitySlot(id) {
        return fetch(`${API_BASE_URL}/availability-slots/${id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        }).then(handleResponse);
    },
    createAvailabilitySlot(data) {
        return fetch(`${API_BASE_URL}/availability-slots`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateAvailabilitySlot(id, data) {
        return fetch(`${API_BASE_URL}/availability-slots/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    updateSlotStatus(id, status) {
        return fetch(`${API_BASE_URL}/availability-slots/${id}/status`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
            credentials: 'include'
        }).then(handleResponse);
    },

    createClassSession(data) {
        return fetch(`${API_BASE_URL}/class-sessions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse).catch((error) => {
            error.requestBody = data;
            throw error;
        });
    },
    cancelClassSession(data) {
        return fetch(`${API_BASE_URL}/class-sessions/cancel`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        }).then(handleResponse);
    },
    confirmClassSession(id) {
    return fetch(`${API_BASE_URL}/class-sessions/confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id }),   // ✔ AHORA SÍ ENVÍAS { id: 12 }
        credentials: 'include',
    }).then(handleResponse);
},


    completeClassSession(id) {
    return fetch(`${API_BASE_URL}/class-sessions/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({id}),
        credentials: 'include',
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


    // ─────────── CRUD INCIDENTS ───────────
getIncidentTypes() {
    return fetch(`${API_BASE_URL}/incidents/tipos/list`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    }).then(handleResponse);
},

getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/incidents${query ? '?' + query : ''}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    }).then(handleResponse);
},

getIncident(id) {
    return fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    }).then(handleResponse);
},

createIncident(data) {
    return fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(handleResponse);
},

updateIncident(id, data) {
    return fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(handleResponse);
},

deleteIncident(id) {
    return fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    }).then(handleResponse);
},
getWeeklyAvailabilities(params = {}) {
    const url = new URL(`${API_BASE_URL}/teacher-weekly-availabilities`);

    if (params.teacher_profile_id) {
        url.searchParams.append('teacher_profile_id', params.teacher_profile_id);
    }
    if (params.town_id) {
        url.searchParams.append('town_id', params.town_id);
    }
    if (params.day_of_week !== undefined && params.day_of_week !== null) {
        url.searchParams.append('day_of_week', params.day_of_week);
    }
    if (params.is_active !== undefined && params.is_active !== null) {
        url.searchParams.append('is_active', params.is_active);
    }

    return fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    }).then(handleResponse);
},

getTeacherStats(id) {
    return fetch(`${API_BASE_URL}/teachers/${id}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    }).then(handleResponse);
},

createWeeklyAvailability(data) {
    return fetch(`${API_BASE_URL}/teacher-weekly-availabilities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(handleResponse);
},

// ─────────── PAYMENT INTENTS ───────────
createPaymentIntent(data) {
    return fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(handleResponse);
},

confirmPaymentIntent(paymentIntentId) {
    return fetch(`${API_BASE_URL}/payments/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
        credentials: 'include'
    }).then(handleResponse);
},

cancelPaymentIntent(paymentIntentId) {
    return fetch(`${API_BASE_URL}/payments/${paymentIntentId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
        credentials: 'include'
    }).then(handleResponse);
},
// ─────────── WALLET (MONEDERO) ───────────
payWithWallet(data) {
    return fetch(`${API_BASE_URL}/payments/wallet`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(handleResponse);
},

rechargeWallet(amount) {
    return fetch(`${API_BASE_URL}/payments/recharge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount }),
        credentials: 'include'
    }).then(handleResponse);
},

withdrawWallet(amount) {
    return fetch(`${API_BASE_URL}/payments/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount }),
        credentials: 'include'
    }).then(handleResponse);
},

withdrawBalance(amount) {
    return this.withdrawWallet(amount);
},

};
