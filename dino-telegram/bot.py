import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    ReplyKeyboardMarkup,
    KeyboardButton,
)

# ==================== Настройки ====================
BOT_TOKEN = os.getenv("BOT_TOKEN") or "8577595131:AAHMRckooeS-4SFKA7Wd_B-L6OKnCFHHWx8"
# URL твоего Mini App (после деплоя)
WEBAPP_URL = os.getenv("WEBAPP_URL") or "https://github.com/tipo4ek27-pixel/TiPo4eKbot.git"

# ==================== Бот ====================
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


def get_play_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Играть",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


def get_menu_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🎮 Играть", web_app=WebAppInfo(url=WEBAPP_URL))],
        ],
        resize_keyboard=True,
    )


@dp.message(CommandStart())
async def cmd_start(message: Message):
    text = (
        "🦖 <b>Dino Run</b>\n\n"
        "Классический раннер в стиле Chrome Dino!\n"
        "Прыгай через препятствия и ставь рекорды.\n\n"
        "Нажми кнопку ниже, чтобы начать игру 👇"
    )
    await message.answer(
        text,
        parse_mode="HTML",
        reply_markup=get_play_keyboard(),
    )
    # Также показываем постоянную кнопку внизу
    await message.answer(
        "Или используй кнопку меню:",
        reply_markup=get_menu_keyboard(),
    )


@dp.message(Command("play"))
@dp.message(F.text == "🎮 Играть")
async def cmd_play(message: Message):
    await message.answer(
        "Запускаю игру! 🚀",
        reply_markup=get_play_keyboard(),
    )


@dp.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "Команды:\n"
        "/start — начать\n"
        "/play — открыть игру\n"
        "/help — помощь\n\n"
        "Управление в игре:\n"
        "• Пробел / Тап по экрану — прыжок"
    )


async def main():
    if BOT_TOKEN == "8577595131:AAHMRckooeS-4SFKA7Wd_B-L6OKnCFHHWx8":
        print("❌ Укажи BOT_TOKEN в переменных окружения или прямо в коде")
        return

    print("🚀 Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
