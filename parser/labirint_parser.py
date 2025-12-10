#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер каталога дверей Лабиринт
Извлекает полную информацию о всех дверях с сайта labirintdoors.ru
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import re
from datetime import datetime
from typing import List, Dict, Optional
from fake_useragent import UserAgent
from tqdm import tqdm
import pandas as pd


class LabirintParser:
    """Класс для парсинга каталога дверей Лабиринт"""
    
    def __init__(self):
        self.base_url = "https://labirintdoors.ru"
        self.catalog_url = f"{self.base_url}/katalog2"
        self.session = requests.Session()
        self.ua = UserAgent()
        self.headers = {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.doors_data = []
        
    def get_page(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Получение и парсинг страницы с retry логикой"""
        for attempt in range(retries):
            try:
                response = self.session.get(
                    url, 
                    headers=self.headers, 
                    timeout=30
                )
                response.raise_for_status()
                return BeautifulSoup(response.content, 'lxml')
            except Exception as e:
                print(f"⚠️  Попытка {attempt + 1}/{retries} не удалась: {e}")
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"❌ Не удалось загрузить {url}")
                    return None
    
    def extract_price(self, text: str) -> Optional[int]:
        """Извлечение цены из текста"""
        if not text:
            return None
        match = re.search(r'(\d+[\s\d]*)\s*руб', text.replace(' ', ''))
        if match:
            return int(match.group(1).replace(' ', ''))
        return None
    
    def parse_catalog_page(self, soup: BeautifulSoup) -> List[Dict]:
        """Парсинг страницы каталога и извлечение ссылок на товары"""
        doors = []
        
        # Ищем все элементы товаров по конкретному классу
        collections = soup.find_all('a', class_='product-sections-01-item')
        
        print(f"🔍 Найдено элементов для парсинга: {len(collections)}")
        
        for item in tqdm(collections, desc="Парсинг товаров"):
            try:
                door_data = {}
                
                # Извлечение ссылки (сам элемент - это ссылка)
                href = item.get('href', '')
                if href:
                    door_data['url'] = href if href.startswith('http') else f"{self.base_url}{href}"
                
                # Извлечение названия из текста ссылки или заголовка внутри
                text = item.get_text(strip=True)
                if text and 'Входные двери' in text:
                    door_data['name'] = text
                elif text:
                    door_data['name'] = f"Входные двери {text}"
                
                # Извлечение цены из текста
                price_match = re.search(r'от\s+(\d+[\s\d]*)\s*руб', text)
                if price_match:
                    price_str = price_match.group(1).replace(' ', '')
                    door_data['price'] = int(price_str)
                
                # Извлечение изображения
                img = item.find('img')
                if img:
                    img_src = img.get('src') or img.get('data-src') or img.get('data-lazy')
                    if img_src:
                        door_data['image'] = img_src if img_src.startswith('http') else f"{self.base_url}{img_src}"
                
                # Определение категории по тексту
                if 'LEOLAB' in text or 'LEO' in text:
                    door_data['category'] = 'Новинки 2025'
                elif 'PIANO' in text or 'ROYAL' in text or 'ISSIDA' in text:
                    door_data['category'] = 'Хиты продаж'
                elif 'терморазрыв' in text.lower() or 'NORD' in text or 'TUNDRA' in text:
                    door_data['category'] = 'С терморазрывом'
                elif 'WHITE' in text or 'VERSAL' in text or 'бел' in text.lower():
                    door_data['category'] = 'Белые двери'
                else:
                    door_data['category'] = 'Основной каталог'
                
                if door_data.get('name'):
                    doors.append(door_data)
                    
            except Exception as e:
                print(f"⚠️  Ошибка парсинга элемента: {e}")
                continue
        
        return doors
    
    def parse_door_detail(self, url: str) -> Dict:
        """Детальный парсинг страницы конкретной двери"""
        soup = self.get_page(url)
        if not soup:
            return {}
        
        detail_data = {}
        
        try:
            # Извлечение характеристик
            specs = soup.find_all(['div', 'li', 'tr'], 
                                 class_=re.compile(r'spec|characteristic|param'))
            
            characteristics = {}
            for spec in specs:
                key_elem = spec.find(['span', 'td', 'dt'], 
                                   class_=re.compile(r'key|label|name'))
                val_elem = spec.find(['span', 'td', 'dd'], 
                                   class_=re.compile(r'value|data'))
                
                if key_elem and val_elem:
                    key = key_elem.get_text(strip=True)
                    value = val_elem.get_text(strip=True)
                    characteristics[key] = value
            
            detail_data['characteristics'] = characteristics
            
            # Описание
            description = soup.find(['div', 'p'], 
                                  class_=re.compile(r'description|about'))
            if description:
                detail_data['description'] = description.get_text(strip=True)
            
            # Дополнительные изображения
            images = soup.find_all('img', class_=re.compile(r'gallery|product'))
            detail_data['images'] = [
                img.get('src') or img.get('data-src') 
                for img in images if img.get('src') or img.get('data-src')
            ]
            
        except Exception as e:
            print(f"⚠️  Ошибка парсинга деталей: {e}")
        
        return detail_data
    
    def parse_all(self, deep_parse: bool = False):
        """Полный парсинг каталога"""
        print("🚀 Начинаю парсинг каталога Лабиринт...")
        print(f"📍 URL: {self.catalog_url}")
        
        # Парсинг главной страницы каталога
        soup = self.get_page(self.catalog_url)
        if not soup:
            print("❌ Не удалось загрузить каталог")
            return
        
        # Извлечение данных
        self.doors_data = self.parse_catalog_page(soup)
        
        print(f"\n✅ Найдено дверей: {len(self.doors_data)}")
        
        # Детальный парсинг каждой двери (опционально)
        if deep_parse and self.doors_data:
            print("\n🔎 Начинаю детальный парсинг каждой двери...")
            for i, door in enumerate(tqdm(self.doors_data, desc="Детальный парсинг")):
                if door.get('url'):
                    details = self.parse_door_detail(door['url'])
                    self.doors_data[i].update(details)
                    time.sleep(1)  # Respect rate limiting
    
    def save_to_json(self, filename: str = None):
        """Сохранение в JSON"""
        if not filename:
            filename = f"labirint_catalog_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.doors_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Сохранено в JSON: {filename}")
        return filename
    
    def save_to_csv(self, filename: str = None):
        """Сохранение в CSV"""
        if not filename:
            filename = f"labirint_catalog_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        if not self.doors_data:
            print("⚠️  Нет данных для сохранения")
            return
        
        df = pd.DataFrame(self.doors_data)
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        
        print(f"💾 Сохранено в CSV: {filename}")
        return filename
    
    def save_to_excel(self, filename: str = None):
        """Сохранение в Excel"""
        if not filename:
            filename = f"labirint_catalog_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        if not self.doors_data:
            print("⚠️  Нет данных для сохранения")
            return
        
        df = pd.DataFrame(self.doors_data)
        df.to_excel(filename, index=False, engine='openpyxl')
        
        print(f"💾 Сохранено в Excel: {filename}")
        return filename
    
    def print_summary(self):
        """Вывод статистики"""
        if not self.doors_data:
            print("⚠️  Нет данных")
            return
        
        print("\n" + "="*60)
        print("📊 СТАТИСТИКА ПАРСИНГА")
        print("="*60)
        print(f"📦 Всего дверей: {len(self.doors_data)}")
        
        # Статистика по ценам
        prices = [d.get('price') for d in self.doors_data if d.get('price')]
        if prices:
            print(f"💰 Минимальная цена: {min(prices):,} руб.")
            print(f"💰 Максимальная цена: {max(prices):,} руб.")
            print(f"💰 Средняя цена: {sum(prices)//len(prices):,} руб.")
        
        # Статистика по категориям
        categories = {}
        for door in self.doors_data:
            cat = door.get('category', 'Без категории')
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"\n📂 Категории:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"   {cat}: {count}")
        
        print("="*60 + "\n")


def main():
    """Главная функция"""
    print("""
    ╔════════════════════════════════════════════════════════╗
    ║     ПАРСЕР КАТАЛОГА ДВЕРЕЙ ЛАБИРИНТ                    ║
    ║     https://labirintdoors.ru/katalog2                  ║
    ╚════════════════════════════════════════════════════════╝
    """)
    
    parser = LabirintParser()
    
    # Парсинг каталога
    parser.parse_all(deep_parse=False)  # deep_parse=True для детального парсинга
    
    # Вывод статистики
    parser.print_summary()
    
    # Сохранение результатов
    if parser.doors_data:
        parser.save_to_json()
        parser.save_to_csv()
        parser.save_to_excel()
        
        print("\n✅ Парсинг завершен успешно!")
    else:
        print("\n❌ Не удалось извлечь данные")


if __name__ == "__main__":
    main()
