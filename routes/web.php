<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome');
Route::view('/test', 'test');
Route::view('/login', 'auth.login')->name('login');
Route::view('/forgot-password', 'auth.forgot-password');
Route::view('/password-reset-sent', 'auth.password-reset-sent');
Route::view('/reset-password', 'auth.reset-password');
Route::view('/dashboard', 'dashboard');
Route::view('/student/home', 'student.home');
Route::view('/teacher/home', 'teacher.home');
Route::view('/admin/panel', 'admin.panel');
Route::view('/admin/towns', 'admin.towns');
Route::view('/admin/professors', 'admin.professors');
Route::view('/admin/vehicles', 'admin.vehicles');
Route::view('/admin/slots', 'admin.slots');
Route::view('/admin/bookings', 'admin.bookings');
Route::view('/student/availability', 'student.availability');
Route::view('/student/my-classes', 'student.my-classes');
Route::view('/teacher/bookings', 'teacher.bookings');
Route::view('/teacher/classes', 'teacher.classes');
Route::view('/admin/incidents', 'admin.incidents');
Route::view('/admin/help', 'admin.help');
Route::view('/register', 'auth.register');
Route::view('/student/profile', 'student.profile');
Route::view('/teacher/profile', 'teacher.profile');