// app/api/weather/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1️⃣ Определяем город по IP (бесплатный сервис)
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();
    const city = ipData.city;
    const country = ipData.country_name;

    if (!city) {
      return NextResponse.json({ 
        weather: "sunny", 
        temp: 20, 
        description: "Не удалось определить город",
        city: null 
      });
    }

    // 2️⃣ Запрашиваем погоду в OpenWeatherMap
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
    );
    const weatherData = await weatherRes.json();

    // 3️⃣ Преобразуем ответ в понятный для AI формат
    const weatherMap = {
      Clear: "sunny",
      Clouds: "cloudy",
      Rain: "rainy",
      Drizzle: "rainy",
      Thunderstorm: "rainy",
      Snow: "cold",
      Mist: "cloudy",
      Fog: "cloudy"
    };

    const condition = weatherData.weather?.[0]?.main || "Clear";
    const weatherType = weatherMap[condition] || "sunny";
    const temperature = Math.round(weatherData.main?.temp || 20);
    const description = weatherData.weather?.[0]?.description || "";

    return NextResponse.json({
      weather: weatherType,
      temp: temperature,
      description: description,
      city: `${city}, ${country}`,
      raw: weatherData.main?.temp
    });

  } catch (error) {
    console.error("Weather API Error:", error);
    // В случае ошибки возвращаем безопасные значения по умолчанию
    return NextResponse.json({ 
      weather: "sunny", 
      temp: 20, 
      description: "Солнечно",
      city: null 
    });
  }
}