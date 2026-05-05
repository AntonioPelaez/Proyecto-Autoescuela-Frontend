@extends('layouts.admin')

@section('title', 'Panel Admin')
@section('main-id', 'admin-panel-page')

@section('content') 
    <header>
        <h1>Panel de administración</h1>
        <p style="margin: 0.4rem 0 0; color: #5b6672;">Acceso rápido a las secciones principales del sistema.</p>
    </header>

    <section class="card">
        <div class="card-body" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <a href="/admin/towns" class="btn btn-outline">Poblaciones</a>
            <a href="/admin/professors" class="btn btn-outline">Profesores</a>
            <a href="/admin/students" class="btn btn-outline">Alumnos</a>
            <a href="/admin/vehicles" class="btn btn-outline">Vehículos</a>
            <a href="/admin/slots" class="btn btn-outline">Huecos ofertados</a>
            <a href="/admin/bookings" class="btn btn-outline">Clases reservadas</a>
            <a href="/admin/incidents" class="btn btn-outline">Incidencias</a>
            <a href="/admin/help" class="btn btn-outline">Ayuda</a>
        </div>
    </section>
@endsection
