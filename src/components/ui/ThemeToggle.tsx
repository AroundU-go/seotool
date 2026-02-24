import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        // Clean up dark class when component unmounts (e.g. navigating away from landing page)
        return () => {
            document.documentElement.classList.remove('dark');
        };
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="relative flex items-center w-16 h-8 rounded-full border border-border bg-muted/60 backdrop-blur-sm transition-colors hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Toggle theme"
        >
            <span className="absolute left-1.5 text-yellow-500 transition-opacity" style={{ opacity: isDark ? 0.3 : 1 }}>
                <Sun size={16} />
            </span>
            <span className="absolute right-1.5 text-accent-300 transition-opacity" style={{ opacity: isDark ? 1 : 0.3 }}>
                <Moon size={16} />
            </span>
            <span
                className="absolute top-1 w-6 h-6 rounded-full bg-accent shadow-md shadow-accent/30 transition-transform duration-300 ease-in-out"
                style={{ transform: isDark ? 'translateX(32px)' : 'translateX(2px)' }}
            />
        </button>
    );
}
