import { useState } from "react";
import { FiGrid, FiActivity, FiAlertOctagon, FiTrendingUp, FiSettings } from "react-icons/fi";

const TopNav = () => {
    const tabs = [
        { id: "overview", label: "Overview", icon: FiGrid, active: false },
        { id: "demand", label: "Demand Forecast", icon: FiTrendingUp, active: false },
        { id: "leaks", label: "Leak & Burst", icon: FiAlertOctagon, active: false },
        { id: "quality", label: "Water Quality", icon: FiActivity, active: true },
        { id: "fraud", label: "Fraud & NRW", icon: FiSettings, active: false }
    ];

    return (
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200/50 dark:border-slate-800/50">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        disabled={!tab.active}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition ${
                            tab.active
                                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                                : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                        {tab.active && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default TopNav;
