# 🦖 Dino Run — Telegram Mini App

Клон Chrome Dino с поддержкой своих текстур. Работает как Telegram Mini App.

## Структура

```
dino-telegram/
├── index.html          # Главная страница игры
├── style.css           # Стили
├── game.js             # Логика игры
├── bot.py              # Telegram-бот (Python + aiogram)
├── requirements.txt
└── assets/             # ← СЮДА КЛАДИ СВОИ ТЕКСТУРЫ
    ├── dino.png
    ├── dino-jump.png
    ├── cactus.png
    ├── ground.png
    └── cloud.png
```

## 1. Свои текстуры

Положи PNG-файлы в папку `assets/`:

| Файл            | Описание                          | Рекомендуемый размер |
|-----------------|-----------------------------------|----------------------|
| `dino.png`      | Персонаж (бег / стояние)         | ~44×47 px           |
| `dino-jump.png` | Персонаж в прыжке (опционально)  | ~44×47 px           |
| `cactus.png`    | Препятствие                       | ~25–50×50 px        |
| `ground.png`    | Земля (будет тайлиться)           | любая ширина × ~24  |
| `cloud.png`     | Облако (опционально)              | ~46×14 px           |

Если какого-то файла нет — игра нарисует простые фигуры вместо него.

## 2. Деплой игры (Mini App)

Нужен любой хостинг с HTTPS.

### Вариант A: Vercel (самый простой)
1. Зарегистрируйся на [vercel.com](https://vercel.com)
2. Создай новый проект → Import Git Repository (или загрузи папку)
3. Получи ссылку вида `https://твой-проект.vercel.app`

### Вариант B: GitHub Pages / Netlify / Cloudflare Pages
То же самое — просто залей файлы `index.html`, `style.css`, `game.js` и папку `assets/`.

## 3. Настройка бота

1. Создай бота через [@BotFather](https://t.me/BotFather) → `/newbot`
2. Скопируй токен
3. В файле `bot.py` замени:
   ```python
   BOT_TOKEN = "твой_токен"
   WEBAPP_URL = "https://твой-сайт.vercel.app"
   ```
   Или используй переменные окружения:
   ```bash
   export BOT_TOKEN="..."
   export WEBAPP_URL="https://..."
   ```

4. Установи зависимости и запусти:
   ```bash
   pip install -r requirements.txt
   python bot.py
   ```

## 4. Кнопка меню в боте (рекомендуется)

В BotFather:
```
/setmenubutton
→ выбери своего бота
→ укажи URL твоего Mini App
→ текст кнопки: Играть
```

## Управление в игре
- **Пробел** или **Тап** по экрану — прыжок
- На мобильных работает отлично

## Что можно доработать
- Отправка рекорда на сервер
- Таблица лидеров
- Звуки
- Больше видов препятствий
- Ночной режим с анимацией

Удачи! 🚀
