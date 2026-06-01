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
Route::view('/admin/students', 'admin.students');
Route::view('/admin/vehicles', 'admin.vehicles');
Route::view('/admin/slots', 'admin.slots');
Route::view('/admin/bookings', 'admin.bookings');
Route::view('/student/availability', 'student.availability');
Route::view('/student/payment', 'student.payment');
Route::view('/student/recharge', 'student.recharge');
Route::view('/student/recharge-form', 'student.recharge-form');
Route::view('/student/confirm-booking', 'student.confirm-booking');
Route::view('/student/my-classes', 'student.my-classes');
Route::view('/teacher/bookings', 'teacher.bookings');
Route::view('/teacher/classes', 'teacher.classes');
Route::view('/admin/incidents', 'admin.incidents');
Route::view('/admin/help', 'admin.help');
Route::view('/register', 'auth.register');
Route::view('/student/profile', 'student.profile');
Route::view('/teacher/profile', 'teacher.profile');
Route::view('/teacher/availability', 'teacher.teacher-availability');
Route::view('/teacher/student-evaluations', 'evaluacion.student-evaluations');
Route::view('/teacher/exam-calls', 'exams.exam-calls');
Route::get('/teacher/exam-calls/{examCallId}/students/{studentId}/result', function ($examCallId, $studentId) {
    return view('exams.student-result', compact('examCallId', 'studentId'));
});
Route::get('/teacher/exam-calls/{examCallId}/students/{studentId}/notes', function ($examCallId, $studentId) {
    return view('exams.student-notes', compact('examCallId', 'studentId'));
});
Route::get('/teacher/exam-calls/{examCallId}/students/{studentId}/remove', function ($examCallId, $studentId) {
    return view('exams.student-remove', compact('examCallId', 'studentId'));
});
Route::view('/teacher/student-evaluations/{id}', 'evaluacion.student-evaluation-show');
Route::view('/teacher/student-evaluations/{id}/history', 'evaluacion.student-evaluation-history');
Route::view('/teacher/student-evaluations/{id}/reports', 'evaluacion.student-reports');
Route::get('/teacher/classes/{classSession}/evaluate-skills', function ($classSession) { return view('teacher.class-evaluation-skills');})->name('teacher.classes.evaluate-skills');
Route::get('/teacher/classes/{classSession}/evaluate-report', function ($classSession) {return view('teacher.class-evaluation-report');})->name('teacher.classes.evaluate-report');
Route::get('/admin/convocatorias', function () {return view('admin.convocatoria_index');})->name('admin.convocatorias');
Route::get('/admin/convocatorias/crear', function () {return view('admin.convocatoria_create');})->name('exam-calls.create');
Route::get('/admin/convocatorias/{id}/editar', function ($id) {return view('admin.convocatoria_edit');})->name('exam-calls.edit');
Route::view('/teacher/student-evaluations/{id}/exams', 'exams.history');



