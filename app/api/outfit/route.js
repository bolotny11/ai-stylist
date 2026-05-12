import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Нет вещей" }, { status: 400 });
    }

    // Теперь AI реально анализирует вещи
    const prompt = `Ты профессиональный стилист.

Проанализируй эти вещи из гардероба пользователя:
${items.map((item, i) => `${i+1}. ${item}`).join("\n")}

Опиши каждую вещь (категория, цвет, стиль), а потом составь 3 готовых образа.

Формат ответа:

📋 АНАЛИЗ ГАРДЕРОБА:
- [вещь 1]: [категория], [цвет], [стиль]
- [вещь 2]: [категория], [цвет], [стиль]

🔥 ОБРАЗ 1 (casual):
- [вещь]
- [вещь]

🔥 ОБРАЗ 2 (офис/умный casual):
- [вещь]
- [вещь]

🔥 ОБРАЗ 3 (вечер/свидание):
- [вещь]
- [вещь]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("Ошибка:", error);
    return NextResponse.json({ error: "Ошибка AI: " + error.message }, { status: 500 });
  }
}