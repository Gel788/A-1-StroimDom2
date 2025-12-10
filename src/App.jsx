import React, { useEffect } from 'react';
import Catalog from './Catalog';

export default function App() {
  useEffect(() => {
    // Элементы
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const form = document.querySelector('.contact-form');
    const slider = document.querySelector('[data-slider]');
    const reveals = document.querySelectorAll('.reveal, .card');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxCap = lightbox?.querySelector('figcaption');
    const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    const observedSections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    // Функция закрытия навигации
    const closeNav = () => {
      nav?.classList.remove('open');
      burger?.classList.remove('active');
      document.body.style.overflow = '';
    };

    // Функция открытия навигации
    const openNav = () => {
      nav?.classList.add('open');
      burger?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    // Переключение навигации
    const toggleNav = () => {
      if (nav?.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    };

    // Табы
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        const content = document.querySelector(`[data-content="${target}"]`);
        if (content) content.classList.add('active');
      });
    });

    // Бургер меню
    if (burger && nav) {
      // Создаем оверлей один раз
      let overlay = document.querySelector('.nav-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
      }

      // Клик на бургер
      burger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleNav();
      });

      // Клик на оверлей
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        closeNav();
      });
    }

    // Ссылки навигации
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href')?.slice(1);
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          e.preventDefault();
          closeNav();
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      });
    });

    // ESC для закрытия меню
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav?.classList.contains('open')) {
        closeNav();
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name');
      alert(`Спасибо, ${name || 'друг'}! Мы свяжемся с вами в рабочее время.`);
      form.reset();
    });

    // Slider
    if (slider) {
      const slides = Array.from(slider.querySelectorAll('.slide'));
      const dotsContainer = slider.querySelector('[data-dots]');
      const prevBtn = slider.querySelector('[data-prev]');
      const nextBtn = slider.querySelector('[data-next]');
      let current = 0;
      let timer;

      const renderDots = () => {
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
          const dot = document.createElement('button');
          dot.addEventListener('click', () => goTo(idx));
          dotsContainer.appendChild(dot);
        });
      };

      const update = () => {
        slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
        dotsContainer.querySelectorAll('button').forEach((d, idx) => d.classList.toggle('active', idx === current));
      };

      const goTo = (idx) => {
        current = (idx + slides.length) % slides.length;
        update();
        restart();
      };

      const nextSlide = () => goTo(current + 1);
      const prevSlide = () => goTo(current - 1);

      const restart = () => {
        clearInterval(timer);
        timer = setInterval(nextSlide, 4500);
      };

      renderDots();
      update();
      restart();

      nextBtn?.addEventListener('click', nextSlide);
      prevBtn?.addEventListener('click', prevSlide);
      slider.addEventListener('mouseenter', () => clearInterval(timer));
      slider.addEventListener('mouseleave', restart);
    }

    // Scroll reveal
    if ('IntersectionObserver' in window && reveals.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      reveals.forEach((el) => obs.observe(el));
    }

    // Lightbox
    const bindLightbox = () => {
      const images = document.querySelectorAll('.slide img, .work-card img');
      images.forEach((img) => {
        img.addEventListener('click', () => {
          if (!lightbox || !lightboxImg || !lightboxCap) return;
          lightboxImg.src = img.src;
          lightboxCap.textContent =
            img.closest('figure')?.querySelector('figcaption')?.textContent || 'Работа A-1 StroimDom';
          lightbox.classList.add('open');
        });
      });
    };

    const closeLightbox = () => lightbox?.classList.remove('open');

    lightbox?.addEventListener('click', (e) => {
      if (e.target.dataset.close !== undefined || e.target === lightbox) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    bindLightbox();

    // Active nav link
    if ('IntersectionObserver' in window && observedSections.length && navLinks.length) {
      const navObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = `#${entry.target.id}`;
              navLinks.forEach((lnk) => lnk.classList.toggle('active', lnk.getAttribute('href') === id));
            }
          });
        },
        { threshold: 0.4 }
      );
      observedSections.forEach((section) => navObs.observe(section));
    }
  }, []);

  return (
    <>
      {/* Новая навигация */}
      <header className="header">
        <div className="header-container">
          <a href="#hero" className="logo">
            <span className="logo-icon">A-1</span>
            <span className="logo-text">StroimDom</span>
          </a>

          <nav className="nav" id="nav">
            <a href="#hero" className="nav-link">Главная</a>
            <a href="#catalog" className="nav-link">Каталог</a>
            <a href="#works" className="nav-link">Работы</a>
            <a href="#services" className="nav-link">Услуги</a>
            <a href="#contacts" className="nav-link">Контакты</a>
          </nav>

          <div className="header-actions">
            <a href="tel:+79687377555" className="header-phone">+7 (968) 737-75-55</a>
            <a href="#contacts" className="header-btn">Заявка</a>
            <button className="burger" id="burger" aria-label="Меню">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="hero" className="hero-new">
          <div className="hero-background">
            <div className="hero-gradient"></div>
            <div className="hero-grid-pattern"></div>
          </div>
          
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-dot"></span>
                Premium Doors • Bespoke Design
              </div>
              
              <h1 className="hero-heading">
                Премиальные двери<br />
                <span className="gradient-text">под ваш проект</span>
              </h1>
              
              <p className="hero-description">
                Премиальные двери для жилых и коммерческих объектов.<br />
                Скрытые системы, шпон, стекло, терморазрыв — полный цикл от проекта до монтажа.
              </p>
              
              <div className="hero-buttons">
                <a href="#catalog" className="btn-hero-primary">
                  <span>Смотреть каталог</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#contacts" className="btn-hero-secondary">
                  Консультация
                </a>
              </div>
              
              <div className="hero-stats-row">
                <div className="hero-stat">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">лет опыта</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-number">2400+</div>
                  <div className="stat-label">проектов</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-number">5 лет</div>
                  <div className="stat-label">гарантия</div>
                </div>
              </div>
            </div>
            
            <div className="hero-features">
              <div className="feature-card">
                <div className="feature-icon">🚪</div>
                <h3>Invisible</h3>
                <p>Скрытые двери заподлицо со стеной</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔇</div>
                <h3>Acoustic</h3>
                <p>Звукоизоляция до 42 дБ</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌡️</div>
                <h3>ThermoSafe</h3>
                <p>Терморазрыв и утепление</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3>Premium</h3>
                <p>Шпон класса АА, стекло</p>
              </div>
            </div>
          </div>
        </section>

        <section className="marquee reveal">
          <div className="container marquee-track">
            <span>Архитекторы</span>
            <span>Девелоперы</span>
            <span>Luxury интерьеры</span>
            <span>Коммерция</span>
            <span>HoReCa</span>
            <span>Smart home интеграция</span>
          </div>
        </section>

        <section className="certs reveal">
          <div className="container certs-grid">
            <div className="cert">
              <span>ISO</span>
              <p>Сертификация производства и материалов</p>
            </div>
            <div className="cert">
              <span>Fire</span>
              <p>Противопожарные EI 30/60/90</p>
            </div>
            <div className="cert">
              <span>Acoustic</span>
              <p>Протоколы до 42 дБ</p>
            </div>
            <div className="cert">
              <span>Warranty</span>
              <p>Расширенная гарантия 5 лет</p>
            </div>
          </div>
        </section>

        <section id="cases" className="section reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Кейсы</p>
              <h2>Как закрываем задачи заказчиков</h2>
              <p className="lead">Материалы, акустика, сроки и интеграция в дизайн — коротко о главном.</p>
            </div>
            <a className="link" href="#contacts">
              Обсудить задачу →
            </a>
          </div>
          <div className="case-filters">
            <button className="pill">Резиденции</button>
            <button className="pill alt">Апартаменты</button>
            <button className="pill">Офисы</button>
            <button className="pill">HoReCa</button>
          </div>
          <div className="cases-grid">
            <article className="case-card">
              <div className="case-header">
                <span className="pill">Резиденция</span>
                <span className="case-cta">48 часов на выезд</span>
              </div>
              <h3>Скрытые двери под покраску</h3>
              <p className="muted">
                15 полотен заподлицо со стеной, магнитные замки, доводчики, подготовка под покраску.
              </p>
              <div className="case-meta">
                <span>Акустика 34 дБ</span>
                <span>Срок 21 день</span>
                <span>Чистый монтаж</span>
              </div>
            </article>
            <article className="case-card">
              <div className="case-header">
                <span className="pill alt">Апартаменты</span>
                <span className="case-cta">Договорённость по цвету</span>
              </div>
              <h3>Шпон и стекло в одном контуре</h3>
              <p className="muted">
                Комбинация шпона и стекла, тонкие профили, подбор оттенков к мебели, скрытая фурнитура.
              </p>
              <div className="case-meta">
                <span>AGB / Simonswerk</span>
                <span>Точные оттенки</span>
                <span>Бронза / графит</span>
              </div>
            </article>
            <article className="case-card">
              <div className="case-header">
                <span className="pill">Офис</span>
                <span className="case-cta">Ночные смены</span>
              </div>
              <h3>Акустические решения для переговорных</h3>
              <p className="muted">
                Полотна с уплотнителями, доводчики, ровные притворы, стабильные зазоры до 40 дБ.
              </p>
              <div className="case-meta">
                <span>График ночных работ</span>
                <span>Контроль пыли</span>
                <span>Доводчики</span>
              </div>
            </article>
          </div>
        </section>

        <section id="services" className="section reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Комплекс услуг</p>
              <h2>От идеи до идеальной установки</h2>
              <p className="lead">Подбор, производство, монтаж и сервис — одна команда отвечает за результат.</p>
            </div>
            <a className="link" href="#contacts">
              Обсудить проект →
            </a>
          </div>
          <div className="cards three">
            <article className="card">
              <div className="pill">Консалтинг</div>
              <h3>Дизайн и подбор</h3>
              <p>Формируем ТЗ, привозим образцы, согласуем фурнитуру, цвета и акустические требования.</p>
            </article>
            <article className="card">
              <div className="pill">Производство</div>
              <h3>Точная геометрия</h3>
              <p>Premium шпоны, устойчивые полотна, скрытые петли, магнитные замки, контроль оттенка и стыков.</p>
            </article>
            <article className="card">
              <div className="pill">Монтаж</div>
              <h3>Чистый монтаж и сервис</h3>
              <p>Тихая установка, шумоизоляция, доводчики, финальная регулировка и гарантия 5 лет.</p>
            </article>
          </div>
          <div className="service-cta">
            <div>
              <p className="eyebrow">Ускоренная подача</p>
              <h3>Выезд и замер за 48 часов</h3>
              <p className="muted">Подготовим смету и спецификацию сразу после замера, закрепим цены.</p>
            </div>
            <a className="primary-btn" href="#contacts">
              Получить смету
            </a>
          </div>
        </section>

        <section className="section gray reveal" id="materials">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Материалы и фурнитура</p>
              <h2>Лучшее из Европы и точность производства</h2>
            </div>
            <a className="link" href="#contacts">
              Запросить подбор →
            </a>
          </div>
          <div className="cards three">
            <article className="card">
              <div className="pill">Шпон / Эмаль</div>
              <h3>Шпон класса АА, эмаль RAL/NCS</h3>
              <p>Ровная фактура, стабильный оттенок, защита от УФ и царапин.</p>
            </article>
            <article className="card">
              <div className="pill">Петли / Замки</div>
              <h3>Simonswerk · AGB · Dormakaba</h3>
              <p>Скрытые петли, магнитные замки, доводчики, тихий притвор.</p>
            </article>
            <article className="card">
              <div className="pill">Стекло / Акустика</div>
              <h3>Тонированные пакеты и акустика</h3>
              <p>Закалённое стекло, бронза/графит, акустические пакеты до 42 дБ.</p>
            </article>
          </div>
        </section>

        <section id="collections" className="section gray reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Линейки</p>
              <h2>Решения под задачу</h2>
              <p className="lead">Invisible, шпон, стекло и входные решения с терморазрывом.</p>
            </div>
            <div className="tabs" role="tablist">
              <button className="tab active" data-tab="invisible">
                Invisible
              </button>
              <button className="tab" data-tab="veneer">
                Шпон
              </button>
              <button className="tab" data-tab="glass">
                Стекло
              </button>
              <button className="tab" data-tab="entrance">
                Входные
              </button>
            </div>
          </div>
          <div className="cards three tab-content active" data-content="invisible">
            <article className="card">
              <h3>Flush Pro</h3>
              <p>Полотно заподлицо со стеной, покраска в любой RAL/NCS, магнитные замки.</p>
            </article>
            <article className="card">
              <h3>Acoustic 40</h3>
              <p>Акустические пакеты до 40 дБ, периметральные уплотнители, доводчики.</p>
            </article>
            <article className="card">
              <h3>Secret Trim</h3>
              <p>Минимальный зазор, скрытые петли Simonswerk, усиленная коробка.</p>
            </article>
          </div>
          <div className="cards three tab-content" data-content="veneer">
            <article className="card">
              <h3>Fine Veneer</h3>
              <p>Натуральные шпоны класса АА, сложные наборы, вертикаль/диагональ.</p>
            </article>
            <article className="card">
              <h3>Deep Shade</h3>
              <p>Тёмные оттенки с матовой защитой, стойкость к царапинам и УФ.</p>
            </article>
            <article className="card">
              <h3>Signature Lines</h3>
              <p>Интегрированные молдинги и вставки металла или камня.</p>
            </article>
          </div>
          <div className="cards three tab-content" data-content="glass">
            <article className="card">
              <h3>Glass Mono</h3>
              <p>Закалённое стекло, тонирование, скрытая фурнитура, маятник/слайдер.</p>
            </article>
            <article className="card">
              <h3>Bronze Air</h3>
              <p>Бронзовое стекло, тонкие профили, мягкий довод, минимум видимых элементов.</p>
            </article>
            <article className="card">
              <h3>Acoustic Glass</h3>
              <p>Многослойные стеклопакеты с акустикой, магнитный притвор.</p>
            </article>
          </div>
          <div className="cards three tab-content" data-content="entrance">
            <article className="card">
              <h3>ThermoSafe</h3>
              <p>Терморазрыв, тройной контур, скрытые петли, высокий класс утепления.</p>
            </article>
            <article className="card">
              <h3>Security Pro</h3>
              <p>Противовзломные замки, бронепакет, усиленный каркас, интеллектуальный глазок.</p>
            </article>
            <article className="card">
              <h3>Design Entry</h3>
              <p>Дизайнерская отделка: шпон, эмаль, металл, камень с лазерной гравировкой.</p>
            </article>
          </div>
        </section>

        <section id="why" className="section reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Почему A-1 StroimDom</p>
              <h2>Чётко, прозрачно, премиально</h2>
              <p className="lead">Движемся быстро, держим качество и даём предсказуемый результат.</p>
            </div>
          </div>
          <div className="cards three">
            <article className="card">
              <div className="pill">Скорость</div>
              <h3>48 часов на выезд</h3>
              <p>Замер, первичная смета и фиксация цен в течение двух рабочих дней.</p>
            </article>
            <article className="card">
              <div className="pill">Качество</div>
              <h3>Трёхступенчатый контроль</h3>
              <p>Геометрия, оттенок, фурнитура и акустика проходят отдельные чек-листы.</p>
            </article>
            <article className="card">
              <div className="pill">Сервис</div>
              <h3>Монтаж без хаоса</h3>
              <p>Чистый монтаж, тишина на объекте, финальная регулировка и гарантия 5 лет.</p>
            </article>
          </div>
        </section>

        <section id="works" className="section reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Работы</p>
              <h2>Свежие установки</h2>
              <p className="lead">Живые фото с объектов: геометрия, акустика, чистый монтаж.</p>
            </div>
            <a className="link" href="#contacts">
              Заказать похожее →
            </a>
          </div>
          <div className="works-slider" data-slider>
            <button className="slider-btn prev" aria-label="Назад" data-prev>
              ←
            </button>
            <div className="slides">
              <figure className="slide active">
                <img src="/works/IMG_5856.jpeg" alt="Установка двери — фото 1" loading="lazy" />
                <figcaption>Скрытые полотна, ровный притвор, акустика 34 дБ</figcaption>
              </figure>
              <figure className="slide">
                <img src="/works/IMG_5857.jpeg" alt="Установка двери — фото 2" loading="lazy" />
                <figcaption>Точное совпадение оттенков шпона и стен</figcaption>
              </figure>
              <figure className="slide">
                <img src="/works/IMG_5858.jpeg" alt="Установка двери — фото 3" loading="lazy" />
                <figcaption>Интеграция в ниши, скрытая фурнитура</figcaption>
              </figure>
              <figure className="slide">
                <img src="/works/IMG_5859.jpeg" alt="Установка двери — фото 4" loading="lazy" />
                <figcaption>Строгая геометрия, тихий доводчик</figcaption>
              </figure>
              <figure className="slide">
                <img src="/works/IMG_5860.jpeg" alt="Установка двери — фото 5" loading="lazy" />
                <figcaption>Чистый монтаж без пыли, готовность к покраске</figcaption>
              </figure>
              <figure className="slide">
                <img src="/works/IMG_5861.jpeg" alt="Установка двери — фото 6" loading="lazy" />
                <figcaption>Глубокая коробка, ровный зазор по периметру</figcaption>
              </figure>
              <figure className="slide">
                <img src="/works/IMG_5862.jpeg" alt="Установка двери — фото 7" loading="lazy" />
                <figcaption>Контрастные полотна, точная подгонка проёмов</figcaption>
              </figure>
            </div>
            <button className="slider-btn next" aria-label="Вперёд" data-next>
              →
            </button>
            <div className="slider-dots" data-dots></div>
          </div>
          <div className="works-grid">
            <figure className="work-card">
              <img src="/works/IMG_5856.jpeg" alt="Установка двери — фото 1" loading="lazy" />
            </figure>
            <figure className="work-card">
              <img src="/works/IMG_5857.jpeg" alt="Установка двери — фото 2" loading="lazy" />
            </figure>
            <figure className="work-card">
              <img src="/works/IMG_5858.jpeg" alt="Установка двери — фото 3" loading="lazy" />
            </figure>
            <figure className="work-card">
              <img src="/works/IMG_5859.jpeg" alt="Установка двери — фото 4" loading="lazy" />
            </figure>
            <figure className="work-card">
              <img src="/works/IMG_5860.jpeg" alt="Установка двери — фото 5" loading="lazy" />
            </figure>
            <figure className="work-card">
              <img src="/works/IMG_5861.jpeg" alt="Установка двери — фото 6" loading="lazy" />
            </figure>
            <figure className="work-card">
              <img src="/works/IMG_5862.jpeg" alt="Установка двери — фото 7" loading="lazy" />
            </figure>
          </div>
        </section>

        {/* Каталог с разделами */}
        <Catalog />

        <section id="process" className="section gray reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Процесс</p>
              <h2>Прозрачно и под контроль</h2>
            </div>
            <a className="link" href="#contacts">
              Назначить встречу →
            </a>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="pill">01</div>
              <div>
                <h3>Замер и консультация</h3>
                <p>Выезд за 48 часов, фиксируем параметры, предлагаем решения и бюджет.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="pill">02</div>
              <div>
                <h3>Проект и спецификация</h3>
                <p>Чертежи, фурнитура, график производства, финальные цвета и покрытия.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="pill">03</div>
              <div>
                <h3>Производство и контроль</h3>
                <p>Трёхступенчатая проверка геометрии, оттенков и акустики.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="pill">04</div>
              <div>
                <h3>Монтаж и сервис</h3>
                <p>Чистый монтаж, уборка, финальная приёмка, сервис и гарантия 5 лет.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta section">
          <div className="container cta-box">
            <div>
              <p className="eyebrow">A-1 StroimDom</p>
              <h2>Нужны двери мирового уровня?</h2>
              <p className="lead">Расскажите о проекте — подготовим предложение и график.</p>
            </div>
            <div className="cta-actions">
              <a className="primary-btn" href="#contacts">
                Запросить предложение
              </a>
              <a className="ghost-btn" href="tel:+79687377555">
                Позвонить
              </a>
            </div>
          </div>
        </section>

        <section id="testimonials" className="section reveal testimonials">
          <div className="container section-header">
            <div>
              <p className="eyebrow">Отзывы</p>
              <h2>Доверие профессионалов</h2>
            </div>
            <div className="dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
          <div className="cards three">
            <article className="card">
              <h3>Архитектор Елена</h3>
              <p>“Соблюдают проектную документацию, аккуратны на объекте, сроки выдерживают. Клиенты довольны.”</p>
            </article>
            <article className="card">
              <h3>Девелопер Skyline</h3>
              <p>“120 входных дверей с терморазрывом и акустикой. Логистика и монтаж без сбоев, сервис на высоте.”</p>
            </article>
            <article className="card">
              <h3>Частный клиент</h3>
              <p>“Скрытые двери под покраску выглядят монолитно. Монтаж тихий и чистый, регулировка бесплатна.”</p>
            </article>
          </div>
        </section>

        <section id="faq" className="section gray reveal">
          <div className="container section-header">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2>Популярные вопросы</h2>
            </div>
          </div>
          <div className="accordion">
            <details open>
              <summary>Сколько занимает производство?</summary>
              <p>Стандарт — 2-3 недели, индивидуальные покрытия и стекло — 4-6 недель.</p>
            </details>
            <details>
              <summary>Делаете ли монтаж в выходные?</summary>
              <p>Да, по согласованию. Работаем чисто: закрываем мебель, убираем после монтажа.</p>
            </details>
            <details>
              <summary>Можно ли интегрировать умный замок?</summary>
              <p>Да, подготавливаем полотна под электрозамки, биометрию и скрытую проводку.</p>
            </details>
            <details>
              <summary>Где посмотреть образцы?</summary>
              <p>Организуем демонстрацию у нас или привезём ключевые образцы на объект.</p>
            </details>
          </div>
        </section>

        <section id="contacts" className="section contact reveal">
          <div className="container contact-grid">
            <div>
              <p className="eyebrow">Контакты</p>
              <h2>Расскажите о задаче</h2>
              <p className="lead">Пришлите план или фото проёмов — ответим в течение рабочего дня.</p>
              <div className="contact-meta">
                <div>
                  <strong>Телефон</strong>
                  <a href="tel:+79687377555">+7 968 737 75 55</a>
                </div>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:info@stroimdom.ru">info@stroimdom.ru</a>
                </div>
                <div>
                  <strong>Адрес</strong>
                  <span>Москва, Пресненская наб. 12</span>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <label>
                Имя
                <input type="text" name="name" placeholder="Как к вам обращаться?" required />
              </label>
              <label>
                Телефон
                <input type="tel" name="phone" placeholder="+7 ___ ___-__-__" required />
              </label>
              <label>
                Задача
                <textarea name="message" rows="4" placeholder="Тип дверей, сроки, особенности объекта"></textarea>
              </label>
              <button type="submit" className="primary-btn full">
                Отправить заявку
              </button>
              <p className="note">Нажимая на кнопку, вы соглашаетесь с обработкой персональных данных.</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand">
              <div className="logo-circle">A-1</div>
              <div>
                <div className="brand-name">StroimDom</div>
                <div className="brand-tag">Двери · Проекты · Сервис</div>
              </div>
            </div>
            <p>
              Создаём решения мирового уровня: дизайн, производство и установка дверей для жилых и коммерческих объектов.
            </p>
          </div>
          <div className="footer-links">
            <strong>Навигация</strong>
            <a href="#hero">Главная</a>
            <a href="#services">Услуги</a>
            <a href="#collections">Линейки</a>
            <a href="#works">Работы</a>
          </div>
          <div className="footer-links">
            <strong>Документы</strong>
            <a href="#">Сертификаты</a>
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Договор оферты</a>
          </div>
          <div className="footer-links">
            <strong>Контакты</strong>
            <a href="tel:+79687377555">+7 968 737 75 55</a>
            <a href="mailto:info@stroimdom.ru">info@stroimdom.ru</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2025 A-1 StroimDom. Все права защищены.</span>
          <span>Сделано с заботой о деталях.</span>
        </div>
      </footer>

      <a className="floating-cta" href="tel:+79687377555">
        Позвонить
      </a>

      <div className="lightbox" id="lightbox">
        <div className="lightbox-backdrop" data-close></div>
        <figure className="lightbox-content">
          <img src="" alt="Просмотр работы" />
          <figcaption></figcaption>
          <button className="lightbox-close" data-close aria-label="Закрыть">
            ×
          </button>
        </figure>
      </div>
    </>
  );
}

