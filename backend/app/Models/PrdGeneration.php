<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrdGeneration extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'chat_transcript',
        'package_type',
        'status',
    ];

    public function chunks()
    {
        return $this->hasMany(PrdChunk::class);
    }
}
