"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/v1/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success && data.data?.token) {
                // Store token in localStorage (since it's a simple dashboard fallback, cookie is better but basic auth uses this first)
                localStorage.setItem("wave_token", data.data.token);
                localStorage.setItem("wave_user", JSON.stringify(data.data.user));

                router.push("/dashboard");
            } else {
                setError(data.message || data.error || "Login gagal, kredensial kemungkinan salah.");
            }
        } catch (err: any) {
            setError(err.message || "Gagal terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-10 max-w-sm w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold gradient-text">Log In</h1>
                    <p className="text-gray-400 text-sm mt-1">Masuk ke Portal Internal & Client</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                            placeholder="anda@email.com"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[28px] text-gray-400 hover:text-white"
                        >
                            {showPassword ? "👁‍🗨" : "👁"}
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm mt-4"
                    >
                        {loading ? "Memproses..." : "Masuk"}
                    </button>
                </form>
            </div>
        </div>
    );
}
