import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { items, style, weather, event } = await request.json();

    // Перевод стилей на русский для AI
    const styleNames = {
      casual: "повседневный (casual)",
      streetwear: "уличный (streetwear), свободный, смелый",
      minimal: "минимализм, чистые линии, спокойные цвета",
      oldmoney: "Old Money — элегантный, дорогой, сдержанный",
      office: "офисный (business casual), строгий но современный",
      evening: "вечерний выход, элегантный, стильный"
    };

    // Перевод погоды
    const weatherDesc = {
      sunny: "солнечно, тепло, можно лёгкую одежду",
      cloudy: "облачно, без осадков",
      rainy: "дождливо, нужен зонт и непромокаемая обувь",
      cold: "холодно, нужно одеваться тепло"
    };

    const prompt = `
Ты элитный стилист, который работает с модными блогерами и звёздами.

Гардероб пользователя:
${items.map((item, i) => `${i+1}. ${item}`).join("\n")}

Параметры:
- Стиль: ${styleNames[style] || style}
- Погода: ${weatherDesc[weather] || weather}
- Событие: ${event === "daily" ? "обычный день" : event === "date" ? "романтическое свидание" : event === "party" ? "вечеринка с друзьями" : "путешествие"}

Твоя задача:
Сгенерируй 3 разных образа, которые строго соответствуют стилю "${styleNames[style]}".

Для каждого образа:
1. Название образа (креативное, запоминающееся)
2. Список вещей из гардероба пользователя (комбинируй существующие вещи)
3. Почему это сочетание работает (цвет, силуэт, стиль)
4. Совет по аксессуарам или обуви (если нет в гардеробе)

Формат ответа:

🔥 ОБРАЗ 1: [Название]
👕 Вещи: ...
💡 Почему круто: ...
✨ Аксессуары: ...

🔥 ОБРАЗ 2: ...
...

Будь конкретным, вдохновляющим и пиши на русском.
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
      error: "Ошибка AI: " + error.message 
    }, { status: 500 });
  }
}