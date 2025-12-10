#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер каталога дверей Лабиринт с Selenium (для JS-контента)
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import json
import pandas as pd
import time
import re
from datetime import datetime
from typing import List, Dict


class LabirintSeleniumParser:
    """Парсер с использованием Selenium для JS-контента"""
    
    def __init__(self, headless: bool = True):
        self.base_url = "https://labirintdoors.ru"
        self.catalog_url = f"{self.base_url}/katalog2"
        self.doors_data = []
        
        # Настройка Chrome
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Chrome WebDriver запущен")
        except Exception as e:
            print(f"❌ Ошибка запуска Chrome: {e}")
            print("💡 Установите ChromeDriver: brew install chromedriver")
            raise
    
    def extract_price(self, text: str) -> int:
        """Извлечение цены"""
        if not text:
            return None
        match = re.search(r'(\d+[\s\d]*)\s*руб', text.replace(' ', ''))
        if match:
            return int(match.group(1).replace(' ', ''))
        return None
    
    def parse_catalog(self):
        """Парсинг всего каталога"""
        print(f"\n🚀 Начинаю парсинг: {self.catalog_url}")
        
        try:
            self.driver.get(self.catalog_url)
            print("⏳ Ждем загрузки JavaScript...")
            time.sleep(3)  # Ждем загрузки JS
            
            # Прокручиваем страницу для загрузки lazy-load контента
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Получаем HTML после загрузки JS
            html = self.driver.page_source
            soup = BeautifulSoup(html, 'lxml')
            
            print("🔍 Парсинг элементов...")
            
            # Ищем различные варианты элементов
            selectors = [
                ('a.product-sections-01-item', 'Товары (тип 1)'),
                ('.product-sections-01-item', 'Товары (тип 2)'),
                ('a[href*="/catalog/"]', 'Ссылки на каталог'),
                ('div[class*="product"]', 'Продукты'),
            ]
            
            all_items = []
            for selector, desc in selectors:
                items = soup.select(selector)
                if items:
                    print(f"   ✅ {desc}: {len(items)} элементов")
                    all_items.extend(items)
                else:
                    print(f"   ⚠️  {desc}: 0 элементов")
            
            # Парсим найденные элементы
            if not all_items:
                print("\n❌ Не найдено элементов товаров")
                print("🔍 Пробую альтернативный подход...")
                all_items = soup.find_all('a', href=True)
                print(f"   Найдено всего ссылок: {len(all_items)}")
            
            for item in all_items:
                try:
                    href = item.get('href', '')
                    text = item.get_text(strip=True)
                    
                    # Фильтруем только релевантные ссылки
                    if not any(keyword in text.lower() for keyword in ['двер', 'door', 'лабиринт', 'labirint']):
                        continue
                    
                    if len(text) < 5:
                        continue
                    
                    door_data = {
                        'name': text,
                        'url': href if href.startswith('http') else f"{self.base_url}{href}",
                    }
                    
                    # Извлечение цены
                    price = self.extract_price(text)
                    if price:
                        door_data['price'] = price
                    
                    # Поиск изображения рядом
                    img = item.find('img')
                    if img:
                        img_src = img.get('src') or img.get('data-src') or img.get('data-lazy')
                        if img_src:
                            door_data['image'] = img_src if img_src.startswith('http') else f"{self.base_url}{img_src}"
                    
                    # Категоризация
                    if any(word in text for word in ['LEOLAB', 'SKYLAB', 'EVOLAB']):
                        door_data['category'] = 'Новинки 2025'
                    elif any(word in text for word in ['PIANO', 'ROYAL', 'ISSIDA', 'STORM']):
                        door_data['category'] = 'Хиты продаж'
                    elif 'терморазрыв' in text.lower() or any(word in text for word in ['NORD', 'TUNDRA', 'ATLANTIC']):
                        door_data['category'] = 'С терморазрывом'
                    elif 'WHITE' in text or 'бел' in text.lower():
                        door_data['category'] = 'Белые двери'
                    else:
                        door_data['category'] = 'Основной каталог'
                    
                    self.doors_data.append(door_data)
                    
                except Exception as e:
                    continue
            
            print(f"\n✅ Найдено дверей: {len(self.doors_data)}")
            
        except Exception as e:
            print(f"❌ Ошибка парсинга: {e}")
        
        finally:
            self.driver.quit()
            print("🔚 Browser закрыт")
    
    def save_results(self):
        """Сохранение результатов"""
        if not self.doors_data:
            print("⚠️  Нет данных для сохранения")
            return
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # JSON
        json_file = f"labirint_catalog_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.doors_data, f, ensure_ascii=False, indent=2)
        print(f"💾 JSON: {json_file}")
        
        # CSV
        csv_file = f"labirint_catalog_{timestamp}.csv"
        df = pd.DataFrame(self.doors_data)
        df.to_csv(csv_file, index=False, encoding='utf-8-sig')
        print(f"💾 CSV: {csv_file}")
        
        # Excel
        xlsx_file = f"labirint_catalog_{timestamp}.xlsx"
        df.to_excel(xlsx_file, index=False, engine='openpyxl')
        print(f"💾 Excel: {xlsx_file}")
        
        self.print_stats()
    
    def print_stats(self):
        """Статистика"""
        if not self.doors_data:
            return
        
        print("\n" + "="*60)
        print("📊 СТАТИСТИКА")
        print("="*60)
        print(f"📦 Всего дверей: {len(self.doors_data)}")
        
        # Цены
        prices = [d['price'] for d in self.doors_data if d.get('price')]
        if prices:
            print(f"💰 Мин: {min(prices):,} ₽")
            print(f"💰 Макс: {max(prices):,} ₽")
            print(f"💰 Средняя: {sum(prices)//len(prices):,} ₽")
        
        # Категории
        cats = {}
        for d in self.doors_data:
            cat = d.get('category', 'Другое')
            cats[cat] = cats.get(cat, 0) + 1
        
        print(f"\n📂 По категориям:")
        for cat, cnt in sorted(cats.items(), key=lambda x: x[1], reverse=True):
            print(f"   {cat}: {cnt}")
        print("="*60)


def main():
    print("""
    ╔════════════════════════════════════════════════════════╗
    ║  ПАРСЕР ЛАБИРИНТ (SELENIUM)                            ║
    ║  https://labirintdoors.ru/katalog2                     ║
    ╚════════════════════════════════════════════════════════╝
    """)
    
    try:
        parser = LabirintSeleniumParser(headless=True)
        parser.parse_catalog()
        parser.save_results()
        
        print("\n✅ Парсинг завершен!")
        
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {e}")
        print("\n💡 Решение:")
        print("   1. Установите Chrome: brew install --cask google-chrome")
        print("   2. Установите ChromeDriver: brew install chromedriver")
        print("   3. Разрешите ChromeDriver: xattr -d com.apple.quarantine /opt/homebrew/bin/chromedriver")


if __name__ == "__main__":
    main()
