import React, { useState, useMemo } from 'react';
import { catalogData } from './catalogData';

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [previewDoor, setPreviewDoor] = useState(null);

  // Фильтрация и сортировка
  const filteredDoors = useMemo(() => {
    let filtered = catalogData.doors;

    // Фильтр по категории
    if (activeCategory !== 'all') {
      filtered = filtered.filter(door => {
        if (activeCategory === 'thermo') {
          return door.thermo || door.category === 'thermo';
        }
        return door.category === activeCategory;
      });
    }

    // Фильтр по цене
    filtered = filtered.filter(door => 
      door.price >= priceRange[0] && door.price <= priceRange[1]
    );

    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
        default:
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      }
    });

    return sorted;
  }, [activeCategory, sortBy, priceRange]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <>
    <section id="catalog" className="section catalog-section reveal">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="eyebrow">Каталог</p>
            <h2>Полный каталог дверей</h2>
            <p className="lead">
              {filteredDoors.length} {filteredDoors.length === 1 ? 'дверь' : 'дверей'} в выбранной категории
            </p>
          </div>
          <div className="catalog-sort">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popular">Популярные</option>
              <option value="price-asc">Сначала дешевые</option>
              <option value="price-desc">Сначала дорогие</option>
              <option value="name">По названию</option>
            </select>
          </div>
        </div>

        {/* Категории */}
        <div className="catalog-categories">
          {catalogData.categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Сетка каталога */}
        <div className="catalog-grid">
          {filteredDoors.map((door) => (
            <article key={door.id} className="catalog-card">
              {/* Бейджи */}
              <div className="catalog-badges">
                {door.new && <span className="badge badge-new">Новинка</span>}
                {door.popular && <span className="badge badge-popular">Хит</span>}
              </div>

              {/* Изображение */}
              <div className="catalog-image-container">
                <img 
                  src={door.image} 
                  alt={door.name}
                  className="catalog-image"
                  loading="lazy"
                />
                <div className="catalog-overlay">
                  <button 
                    className="catalog-quick-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPreviewDoor(door);
                    }}
                  >
                    👁 Быстрый просмотр
                  </button>
                </div>
              </div>

              {/* Информация */}
              <div className="catalog-info">
                <h3 className="catalog-title">{door.name}</h3>
                
                <div className="catalog-specs">
                  <div className="spec-item">
                    <span className="spec-icon">🔇</span>
                    <span className="spec-value">{door.acoustic}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-icon">📏</span>
                    <span className="spec-value">{door.size}</span>
                  </div>
                </div>

                <p className="catalog-material">{door.material}</p>

                <ul className="catalog-features">
                  {door.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-dot">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="catalog-footer">
                  <div className="catalog-price">
                    <span className="price-label">от</span>
                    <span className="price-value">{formatPrice(door.price)} ₽</span>
                  </div>
                  <button className="catalog-btn-primary">
                    Подробнее
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Если ничего не найдено */}
        {filteredDoors.length === 0 && (
          <div className="catalog-empty">
            <div className="empty-icon">🔍</div>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить фильтры или выберите другую категорию</p>
            <button 
              className="primary-btn"
              onClick={() => {
                setActiveCategory('all');
                setPriceRange([0, 300000]);
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </section>

    {/* Модальное окно - вне section! */}
    {previewDoor && (
      <div className="modal">
        <div className="modal-backdrop" onClick={() => setPreviewDoor(null)}></div>
        <div className="modal-content">
          <button className="modal-x" onClick={() => setPreviewDoor(null)}>×</button>
          <img src={previewDoor.image} alt={previewDoor.name} />
          <div className="modal-body">
            <h3>{previewDoor.name}</h3>
            <p className="modal-price">{formatPrice(previewDoor.price)} ₽</p>
            <div className="modal-info">
              <span>Акустика: {previewDoor.acoustic}</span>
              <span>Размер: {previewDoor.size}</span>
              <span>Материал: {previewDoor.material}</span>
            </div>
            <a href="#contacts" className="modal-btn" onClick={() => setPreviewDoor(null)}>
              Оставить заявку
            </a>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
