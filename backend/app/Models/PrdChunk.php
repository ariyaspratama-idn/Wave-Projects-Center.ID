<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrdChunk extends Model
{
    use HasFactory;

    protected $fillable = [
        'prd_generation_id',
        'chunk_order',
        'content',
    ];

    public function generation()
    {
        return $this->belongsTo(PrdGeneration::class, 'prd_generation_id');
    }
}
