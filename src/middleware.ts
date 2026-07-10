import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Gunakan credential yang sudah ada (dari process.env)
// Jika belum ada/tidak diset, Redis constructor akan mencari UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN otomatis
let ratelimit: Ratelimit | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(5, '60 s'),
            analytics: true,
        });
    }
} catch (e) {
    console.error("Upstash Redis gagal diinisiasi. Pastikan credentials ada di environment.", e);
}

export async function middleware(request: NextRequest) {
    // Hanya rate limit untuk endpoint chat
    if (request.nextUrl.pathname.startsWith('/api/v1/chat/send')) {
        if (!ratelimit) {
            // Jika Redis belum diset oleh user (gunakan API key yang sudah ada kata user), bypass
            return NextResponse.next();
        }

        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

        try {
            const { success, limit, reset, remaining } = await ratelimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Mohon maaf, sistem mendeteksi aktivitas yang tidak biasa. Silakan pelankan sedikit interaksi Anda dan coba kembali beberapa saat lagi."
                    },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error("Gagal melakukan rate limit check", error);
            // Bypass on failure so we don't block legitimate traffic if DB is down
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/v1/chat/send',
};
