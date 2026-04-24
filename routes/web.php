<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome');
Route::view('/test', 'test');
Route::view('/login', 'auth.login');
Route::view('/dashboard', 'dashboard');
Route::view('/student/home', 'student.home');
Route::view('/teacher/home', 'teacher.home');
Route::view('/admin/towns', 'admin.towns');
Route::view('/admin/professors', 'admin.professors');
Route::view('/admin/vehicles', 'admin.vehicles');
Route::view('/student/availability', 'student.availability');
Route::view('/student/my-classes', 'student.my-classes');
Route::view('/teacher/bookings', 'teacher.bookings');
Route::view('/teacher/classes', 'teacher.classes');