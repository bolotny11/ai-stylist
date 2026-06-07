"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Проверяем сохранённую тему при загрузке
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return children;
}