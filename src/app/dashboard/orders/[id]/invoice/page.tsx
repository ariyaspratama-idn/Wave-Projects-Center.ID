"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InvoiceRedirect() {
    const params = useParams();
    const router = useRouter();
    useEffect(() => {
        router.replace(`/invoice/${params?.id}`);
    }, [params, router]);
    return <p className="text-gray-400 p-10">Mengalihkan ke halaman Invoice...</p>;
}
