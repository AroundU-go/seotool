import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface DummyProCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    onUpgradeClick?: () => void;
    backgroundImageUrl?: string;
    cardClassName?: string;
}

export function DummyProCard({ icon: Icon, title, description, onUpgradeClick, backgroundImageUrl, cardClassName }: DummyProCardProps) {
    return (
        <div className={`relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[300px] p-6 ${cardClassName || ''}`}>
            {backgroundImageUrl ? (
                <div
                    className="absolute inset-0 z-0 bg-cover bg-top opacity-50 select-none pointer-events-none filter blur-[2px]"
                    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                />
            ) : (
                <>
                    {/* Header (Blurred out styling) */}
                    <div className="flex items-center gap-3 mb-6 opacity-30 select-none pointer-events-none filter blur-[2px] relative z-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            <p className="text-gray-600">{description}</p>
                        </div>
                    </div>

                    {/* Fake Content Body */}
                    <div className="opacity-20 select-none pointer-events-none filter blur-[3px] relative z-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="h-24 bg-gray-100 rounded-lg"></div>
                            <div className="h-24 bg-gray-100 rounded-lg"></div>
                            <div className="h-24 bg-gray-100 rounded-lg"></div>
                            <div className="h-24 bg-gray-100 rounded-lg"></div>
                        </div>
                        <div className="h-40 bg-gray-100 rounded-lg w-full mt-4"></div>
                    </div>
                </>
            )}

            {/* Overlay Lock & Upgrade Message */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm border border-accent/20 rounded-xl transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4 text-accent shadow-sm">
                    <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm font-medium text-gray-700 bg-white/80 px-4 py-1.5 rounded-full mb-4 shadow-sm border border-gray-100">
                    Pro feature locked
                </p>
                <button
                    onClick={onUpgradeClick}
                    className="px-6 py-2.5 bg-accent text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer text-sm"
                >
                    Upgrade to view
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

