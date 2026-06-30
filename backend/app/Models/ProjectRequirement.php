<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectRequirement extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'prd_document' => 'array',
        'features_requested' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
