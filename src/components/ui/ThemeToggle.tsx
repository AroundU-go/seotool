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
            className="flex items-center justify-center p-2.5 rounded-full border border-border bg-background/80 backdrop-blur-md shadow-sm transition-colors hover:bg-muted hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground/80 hover:text-foreground"
            aria-label="Toggle theme"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
