<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'dni',
        'license_number',
        'notes',
        'is_active_for_booking',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
