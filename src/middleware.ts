import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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
    console.error("Upstash Redis gagal diinisiasi.", e);
}

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/v1/chat/send')) {
        if (!ratelimit) return NextResponse.next();

        const ip =
            request.headers.get('cf-connecting-ip') ||
            request.headers.get('x-forwarded-for') ||
            '127.0.0.1';

        try {
            const { success } = await ratelimit.limit(ip);
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
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/v1/chat/send',
};
