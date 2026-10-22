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
    console.error("Upstash Redis gagal diinisiasi. Pastikan credentials ada di environment.", e);
}

// Basic Auth: return null kalau lolos, atau response 401/503 kalau gagal
function checkBasicAuth(request: NextRequest): NextResponse | null {
    const user = process.env.BASIC_AUTH_USER;
    const pass = process.env.BASIC_AUTH_PASS;

    // Aman secara default: kalau env belum diisi, semua akses ditolak
    if (!user || !pass) {
        return new NextResponse('Auth not configured', { status: 503 });
    }

    const header = request.headers.get('authorization');
    if (header?.startsWith('Basic ')) {
        try {
            const decoded = atob(header.slice(6));
            const i = decoded.indexOf(':');
            if (decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
                return null;
            }
        } catch {
            // header rusak, jatuh ke 401 di bawah
        }
    }

    return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Wave Projects"' },
    });
}

export async function middleware(request: NextRequest) {
    // 1. Pengaman login untuk semua halaman dan API
    const denied = checkBasicAuth(request);
    if (denied) return denied;

    // 2. Rate limit hanya untuk endpoint chat
    if (request.nextUrl.pathname.startsWith('/api/v1/chat/send')) {
        if (!ratelimit) {
            return NextResponse.next();
        }

        // Di belakang Cloudflare, IP asli ada di cf-connecting-ip
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
            // Bypass kalau DB bermasalah agar trafik sah tidak terblokir
        }
    }

    return NextResponse.next();
}

export const config = {
    // Sebelumnya hanya '/api/v1/chat/send'. Sekarang semua rute, kecuali aset statis.
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
