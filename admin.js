(() => {
  let data = window.SDCData.read();
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const prettyDate = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const toast = message => {
    const element = document.getElementById('admin-toast');
    element.textContent = message;
    element.classList.add('visible');
    window.setTimeout(() => element.classList.remove('visible'), 3000);
  };
  const save = message => {
    window.SDCData.write(data);
    toast(message || 'Changes saved in this browser.');
    renderAll();
  };

  function renderOverview() {
    const pending = data.submissions.filter(item => item.status !== 'Reviewed').length;
    document.getElementById('total-members').textContent = data.members.length;
    document.getElementById('total-submissions').textContent = pending;
    document.getElementById('total-stores').textContent = data.stores.length;
    document.getElementById('total-events').textContent = data.events.filter(item => item.status === 'upcoming').length;
    document.getElementById('submission-badge').textContent = pending;
    document.getElementById('member-badge').textContent = data.members.length;
    document.getElementById('submission-count').textContent = data.submissions.length;
    document.getElementById('member-count').textContent = data.members.length;
    document.getElementById('admin-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const latest = [...data.submissions.map(item => ({ ...item, kind: 'store' })), ...data.members.map(item => ({ ...item, kind: 'member' }))].sort((a, b) => new Date(b.submittedAt || b.joinedAt) - new Date(a.submittedAt || a.joinedAt)).slice(0, 5);
    document.getElementById('recent-activity').innerHTML = latest.length ? latest.map(item => `<div class="activity-row"><span class="activity-avatar ${item.kind === 'store' ? 'avatar-store' : ''}">${escapeHtml((item.name || '?').slice(0, 1).toUpperCase())}</span><span class="activity-copy"><b>${escapeHtml(item.name || 'New community member')}</b><small>${item.kind === 'store' ? `Introduced ${escapeHtml(item.storeName || 'a store')}` : 'Joined as a shopper'}</small></span><time>${prettyDate(item.submittedAt || item.joinedAt)}</time></div>`).join('') : '<div class="empty-state"><span>✳</span><b>Your community is ready to meet.</b><p>New shopper signups and store introductions will appear here.</p></div>';
  }

  function bindContent() {
    const form = document.getElementById('content-form');
    for (const field of form.elements) if (field.name in data) field.value = data[field.name];
    form.onsubmit = event => {
      event.preventDefault();
      Object.assign(data, Object.fromEntries(new FormData(form).entries()));
      save('Homepage content saved.');
    };
    document.querySelectorAll('[data-save]').forEach(button => button.onclick = () => form.requestSubmit());
  }

  function renderCategories() {
    const host = document.getElementById('category-editor');
    host.innerHTML = data.categories.map((category, index) => `<div class="category-editor-row"><span class="category-editor-index">${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(category)}</span><button type="button" data-remove-category="${index}" aria-label="Remove ${escapeHtml(category)}">×</button></div>`).join('');
    host.querySelectorAll('[data-remove-category]').forEach(button => button.onclick = () => {
      if (data.categories.length < 2) return toast('Keep at least one category.');
      data.categories.splice(Number(button.dataset.removeCategory), 1);
      data.interests = data.interests.filter(item => data.categories.includes(item.name));
      save('Category removed.');
    });
    document.getElementById('category-add-form').onsubmit = event => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('input');
      const name = input.value.trim();
      if (data.categories.some(item => item.toLowerCase() === name.toLowerCase())) return toast('That category already exists.');
      data.categories.push(name);
      data.interests.push({ name, detail: `What are you looking for in ${name.toLowerCase()}?`, icon: '✳', color: 'sage' });
      event.currentTarget.reset();
      save('Category added.');
    };
  }

  function renderStores() {
    const host = document.getElementById('store-admin-list');
    host.innerHTML = data.stores.length ? data.stores.map((store, index) => `<article class="admin-record"><div class="record-mark">${escapeHtml(store.mark || store.name.slice(0, 1))}</div><div class="record-main"><div class="record-kicker">${escapeHtml(store.category)} ${store.url ? `· <a href="${escapeHtml(store.url)}" target="_blank" rel="noreferrer">VISIT SITE ↗</a>` : ''}</div><h3>${escapeHtml(store.name)}</h3><p>${escapeHtml(store.description || 'No description yet.')}</p><small>Featured: ${escapeHtml(store.products || 'Not specified')}</small></div><div class="record-actions"><button data-edit-store="${index}">Edit</button><button data-delete-store="${index}" class="record-delete">Remove</button></div></article>`).join('') : '<div class="admin-panel empty-state"><span>◈</span><b>No featured stores yet.</b><p>Add selected stores here. They will appear as recently discovered on the homepage.</p></div>';
    host.querySelectorAll('[data-edit-store]').forEach(button => button.onclick = () => openRecord('store', Number(button.dataset.editStore)));
    host.querySelectorAll('[data-delete-store]').forEach(button => button.onclick = () => { data.stores.splice(Number(button.dataset.deleteStore), 1); save('Store removed.'); });
  }

  function renderEvents() {
    const host = document.getElementById('event-admin-list');
    host.innerHTML = data.events.length ? data.events.map((item, index) => `<article class="admin-record"><div class="event-record-date"><b>${escapeHtml(item.day || 'TBA')}</b><span>${escapeHtml(item.month || 'SOON')}</span></div><div class="record-main"><div class="record-kicker">${escapeHtml(item.category || 'SESSION')} ${item.status === 'past' ? '· PAST' : item.status === 'draft' ? '· DRAFT IDEA' : '· UPCOMING'}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.time || 'Time to be announced')} · ${escapeHtml(item.stores || 'Stores to be announced')}</p></div><div class="record-actions"><button data-edit-event="${index}">Edit</button><button data-delete-event="${index}" class="record-delete">Remove</button></div></article>`).join('') : '<div class="admin-panel empty-state"><span>◷</span><b>No sessions on the calendar.</b><p>Add a session when the next store introduction is ready.</p></div>';
    host.querySelectorAll('[data-edit-event]').forEach(button => button.onclick = () => openRecord('event', Number(button.dataset.editEvent)));
    host.querySelectorAll('[data-delete-event]').forEach(button => button.onclick = () => { data.events.splice(Number(button.dataset.deleteEvent), 1); save('Session removed.'); });
  }

  function renderFaqs() {
    const host = document.getElementById('faq-admin-list');
    host.innerHTML = data.faqs.map((faq, index) => `<article class="admin-record faq-record"><div class="faq-record-number">${String(index + 1).padStart(2, '0')}</div><div class="record-main"><h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p></div><div class="record-actions"><button data-edit-faq="${index}">Edit</button><button data-delete-faq="${index}" class="record-delete">Remove</button></div></article>`).join('');
    host.querySelectorAll('[data-edit-faq]').forEach(button => button.onclick = () => openRecord('faq', Number(button.dataset.editFaq)));
    host.querySelectorAll('[data-delete-faq]').forEach(button => button.onclick = () => { data.faqs.splice(Number(button.dataset.deleteFaq), 1); save('Question removed.'); });
  }

  function renderSubmissions() {
    const host = document.getElementById('submission-list');
    host.innerHTML = data.submissions.length ? data.submissions.map((item, index) => `<article class="admin-record submission-record"><div class="record-mark submission-mark">${escapeHtml((item.storeName || '?').slice(0, 1).toLowerCase())}</div><div class="record-main"><div class="record-kicker">${escapeHtml(item.category || 'CATEGORY NOT SPECIFIED')} · ${prettyDate(item.submittedAt)}</div><h3>${escapeHtml(item.storeName || 'Store submission')} <span class="submission-status ${item.status === 'Reviewed' ? 'status-reviewed' : ''}">${escapeHtml(item.status || 'New')}</span></h3><p>${escapeHtml(item.name)} · <a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a> · <a href="${escapeHtml(item.website)}" target="_blank" rel="noreferrer">Visit website ↗</a></p><div class="submission-details"><span><b>Ships to</b>${escapeHtml(item.shipping || 'Not specified')}</span><span><b>Delivery estimate</b>${escapeHtml(item.delivery || 'Not specified')}</span><span><b>Featured products</b>${escapeHtml(item.products || 'Not specified')}</span><span><b>Current offers</b>${escapeHtml(item.offers || 'None shared')}</span></div>${item.notes ? `<p class="submission-note-admin">${escapeHtml(item.notes)}</p>` : ''}</div><div class="record-actions"><button data-review-submission="${index}">${item.status === 'Reviewed' ? 'Mark new' : 'Mark reviewed'}</button><button data-delete-submission="${index}" class="record-delete">Remove</button></div></article>`).join('') : '<div class="admin-panel empty-state"><span>↙</span><b>No store introductions yet.</b><p>Submissions from the homepage will arrive here.</p></div>';
    host.querySelectorAll('[data-review-submission]').forEach(button => button.onclick = () => { const item = data.submissions[Number(button.dataset.reviewSubmission)]; item.status = item.status === 'Reviewed' ? 'New' : 'Reviewed'; save('Submission status updated.'); });
    host.querySelectorAll('[data-delete-submission]').forEach(button => button.onclick = () => { data.submissions.splice(Number(button.dataset.deleteSubmission), 1); save('Submission removed.'); });
  }

  function renderMembers() {
    const host = document.getElementById('member-list');
    host.innerHTML = data.members.length ? data.members.map((member, index) => `<article class="admin-record member-record"><div class="record-mark member-mark">${escapeHtml((member.name || '?').slice(0, 1).toUpperCase())}</div><div class="record-main"><div class="record-kicker">JOINED ${prettyDate(member.joinedAt)}</div><h3>${escapeHtml(member.name)}</h3><p><a href="mailto:${escapeHtml(member.email)}">${escapeHtml(member.email)}</a></p><div class="member-interest"><b>LOOKING FOR</b>${escapeHtml(member.interests || 'No interests shared yet.')}</div></div><div class="record-actions"><button class="record-delete" data-delete-member="${index}">Remove</button></div></article>`).join('') : '<div class="admin-panel empty-state"><span>♡</span><b>No shopper signups yet.</b><p>Community members who join on the homepage will show up here.</p></div>';
    host.querySelectorAll('[data-delete-member]').forEach(button => button.onclick = () => { data.members.splice(Number(button.dataset.deleteMember), 1); save('Member removed.'); });
  }

  const schemas = {
    store: { title: 'Store', fields: [['name', 'Store name', 'text', true], ['category', 'Category', 'select', true], ['description', 'Short description', 'textarea', true], ['products', 'Featured products', 'text', false], ['url', 'Store website', 'url', false], ['image', 'Image URL', 'url', false], ['mark', 'Short logo mark', 'text', false]] },
    event: { title: 'Virtual session', fields: [['title', 'Session title', 'text', true], ['day', 'Day', 'text', false], ['month', 'Month', 'text', false], ['time', 'Date and time', 'text', true], ['category', 'Category', 'text', false], ['stores', 'Participating stores', 'text', false], ['status', 'Status', 'select-status', false]] },
    faq: { title: 'Question', fields: [['q', 'Question', 'text', true], ['a', 'Answer', 'textarea', true]] }
  };
  let activeRecord = { type: '', index: -1 };

  function openRecord(type, index = -1) {
    activeRecord = { type, index };
    const schema = schemas[type];
    const item = index < 0 ? {} : data[type === 'store' ? 'stores' : type === 'event' ? 'events' : 'faqs'][index];
    document.getElementById('dialog-title').textContent = `${index < 0 ? 'Add' : 'Edit'} ${schema.title.toLowerCase()}`;
    document.getElementById('dialog-fields').innerHTML = schema.fields.map(([key, label, kind, required]) => {
      const value = escapeHtml(item[key] || '');
      const requiredAttribute = required ? 'required' : '';
      if (kind === 'textarea') return `<label class="dialog-field dialog-wide">${label}<textarea name="${key}" rows="3" ${requiredAttribute}>${value}</textarea></label>`;
      if (kind === 'select') return `<label class="dialog-field">${label}<select name="${key}" ${requiredAttribute}><option value="">Choose a category</option>${data.categories.map(category => `<option ${category === item[key] ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></label>`;
      if (kind === 'select-status') return `<label class="dialog-field">${label}<select name="${key}"><option value="upcoming" ${!item[key] || item[key] === 'upcoming' ? 'selected' : ''}>Upcoming</option><option value="draft" ${item[key] === 'draft' ? 'selected' : ''}>Draft idea</option><option value="past" ${item[key] === 'past' ? 'selected' : ''}>Past</option></select></label>`;
      return `<label class="dialog-field">${label}<input name="${key}" type="${kind}" value="${value}" ${requiredAttribute}></label>`;
    }).join('');
    document.getElementById('record-dialog').showModal();
  }

  function setupDialog() {
    document.getElementById('add-store').onclick = () => openRecord('store');
    document.getElementById('add-event').onclick = () => openRecord('event');
    document.getElementById('add-faq').onclick = () => openRecord('faq');
    document.getElementById('record-form').addEventListener('submit', event => {
      if (event.submitter?.value === 'cancel') return;
      event.preventDefault();
      const { type, index } = activeRecord;
      const collection = type === 'store' ? data.stores : type === 'event' ? data.events : data.faqs;
      const record = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (index < 0) collection.push(record); else collection[index] = record;
      document.getElementById('record-dialog').close();
      save(`${schemas[type].title} saved.`);
    });
  }

  function exportMembers() {
    const rows = [['Name', 'Email', 'Interests', 'Joined'], ...data.members.map(member => [member.name, member.email, member.interests || '', member.joinedAt || ''])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'community-members.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderAll() {
    data = window.SDCData.read();
    renderOverview();
    bindContent();
    renderCategories();
    renderStores();
    renderEvents();
    renderFaqs();
    renderSubmissions();
    renderMembers();
  }

  setupDialog();
  document.getElementById('export-members').onclick = exportMembers;
  document.getElementById('save-all').onclick = () => {
    const form = document.getElementById('content-form');
    Object.assign(data, Object.fromEntries(new FormData(form).entries()));
    save('All changes saved in this browser.');
  };
  document.getElementById('reset-data').onclick = () => {
    if (!window.confirm('Restore starter content and remove local submissions and shopper signups from this browser?')) return;
    window.SDCData.reset();
    data = window.SDCData.read();
    renderAll();
    toast('Starter content restored.');
  };
  document.querySelectorAll('.admin-nav-link').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-link').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  }));
  renderAll();
})();
