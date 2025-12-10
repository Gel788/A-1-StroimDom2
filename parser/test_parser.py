#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup

url = "https://labirintdoors.ru/katalog2"
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

print("🔍 Загружаю страницу...")
response = requests.get(url, headers=headers, timeout=30)
print(f"📄 Статус: {response.status_code}")
print(f"📏 Размер: {len(response.content)} bytes")

soup = BeautifulSoup(response.content, 'lxml')

# Проверяем различные селекторы
selectors = [
    ('a.product-sections-01-item', 'Ссылки с классом product-sections-01-item'),
    ('div.product-sections-01-item', 'Div с классом product-sections-01-item'),
    ('a[href*="doors"]', 'Ссылки содержащие doors'),
    ('a[href*="catalog"]', 'Ссылки содержащие catalog'),
    ('a', 'Все ссылки'),
]

for selector, description in selectors:
    elements = soup.select(selector)
    print(f"\n{description}: {len(elements)}")
    if elements:
        for elem in elements[:3]:
            print(f"  - {elem.get('href', 'no href')[:60]}")
