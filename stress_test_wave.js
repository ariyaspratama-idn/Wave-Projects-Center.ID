import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
    scenarios: {
        browsing_and_chat: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 30 },
                { duration: '1m', target: 30 },
                { duration: '15s', target: 0 },
            ],
            gracefulRampDown: '15s',
        },
        heavy_checkout: {
            executor: 'per-vu-iterations',
            vus: 15,
            iterations: 2,
            maxDuration: '2m',
        },
    },
    thresholds: {
        'http_req_duration{name:CheckoutAPI}': ['p(95)<3000'],
        'http_req_failed': ['rate<0.02'],
    },
};

export default function () {
    // Test target: Since user will test locally, use localhost mapping to our Next.js API Routes.
    const BASE_URL = 'http://localhost:3000/api/v1';

    group('01_Browsing Paket & Portofolio', function () {
        const res = http.get(`${BASE_URL}/packages`);
        check(res, {
            'status is 200': (r) => r.status === 200,
        });
        sleep(1);
    });

    group('02_Proses Checkout Pesanan Baru', function () {
        const url = `${BASE_URL}/orders/checkout`;
        const payload = JSON.stringify({
            client_name: `Automated Test VU-${__VU}`,
            client_email: `dev.test_${__VU}@waveprojects.id`,
            client_whatsapp: '081234567890',
            project_purpose: 'Saya ingin membuat sistem e-commerce produk kopi lokal terintegrasi kasir.',
            package_id: 'pkg_fullstack_mvp',
            github_url: 'https://github.com/ariyas/public-dummy-repo',
            payment_choice: 'DP_30'
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `k6-stress-key-uuid-${__VU}-${__ITER}`,
            },
            tags: { name: 'CheckoutAPI' },
        };

        const res = http.post(url, payload, params);

        // Accept either 201 Created or 200 OK (mock mode might return 200)
        check(res, {
            'Order berhasil dibuat (201/200)': (r) => r.status === 201 || r.status === 200,
            'Snap Token Midtrans Terbaca': (r) => {
                try {
                    const body = r.json();
                    return body && body.data && body.data.snap_token !== undefined;
                } catch (e) {
                    return false;
                }
            },
        });
        sleep(2);
    });
}
