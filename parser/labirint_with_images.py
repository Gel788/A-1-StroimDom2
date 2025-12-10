#!/usr/bin/env python3
"""Парсер с скачиванием изображений"""

import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
import re
from datetime import datetime
from pathlib import Path
import time
from urllib.parse import urljoin

# Конфигурация
URL = "https://labirintdoors.ru/katalog2"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
IMAGES_DIR = Path('images')

# Создание папки для изображений
IMAGES_DIR.mkdir(exist_ok=True)

print("🚀 Парсер Лабиринт с загрузкой изображений\n")
print(f"📍 URL: {URL}")
print(f"📁 Папка изображений: {IMAGES_DIR}\n")

# Функция скачивания изображения
def download_image(url, filename):
    """Скачивает изображение и сохраняет локально"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            filepath = IMAGES_DIR / filename
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return str(filepath)
        else:
            print(f"   ❌ Ошибка загрузки: {response.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return None

# Загрузка страницы
response = requests.get(URL, headers=HEADERS)
print(f"✅ Страница загружена ({len(response.content)} bytes)\n")

soup = BeautifulSoup(response.content, 'lxml')

# Парсинг всех ссылок
all_links = soup.find_all('a', href=True)
print(f"🔗 Найдено ссылок: {len(all_links)}\n")

doors = []
image_counter = 0

print("📸 Начинаю скачивание изображений...\n")

for idx, link in enumerate(all_links):
    text = link.get_text(strip=True)
    href = link['href']
    
    # Фильтр: ищем только ссылки с дверями
    if not text or len(text) < 10:
        continue
    
    keywords = ['входн', 'двер', 'лабиринт', 'labirint', 'руб']
    if not any(kw in text.lower() for kw in keywords):
        continue
    
    # Извлечение цены
    price_match = re.search(r'(\d+[\s\d]+)\s*руб', text)
    price = int(price_match.group(1).replace(' ', '')) if price_match else None
    
    # Категория
    if any(w in text for w in ['LEOLAB', 'SKYLAB', 'EVOLAB']):
        category = 'Новинки 2025'
    elif any(w in text for w in ['PIANO', 'ROYAL', 'ISSIDA', 'STORM']):
        category = 'Хиты продаж'
    elif any(w in text.lower() for w in ['терморазрыв', 'nord', 'tundra']):
        category = 'С терморазрывом'
    elif any(w in text for w in ['WHITE', 'VERSAL', 'белые']):
        category = 'Белые двери'
    else:
        category = 'Основной каталог'
    
    # Изображение
    img = link.find('img')
    image_url = None
    local_image = None
    
    if img:
        image_url = img.get('src') or img.get('data-src')
        if image_url:
            # Полный URL
            if not image_url.startswith('http'):
                image_url = urljoin(URL, image_url)
            
            # Скачивание изображения
            image_counter += 1
            filename = f"door_{image_counter:04d}.jpg"
            print(f"   📥 [{image_counter}] Загружаю: {filename}")
            
            local_image = download_image(image_url, filename)
            
            if local_image:
                print(f"   ✅ Сохранено: {local_image}")
            
            time.sleep(0.3)  # Задержка между запросами
    
    door = {
        'name': text,
        'price': price,
        'url': href if href.startswith('http') else urljoin(URL, href),
        'category': category,
        'image': local_image or image_url,
        'image_url': image_url
    }
    
    doors.append(door)

print(f"\n✅ Найдено дверей: {len(doors)}")
print(f"📸 Скачано изображений: {image_counter}\n")

if doors:
    # Статистика
    print("="*60)
    print("📊 СТАТИСТИКА")
    print("="*60)
    print(f"📦 Всего: {len(doors)}")
    
    prices = [d['price'] for d in doors if d['price']]
    if prices:
        print(f"💰 Мин: {min(prices):,} ₽")
        print(f"💰 Макс: {max(prices):,} ₽")
        print(f"💰 Средняя: {sum(prices)//len(prices):,} ₽")
    
    cats = {}
    for d in doors:
        cat = d['category']
        cats[cat] = cats.get(cat, 0) + 1
    
    print(f"\n📂 Категории:")
    for cat, cnt in sorted(cats.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat}: {cnt}")
    
    # Статистика по изображениям
    with_images = len([d for d in doors if d.get('image')])
    print(f"\n📸 С изображениями: {with_images}/{len(doors)} ({with_images*100//len(doors)}%)")
    
    print("="*60 + "\n")
    
    # Сохранение
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # JSON
    with open(f'labirint_{ts}.json', 'w', encoding='utf-8') as f:
        json.dump(doors, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON: labirint_{ts}.json")
    
    # CSV
    df = pd.DataFrame(doors)
    df.to_csv(f'labirint_{ts}.csv', index=False, encoding='utf-8-sig')
    print(f"💾 CSV: labirint_{ts}.csv")
    
    # Excel
    df.to_excel(f'labirint_{ts}.xlsx', index=False)
    print(f"💾 Excel: labirint_{ts}.xlsx")
    
    print(f"\n📁 Изображения сохранены в: {IMAGES_DIR}/")
    print(f"   Всего файлов: {len(list(IMAGES_DIR.glob('*.jpg')))}")
    
    print("\n✅ Готово!")
else:
    print("❌ Не удалось найти данные")
