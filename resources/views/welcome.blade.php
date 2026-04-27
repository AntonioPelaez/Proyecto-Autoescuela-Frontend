<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoEscuela Pro — Saca tu carnet con los mejores profesores</title>
    <meta name="description" content="Reserva tus clases de conducir en línea, elige horario y profesor, y sigue tu progreso desde cualquier dispositivo.">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body class="page-public">

    {{-- ── NAVBAR ─────────────────────────────────────────── --}}
    <header class="pub-nav" role="banner">
        <div class="pub-nav-inner">
            <a href="/" class="pub-nav-logo" aria-label="AutoEscuela Pro — inicio">
                <span class="pub-nav-logo-icon" aria-hidden="true">🚗</span>
                <span class="pub-nav-logo-text">AutoEscuela <strong>Pro</strong></span>
            </a>

            <nav class="pub-nav-links" aria-label="Navegación principal">
                <a href="#como-funciona" class="pub-nav-link">Cómo funciona</a>
                <a href="#servicios"     class="pub-nav-link">Servicios</a>
                <a href="#ventajas"      class="pub-nav-link">Ventajas</a>
                <a href="#sedes"         class="pub-nav-link">Sedes</a>
                <a href="#contacto"      class="pub-nav-link">Contacto</a>
            </nav>

            <div class="pub-nav-actions">
                <a href="/login" class="btn btn-primary">Iniciar sesión</a>
            </div>

            {{-- Mobile toggle --}}
            <button class="pub-nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="pub-mobile-menu">
                <span></span><span></span><span></span>
            </button>
        </div>

        {{-- Mobile drawer --}}
        <div id="pub-mobile-menu" class="pub-mobile-menu" aria-hidden="true">
            <a href="#como-funciona" class="pub-mobile-link">Cómo funciona</a>
            <a href="#servicios"     class="pub-mobile-link">Servicios</a>
            <a href="#ventajas"      class="pub-mobile-link">Ventajas</a>
            <a href="#sedes"         class="pub-mobile-link">Sedes</a>
            <a href="#contacto"      class="pub-mobile-link">Contacto</a>
            <a href="/login" class="btn btn-primary pub-mobile-cta">Iniciar sesión</a>
        </div>
    </header>

    <main id="main-content">

        {{-- ── HERO ────────────────────────────────────────────── --}}
        <section class="pub-hero" aria-labelledby="hero-heading">
            <div class="pub-hero-inner">
                <div class="pub-hero-content">
                    <p class="pub-eyebrow">La autoescuela del siglo XXI</p>
                    <h1 id="hero-heading" class="pub-hero-title">
                        Tu carnet de conducir,<br>
                        <span class="pub-hero-highlight">sin complicaciones</span>
                    </h1>
                    <p class="pub-hero-lead">
                        Reserva clases en línea, elige horario y profesor disponible en tu población, y sigue tu progreso desde cualquier dispositivo.
                    </p>
                    <div class="pub-hero-actions">
                            <a href="/register" class="btn btn-primary btn-lg">Empezar ahora</a>
                        <a href="#como-funciona" class="btn btn-outline btn-lg pub-hero-scroll">Ver cómo funciona</a>
                    </div>
                </div>

                <div class="pub-hero-visual" aria-hidden="true">
                    <div class="pub-hero-card pub-hero-card-1">
                        <span class="pub-hero-card-icon">📅</span>
                        <div>
                            <strong>Reserva confirmada</strong>
                            <small>Hoy · 10:00 h · Prof. García</small>
                        </div>
                    </div>
                    <div class="pub-hero-card pub-hero-card-2">
                        <span class="pub-hero-card-icon">✅</span>
                        <div>
                            <strong>Clase completada</strong>
                            <small>12 clases realizadas</small>
                        </div>
                    </div>
                    <div class="pub-hero-card pub-hero-card-3">
                        <span class="pub-hero-card-icon">🏆</span>
                        <div>
                            <strong>¡Carnet conseguido!</strong>
                            <small>Carmona · Mayo 2026</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pub-hero-stats" aria-label="Cifras destacadas">
                <article class="pub-stat">
                    <strong class="pub-stat-value">+500</strong>
                    <span class="pub-stat-label">Alumnos graduados</span>
                </article>
                <article class="pub-stat">
                    <strong class="pub-stat-value">15</strong>
                    <span class="pub-stat-label">Profesores certificados</span>
                </article>
                <article class="pub-stat">
                    <strong class="pub-stat-value">3</strong>
                    <span class="pub-stat-label">Poblaciones disponibles</span>
                </article>
                <article class="pub-stat">
                    <strong class="pub-stat-value">98%</strong>
                    <span class="pub-stat-label">Tasa de aprobados</span>
                </article>
            </div>
        </section>

        {{-- ── CÓMO FUNCIONA ───────────────────────────────────── --}}
        <section id="como-funciona" class="pub-section pub-section-alt" aria-labelledby="como-heading">
            <div class="pub-section-inner">
                <header class="pub-section-header">
                    <p class="pub-eyebrow">Simple y rápido</p>
                    <h2 id="como-heading">¿Cómo funciona?</h2>
                    <p class="pub-section-lead">Desde que creas tu cuenta hasta que subes al coche, en tres pasos.</p>
                </header>

                <ol class="pub-steps" aria-label="Pasos para reservar una clase">
                    <li class="pub-step">
                        <div class="pub-step-number" aria-hidden="true">1</div>
                        <div class="pub-step-icon" aria-hidden="true">🏙️</div>
                        <h3>Elige población y fecha</h3>
                        <p>Selecciona la localidad más cercana a ti y el día que mejor te venga.</p>
                    </li>
                    <li class="pub-step">
                        <div class="pub-step-number" aria-hidden="true">2</div>
                        <div class="pub-step-icon" aria-hidden="true">🕐</div>
                        <h3>Elige horario</h3>
                        <p>Consulta las franjas disponibles y reserva la que se ajuste a tu agenda.</p>
                    </li>
                    <li class="pub-step">
                        <div class="pub-step-number" aria-hidden="true">3</div>
                        <div class="pub-step-icon" aria-hidden="true">👨‍🏫</div>
                        <h3>Elige tu profesor</h3>
                        <p>Ve los profesores libres para ese hueco y confirma tu reserva en un clic.</p>
                    </li>
                </ol>

                <div class="pub-section-cta">
                    <a href="/register" class="btn btn-primary btn-lg">Reservar mi primera clase</a>
                </div>
            </div>
        </section>

        {{-- ── SERVICIOS / CARNETS ─────────────────────────────── --}}
        <section id="servicios" class="pub-section" aria-labelledby="servicios-heading">
            <div class="pub-section-inner">
                <header class="pub-section-header">
                    <p class="pub-eyebrow">Lo que ofrecemos</p>
                    <h2 id="servicios-heading">Tipos de carnet</h2>
                    <p class="pub-section-lead">Formación completa para cada tipo de permiso, adaptada a tus necesidades.</p>
                </header>

                <div class="pub-services-grid">
                    <article class="pub-service-card pub-service-b">
                        <div class="pub-service-badge">B</div>
                        <h3>Permiso B</h3>
                        <p>El carnet más habitual. Para turismos y furgonetas hasta 3.500 kg. Incluye prácticas en ciudad y carretera.</p>
                        <ul class="pub-service-list">
                            <li>Clases teóricas incluidas</li>
                            <li>Prácticas en circuito y vía pública</li>
                            <li>Acceso 24/7 al material de estudio</li>
                        </ul>
                    </article>

                    <article class="pub-service-card pub-service-a">
                        <div class="pub-service-badge">A / A2</div>
                        <h3>Permiso A y A2</h3>
                        <p>Para motocicletas. El A2 permite motos de hasta 35 kW; el A, sin restricción de potencia.</p>
                        <ul class="pub-service-list">
                            <li>Formación en maniobras y conducción segura</li>
                            <li>Equipamiento de seguridad disponible</li>
                            <li>Profesores especializados</li>
                        </ul>
                    </article>

                    <article class="pub-service-card pub-service-am">
                        <div class="pub-service-badge">AM</div>
                        <h3>Permiso AM</h3>
                        <p>Ciclomotores y quads ligeros. Ideal desde los 15 años. El primer paso a la movilidad independiente.</p>
                        <ul class="pub-service-list">
                            <li>Apto desde 15 años</li>
                            <li>Clases breves y prácticas</li>
                            <li>Sin examen teórico previo</li>
                        </ul>
                    </article>

                    <article class="pub-service-card pub-service-c">
                        <div class="pub-service-badge">C / C+E</div>
                        <h3>Permiso C y C+E</h3>
                        <p>Para camiones y vehículos articulados. Formación profesional con certificado de aptitud.</p>
                        <ul class="pub-service-list">
                            <li>CAP (Certificado de Aptitud Profesional)</li>
                            <li>Normativa de transporte de mercancías</li>
                            <li>Tacógrafo y legislación vigente</li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>

        {{-- ── VENTAJAS ─────────────────────────────────────────── --}}
        <section id="ventajas" class="pub-section pub-section-alt" aria-labelledby="ventajas-heading">
            <div class="pub-section-inner">
                <header class="pub-section-header">
                    <p class="pub-eyebrow">¿Por qué elegirnos?</p>
                    <h2 id="ventajas-heading">Tu mejor opción para conducir</h2>
                    <p class="pub-section-lead">Más que clases: un acompañamiento completo hasta aprobar.</p>
                </header>

                <div class="pub-features-grid">
                    <article class="pub-feature">
                        <div class="pub-feature-icon" aria-hidden="true">👨‍🏫</div>
                        <h3>Profesores certificados</h3>
                        <p>Todo el profesorado cuenta con titulación oficial y amplia experiencia en formación vial.</p>
                    </article>
                    <article class="pub-feature">
                        <div class="pub-feature-icon" aria-hidden="true">📱</div>
                        <h3>Gestión 100% online</h3>
                        <p>Reserva, cancela y consulta tus clases desde el móvil, tableta u ordenador sin llamar por teléfono.</p>
                    </article>
                    <article class="pub-feature">
                        <div class="pub-feature-icon" aria-hidden="true">🗓️</div>
                        <h3>Horarios flexibles</h3>
                        <p>Franjas mañana, tarde y fines de semana para que encuentres siempre el hueco que necesitas.</p>
                    </article>
                    <article class="pub-feature">
                        <div class="pub-feature-icon" aria-hidden="true">🚗</div>
                        <h3>Vehículos modernos</h3>
                        <p>Flota de vehículos de última generación, bien mantenidos y equipados con doble mando.</p>
                    </article>
                    <article class="pub-feature">
                        <div class="pub-feature-icon" aria-hidden="true">📊</div>
                        <h3>Seguimiento en tiempo real</h3>
                        <p>Consulta el estado de cada clase, el historial de reservas y tus progresos desde tu panel.</p>
                    </article>
                    <article class="pub-feature">
                        <div class="pub-feature-icon" aria-hidden="true">🛡️</div>
                        <h3>Seguridad y privacidad</h3>
                        <p>Tus datos protegidos. Plataforma con cifrado y cumplimiento del RGPD en todo momento.</p>
                    </article>
                </div>
            </div>
        </section>

        {{-- ── SEDES ────────────────────────────────────────────── --}}
        <section id="sedes" class="pub-section" aria-labelledby="sedes-heading">
            <div class="pub-section-inner">
                <header class="pub-section-header">
                    <p class="pub-eyebrow">Dónde estamos</p>
                    <h2 id="sedes-heading">Nuestras sedes</h2>
                    <p class="pub-section-lead">Operamos en varias poblaciones. Elige la más cercana al crear tu cuenta.</p>
                </header>

                <div class="pub-towns-grid">
                    <article class="pub-town-card">
                        <div class="pub-town-icon" aria-hidden="true">📍</div>
                        <h3>Carmona</h3>
                        <p>Sede principal. Atención de lunes a sábado con amplia disponibilidad de profesores y vehículos.</p>
                        <ul class="pub-town-meta">
                            <li>5 profesores disponibles</li>
                            <li>Lunes – Sábado · 08:00–20:00</li>
                        </ul>
                    </article>

                    <article class="pub-town-card">
                        <div class="pub-town-icon" aria-hidden="true">📍</div>
                        <h3>Sevilla</h3>
                        <p>Sede urbana con horarios especiales para profesionales y estudiantes universitarios.</p>
                        <ul class="pub-town-meta">
                            <li>4 profesores disponibles</li>
                            <li>Lunes – Viernes · 07:00–21:00</li>
                        </ul>
                    </article>

                    <article class="pub-town-card">
                        <div class="pub-town-icon" aria-hidden="true">📍</div>
                        <h3>Écija</h3>
                        <p>Sede comarcal con clases en carretera, autovía y circuito homologado a 10 minutos.</p>
                        <ul class="pub-town-meta">
                            <li>3 profesores disponibles</li>
                            <li>Lunes – Sábado · 08:30–19:00</li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>

        {{-- ── CTA BANNER ───────────────────────────────────────── --}}
        <section class="pub-cta-banner" aria-labelledby="cta-heading">
            <div class="pub-cta-inner">
                <h2 id="cta-heading">¿Listo para empezar?</h2>
                <p>Inicia sesión ahora y reserva tu primera clase en menos de 2 minutos.</p>
                <a href="/login" class="btn btn-surface btn-lg">Acceder a la plataforma</a>
            </div>
        </section>

        {{-- ── CONTACTO ─────────────────────────────────────────── --}}
        <section id="contacto" class="pub-section pub-section-alt" aria-labelledby="contacto-heading">
            <div class="pub-section-inner pub-section-inner-narrow">
                <header class="pub-section-header">
                    <p class="pub-eyebrow">¿Tienes dudas?</p>
                    <h2 id="contacto-heading">Contacta con nosotros</h2>
                    <p class="pub-section-lead">Escríbenos y te responderemos en menos de 24 horas en días laborables.</p>
                </header>

                <div class="pub-contact-grid">
                    <div class="pub-contact-info">
                        <article class="pub-contact-item">
                            <span class="pub-contact-icon" aria-hidden="true">📧</span>
                            <div>
                                <strong>Email</strong>
                                <span>info@autoescuelapro.es</span>
                            </div>
                        </article>
                        <article class="pub-contact-item">
                            <span class="pub-contact-icon" aria-hidden="true">📞</span>
                            <div>
                                <strong>Teléfono</strong>
                                <span>954 00 00 00</span>
                            </div>
                        </article>
                        <article class="pub-contact-item">
                            <span class="pub-contact-icon" aria-hidden="true">🕐</span>
                            <div>
                                <strong>Horario de atención</strong>
                                <span>Lunes–Viernes, 09:00–18:00</span>
                            </div>
                        </article>
                    </div>

                    <form class="pub-contact-form card" aria-label="Formulario de contacto" novalidate>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label" for="contact-name">Nombre</label>
                                <input class="input" type="text" id="contact-name" name="name"
                                       placeholder="Tu nombre completo" autocomplete="name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="contact-email">Email</label>
                                <input class="input" type="email" id="contact-email" name="email"
                                       placeholder="tu@email.com" autocomplete="email" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="contact-subject">Asunto</label>
                                <select class="input" id="contact-subject" name="subject" required>
                                    <option value="" disabled selected>Selecciona un asunto</option>
                                    <option value="info">Información general</option>
                                    <option value="precio">Precios y tarifas</option>
                                    <option value="reserva">Ayuda con reservas</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="contact-message">Mensaje</label>
                                <textarea class="input" id="contact-message" name="message"
                                          rows="4" placeholder="Escribe tu consulta aquí…" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width:100%">
                                Enviar mensaje
                            </button>
                            <div id="contact-feedback" class="pub-contact-feedback" aria-live="polite"></div>
                        </div>
                    </form>
                </div>
            </div>
        </section>

    </main>

    {{-- ── FOOTER ───────────────────────────────────────────── --}}
    <footer class="pub-footer" role="contentinfo">
        <div class="pub-footer-inner">
            <div class="pub-footer-brand">
                <span class="pub-footer-logo">🚗 AutoEscuela <strong>Pro</strong></span>
                <p>Formación vial de calidad desde 2005.<br>Licencia DGT n.º 41-00000.</p>
            </div>

            <nav class="pub-footer-nav" aria-label="Enlances de pie de página">
                <div class="pub-footer-col">
                    <strong>Plataforma</strong>
                    <a href="/login">Iniciar sesión</a>
                    <a href="#como-funciona">Cómo funciona</a>
                    <a href="#servicios">Servicios</a>
                </div>
                <div class="pub-footer-col">
                    <strong>Información</strong>
                    <a href="#ventajas">Por qué elegirnos</a>
                    <a href="#sedes">Sedes</a>
                    <a href="#contacto">Contacto</a>
                </div>
                <div class="pub-footer-col">
                    <strong>Legal</strong>
                    <a href="#" aria-label="Aviso legal (próximamente)">Aviso legal</a>
                    <a href="#" aria-label="Política de privacidad (próximamente)">Privacidad</a>
                    <a href="#" aria-label="Política de cookies (próximamente)">Cookies</a>
                </div>
            </nav>
        </div>

        <div class="pub-footer-bottom">
            <p>&copy; {{ date('Y') }} AutoEscuela Pro. Todos los derechos reservados.</p>
        </div>
    </footer>

    <script>
        // ── Nav scroll effect ──────────────────────────────────
        const nav = document.querySelector('.pub-nav');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('pub-nav-scrolled', window.scrollY > 40);
        }, { passive: true });

        // ── Mobile menu toggle ─────────────────────────────────
        const toggle = document.querySelector('.pub-nav-toggle');
        const mobileMenu = document.getElementById('pub-mobile-menu');
        toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            mobileMenu.setAttribute('aria-hidden', String(open));
            mobileMenu.classList.toggle('pub-mobile-menu-open', !open);
            document.body.classList.toggle('pub-nav-open', !open);
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenu.classList.remove('pub-mobile-menu-open');
                document.body.classList.remove('pub-nav-open');
            });
        });

        // ── Smooth scroll for anchor links ─────────────────────
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // ── Intersection Observer: active nav link ─────────────
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.pub-nav-link');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.remove('pub-nav-link-active'));
                    const active = document.querySelector(`.pub-nav-link[href="#${entry.target.id}"]`);
                    if (active) active.classList.add('pub-nav-link-active');
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });
        sections.forEach(s => observer.observe(s));

        // ── Contact form (mock) ────────────────────────────────
        document.querySelector('.pub-contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const fb = document.getElementById('contact-feedback');
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            if (!name || !email || !message) {
                fb.className = 'pub-contact-feedback pub-contact-feedback-error';
                fb.textContent = 'Por favor rellena todos los campos obligatorios.';
                return;
            }
            fb.className = 'pub-contact-feedback pub-contact-feedback-ok';
            fb.textContent = '¡Mensaje enviado! Te responderemos en breve.';
            this.reset();
        });
    </script>
</body>
</html>
