import { NextResponse } from 'next/server';

export async function GET() {
    const packages = [
        {
            id: 'pkg_fullstack_mvp',
            name: 'Fullstack MVP',
            price: 5000000,
            features: ['PWA', 'Admin Panel', 'TiDB Storage', 'Next.js Frontend', 'Laravel Backend API']
        },
        {
            id: 'pkg_ecommerce',
            name: 'E-Commerce Pro',
            price: 10000000,
            features: ['Midtrans Integration', 'Cart', 'Product Catalog', 'SEO Ready']
        }
    ];

    return NextResponse.json({
        success: true,
        data: packages
    });
}
