import Image from "next/image";
import Logo from "./logo.png";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center -mt-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>

            <div className="relative w-40 h-40 md:w-56 md:h-56 animate-pulse-slow z-10 flex items-center justify-center mb-8">
                <Image src={Logo} alt="Memuat Wave Projects" priority className="object-contain w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
            </div>

            <div className="flex items-center gap-3 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce shadow-[0_0_10px_rgba(45,91,255,0.5)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neon-violet animate-bounce shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-soft-peach animate-bounce shadow-[0_0_10px_rgba(255,178,153,0.5)]" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    );
}
