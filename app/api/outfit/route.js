import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Функция для получения реальной погоды
async function getRealWeather() {
  try {
    // Определяем базовый URL (работает и локально, и на Vercel)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const res = await fetch(`${baseUrl}/api/weather`, {
      // Таймаут, чтобы не ждать слишком долго
      signal: AbortSignal.timeout(3000)
    });
    
    if (!res.ok) {
      return { weather: null, temp: null, city: null, description: null };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Weather fetch error:", error);
    return { weather: null, temp: null, city: null, description: null };
  }
}

export async function POST(request) {
  try {
    const { items, style, weather, event } = await request.json();

    // ПОЛУЧАЕМ РЕАЛЬНУЮ ПОГОДУ
    const realWeatherData = await getRealWeather();
    const hasRealWeather = realWeatherData.weather && realWeatherData.city;
    
    // Используем реальную погоду, если пользователь не выбрал свою
    let finalWeather = weather;
    let weatherContext = "";
    
    if (hasRealWeather && !weather) {
      finalWeather = realWeatherData.weather;
      weatherContext = `🌍 РЕАЛЬНАЯ ПОГОДА (${realWeatherData.city}): ${realWeatherData.description}, ${realWeatherData.temp}°C
      
ВАЖНО: Учитывай эту реальную погоду при подборе образов! Если на улице дождь — предложи непромокаемую обувь и зонт, если холодно — тёплые вещи, если солнечно — лёгкую одежду.`;
    } else if (weather) {
      weatherContext = `🌤️ ПОЛЬЗОВАТЕЛЬ ВЫБРАЛ: ${weatherDesc[weather] || weather}`;
    } else {
      weatherContext = `🌤️ ПОГОДА: стандартная (солнечно, +20°C)`;
    }

    // Перевод стилей на русский для AI
    const styleNames = {
      casual: "повседневный (casual)",
      streetwear: "уличный (streetwear), свободный, смелый",
      minimal: "минимализм, чистые линии, спокойные цвета",
      oldmoney: "Old Money — элегантный, дорогой, сдержанный",
      office: "офисный (business casual), строгий но современный",
      evening: "вечерний выход, элегантный, стильный"
    };

    // Перевод погоды для выбранного пользователем варианта
    const weatherDesc = {
      sunny: "солнечно, тепло, можно лёгкую одежду",
      cloudy: "облачно, без осадков",
      rainy: "дождливо, нужен зонт и непромокаемая обувь",
      cold: "холодно, нужно одеваться тепло"
    };

    // Определяем стиль для промпта
    let styleText = "";
    if (style) {
      styleText = `- Стиль: ${styleNames[style] || style}`;
    } else if (hasRealWeather) {
      styleText = `- Стиль: определи сам, но учитывай реальную погоду (${realWeatherData.description}, ${realWeatherData.temp}°C). Например, если холодно — предложи более тёплые слои, если жарко — лёгкие ткани.`;
    } else {
      styleText = `- Стиль: определи сам, исходя из вещей пользователя и погоды. Будь креативен.`;
    }

    // Определяем событие для промпта
    let eventText = "";
    switch(event) {
      case "daily":
        eventText = "обычный день в городе";
        break;
      case "date":
        eventText = "романтическое свидание";
        break;
      case "party":
        eventText = "вечеринка с друзьями";
        break;
      case "travel":
        eventText = "путешествие";
        break;
      default:
        eventText = "обычный день";
    }

    const prompt = `
Ты элитный стилист, который работает с модными блогерами и звёздами.

ГАРДЕРОБ ПОЛЬЗОВАТЕЛЯ:
${items.map((item, i) => `${i+1}. ${item}`).join("\n")}

${weatherContext}

ПАРАМЕТРЫ:
${styleText}
- Событие: ${eventText}

ТВОЯ ЗАДАЧА:
Сгенерируй 3 разных образа.

ВАЖНЫЕ ПРАВИЛА:
1. Используй ТОЛЬКО те вещи, которые перечислены в гардеробе выше
2. Комбинируй их по-разному
3. ОБЯЗАТЕЛЬНО учитывай погоду (если указана реальная — строго следуй ей)
4. Если погода дождливая или холодная — не предлагай лёгкую обувь или тонкие куртки

Для каждого образа напиши:
1. Название образа (креативное, запоминающееся)
2. Список вещей из гардероба пользователя
3. Почему это сочетание работает (цвет, силуэт, стиль)
4. Совет по аксессуарам (если нет в гардеробе)

ФОРМАТ ОТВЕТА:

🔥 ОБРАЗ 1: [Название]
👕 Вещи: ...
💡 Почему круто: ...
✨ Аксессуары: ...

🔥 ОБРАЗ 2: [Название]
👕 Вещи: ...
💡 Почему круто: ...
✨ Аксессуары: ...

🔥 ОБРАЗ 3: [Название]
👕 Вещи: ...
💡 Почему круто: ...
✨ Аксессуары: ...

Будь конкретным, вдохновляющим и пиши на русском. Используй эмодзи для оформления.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ 
      result: "❌ Ошибка AI: " + error.message 
    }, { status: 500 });
  }
}