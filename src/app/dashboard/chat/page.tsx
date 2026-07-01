"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminChatPanel() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    // Polling interval reference
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSessions = async () => {
        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/chats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setSessions(data.data);
            setLoading(false);
        }
    };

    const fetchMessages = async (sessionId: string) => {
        const token = localStorage.getItem("wave_token");
        const res = await fetch(`/api/v1/admin/chats/${sessionId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMessages(data.data);
    };

    useEffect(() => {
        fetchSessions();
        pollRef.current = setInterval(() => {
            fetchSessions();
        }, 5000); // Poll every 5s

        return () => clearInterval(pollRef.current!);
    }, []);

    useEffect(() => {
        if (activeSession) {
            fetchMessages(activeSession.id);
            const msgInterval = setInterval(() => {
                fetchMessages(activeSession.id);
            }, 3000);
            return () => clearInterval(msgInterval);
        }
    }, [activeSession]);

    const handleSend = async () => {
        if (!input.trim() || !activeSession) return;

        const text = input;
        setInput("");
        // Optimistic UI update
        setMessages(prev => [...prev, { sender: 'admin', content: text, created_at: new Date().toISOString() }]);

        const token = localStorage.getItem("wave_token");
        await fetch(`/api/v1/admin/chats/${activeSession.id}/reply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ message: text })
        });

        fetchSessions(); // update latest message
    };

    if (loading) return <div className="text-gray-400">Loading Live Chat Module...</div>;

    return (
        <div className="h-[85vh] flex gap-4">
            {/* Conversation List */}
            <div className="w-1/3 glass rounded-2xl p-4 flex flex-col h-full border border-white/5 overflow-hidden">
                <h2 className="font-bold text-lg mb-4">Konsultasi Aktif</h2>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {sessions.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSession(s)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${activeSession?.id === s.id ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="font-semibold">{s.customer_name || 'Guest'}</div>
                            <div className="text-xs text-gray-400 mt-1 truncate">{s.last_message || 'Mulai percakapan...'}</div>
                            <div className="text-[10px] text-gray-500 mt-2">{new Date(s.last_message_time).toLocaleString()}</div>
                        </button>
                    ))}
                    {sessions.length === 0 && <p className="text-sm text-gray-500 text-center mt-10">Belum ada obrolan.</p>}
                </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 glass rounded-2xl flex flex-col h-full border border-white/5 overflow-hidden">
                {activeSession ? (
                    <>
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="font-bold">{activeSession.customer_name || 'Guest'}</h3>
                            <p className="text-xs text-green-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online</p>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.sender === 'customer' ? 'bg-white/10 text-white rounded-bl-none' :
                                            m.sender === 'ai' ? 'bg-blue-900/30 text-blue-200 border border-blue-500/30 rounded-br-none' :
                                                'bg-primary text-white rounded-br-none'
                                        }`}>
                                        {m.sender === 'ai' && <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">🤖 Bot Terjawab:</span>}
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ketik balasan untuk memotong bot..."
                                className="flex-1 bg-white/10 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button onClick={handleSend} className="bg-primary hover:bg-primary-light px-6 font-semibold py-2 rounded-xl text-sm transition-all text-white">
                                Balas
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                        Pilih percakapan untuk mulai mambalas.
                    </div>
                )}
            </div>
        </div>
    );
}
