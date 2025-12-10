#!/usr/bin/env python3
"""Простой парсер без Selenium - парсит все ссылки и названия"""

import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
import re
from datetime import datetime

# Конфигурация
URL = "https://labirintdoors.ru/katalog2"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}

print("🚀 Простой парсер Лабиринт\n")
print(f"📍 URL: {URL}\n")

# Загрузка
response = requests.get(URL, headers=HEADERS)
print(f"✅ Страница загружена ({len(response.content)} bytes)\n")

soup = BeautifulSoup(response.content, 'lxml')

# Парсинг всех ссылок
all_links = soup.find_all('a', href=True)
print(f"🔗 Найдено ссылок: {len(all_links)}\n")

doors = []

for link in all_links:
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
    image = None
    if img:
        image = img.get('src') or img.get('data-src')
        if image and not image.startswith('http'):
            image = f"https://labirintdoors.ru{image}"
    
    door = {
        'name': text,
        'price': price,
        'url': href if href.startswith('http') else f"https://labirintdoors.ru{href}",
        'category': category,
        'image': image
    }
    
    doors.append(door)

print(f"✅ Найдено дверей: {len(doors)}\n")

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
    
    print("\n✅ Готово!")
else:
    print("❌ Не удалось найти данные")
