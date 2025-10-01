import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Verificar preferência inicial
        const isDarkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "dark" || (!savedTheme && isDarkPreferred)) {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        root.classList.toggle("dark");
        const newTheme = root.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        setIsDark(!isDark);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            aria-label="Alternar tema"
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
                <Moon className="w-5 h-5 text-gray-800 dark:text-white" />
            )}
        </button>
    );
};
