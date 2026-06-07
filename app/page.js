"use client";
import { useState, useEffect } from "react";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [outfits, setOutfits] = useState("");
  const [loading, setLoading] = useState(false);
  const [realWeather, setRealWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const [selectedStyle, setSelectedStyle] = useState("casual");
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("daily");

  // Загружаем реальную погоду
  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        const data = await res.json();
        setRealWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const handleAddPhotos = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalFiles = images.length + newFiles.length;
    
    if (totalFiles > 5) {
      alert(`можно загрузить только 5 фото. Сейчас у тебя ${images.length} фото, можно добавить ещё ${5 - images.length}.`);
      return;
    }
    
    setImages([...images, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    e.target.value = "";
  };

  const removePhoto = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const generateOutfit = async () => {
    if (images.length === 0) {
      alert("сначала добавь фото одежды");
      return;
    }

    setLoading(true);
    setOutfits("");

    try {
      const res = await fetch("/api/outfit", {
        method: "POST",
        body: JSON.stringify({
          items: images.map((f) => f.name),
          style: selectedStyle,
          weather: selectedWeather,
          event: selectedEvent,
        }),
      });

      const data = await res.json();
      setOutfits(data.result);
    } catch (error) {
      setOutfits("ошибка: не удалось создать образ. попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeToggle />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="mb-4">
            <img 
              src="/logo.png" 
              alt="Логотип" 
              className="h-44 mx-auto"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
            твой стилист прямо в кармане
          </p>
        </div>

        {realWeather && realWeather.city && (
          <div className="text-center mb-6 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2 rounded-full">
            {realWeather.city} • {realWeather.description} • {realWeather.temp}°C
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Настрой стиль</h3>
          
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {[
              { id: "casual", name: "casual" },
              { id: "streetwear", name: "streetwear" },
              { id: "minimal", name: "минимализм" },
              { id: "oldmoney", name: "old money" },
              { id: "office", name: "офис" },
              { id: "evening", name: "вечерний" }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedStyle === style.id
                    ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>

          {/* Кнопки погоды */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <h4 className="w-full text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Погода</h4>
            
            <button
              onClick={() => setSelectedWeather(null)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                selectedWeather === null
                  ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              авто
            </button>
            
            {[
              { id: "sunny", name: "солнечно" },
              { id: "cloudy", name: "облачно" },
              { id: "rainy", name: "дождливо" },
              { id: "cold", name: "холодно" }
            ].map((weather) => (
              <button
                key={weather.id}
                onClick={() => setSelectedWeather(weather.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedWeather === weather.id
                    ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {weather.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <h4 className="w-full text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Событие</h4>
            {[
              { id: "daily", name: "повседневность" },
              { id: "date", name: "свидание" },
              { id: "party", name: "вечеринка" },
              { id: "travel", name: "путешествие" }
            ].map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedEvent === event.id
                    ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-12">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Тарифы</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Free</h3>
              <p className="text-3xl font-light text-gray-900 dark:text-white mb-3">0 ₽<span className="text-sm text-gray-400 dark:text-gray-500">/мес</span></p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>✓ До 5 вещей</li>
                <li>✓ Базовые стили</li>
              </ul>
            </div>
            <div className="flex-1 bg-gray-900 dark:bg-white rounded-xl p-5 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-3 py-0.5 rounded-full border border-gray-700 dark:border-gray-200">популярный</div>
              <h3 className="font-medium text-white dark:text-gray-900 mb-1">Pro</h3>
              <p className="text-3xl font-light text-white dark:text-gray-900 mb-3">399 ₽<span className="text-sm text-gray-400 dark:text-gray-500">/мес</span></p>
              <ul className="text-sm text-gray-300 dark:text-gray-600 space-y-1">
                <li>✓ Все стили</li>
                <li>✓ AI стилист 24/7</li>
                <li>✓ Рекомендации покупок</li>
              </ul>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Premium</h3>
              <p className="text-3xl font-light text-gray-900 dark:text-white mb-3">799 ₽<span className="text-sm text-gray-400 dark:text-gray-500">/мес</span></p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>✓ Всё из Pro</li>
                <li>✓ Виртуальная примерка</li>
                <li>✓ Персональный стилист</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <label className="block mb-6">
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddPhotos}
                disabled={images.length >= 5}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <span className="text-4xl block mb-3"></span>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {images.length >= 5 ? "максимум 5 вещей" : "добавить одежду"}
                </span>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {images.length}/5 вещей в гардеробе
                </p>
              </label>
            </div>
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img src={preview} alt={`Одежда ${i+1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm" />
                    <button onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full w-6 h-6 text-xs hover:bg-gray-200 dark:hover:bg-gray-600">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-16">
          <button
            onClick={generateOutfit}
            disabled={loading || images.length === 0}
            className="px-10 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            {loading ? "создаю образ..." : "собрать образ"}
          </button>
        </div>

        {outfits && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-12">
            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-6 tracking-tight">твой образ</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {outfits}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}