// ─────────────────────────────────────────────
// Usuarios simulados (sustituir por API real)
// ─────────────────────────────────────────────
const _users = [
    { id: 1, email: 'admin@autoescuela.com',   password: 'admin123',   role: 'admin',   name: 'Administrador' },
    { id: 2, email: 'alumno@autoescuela.com',  password: 'alumno123',  role: 'student', name: 'Alumno Demo'   },
    { id: 3, email: 'profesor@autoescuela.com',password: 'profesor123',role: 'teacher', name: 'Profesor Demo' },
];

// Token simulado en memoria durante la sesión de api.js
let _currentUser = null;

// Datos simulados para Sprint 2
let _towns = [
    { id: 1, name: 'Madrid', active: true },
    { id: 2, name: 'Getafe', active: true },
    { id: 3, name: 'Leganés', active: false },
];

let _professors = [
    { id: 1, name: 'Laura Gómez', email: 'laura.gomez@autoescuela.com', active: true },
    { id: 2, name: 'Carlos Martín', email: 'carlos.martin@autoescuela.com', active: true },
    { id: 3, name: 'Ana Ruiz', email: 'ana.ruiz@autoescuela.com', active: false },
];

let _offeredSlots = [
    { id: 1, townId: 1, date: '2026-04-23', time: '09:00', professorId: 1, professorName: 'Laura Gómez', vehicle: 'Toyota Yaris', active: true },
    { id: 2, townId: 1, date: '2026-04-23', time: '11:30', professorId: 2, professorName: 'Carlos Martín', vehicle: 'Seat Ibiza', active: true },
    { id: 3, townId: 1, date: '2026-04-24', time: '10:00', professorId: 1, professorName: 'Laura Gómez', vehicle: '', active: true },
    { id: 4, townId: 2, date: '2026-04-23', time: '08:30', professorId: 3, professorName: 'Ana Ruiz', vehicle: 'Renault Clio', active: true },
    { id: 5, townId: 2, date: '2026-04-23', time: '12:00', professorId: 2, professorName: 'Carlos Martín', vehicle: '', active: true },
    { id: 6, townId: 2, date: '2026-04-24', time: '10:30', professorId: 3, professorName: 'Ana Ruiz', vehicle: 'Peugeot 208', active: true },
];

let _bookings = [
    { id: 1, slotId: 1, studentId: 2, studentName: 'Alumno Demo', townId: 1, townName: 'Madrid', date: '2026-04-23', time: '09:00', professorId: 1, professorName: 'Laura Gómez', vehicle: 'Toyota Yaris', status: 'confirmada' },
    { id: 2, slotId: 2, studentId: 2, studentName: 'Alumno Demo', townId: 2, townName: 'Getafe', date: '2026-04-24', time: '10:00', professorId: 2, professorName: 'Carlos Martín', vehicle: 'Seat Ibiza', status: 'confirmada' },
    { id: 3, slotId: 3, studentId: 4, studentName: 'Alumno Tercero', townId: 1, townName: 'Madrid', date: '2026-04-24', time: '10:00', professorId: 3, professorName: 'Ana Ruiz', vehicle: 'Renault Clio', status: 'confirmada' },
];

let _incidents = [
    { id: 1, type: 'reserva', priority: 'alta', status: 'abierta', description: 'Alumno no puede asistir a la clase del 23/04', bookingId: 1, assignedTo: null, createdAt: '2026-04-20T10:00:00', resolvedAt: null },
    { id: 2, type: 'profesor', priority: 'media', status: 'en_curso', description: 'Solicitud de cambio de profesor para la clase', bookingId: 2, assignedTo: 1, createdAt: '2026-04-21T14:30:00', resolvedAt: null },
];

// Horarios fijos disponibles para reservas
const _availableTimeSlots = [
    { id: 1, time: '09:00', display: '09:00 - Mañana' },
    { id: 2, time: '10:00', display: '10:00 - Mañana' },
    { id: 3, time: '11:00', display: '11:00 - Mañana' },
    { id: 4, time: '12:00', display: '12:00 - Mediodía' },
    { id: 5, time: '14:00', display: '14:00 - Tarde' },
    { id: 6, time: '15:00', display: '15:00 - Tarde' },
    { id: 7, time: '16:00', display: '16:00 - Tarde' },
    { id: 8, time: '17:00', display: '17:00 - Tarde' },
    { id: 9, time: '18:00', display: '18:00 - Tarde' },
];

// ─────────────────────────────────────────────
// Cabeceras simuladas (estructura idéntica a la real)
// ─────────────────────────────────────────────
function _headers(withAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

function _clone(data) {
    return JSON.parse(JSON.stringify(data));
}

function _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function _nextId(items) {
    if (!items.length) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
}

function _findTown(id) {
    return _towns.find(town => town.id === Number(id));
}

function _findProfessor(id) {
    return _professors.find(professor => professor.id === Number(id));
}

function _findOfferedSlot(id) {
    return _offeredSlots.find(slot => slot.id === Number(id));
}

function _findBooking(id) {
    return _bookings.find(booking => booking.id === Number(id));
}

function _findIncident(id) {
    return _incidents.find(incident => incident.id === Number(id));
}

function _isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function _isValidTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function _getVehicleForProfessor(professorId) {
    // Obtener el vehículo más reciente asignado a un profesor
    const recentBooking = _bookings
        .filter(b => b.professorId === professorId && b.vehicle)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    return recentBooking ? recentBooking.vehicle : 'Vehículo 1';
}

function _restoreCurrentUserFromStorage() {
    if (_currentUser) {
        return _currentUser;
    }

    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawUser);
        const matched = _users.find(
            user => user.email === parsed?.email && user.role === parsed?.role
        );

        if (matched) {
            _currentUser = matched;
            return _currentUser;
        }
    } catch (error) {
        return null;
    }

    return null;
}

function _requireSession(headers) {
    const hasAuthHeader = Boolean(headers?.Authorization);
    const currentUser = _restoreCurrentUserFromStorage();

    if (!hasAuthHeader || !currentUser) {
        throw new Error('No hay sesión activa.');
    }

    return currentUser;
}

function _requireAdmin(headers) {
    const currentUser = _requireSession(headers);
    if (currentUser.role !== 'admin') {
        throw new Error('No tienes permisos para esta acción.');
    }
    return currentUser;
}

function _assertSlotPayload(data) {
    const townId = Number(data?.townId);
    const professorId = Number(data?.professorId);
    const date = String(data?.date || '').trim();
    const time = String(data?.time || '').trim();
    const vehicle = String(data?.vehicle || '').trim();

    if (!townId || !professorId || !date || !time || !vehicle) {
        throw new Error('Todos los campos del hueco son obligatorios.');
    }

    if (!_isValidDate(date)) {
        throw new Error('La fecha no es válida.');
    }

    if (!_isValidTime(time)) {
        throw new Error('La hora no es válida.');
    }

    const town = _findTown(townId);
    if (!town) {
        throw new Error('La población seleccionada no existe.');
    }

    const professor = _findProfessor(professorId);
    if (!professor) {
        throw new Error('El profesor seleccionado no existe.');
    }

    return { town, professor, townId, professorId, date, time, vehicle };
}

function _assertNoSlotOverlap(payload, ignoreSlotId = null) {
    const normalizedVehicle = payload.vehicle.toLowerCase();

    const conflictByProfessor = _offeredSlots.find((slot) => {
        if (!slot.active) return false;
        if (ignoreSlotId !== null && slot.id === Number(ignoreSlotId)) return false;
        return slot.date === payload.date && slot.time === payload.time && slot.professorId === payload.professorId;
    });

    if (conflictByProfessor) {
        throw new Error('Solape detectado: el profesor ya tiene un hueco en esa fecha y hora.');
    }

    const conflictByVehicle = _offeredSlots.find((slot) => {
        if (!slot.active) return false;
        if (ignoreSlotId !== null && slot.id === Number(ignoreSlotId)) return false;
        return slot.date === payload.date && slot.time === payload.time && String(slot.vehicle || '').toLowerCase() === normalizedVehicle;
    });

    if (conflictByVehicle) {
        throw new Error('Solape detectado: el vehículo ya está asignado en esa fecha y hora.');
    }
}

function _sortByDateTime(items) {
    return items.sort((a, b) => {
        const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
        if (dateCompare !== 0) return dateCompare;
        return String(a.time || '').localeCompare(String(b.time || ''));
    });
}

function _toStudentBookingRow(booking) {
    return {
        id: booking.id,
        date: booking.date,
        time: booking.time,
        professorName: booking.professorName,
        vehicle: booking.vehicle,
        status: booking.status,
    };
}

function _toTeacherBookingRow(booking) {
    return {
        id: booking.id,
        studentName: booking.studentName,
        townName: booking.townName,
        vehicle: booking.vehicle,
        time: booking.time,
        status: booking.status,
        date: booking.date,
    };
}

function _assertBookingReassignmentNoOverlap(targetBookingId, payload) {
    const normalizedVehicle = String(payload.vehicle || '').toLowerCase();

    const conflictByProfessor = _bookings.find((booking) => {
        if (booking.id === Number(targetBookingId)) return false;
        if (booking.status === 'cancelada') return false;
        return booking.date === payload.date && booking.time === payload.time && booking.professorId === payload.professorId;
    });

    if (conflictByProfessor) {
        throw new Error('No se puede reasignar: el profesor ya tiene otra clase en esa fecha y hora.');
    }

    const conflictByVehicle = _bookings.find((booking) => {
        if (booking.id === Number(targetBookingId)) return false;
        if (booking.status === 'cancelada') return false;
        return booking.date === payload.date && booking.time === payload.time && String(booking.vehicle || '').toLowerCase() === normalizedVehicle;
    });

    if (conflictByVehicle) {
        throw new Error('No se puede reasignar: el vehículo ya está ocupado en esa fecha y hora.');
    }
}

// ─────────────────────────────────────────────
// Capa API
// ─────────────────────────────────────────────
const Api = {

    /**
     * Simula POST /login
     * Devuelve { token } si las credenciales son correctas.
     * Rechaza la promesa si son incorrectas.
     */
    login(email, password) {
        return new Promise((resolve, reject) => {
            // Simula latencia de red
            setTimeout(() => {
                const user = _users.find(
                    u => u.email === email && u.password === password
                );

                if (!user) {
                    reject(new Error('Credenciales incorrectas.'));
                    return;
                }

                // Guarda usuario en memoria para getMe()
                _currentUser = user;

                // Token simulado (cuando sea real vendrá del backend)
                const token = 'simulated-token-' + user.id + '-' + Date.now();

                resolve({ token });
            }, 400);
        });
    },

    /**
     * Simula GET /me
     * Devuelve los datos del usuario logueado.
     * Rechaza si no hay sesión activa.
     */
    getMe() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Cabeceras con token (estructura preparada para la API real)
                    const headers = _headers(true);
                    const currentUser = _requireSession(headers);

                    const { password, ...safeUser } = currentUser;
                    resolve(safeUser);
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getTowns() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    resolve(_clone(_towns));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    createTown(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const name = data?.name?.trim();

                    if (!name) {
                        reject(new Error('El nombre de la población es obligatorio.'));
                        return;
                    }

                    const town = {
                        id: _nextId(_towns),
                        name,
                        active: true,
                    };

                    _towns.push(town);
                    resolve(_clone(town));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    updateTown(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const town = _findTown(id);
                    const name = data?.name?.trim();

                    if (!town) {
                        reject(new Error('La población no existe.'));
                        return;
                    }

                    if (!name) {
                        reject(new Error('El nombre de la población es obligatorio.'));
                        return;
                    }

                    town.name = name;
                    resolve(_clone(town));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    toggleTown(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const town = _findTown(id);

                    if (!town) {
                        reject(new Error('La población no existe.'));
                        return;
                    }

                    town.active = !town.active;
                    resolve(_clone(town));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getProfessors() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    resolve(_clone(_professors));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    createProfessor(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const name = data?.name?.trim();
                    const email = data?.email?.trim();
                    const active = Boolean(data?.active);

                    if (!name || !email) {
                        reject(new Error('El nombre y el email son obligatorios.'));
                        return;
                    }

                    if (!_isValidEmail(email)) {
                        reject(new Error('El email no es válido.'));
                        return;
                    }

                    const professor = {
                        id: _nextId(_professors),
                        name,
                        email,
                        active,
                    };

                    _professors.push(professor);
                    resolve(_clone(professor));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    updateProfessor(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const professor = _findProfessor(id);
                    const name = data?.name?.trim();
                    const email = data?.email?.trim();

                    if (!professor) {
                        reject(new Error('El profesor no existe.'));
                        return;
                    }

                    if (!name || !email) {
                        reject(new Error('El nombre y el email son obligatorios.'));
                        return;
                    }

                    if (!_isValidEmail(email)) {
                        reject(new Error('El email no es válido.'));
                        return;
                    }

                    professor.name = name;
                    professor.email = email;
                    professor.active = Boolean(data?.active);

                    resolve(_clone(professor));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    toggleProfessor(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const professor = _findProfessor(id);

                    if (!professor) {
                        reject(new Error('El profesor no existe.'));
                        return;
                    }

                    professor.active = !professor.active;
                    resolve(_clone(professor));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getOfferedSlots() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);

                    const rows = _offeredSlots
                        .map((slot) => ({
                            ...slot,
                            townName: _findTown(slot.townId)?.name || 'Población desconocida',
                        }))
                        .sort((a, b) => {
                            const dateCompare = a.date.localeCompare(b.date);
                            if (dateCompare !== 0) return dateCompare;
                            return a.time.localeCompare(b.time);
                        });

                    resolve(_clone(rows));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    createOfferedSlot(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);
                    const payload = _assertSlotPayload(data);
                    _assertNoSlotOverlap(payload);

                    const slot = {
                        id: _nextId(_offeredSlots),
                        townId: payload.townId,
                        date: payload.date,
                        time: payload.time,
                        professorId: payload.professorId,
                        professorName: payload.professor.name,
                        vehicle: payload.vehicle,
                        active: true,
                    };

                    _offeredSlots.push(slot);
                    resolve(_clone(slot));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    updateOfferedSlot(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);
                    const slot = _findOfferedSlot(id);
                    if (!slot) {
                        reject(new Error('El hueco no existe.'));
                        return;
                    }

                    const payload = _assertSlotPayload(data);
                    _assertNoSlotOverlap(payload, slot.id);

                    slot.townId = payload.townId;
                    slot.date = payload.date;
                    slot.time = payload.time;
                    slot.professorId = payload.professorId;
                    slot.professorName = payload.professor.name;
                    slot.vehicle = payload.vehicle;

                    resolve(_clone(slot));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    toggleOfferedSlot(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);
                    const slot = _findOfferedSlot(id);

                    if (!slot) {
                        reject(new Error('El hueco no existe.'));
                        return;
                    }

                    slot.active = !slot.active;
                    resolve(_clone(slot));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getAvailabilitySlots(townId, date) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);

                    const filtered = _offeredSlots
                        .filter((slot) => slot.active && slot.townId === Number(townId) && slot.date === date)
                        .map((slot) => ({
                            id: slot.id,
                            townId: slot.townId,
                            date: slot.date,
                            time: slot.time,
                            professorName: slot.professorName,
                            vehicle: slot.vehicle,
                        }))
                        .sort((a, b) => a.time.localeCompare(b.time));

                    resolve(_clone(filtered));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    createBooking(slotId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    const currentUser = _requireSession(headers);
                    const normalizedSlotId = Number(slotId);

                    const slot = _offeredSlots.find((item) => item.id === normalizedSlotId && item.active);
                    if (!slot) {
                        reject(new Error('El hueco seleccionado no existe.'));
                        return;
                    }

                    // Simula concurrencia en algunos huecos.
                    if (normalizedSlotId % 2 === 0) {
                        reject(new Error('Este hueco ya ha sido reservado por otro alumno.'));
                        return;
                    }

                    const town = _findTown(slot.townId);
                    const booking = {
                        id: _nextId(_bookings),
                        slotId: slot.id,
                        studentId: currentUser.id,
                        studentName: currentUser.name,
                        townId: slot.townId,
                        townName: town?.name || 'Población desconocida',
                        date: slot.date,
                        time: slot.time,
                        professorId: slot.professorId,
                        professorName: slot.professorName,
                        vehicle: slot.vehicle,
                        status: 'confirmada',
                    };

                    _bookings.push(booking);
                    slot.active = false;

                    resolve({
                        bookingId: 'booking-' + normalizedSlotId + '-' + Date.now(),
                        slotId: normalizedSlotId,
                    });
                } catch (error) {
                    reject(error);
                }
            }, 400);
        });
    },

    getAdminBookings(filters = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);

                    const filtered = _bookings.filter((booking) => {
                        const byDate = filters?.date ? booking.date === filters.date : true;
                        const byTown = filters?.townId ? booking.townId === Number(filters.townId) : true;
                        const byProfessor = filters?.professorId ? booking.professorId === Number(filters.professorId) : true;
                        const byStatus = filters?.status ? booking.status === filters.status : true;
                        return byDate && byTown && byProfessor && byStatus;
                    });

                    resolve(_clone(_sortByDateTime(filtered)));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    cancelAdminBooking(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);
                    const booking = _findBooking(id);

                    if (!booking) {
                        reject(new Error('La reserva no existe.'));
                        return;
                    }

                    if (booking.status === 'cancelada') {
                        reject(new Error('La reserva ya está cancelada.'));
                        return;
                    }

                    booking.status = 'cancelada';
                    resolve(_clone(booking));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    reassignAdminBooking(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);
                    const booking = _findBooking(id);

                    if (!booking) {
                        reject(new Error('La reserva no existe.'));
                        return;
                    }

                    if (booking.status === 'cancelada') {
                        reject(new Error('No se puede reasignar una clase cancelada.'));
                        return;
                    }

                    const professorId = Number(data?.professorId);
                    const vehicle = String(data?.vehicle || '').trim();
                    const professor = _findProfessor(professorId);

                    if (!professor || !vehicle) {
                        reject(new Error('Profesor y vehículo son obligatorios para reasignar.'));
                        return;
                    }

                    _assertBookingReassignmentNoOverlap(booking.id, {
                        date: booking.date,
                        time: booking.time,
                        professorId,
                        vehicle,
                    });

                    booking.professorId = professor.id;
                    booking.professorName = professor.name;
                    booking.vehicle = vehicle;

                    resolve(_clone(booking));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    updateBookingStatus(id, newStatus) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);
                    const booking = _findBooking(id);

                    if (!booking) {
                        reject(new Error('La reserva no existe.'));
                        return;
                    }

                    const validStatuses = ['confirmada', 'en_curso', 'completada', 'cancelada'];
                    if (!validStatuses.includes(newStatus)) {
                        reject(new Error(`Estado no válido. Debe ser uno de: ${validStatuses.join(', ')}`));
                        return;
                    }

                    booking.status = newStatus;
                    resolve(_clone(booking));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getMyBookings() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);

                    const rows = _bookings.map(_toStudentBookingRow);
                    resolve(_clone(_sortByDateTime(rows)));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getTeacherBookings() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);

                    const rows = _bookings.map(_toTeacherBookingRow);
                    resolve(_clone(_sortByDateTime(rows)));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    getIncidents(filters = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);

                    const filtered = _incidents.filter((incident) => {
                        const byStatus = filters?.status ? incident.status === filters.status : true;
                        const byPriority = filters?.priority ? incident.priority === filters.priority : true;
                        const byType = filters?.type ? incident.type === filters.type : true;
                        const byAssigned = filters?.assigned !== undefined && filters.assigned !== null ? 
                            (filters.assigned === 'sin_asignar' ? incident.assignedTo === null : incident.assignedTo === Number(filters.assigned)) : true;
                        const byDateFrom = filters?.dateFrom ? incident.createdAt.split('T')[0] >= filters.dateFrom : true;
                        const byDateTo = filters?.dateTo ? incident.createdAt.split('T')[0] <= filters.dateTo : true;
                        return byStatus && byPriority && byType && byAssigned && byDateFrom && byDateTo;
                    });

                    resolve(_clone(_sortByDateTime(filtered)));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    createIncident(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);

                    const type = data?.type?.trim();
                    const priority = data?.priority?.trim();
                    const description = data?.description?.trim();
                    const bookingId = data?.bookingId ? Number(data.bookingId) : null;

                    if (!type || !priority || !description) {
                        reject(new Error('Tipo, prioridad y descripción son obligatorios.'));
                        return;
                    }

                    const validTypes = ['reserva', 'profesor', 'vehiculo', 'otro'];
                    if (!validTypes.includes(type)) {
                        reject(new Error('El tipo de incidencia no es válido.'));
                        return;
                    }

                    const validPriorities = ['baja', 'media', 'alta'];
                    if (!validPriorities.includes(priority)) {
                        reject(new Error('La prioridad no es válida.'));
                        return;
                    }

                    if (bookingId && !_findBooking(bookingId)) {
                        reject(new Error('La reserva relacionada no existe.'));
                        return;
                    }

                    const incident = {
                        id: _nextId(_incidents),
                        type,
                        priority,
                        status: 'abierta',
                        description,
                        bookingId,
                        assignedTo: null,
                        createdAt: new Date().toISOString(),
                        resolvedAt: null,
                    };

                    _incidents.push(incident);
                    resolve(_clone(incident));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    updateIncident(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireAdmin(headers);
                    const incident = _findIncident(id);

                    if (!incident) {
                        reject(new Error('La incidencia no existe.'));
                        return;
                    }

                    if (data?.type !== undefined) {
                        const validTypes = ['reserva', 'profesor', 'vehiculo', 'otro'];
                        if (!validTypes.includes(data.type)) {
                            reject(new Error('El tipo de incidencia no es válido.'));
                            return;
                        }
                        incident.type = data.type;
                    }

                    if (data?.priority !== undefined) {
                        const validPriorities = ['baja', 'media', 'alta'];
                        if (!validPriorities.includes(data.priority)) {
                            reject(new Error('La prioridad no es válida.'));
                            return;
                        }
                        incident.priority = data.priority;
                    }

                    if (data?.status !== undefined) {
                        const validStatuses = ['abierta', 'en_curso', 'cerrada'];
                        if (!validStatuses.includes(data.status)) {
                            reject(new Error('El estado no es válido.'));
                            return;
                        }
                        incident.status = data.status;
                        if (data.status === 'cerrada') {
                            incident.resolvedAt = new Date().toISOString();
                        }
                    }

                    if (data?.description !== undefined) {
                        const desc = String(data.description || '').trim();
                        if (!desc) {
                            reject(new Error('La descripción no puede estar vacía.'));
                            return;
                        }
                        incident.description = desc;
                    }

                    if (data?.bookingId !== undefined) {
                        const bookingId = data.bookingId ? Number(data.bookingId) : null;
                        if (bookingId && !_findBooking(bookingId)) {
                            reject(new Error('La reserva relacionada no existe.'));
                            return;
                        }
                        incident.bookingId = bookingId;
                    }

                    if (data?.assignedTo !== undefined) {
                        incident.assignedTo = data.assignedTo ? Number(data.assignedTo) : null;
                    }

                    resolve(_clone(incident));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    // ─────────────────────────────────────────────
    // Métodos para horarios y disponibilidad
    // ─────────────────────────────────────────────

    getTimeSlots() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(_clone(_availableTimeSlots));
            }, 100);
        });
    },

    getAvailableProfessorsByTimeSlot(townId, date, time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    _requireSession(_headers(true));

                    const town = _findTown(townId);
                    if (!town) {
                        reject(new Error('Población no válida.'));
                        return;
                    }

                    if (!_isValidDate(date)) {
                        reject(new Error('Fecha no válida.'));
                        return;
                    }

                    if (!_isValidTime(time)) {
                        reject(new Error('Hora no válida.'));
                        return;
                    }

                    // Obtener todos los profesores activos
                    const activeProfessors = _professors.filter(p => p.active);

                    // Filtrar los que NO tienen conflicto en esa fecha/hora
                    const availableProfessors = activeProfessors.filter(professor => {
                        // Verificar si hay reserva confirmada en esa hora
                        const hasConflict = _bookings.some(booking =>
                            booking.date === date &&
                            booking.time === time &&
                            booking.professorId === professor.id &&
                            booking.status !== 'cancelada'
                        );
                        return !hasConflict;
                    });

                    // Obtener información de vehículos disponibles para cada profesor
                    const result = availableProfessors.map(prof => ({
                        id: prof.id,
                        name: prof.name,
                        email: prof.email,
                        available: true,
                        vehicle: _getVehicleForProfessor(prof.id),
                    }));

                    resolve(_clone(result));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

    createBookingByTimeSlot(townId, date, time, professorId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const headers = _headers(true);
                    _requireSession(headers);

                    const user = _currentUser;
                    const town = _findTown(townId);
                    const professor = _findProfessor(professorId);

                    if (!town) {
                        reject(new Error('Población no válida.'));
                        return;
                    }

                    if (!professor) {
                        reject(new Error('Profesor no válido.'));
                        return;
                    }

                    if (!_isValidDate(date)) {
                        reject(new Error('Fecha no válida.'));
                        return;
                    }

                    if (!_isValidTime(time)) {
                        reject(new Error('Hora no válida.'));
                        return;
                    }

                    // Verificar que no haya conflicto
                    const hasConflict = _bookings.some(booking =>
                        booking.date === date &&
                        booking.time === time &&
                        booking.professorId === professorId &&
                        booking.status !== 'cancelada'
                    );

                    if (hasConflict) {
                        reject(new Error('El profesor no está disponible a esa hora.'));
                        return;
                    }

                    // Crear reserva
                    const booking = {
                        id: _nextId(_bookings),
                        slotId: null, // No vinculado a un slot específico
                        studentId: user.id,
                        studentName: user.name,
                        townId: town.id,
                        townName: town.name,
                        date,
                        time,
                        professorId: professor.id,
                        professorName: professor.name,
                        vehicle: _getVehicleForProfessor(professorId),
                        status: 'confirmada',
                    };

                    _bookings.push(booking);
                    resolve(_clone(booking));
                } catch (error) {
                    reject(error);
                }
            }, 200);
        });
    },

};
