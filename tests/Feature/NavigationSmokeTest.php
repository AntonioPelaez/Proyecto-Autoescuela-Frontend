<?php

namespace Tests\Feature;

use Tests\TestCase;

class NavigationSmokeTest extends TestCase
{
    public function test_login_and_public_pages_return_200(): void
    {
        $this->get('/')->assertOk();
        $this->get('/login')->assertOk();
        $this->get('/dashboard')->assertOk();
    }

    public function test_admin_pages_return_200(): void
    {
        $this->get('/admin/towns')->assertOk();
        $this->get('/admin/professors')->assertOk();
        $this->get('/admin/vehicles')->assertOk();
    }

    public function test_student_pages_return_200(): void
    {
        $this->get('/student/home')->assertOk();
        $this->get('/student/availability')->assertOk();
        $this->get('/student/my-classes')->assertOk();
    }

    public function test_teacher_pages_return_200(): void
    {
        $this->get('/teacher/home')->assertOk();
        $this->get('/teacher/bookings')->assertOk();
        $this->get('/teacher/classes')->assertOk();
    }
}
