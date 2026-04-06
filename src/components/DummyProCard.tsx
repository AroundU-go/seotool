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
        <div className={`relative ${cardClassName || ''}`}>
            <div className="text-[11px] font-medium text-[#6B7280] tracking-[0.05em] uppercase mb-2 flex items-center justify-between">
                <span>{title}</span>
                <span className="text-[10px] font-medium px-[7px] py-[2px] rounded-[10px] bg-[#EEEDFE] text-[#3C3489] border border-[#CECBF6]">pro</span>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-4 md:p-6 border border-[#F3F4F6] relative overflow-hidden min-h-[300px]">
                {backgroundImageUrl ? (
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-top opacity-50 select-none pointer-events-none filter blur-[2px]"
                        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                    />
                ) : (
                    <>
                        {/* Fake Content Body */}
                        <div className="opacity-20 select-none pointer-events-none filter blur-[3px] relative z-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="h-24 bg-gray-200 rounded-lg"></div>
                                <div className="h-24 bg-gray-200 rounded-lg"></div>
                                <div className="h-24 bg-gray-200 rounded-lg"></div>
                                <div className="h-24 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="h-40 bg-gray-200 rounded-lg w-full mt-4"></div>
                        </div>
                    </>
                )}

                {/* Overlay Lock & Upgrade Message */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-300">
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
        </div>
    );
}

