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
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

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

burger?.addEventListener('click', () => {
  nav?.classList.toggle('open');
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      nav?.classList.remove('open');
    }
  });
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get('name');
  alert(`Спасибо, ${name || 'друг'}! Мы свяжемся с вами в рабочее время.`);
  form.reset();
});

// Works slider
if (slider) {
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsContainer = slider.querySelector('[data-dots]');
  const prev = slider.querySelector('[data-prev]');
  const next = slider.querySelector('[data-next]');
  let current = 0;
  let timer;

  const renderDots = () => {
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

  next?.addEventListener('click', nextSlide);
  prev?.addEventListener('click', prevSlide);
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', restart);
}

// Scroll reveal
if (IntersectionObserver && reveals.length) {
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

// Lightbox for works
const bindLightbox = () => {
  const images = document.querySelectorAll('.slide img, .work-card img');
  images.forEach((img) => {
    img.addEventListener('click', () => {
      if (!lightbox || !lightboxImg || !lightboxCap) return;
      lightboxImg.src = img.src;
      lightboxCap.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || 'Работа A-1 StroimDom';
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

// Active nav highlight
if (IntersectionObserver && observedSections.length && navLinks.length) {
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

