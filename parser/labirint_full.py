#!/usr/bin/env python3
"""Полный парсер с Selenium и скачиванием изображений"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
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
IMAGES_DIR.mkdir(exist_ok=True)

print("🚀 Полный парсер Лабиринт (Selenium + изображения)\n")
print(f"📍 URL: {URL}")
print(f"📁 Папка изображений: {IMAGES_DIR}\n")

# Функция скачивания изображения
def download_image(url, filename):
    """Скачивает изображение и сохраняет локально"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        if response.status_code == 200:
            filepath = IMAGES_DIR / filename
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return str(filepath)
        else:
            return None
    except Exception as e:
        print(f"   ⚠️ Ошибка загрузки {filename}: {str(e)[:50]}")
        return None

# Настройка Selenium
print("🌐 Запускаю браузер...\n")
options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--disable-gpu')
options.add_argument(f'user-agent={HEADERS["User-Agent"]}')

driver = webdriver.Chrome(options=options)

try:
    # Загрузка страницы
    driver.get(URL)
    print("⏳ Жду загрузки контента...")
    
    # Ждем загрузки
    time.sleep(5)
    
    # Скроллим вниз для ленивой загрузки
    print("📜 Скроллю страницу для загрузки изображений...\n")
    for i in range(5):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
    
    # Получаем HTML
    html = driver.page_source
    soup = BeautifulSoup(html, 'lxml')
    
    # Ищем изображения дверей
    print("🔍 Ищу карточки товаров...\n")
    
    doors = []
    image_counter = 0
    
    # Вариант 1: ищем все изображения
    all_imgs = soup.find_all('img')
    print(f"🖼️  Найдено изображений на странице: {len(all_imgs)}\n")
    
    # Вариант 2: ищем карточки товаров
    products = soup.find_all(['div', 'article'], class_=re.compile(r'product|item|card|door', re.I))
    print(f"📦 Найдено карточек товаров: {len(products)}\n")
    
    # Вариант 3: ищем через ссылки с изображениями внутри
    links_with_imgs = soup.find_all('a', href=True)
    
    for idx, link in enumerate(links_with_imgs):
        text = link.get_text(strip=True)
        href = link['href']
        
        # Фильтр
        if not text or len(text) < 10:
            continue
        
        keywords = ['входн', 'двер', 'лабиринт', 'labirint', 'руб', 'nord', 'royal', 'piano']
        if not any(kw in text.lower() for kw in keywords):
            continue
        
        # Извлечение цены
        price_match = re.search(r'(\d+[\s\d]+)\s*руб', text, re.IGNORECASE)
        price = int(price_match.group(1).replace(' ', '')) if price_match else None
        
        # Категория
        if any(w in text.upper() for w in ['LEOLAB', 'SKYLAB', 'EVOLAB']):
            category = 'invisible'
        elif any(w in text.upper() for w in ['PIANO', 'ROYAL', 'ISSIDA', 'STORM']):
            category = 'veneer'
        elif any(w in text.lower() for w in ['терморазрыв', 'nord', 'tundra']):
            category = 'thermo'
        elif any(w in text.upper() for w in ['WHITE', 'VERSAL']):
            category = 'glass'
        else:
            category = 'entrance'
        
        # Поиск изображения
        img = link.find('img')
        image_url = None
        local_image = None
        
        if img:
            # Пробуем разные атрибуты
            image_url = (img.get('src') or 
                        img.get('data-src') or 
                        img.get('data-lazy-src') or
                        img.get('data-original'))
            
            if image_url:
                # Полный URL
                if not image_url.startswith('http'):
                    image_url = urljoin(URL, image_url)
                
                # Пропускаем маленькие иконки и плейсхолдеры
                if any(skip in image_url.lower() for skip in ['icon', 'logo', 'placeholder', 'thumb']):
                    continue
                
                # Скачивание
                image_counter += 1
                ext = 'jpg' if '.jpg' in image_url or '.jpeg' in image_url else 'png'
                filename = f"door_{image_counter:04d}.{ext}"
                
                print(f"   📥 [{image_counter}/{len(doors)+1}] {text[:40]}...")
                local_image = download_image(image_url, filename)
                
                if local_image:
                    print(f"   ✅ OK")
        
        door = {
            'id': len(doors) + 1,
            'name': text[:100],  # Ограничиваем длину
            'price': price or 45000,  # Дефолтная цена
            'category': category,
            'image': f'/catalog-images/{filename}' if local_image else '/placeholder-door.jpg',
            'local_path': local_image,
            'source_url': image_url,
            'url': href if href.startswith('http') else urljoin(URL, href),
            'material': 'Шпон премиум',
            'acoustic': '36-42 дБ',
            'size': '900×2100 мм',
            'features': [
                'Скрытые петли',
                'Магнитный замок',
                'Доводчик',
                'Акустика до 42 дБ'
            ],
            'popular': 'royal' in text.lower() or 'piano' in text.lower(),
            'new': 'leolab' in text.lower() or 'skylab' in text.lower()
        }
        
        doors.append(door)
    
    print(f"\n\n✅ Найдено дверей: {len(doors)}")
    print(f"📸 Скачано изображений: {image_counter}\n")
    
    if doors:
        # Статистика
        print("="*60)
        print("📊 ИТОГОВАЯ СТАТИСТИКА")
        print("="*60)
        print(f"📦 Всего дверей: {len(doors)}")
        print(f"📸 С изображениями: {len([d for d in doors if d.get('local_path')])}")
        
        prices = [d['price'] for d in doors if d['price']]
        if prices:
            print(f"\n💰 Цены:")
            print(f"   Мин: {min(prices):,} ₽")
            print(f"   Макс: {max(prices):,} ₽")
            print(f"   Средняя: {sum(prices)//len(prices):,} ₽")
        
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
        with open(f'labirint_full_{ts}.json', 'w', encoding='utf-8') as f:
            json.dump(doors, f, ensure_ascii=False, indent=2)
        print(f"💾 JSON: labirint_full_{ts}.json")
        
        # CSV
        df = pd.DataFrame(doors)
        df.to_csv(f'labirint_full_{ts}.csv', index=False, encoding='utf-8-sig')
        print(f"💾 CSV: labirint_full_{ts}.csv")
        
        # Excel
        df.to_excel(f'labirint_full_{ts}.xlsx', index=False)
        print(f"💾 Excel: labirint_full_{ts}.xlsx")
        
        print(f"\n📁 Изображения: {IMAGES_DIR}/")
        print(f"   Файлов: {len(list(IMAGES_DIR.glob('*')))}")
        
        print("\n✅ Парсинг завершён!")
    else:
        print("❌ Не удалось найти данные")

finally:
    driver.quit()
    print("\n🔚 Браузер закрыт")
