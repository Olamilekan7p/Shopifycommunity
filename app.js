(() => {
  const data = window.SDCData.read();
  const interestIcons = { 'Home & Living': '⌂', Fashion: '✳', Electronics: '⌁', 'Office Supplies': '▤', 'School Items': '✎', Gifts: '♧', Travel: '↗', Beauty: '✿', Lifestyle: '☼', Other: '＋' };
  const categoryImages = {
    'Home & Living': 'photo-1490312278390-ab64016e0aa9', Fashion: 'photo-1490481651871-ab68de25d43d', Electronics: 'photo-1519389950473-47ba0277781c',
    Beauty: 'photo-1596462502278-27bfdc403348', Gifts: 'photo-1513201099705-a9746e1e201f', Travel: 'photo-1488644396922-5c3ddc0a99e7',
    School: 'photo-1503676260728-1c00da094a0b', Office: 'photo-1498050108023-c5249f4df085', Lifestyle: 'photo-1441986300917-64674bd600d8', Other: 'photo-1494438639946-1ebd1d20bf85'
  };
  const escapeHtml = (text = '') => String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const imageUrl = (id, width = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

  function applyContent() {
    const title = document.getElementById('hero-title');
    const subtitle = document.getElementById('hero-subtitle');
    if (title) title.innerHTML = escapeHtml(data.heroTitle).replace(/\. /g, '.<br>').replace(/looking for\./i, '<em>looking for.</em>');
    if (subtitle) subtitle.textContent = data.heroSubtitle;
    document.getElementById('community-stat').textContent = data.communityStat;
    document.querySelector('.footer-tagline').innerHTML = escapeHtml(data.tagline).replace(/\. /g, '.<br>');
  }

  function renderInterests() {
    const host = document.getElementById('interest-categories');
    host.innerHTML = data.interests.map((interest, index) => `<button class="interest-chip ${interest.color || 'sage'}" type="button" data-interest="${index}" aria-pressed="false"><span>${escapeHtml(interest.icon || '✳')}</span>${escapeHtml(interest.name)}<i>↗</i></button>`).join('');
    host.addEventListener('click', event => {
      const button = event.target.closest('[data-interest]');
      if (!button) return;
      host.querySelectorAll('.interest-chip').forEach(item => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      const interest = data.interests[Number(button.dataset.interest)];
      document.getElementById('interest-detail').innerHTML = `<span class="detail-star">${escapeHtml(interest.icon || '✳')}</span><p><b>${escapeHtml(interest.name)}:</b> ${escapeHtml(interest.detail || 'What are you looking for in this category?')}</p>`;
    });
  }

  function renderCategories() {
    const host = document.getElementById('category-grid');
    host.innerHTML = data.categories.map((name, index) => {
      const key = name.split(' ')[0];
      const photo = categoryImages[name] || categoryImages[key] || categoryImages.Other;
      return `<a class="category-tile category-tone-${index % 5}" href="#interests"><img src="${imageUrl(photo, 560)}" alt="" loading="lazy"><span class="category-index">0${index + 1}</span><strong>${escapeHtml(name)}</strong><span class="category-arrow">↗</span></a>`;
    }).join('');
  }

  function renderStores() {
    const host = document.getElementById('store-cards');
    if (!data.stores.length) {
      host.innerHTML = ['Home & Living', 'Beauty', 'Fashion'].map((category, index) => `<article class="store-card store-placeholder reveal"><div class="store-card-image"><img src="${imageUrl([categoryImages['Home & Living'], categoryImages.Beauty, categoryImages.Fashion][index], 760)}" alt="${category} product inspiration" loading="lazy"><span class="placeholder-label">SAMPLE SPACE</span><span class="store-symbol">${['h.', 'b.', 'm.'][index]}</span></div><div class="store-card-body"><div class="store-meta"><span>${category}</span><span>NEW FIND / 0${index + 1}</span></div><h3>${['A home for considered things', 'Rituals for every day', 'Pieces with a point of view'][index]}</h3><p>A placeholder for an independent store selected for a future community introduction.</p><div class="store-featured">FEATURED IN THIS SPACE <b>${['Everyday objects · Useful design', 'Small-batch care · Daily essentials', 'Easy layers · Independent makers'][index]}</b></div><a href="#submit-store" class="store-explore">Explore this space <span>↗</span></a></div></article>`).join('');
      return;
    }
    host.innerHTML = data.stores.slice(0, 3).map((store, index) => `<article class="store-card reveal"><div class="store-card-image"><img src="${escapeHtml(store.image || imageUrl(categoryImages[store.category] || categoryImages.Other, 760))}" alt="${escapeHtml(store.name)}" loading="lazy"><span class="store-symbol">${escapeHtml(store.mark || store.name.slice(0, 1).toLowerCase() + '.')}</span></div><div class="store-card-body"><div class="store-meta"><span>${escapeHtml(store.category)}</span><span>COMMUNITY FIND / 0${index + 1}</span></div><h3>${escapeHtml(store.name)}</h3><p>${escapeHtml(store.description)}</p><div class="store-featured">FEATURED PRODUCTS <b>${escapeHtml(store.products || 'A few community favorites')}</b></div><a href="${escapeHtml(store.url || '#submit-store')}" class="store-explore" ${store.url ? 'target="_blank" rel="noreferrer"' : ''}>Explore store <span>↗</span></a></div></article>`).join('');
  }

  function renderEvents() {
    const host = document.getElementById('event-cards');
    const events = data.events.filter(event => event.status !== 'past').slice(0, 4);
    if (!events.length) {
      host.innerHTML = `<div class="no-events"><span class="no-event-icon">✳</span><div><b>New sessions are taking shape.</b><p>Virtual discovery sessions will appear here as they are scheduled.</p></div></div>`;
      return;
    }
    host.innerHTML = events.map(event => `<article class="upcoming-event"><div class="event-date"><b>${escapeHtml(event.day || 'TBA')}</b><span>${escapeHtml(event.month || 'SOON')}</span></div><div class="upcoming-event-info"><span>${escapeHtml(event.status === 'draft' ? 'SESSION IDEA · NOT SCHEDULED' : event.category || 'COMMUNITY SESSION')}</span><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.time || 'Time to be announced')} · ${escapeHtml(event.stores || 'Stores to be announced')}</p></div><a href="#join" class="event-view" aria-label="Get updates about ${escapeHtml(event.title)}">↗</a></article>`).join('');
  }

  function renderFaqs() {
    const host = document.getElementById('faq-list');
    host.innerHTML = data.faqs.map((faq, index) => `<details class="faq-item"><summary><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(faq.q)}<i aria-hidden="true">+</i></summary><p>${escapeHtml(faq.a)}</p></details>`).join('');
  }

  function setFormCategories() {
    const select = document.querySelector('#store-form select[name="category"]');
    select.innerHTML = '<option value="">Choose a category</option>' + data.categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  }

  function setupForms() {
    document.getElementById('store-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const submission = Object.fromEntries(new FormData(form).entries());
      submission.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      submission.submittedAt = new Date().toISOString();
      submission.status = 'New';
      data.submissions.unshift(submission);
      window.SDCData.write(data);
      form.reset();
      showToast('Thanks for introducing your store. We’ll be in touch.');
    });
    document.getElementById('join-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const member = Object.fromEntries(new FormData(form).entries());
      member.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      member.joinedAt = new Date().toISOString();
      data.members.unshift(member);
      window.SDCData.write(data);
      form.reset();
      showToast('You’re on the list. Keep an eye on your inbox.');
    });
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    window.setTimeout(() => toast.classList.remove('visible'), 4200);
  }

  function setupNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        nav.classList.remove('is-open');
      }
    });
  }

  function setupMotion() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }

  applyContent();
  renderInterests();
  renderCategories();
  renderStores();
  renderEvents();
  renderFaqs();
  setFormCategories();
  setupForms();
  setupNavigation();
  setupMotion();
  document.getElementById('year').textContent = new Date().getFullYear();
})();
