import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiCpu, FiUser } from "react-icons/fi";

const RoleSwitcher = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [switching, setSwitching] = useState(false);

    const handleRoleSwitch = async (role) => {
        if (currentUser.role === role) return;

        setSwitching(true);
        try {
            const email = role === "admin" ? "admin@aquaflow.lk" : "user@aquaflow.lk";
            const password = "password123";

            // Authenticate directly with the express server
            const res = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error("Automatic login switch failed");

            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Force refresh of the page to reload context states
            if (role === "admin") {
                window.location.href = "/dashboard/hydrotwin";
            } else {
                window.location.href = "/app/safety";
            }
        } catch (err) {
            console.error(err);
            // Fallback routing if backend login fails
            if (role === "admin") {
                navigate("/dashboard/hydrotwin");
            } else {
                navigate("/app/safety");
            }
        } finally {
            setSwitching(false);
        }
    };

    return (
        <div className="relative">
            <select
                disabled={switching}
                value={currentUser.role || "user"}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-hidden hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition"
            >
                <option value="admin">🔧 Admin View (NWSDB)</option>
                <option value="user">👤 Consumer View (Citizen)</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                ▾
            </div>
        </div>
    );
};

export default RoleSwitcher;
