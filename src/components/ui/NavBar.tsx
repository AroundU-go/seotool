import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavItem {
    name: string;
    url: string;
    icon: LucideIcon;
    onClick?: () => void;
}

interface NavBarProps {
    items: NavItem[];
    className?: string;
    activeTab?: string;
}

export function NavBar({ items, className, activeTab: controlledActiveTab }: NavBarProps) {
    const [internalActiveTab, setInternalActiveTab] = useState(items[0].name);
    const activeTab = controlledActiveTab ?? internalActiveTab;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // const [isMobile, setIsMobile] = useState(false);
    // useEffect(() => {
    //     const handleResize = () => setIsMobile(window.innerWidth < 768);
    //     handleResize();
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isMenuOpen]);

    return (
        <>
            {/* Desktop / Tablet Navbar */}
            <div
                className={cn(
                    "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 pointer-events-none hidden md:block",
                    className
                )}
            >
                <div className="flex items-center gap-3 bg-background/80 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg shadow-accent/5 pointer-events-auto">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.name;

                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setInternalActiveTab(item.name);
                                    item.onClick?.();
                                }}
                                className={cn(
                                    "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                                    "text-foreground/80 hover:text-accent-600 dark:hover:text-accent-300",
                                    isActive && "bg-muted text-accent-600 dark:text-accent-300"
                                )}
                            >
                                <span className="hidden md:inline">{item.name}</span>
                                <span className="md:hidden">
                                    <Icon size={18} strokeWidth={2.5} />
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="lamp"
                                        className="absolute inset-0 w-full rounded-full -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    >
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-t-full">
                                            <div className="absolute w-12 h-6 bg-accent/20 rounded-full blur-md -top-2 -left-2" />
                                            <div className="absolute w-8 h-6 bg-accent/20 rounded-full blur-md -top-1" />
                                            <div className="absolute w-4 h-4 bg-accent/20 rounded-full blur-sm top-0 left-2" />
                                        </div>
                                    </motion.div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Navbar Hamburger & Menu */}
            <div className="md:hidden">
                {/* Fixed Hamburger Button */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="fixed top-6 right-6 z-50 p-2 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg text-foreground hover:bg-accent/10 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
                            />

                            {/* Menu Drawer */}
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-background border-l border-border z-[100] shadow-2xl p-6 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-xl font-black tracking-tight text-foreground">
                                        SEO<span className="text-accent">zapp</span>
                                    </span>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.name;
                                        return (
                                            <button
                                                key={item.name}
                                                onClick={() => {
                                                    setInternalActiveTab(item.name);
                                                    item.onClick?.();
                                                    setIsMenuOpen(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 px-4 py-4 rounded-xl text-left font-medium transition-all",
                                                    isActive
                                                        ? "bg-accent/10 text-accent-700 dark:text-accent-300"
                                                        : "text-foreground/80 hover:bg-muted"
                                                )}
                                            >
                                                <Icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-foreground/50")} />
                                                {item.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-6 border-t border-border mt-4">
                                    <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-xl">
                                        <span className="text-sm font-medium text-foreground/70">Appearance</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
