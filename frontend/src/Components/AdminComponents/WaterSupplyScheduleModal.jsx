import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";

const STORAGE_KEY = "aquaFlowWaterSupplySchedule";

const today = () => {
    const date = new Date();
    return date.toISOString().slice(0, 10);
};

const WaterSupplyScheduleModal = ({ open, onClose }) => {
    const [schedule, setSchedule] = useState({ date: today(), startTime: "", endTime: "", note: "" });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!open) return;
        const stored = localStorage.getItem(STORAGE_KEY);
        setSchedule(stored ? JSON.parse(stored) : { date: today(), startTime: "", endTime: "", note: "" });
        setSaved(false);
    }, [open]);

    if (!open) return null;

    const update = (field) => (event) => setSchedule((current) => ({ ...current, [field]: event.target.value }));

    const saveSchedule = (event) => {
        event.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
        setSaved(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                            <FiCalendar className="h-5 w-5" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add water supply schedule</h2>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Set the supply window for today. It stays saved until you change it.</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={saveSchedule} className="mt-5 space-y-4">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Date
                        <input type="date" value={schedule.date} onChange={update("date")} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" required />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Start time
                            <span className="relative mt-1.5 block"><FiClock className="pointer-events-none absolute left-3 top-2.5 text-slate-400" /><input type="time" value={schedule.startTime} onChange={update("startTime")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" required /></span>
                        </label>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            End time
                            <span className="relative mt-1.5 block"><FiClock className="pointer-events-none absolute left-3 top-2.5 text-slate-400" /><input type="time" value={schedule.endTime} onChange={update("endTime")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" required /></span>
                        </label>
                    </div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Note (optional)
                        <input type="text" value={schedule.note} onChange={update("note")} placeholder="Example: Morning supply window" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                    </label>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700">{saved ? "Schedule saved" : "Save schedule"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WaterSupplyScheduleModal;
