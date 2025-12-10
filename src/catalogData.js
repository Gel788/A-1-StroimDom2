// Данные каталога дверей A-1 StroimDom
export const catalogData = {
  categories: [
    { id: 'all', name: 'Все двери', icon: '🚪' },
    { id: 'invisible', name: 'Скрытые двери', icon: '🎭' },
    { id: 'veneer', name: 'Шпон премиум', icon: '🪵' },
    { id: 'glass', name: 'Стеклянные', icon: '💎' },
    { id: 'entrance', name: 'Входные', icon: '🏠' },
    { id: 'acoustic', name: 'Акустические', icon: '🔇' },
    { id: 'thermo', name: 'С терморазрывом', icon: '❄️' },
  ],
  
  doors: [
    // Скрытые двери
    {
      id: 1,
      name: 'Invisible Pro',
      category: 'invisible',
      price: 89900,
      image: '/works/IMG_5856.jpeg',
      features: ['Заподлицо со стеной', 'Магнитный притвор', 'Скрытые петли Simonswerk'],
      acoustic: '36 дБ',
      size: '2100×900 мм',
      material: 'МДФ под покраску',
      popular: true
    },
    {
      id: 2,
      name: 'Secret Trim',
      category: 'invisible',
      price: 94500,
      image: '/works/IMG_5857.jpeg',
      features: ['Минимальный зазор 2мм', 'Доводчик', 'Подготовка под RAL/NCS'],
      acoustic: '38 дБ',
      size: '2100×900 мм',
      material: 'МДФ + алюминий',
      new: true
    },
    {
      id: 3,
      name: 'Flush Elegance',
      category: 'invisible',
      price: 79900,
      image: '/works/IMG_5858.jpeg',
      features: ['Ровный притвор', 'Магнитные замки', 'Чистый монтаж'],
      acoustic: '34 дБ',
      size: '2100×800 мм',
      material: 'МДФ',
      popular: false
    },
    
    // Шпон премиум
    {
      id: 4,
      name: 'Noble Oak AA',
      category: 'veneer',
      price: 124900,
      image: '/works/IMG_5859.jpeg',
      features: ['Шпон дуба класса АА', 'Вертикальный набор', 'Защита от УФ'],
      acoustic: '40 дБ',
      size: '2100×900 мм',
      material: 'Массив + шпон дуба',
      popular: true
    },
    {
      id: 5,
      name: 'Walnut Signature',
      category: 'veneer',
      price: 149900,
      image: '/works/IMG_5860.jpeg',
      features: ['Шпон ореха', 'Молдинги с металлом', 'Матовая защита'],
      acoustic: '42 дБ',
      size: '2100×900 мм',
      material: 'Массив + шпон ореха',
      new: true
    },
    {
      id: 6,
      name: 'Dark Ash Premium',
      category: 'veneer',
      price: 134900,
      image: '/works/IMG_5861.jpeg',
      features: ['Тёмный ясень', 'Диагональный набор', 'Стойкость к царапинам'],
      acoustic: '38 дБ',
      size: '2100×900 мм',
      material: 'Массив + шпон ясеня',
      popular: false
    },
    
    // Стеклянные двери
    {
      id: 7,
      name: 'Glass Mono Bronze',
      category: 'glass',
      price: 98900,
      image: '/works/IMG_5862.jpeg',
      features: ['Закалённое стекло', 'Бронзовое напыление', 'Скрытая фурнитура'],
      acoustic: '32 дБ',
      size: '2100×900 мм',
      material: 'Алюминий + стекло 8мм',
      popular: true
    },
    {
      id: 8,
      name: 'Crystal Clear',
      category: 'glass',
      price: 87900,
      image: '/works/IMG_5856.jpeg',
      features: ['Прозрачное стекло', 'Тонкие профили', 'Маятниковая система'],
      acoustic: '28 дБ',
      size: '2100×800 мм',
      material: 'Алюминий + стекло 10мм',
      popular: false
    },
    {
      id: 9,
      name: 'Graphite Luxury',
      category: 'glass',
      price: 112900,
      image: '/works/IMG_5857.jpeg',
      features: ['Графитовое стекло', 'Антиотпечатки', 'Мягкий довод'],
      acoustic: '35 дБ',
      size: '2100×900 мм',
      material: 'Алюминий + стекло 8мм',
      new: true
    },
    
    // Входные двери
    {
      id: 10,
      name: 'ThermoSafe Elite',
      category: 'entrance',
      price: 189900,
      image: '/works/IMG_5858.jpeg',
      features: ['Терморазрыв', 'Тройной контур', 'Класс утепления A++'],
      acoustic: '45 дБ',
      size: '2100×950 мм',
      material: 'Сталь + утеплитель',
      popular: true,
      thermo: true
    },
    {
      id: 11,
      name: 'Security Pro Max',
      category: 'entrance',
      price: 224900,
      image: '/works/IMG_5859.jpeg',
      features: ['Противовзломные замки', 'Бронепакет 4 класса', 'Smart-замок'],
      acoustic: '48 дБ',
      size: '2100×950 мм',
      material: 'Сталь 2мм + бронепакет',
      new: true
    },
    {
      id: 12,
      name: 'Design Entry Wood',
      category: 'entrance',
      price: 169900,
      image: '/works/IMG_5860.jpeg',
      features: ['Декор шпоном', 'Терморазрыв', 'Интеллектуальный глазок'],
      acoustic: '42 дБ',
      size: '2100×950 мм',
      material: 'Сталь + шпон дуба',
      popular: false,
      thermo: true
    },
    
    // Акустические двери
    {
      id: 13,
      name: 'Acoustic 42',
      category: 'acoustic',
      price: 109900,
      image: '/works/IMG_5861.jpeg',
      features: ['Звукоизоляция 42 дБ', 'Периметральные уплотнители', 'Доводчик'],
      acoustic: '42 дБ',
      size: '2100×900 мм',
      material: 'МДФ + акустический пакет',
      popular: true
    },
    {
      id: 14,
      name: 'Silent Pro 45',
      category: 'acoustic',
      price: 134900,
      image: '/works/IMG_5862.jpeg',
      features: ['Звукоизоляция 45 дБ', 'Двойной контур', 'Магнитный притвор'],
      acoustic: '45 дБ',
      size: '2100×900 мм',
      material: 'МДФ + акустический пакет PRO',
      new: true
    },
    {
      id: 15,
      name: 'Studio Guard',
      category: 'acoustic',
      price: 119900,
      image: '/works/IMG_5856.jpeg',
      features: ['Звукоизоляция 40 дБ', 'Для студий', 'Усиленная коробка'],
      acoustic: '40 дБ',
      size: '2100×900 мм',
      material: 'МДФ + акустический пакет',
      popular: false
    },
    
    // С терморазрывом
    {
      id: 16,
      name: 'Nord Plus Arctic',
      category: 'thermo',
      price: 199900,
      image: '/works/IMG_5857.jpeg',
      features: ['Терморазрыв Premium', 'До -40°C', 'Тройной контур'],
      acoustic: '46 дБ',
      size: '2100×950 мм',
      material: 'Сталь + PIR утеплитель',
      popular: true,
      entrance: true
    },
    {
      id: 17,
      name: 'Tundra Luxury',
      category: 'thermo',
      price: 234900,
      image: '/works/IMG_5858.jpeg',
      features: ['Терморазрыв Extreme', 'До -50°C', 'Отделка шпоном'],
      acoustic: '48 дБ',
      size: '2100×950 мм',
      material: 'Сталь + PIR + шпон',
      new: true,
      entrance: true
    },
    {
      id: 18,
      name: 'Winter Guard Pro',
      category: 'thermo',
      price: 179900,
      image: '/works/IMG_5859.jpeg',
      features: ['Терморазрыв Standard', 'До -30°C', 'Доступная цена'],
      acoustic: '44 дБ',
      size: '2100×950 мм',
      material: 'Сталь + минвата',
      popular: false,
      entrance: true
    }
  ]
};
