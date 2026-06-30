<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function developer()
    {
        return $this->belongsTo(User::class, 'developer_id');
    }

    public function requirements()
    {
        return $this->hasOne(ProjectRequirement::class);
    }
}
