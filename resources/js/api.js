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
                // Cabeceras con token (estructura preparada para la API real)
                const headers = _headers(true);

                if (!_currentUser) {
                    reject(new Error('No hay sesión activa.'));
                    return;
                }

                const { password, ...safeUser } = _currentUser;
                resolve(safeUser);
            }, 200);
        });
    },

    getTowns() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const headers = _headers(true);
                resolve(_clone(_towns));
            }, 200);
        });
    },

    createTown(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);
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
            }, 200);
        });
    },

    updateTown(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);
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
            }, 200);
        });
    },

    toggleTown(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);
                const town = _findTown(id);

                if (!town) {
                    reject(new Error('La población no existe.'));
                    return;
                }

                town.active = !town.active;
                resolve(_clone(town));
            }, 200);
        });
    },

    getProfessors() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const headers = _headers(true);
                resolve(_clone(_professors));
            }, 200);
        });
    },

    createProfessor(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);
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
            }, 200);
        });
    },

    updateProfessor(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);
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
            }, 200);
        });
    },

    toggleProfessor(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);
                const professor = _findProfessor(id);

                if (!professor) {
                    reject(new Error('El profesor no existe.'));
                    return;
                }

                professor.active = !professor.active;
                resolve(_clone(professor));
            }, 200);
        });
    },

    getAvailabilitySlots(townId, date) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const headers = _headers(true);

                const slots = [
                    { id: 1, townId: 1, date: '2026-04-23', time: '09:00', professorName: 'Laura Gómez', vehicle: 'Toyota Yaris' },
                    { id: 2, townId: 1, date: '2026-04-23', time: '11:30', professorName: 'Carlos Martín', vehicle: 'Seat Ibiza' },
                    { id: 3, townId: 1, date: '2026-04-24', time: '10:00', professorName: 'Laura Gómez' },
                    { id: 4, townId: 2, date: '2026-04-23', time: '08:30', professorName: 'Ana Ruiz', vehicle: 'Renault Clio' },
                    { id: 5, townId: 2, date: '2026-04-23', time: '12:00', professorName: 'Carlos Martín' },
                    { id: 6, townId: 2, date: '2026-04-24', time: '10:30', professorName: 'Ana Ruiz', vehicle: 'Peugeot 208' },
                ];

                const filtered = slots
                    .filter((slot) => slot.townId === Number(townId) && slot.date === date)
                    .sort((a, b) => a.time.localeCompare(b.time));

                resolve(_clone(filtered));
            }, 200);
        });
    },

    createBooking(slotId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const headers = _headers(true);

                const availableSlotIds = [1, 2, 3, 4, 5, 6];
                const normalizedSlotId = Number(slotId);

                if (!availableSlotIds.includes(normalizedSlotId)) {
                    reject(new Error('El hueco seleccionado no existe.'));
                    return;
                }

                // Simula concurrencia en algunos huecos.
                if (normalizedSlotId % 2 === 0) {
                    reject(new Error('Este hueco ya ha sido reservado por otro alumno.'));
                    return;
                }

                resolve({
                    bookingId: 'booking-' + normalizedSlotId + '-' + Date.now(),
                    slotId: normalizedSlotId,
                });
            }, 400);
        });
    },

};
