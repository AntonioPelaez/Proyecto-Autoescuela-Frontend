@extends('layouts.admin')

@section('content')
<div class="admin-panel help-panel">
    <h2>Guía Rápida del Sistema</h2>
    
    <div class="help-intro">
        <p>Bienvenido al panel de administración. Esta guía te ayuda a entender cómo funciona el sistema y cómo gestionar huecos, reservas e incidencias.</p>
    </div>

    <!-- Huecos Ofertados -->
    <section class="help-section">
        <div class="help-header">
            <h3>🎯 Huecos Ofertados</h3>
            <span class="badge badge-blue">Gestión</span>
        </div>
        <div class="help-content">
            <p><strong>¿Para qué sirve?</strong> Define los horarios y profesores disponibles para que los alumnos puedan reservar clases.</p>
            
            <div class="help-subsection">
                <h4>Flujo típico:</h4>
                <ol class="help-list">
                    <li>Accede a <strong>Huecos ofertados</strong></li>
                    <li>Crea un nuevo hueco: selecciona población, profesor, fecha, hora y vehículo</li>
                    <li>El hueco aparece como <span class="badge-inline badge-green">Activo</span> y los alumnos pueden reservarlo</li>
                    <li>Cuando se reserva, el hueco pasa a <span class="badge-inline badge-red">Inactivo</span> automáticamente</li>
                    <li>Si necesitas reactivarlo (p.ej., alumno canceló), usa el botón "Activar/Desactivar"</li>
                </ol>
            </div>

            <div class="help-subsection">
                <h4>Validaciones automáticas:</h4>
                <ul class="help-list">
                    <li>❌ No puedes tener el <strong>mismo profesor</strong> en dos huecos a la misma hora</li>
                    <li>❌ No puedes tener el <strong>mismo vehículo</strong> en dos huecos a la misma hora</li>
                    <li>✅ El sistema te avisa si hay conflicto y no te deja guardar</li>
                </ul>
            </div>

            <div class="help-subsection">
                <h4>Acciones disponibles:</h4>
                <table class="help-table">
                    <tr>
                        <td><strong>Editar</strong></td>
                        <td>Modifica cualquier campo del hueco (solo si aún está activo)</td>
                    </tr>
                    <tr>
                        <td><strong>Activar/Desactivar</strong></td>
                        <td>Cambia el estado. Inactivo = no disponible para alumnos</td>
                    </tr>
                    <tr>
                        <td><strong>Borrar (No implementado)</strong></td>
                        <td>Mejor: desactiva en lugar de borrar, para mantener historial</td>
                    </tr>
                </table>
            </div>
        </div>
    </section>

    <!-- Clases Reservadas -->
    <section class="help-section">
        <div class="help-header">
            <h3>📅 Clases Reservadas</h3>
            <span class="badge badge-purple">Operación</span>
        </div>
        <div class="help-content">
            <p><strong>¿Para qué sirve?</strong> Ve todas las reservas de alumnos, cancélalas si es necesario, o reasigna a otro profesor.</p>
            
            <div class="help-subsection">
                <h4>Flujo típico:</h4>
                <ol class="help-list">
                    <li>Accede a <strong>Clases reservadas</strong></li>
                    <li>Usa los filtros (fecha, población, profesor, estado) para encontrar reservas</li>
                    <li>Para cada reserva puedes:
                        <ul>
                            <li><strong>Cancelar</strong>: anula la reserva y automáticamente reactiva el hueco</li>
                            <li><strong>Reasignar</strong>: cambias el profesor o vehículo de la clase</li>
                        </ul>
                    </li>
                </ol>
            </div>

            <div class="help-subsection">
                <h4>Estados de reserva:</h4>
                <table class="help-table">
                    <tr>
                        <td><span class="badge-inline badge-green">Confirmada</span></td>
                        <td>La clase está confirmada, el alumno tiene que asistir</td>
                    </tr>
                    <tr>
                        <td><span class="badge-inline badge-gray">Cancelada</span></td>
                        <td>La clase fue cancelada (por admin o alumno)</td>
                    </tr>
                </table>
            </div>

            <div class="help-subsection">
                <h4>⚠️ Comportamiento importante:</h4>
                <ul class="help-list">
                    <li>Cuando <strong>cancelas</strong> una reserva, el hueco correspondiente se <strong>reactiva automáticamente</strong></li>
                    <li>Esto permite que otro alumno reserve ese horario</li>
                    <li>Si <strong>reasignas</strong> a otro profesor, el sistema valida que no haya conflictos</li>
                </ul>
            </div>

            <div class="help-subsection">
                <h4>Acciones disponibles:</h4>
                <table class="help-table">
                    <tr>
                        <td><strong>Cancelar</strong></td>
                        <td>Cancela la reserva y libera el hueco</td>
                    </tr>
                    <tr>
                        <td><strong>Reasignar</strong></td>
                        <td>Cambia profesor y/o vehículo de la clase</td>
                    </tr>
                    <tr>
                        <td><strong>Filtrar</strong></td>
                        <td>Busca por fecha, población, profesor, estado</td>
                    </tr>
                </table>
            </div>
        </div>
    </section>

    <!-- Incidencias -->
    <section class="help-section">
        <div class="help-header">
            <h3>⚡ Incidencias</h3>
            <span class="badge badge-orange">Soporte</span>
        </div>
        <div class="help-content">
            <p><strong>¿Para qué sirve?</strong> Reporta y gestiona problemas, cambios de último minuto, o reclamaciones de alumnos/profesores.</p>
            
            <div class="help-subsection">
                <h4>Flujo típico:</h4>
                <ol class="help-list">
                    <li>Accede a <strong>Incidencias</strong></li>
                    <li>Crea nueva incidencia:
                        <ul>
                            <li><strong>Tipo</strong>: ¿Qué es? (reserva, profesor, vehículo, otro)</li>
                            <li><strong>Prioridad</strong>: ¿Qué tan urgente?</li>
                            <li><strong>Descripción</strong>: detalles del problema</li>
                            <li><strong>Reserva relacionada (opcional)</strong>: vincula a una reserva si aplica</li>
                        </ul>
                    </li>
                    <li>La incidencia queda en estado <span class="badge-inline badge-green">Abierta</span></li>
                    <li>Asígnatela a ti o a otro admin</li>
                    <li>Cuando trabajes en ella, cambia estado a <span class="badge-inline badge-blue">En curso</span></li>
                    <li>Cuando resuelvas, ciérrala → <span class="badge-inline badge-purple">Cerrada</span></li>
                </ol>
            </div>

            <div class="help-subsection">
                <h4>Tipos de incidencia:</h4>
                <table class="help-table">
                    <tr>
                        <td><strong>Reserva</strong></td>
                        <td>Alumno no puede asistir, quiere cambiar hora, reclamo de clase, etc.</td>
                    </tr>
                    <tr>
                        <td><strong>Profesor</strong></td>
                        <td>Profesor enfermo, no disponible, solicita cambio</td>
                    </tr>
                    <tr>
                        <td><strong>Vehículo</strong></td>
                        <td>Coche en reparación, accidente, falta mantenimiento</td>
                    </tr>
                    <tr>
                        <td><strong>Otro</strong></td>
                        <td>Cualquier otro problema que no entra en las categorías anteriores</td>
                    </tr>
                </table>
            </div>

            <div class="help-subsection">
                <h4>Prioridades:</h4>
                <table class="help-table">
                    <tr>
                        <td><span class="badge-inline priority-badge baja">Baja</span></td>
                        <td>Informativo, puede esperar. Resuelve en próximos días</td>
                    </tr>
                    <tr>
                        <td><span class="badge-inline priority-badge media">Media</span></td>
                        <td>Debe resolverse hoy. Afecta al funcionamiento normal</td>
                    </tr>
                    <tr>
                        <td><span class="badge-inline priority-badge alta">Alta</span></td>
                        <td>Urgente. Resuelve ya. Afecta a alumno/profesor inmediatamente</td>
                    </tr>
                </table>
            </div>

            <div class="help-subsection">
                <h4>Estados de incidencia:</h4>
                <table class="help-table">
                    <tr>
                        <td><span class="badge-inline status-badge abierta">Abierta</span></td>
                        <td>Acaba de crearse, no asignada o en cola</td>
                    </tr>
                    <tr>
                        <td><span class="badge-inline status-badge en_curso">En curso</span></td>
                        <td>Alguien está trabajando en ella</td>
                    </tr>
                    <tr>
                        <td><span class="badge-inline status-badge cerrada">Cerrada</span></td>
                        <td>Resuelta y finalizada</td>
                    </tr>
                </table>
            </div>

            <div class="help-subsection">
                <h4>Acciones disponibles:</h4>
                <table class="help-table">
                    <tr>
                        <td><strong>Crear</strong></td>
                        <td>Nueva incidencia con tipo, prioridad y descripción</td>
                    </tr>
                    <tr>
                        <td><strong>Cambiar estado</strong></td>
                        <td>Abierta → En curso → Cerrada</td>
                    </tr>
                    <tr>
                        <td><strong>Reasignar</strong></td>
                        <td>Asigna a ti o a otro admin para que la maneje</td>
                    </tr>
                    <tr>
                        <td><strong>Filtrar</strong></td>
                        <td>Busca por estado, prioridad, tipo, fecha, asignado a</td>
                    </tr>
                </table>
            </div>
        </div>
    </section>

    <!-- Comportamientos Clave -->
    <section class="help-section help-section-highlight">
        <div class="help-header">
            <h3>🔑 Comportamientos Clave del Sistema</h3>
        </div>
        <div class="help-content">
            <div class="help-subsection">
                <h4>1. Ciclo de Hueco → Reserva</h4>
                <ul class="help-list">
                    <li>Admin crea <strong>Hueco activo</strong> (ej: 23/04 09:00, Profesor Laura, Yaris)</li>
                    <li>Alumno ve en su panel y <strong>reserva</strong></li>
                    <li>Hueco pasa automáticamente a <strong>Inactivo</strong></li>
                    <li>En admin ves una <strong>Reserva confirmada</strong></li>
                    <li>Si alumno cancela → Hueco vuelve a estar <strong>Activo</strong> para que otro reserve</li>
                </ul>
            </div>

            <div class="help-subsection">
                <h4>2. Validaciones que el sistema hace por ti</h4>
                <ul class="help-list">
                    <li>No dejas crear 2 huecos del mismo profesor a la misma hora</li>
                    <li>No dejas asignar 2 huecos del mismo vehículo a la misma hora</li>
                    <li>No dejas reasignar una reserva si el nuevo profesor tiene conflicto</li>
                    <li>No dejas vincular una incidencia a una reserva que no existe</li>
                </ul>
            </div>

            <div class="help-subsection">
                <h4>3. Filtros aceptan valores vacíos</h4>
                <ul class="help-list">
                    <li>Si no rellenas un filtro (p.ej., dejas "Profesor" vacío) = <strong>cualquier profesor</strong></li>
                    <li>Esto permite ver "todas las reservas de hoy" sin especificar profesor</li>
                    <li>Llena solo los filtros que necesites</li>
                </ul>
            </div>

            <div class="help-subsection">
                <h4>4. Estados nunca se borran</h4>
                <ul class="help-list">
                    <li><strong>Nunca borramos datos</strong> (huecos, reservas, incidencias)</li>
                    <li>Desactivamos o cancelamos en su lugar</li>
                    <li>Esto mantiene historial para auditoría y análisis</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Tips & Troubleshooting -->
    <section class="help-section">
        <div class="help-header">
            <h3>💡 Tips & Troubleshooting</h3>
        </div>
        <div class="help-content">
            <div class="help-subsection">
                <h4>¿Qué hago si...?</h4>
                <table class="help-table">
                    <tr>
                        <td><strong>...el sistema me dice "Solape detectado"</strong></td>
                        <td>Significa que el profesor/vehículo ya tiene otra clase a esa hora. Elige otro horario o profesor.</td>
                    </tr>
                    <tr>
                        <td><strong>...quiero desactivar un hueco que aún no se ha reservado</strong></td>
                        <td>Usa el botón "Activar/Desactivar" en la tabla de huecos.</td>
                    </tr>
                    <tr>
                        <td><strong>...cancelo una reserva sin querer</strong></td>
                        <td>No hay "deshacer", pero el hueco se reactiva automáticamente. Puedes crear la reserva de nuevo.</td>
                    </tr>
                    <tr>
                        <td><strong>...necesito reasignar muchas clases al profesor X</strong></td>
                        <td>Filtra por profesor actual, luego reasigna una por una (sin batch edit aún).</td>
                    </tr>
                    <tr>
                        <td><strong>...no sé a quién asignar una incidencia</strong></td>
                        <td>Déjala sin asignar (sin asignar) o asígnate tú mismo. Se puede cambiar después.</td>
                    </tr>
                </table>
            </div>

            <div class="help-subsection">
                <h4>⚠️ Limitaciones actuales (en la roadmap):</h4>
                <ul class="help-list">
                    <li>No hay notificaciones a alumnos/profesores cuando cambias sus clases</li>
                    <li>No hay batch edit (cambiar múltiples registros a la vez)</li>
                    <li>No hay export a Excel de reservas/incidencias</li>
                    <li>No hay calendario visual (solo listados con filtros)</li>
                    <li>No se pueden añadir documentos adjuntos a incidencias</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <section class="help-section help-section-footer">
        <p><strong>¿Preguntas o sugerencias?</strong> Contacta con el equipo de desarrollo o abre una incidencia en el sistema.</p>
        <p style="font-size: 0.9rem; color: #666;">Última actualización: 27 de abril de 2026</p>
    </section>
</div>

@endsection
