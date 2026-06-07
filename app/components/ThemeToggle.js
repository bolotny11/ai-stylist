"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  // Загружаем тему при старте
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl shadow-md hover:scale-105 transition-transform"
      aria-label="Переключить тему"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}