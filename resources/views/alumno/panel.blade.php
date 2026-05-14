<div class="student-panel">
    <h2>Panel del Alumno</h2>

    <!-- Selección de población y fecha -->
    <form id="selection-form">
        <label for="town-select">Población:</label>
        <select id="town-select" name="town"></select>

        <label for="date-select">Fecha:</label>
        <input type="date" id="date-select" name="date">

        <button type="submit" class="btn-reserve">Buscar horarios</button>
    </form>

    <!-- Horarios disponibles -->
    <section id="time-slots-section" style="display:none;">
        <div id="time-slots-meta"></div>
        <div id="time-slots-grid"></div>
    </section>

    <!-- Resumen de reserva -->
    <section id="booking-summary" style="display:none;">
        <div id="summary-details"></div>
        <form id="confirm-form">
            <button type="submit" class="btn-reserve">Confirmar reserva</button>
            <button type="button" id="cancel-booking" class="btn-cancel">Cancelar</button>
        </form>
    </section>

    <!-- Mensajes de estado -->
    <div id="message-state" class="message-state" style="display:none;"></div>

    <!-- Clases pendientes -->
    <section>
        <h3>Clases pendientes</h3>
        <div id="pending-classes"></div>
    </section>

    <!-- Clases confirmadas -->
    <section>
        <h3>Clases confirmadas</h3>
        <div id="bookings-container"></div>
    </section>
</div>
