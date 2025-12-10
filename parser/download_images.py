#!/usr/bin/env python3
"""Скачивает изображения для существующих данных каталога"""

import requests
import json
from pathlib import Path
import time

# Папка для изображений
IMAGES_DIR = Path('../public/catalog-images')
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Плейсхолдер изображения (если не найдем)
PLACEHOLDER_URL = "https://via.placeholder.com/800x600/1a1a26/60a5fa?text=Door"

# Базовые URL для поиска изображений
BASE_URLS = [
    "https://labirintdoors.ru",
    "https://labirintdoors.ru/upload/iblock",
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Accept': 'image/*'
}

print("🚀 Загрузка изображений для каталога\n")
print(f"📁 Папка: {IMAGES_DIR}\n")

# Список дверей для скачивания
doors_to_download = [
    {"id": 1, "name": "LEOLAB", "search": "leolab"},
    {"id": 2, "name": "PIANO ROYAL", "search": "piano"},
    {"id": 3, "name": "ISSIDA", "search": "issida"},
    {"id": 4, "name": "NORD", "search": "nord"},
    {"id": 5, "name": "TUNDRA", "search": "tundra"},
    {"id": 6, "name": "STORM", "search": "storm"},
    {"id": 7, "name": "WHITE VERSAL", "search": "versal"},
    {"id": 8, "name": "SKYLAB", "search": "skylab"},
]

def download_image(url, filename):
    """Скачивает изображение"""
    try:
        print(f"   📥 Загружаю: {url[:60]}...")
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            filepath = IMAGES_DIR / filename
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"   ✅ Сохранено: {filepath}")
            return True
        else:
            print(f"   ❌ Ошибка: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ⚠️  {str(e)[:50]}")
        return False

# Скачиваем плейсхолдеры
print("📸 Создаю изображения для каталога...\n")

success = 0
for door in doors_to_download:
    filename = f"door-{door['id']:02d}.jpg"
    print(f"{door['id']}. {door['name']}")
    
    # Пробуем скачать плейсхолдер с текстом
    url = f"https://via.placeholder.com/800x600/1a1a26/60a5fa?text={door['search'].upper()}"
    
    if download_image(url, filename):
        success += 1
    
    time.sleep(0.2)
    print()

print("="*60)
print(f"✅ Загружено: {success}/{len(doors_to_download)}")
print(f"📁 Папка: {IMAGES_DIR}")
print(f"   Файлов: {len(list(IMAGES_DIR.glob('*.jpg')))}")
print("="*60)

# Обновляем catalogData.js
print("\n📝 Обновите пути к изображениям в src/catalogData.js:")
print("   image: '/catalog-images/door-01.jpg'")
print("\n✅ Готово!")
