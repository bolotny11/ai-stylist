import React from "react";
// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google"; // Импортируем шрифт Inter из Google Fonts

// 1️⃣ Загружаем шрифт и создаём CSS-переменную
const inter = Inter({
  subsets: ["latin"],       // Загружаем только латиницу (быстрее)
  variable: "--font-sans",  // 👈 Это и есть CSS-переменная (имя может быть любым)
  display: "swap",          // Показывает текст сразу, даже если шрифт ещё грузится
});

export const metadata = {
  title: "AI Stylist",
  description: "Your personal AI stylist",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        2️⃣ Применяем CSS-переменную к тегу <body>.
        Класс `${inter.variable}` сделает так, что CSS-переменная --font-sans
        станет доступна во всей вёрстке.
      */}
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}