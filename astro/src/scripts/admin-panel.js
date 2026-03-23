const adminDataNode = document.getElementById('admin-data');
const payload = adminDataNode ? JSON.parse(adminDataNode.textContent || '{}') : {};

const collectionConfig = {
  events: { label: 'Events', extension: '.md', format: 'markdown' },
  vendors: { label: 'Venues', extension: '.json', format: 'json' },
  sliders: { label: 'Sliders', extension: '.json', format: 'json' },
  organizers: { label: 'Organizers', extension: '.json', format: 'json' }
};

const knownSlideAssets = Array.isArray(payload.slideAssets) ? payload.slideAssets : [];
const knownSlideNames = new Set(knownSlideAssets.map((asset) => asset.fileName));
const initialState = { events: [], vendors: [], sliders: [], organizers: [] };

for (const record of Array.isArray(payload.initialRecords) ? payload.initialRecords : []) {
  initialState[record.collection].push({
    ...record,
    isNew: false,
    isDirty: false,
    parseError: null,
    editorMode: 'form'
  });
}

const state = {
  collections: initialState,
  activeCollection: initialState.events.length > 0 ? 'events' : (Object.keys(initialState).find((key) => initialState[key].length > 0) || 'events'),
  activeRecordPath: initialState.events[0]?.relativePath || payload.initialRecords?.[0]?.relativePath || null,
  message: ''
};

const recordList = document.getElementById('admin-record-list');
const recordCount = document.getElementById('admin-record-count');
const statusNode = document.getElementById('admin-status');
const title = document.getElementById('admin-record-title');
const badge = document.getElementById('admin-record-badge');
const collectionNode = document.getElementById('admin-record-collection');
const pathNode = document.getElementById('admin-record-path');
const slugNode = document.getElementById('admin-record-slug');
const dateNode = document.getElementById('admin-record-date');
const source = document.getElementById('admin-source');
const sourceWrap = document.getElementById('admin-source-wrap');
const formHost = document.getElementById('admin-form-host');
const modeToggle = document.getElementById('admin-mode-toggle');
const cancelDraftButton = document.getElementById('admin-cancel-draft');

let uidCounter = 0;
let isRenderingSource = false;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const toInputDate = (value) => {
  if (!value) return '';
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

const toInputTime = (value) => {
  if (!value) return '';
  const match = String(value).match(/\b(\d{2}:\d{2})/);
  return match ? match[1] : '';
};

const combineDateTime = (dateValue, timeValue) => {
  if (!dateValue && !timeValue) return '';
  return `${dateValue || '2026-01-01'} ${timeValue || '18:00'}:00`;
};

const createTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const nextNumericPrefix = (records) => {
  const max = records.reduce((current, record) => {
    const match = record.fileName.match(/^(\d+)-/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);

  return String(max + 1).padStart(3, '0');
};

const uniqueId = () => `${Date.now()}${String(uidCounter++).padStart(3, '0')}`;

const parseMarkdownMeta = (value) => {
  const match = value.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fallback = { title: 'Untitled', slug: '', status: '', date: '', parseError: null };

  if (!match) return { ...fallback, parseError: 'Frontmatter block not found.' };

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const fieldMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!fieldMatch) continue;
    fields[fieldMatch[1]] = fieldMatch[2].trim().replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
  }

  return {
    title: fields.title || fallback.title,
    slug: fields.slug || '',
    status: fields.status || '',
    date: fields.date || '',
    parseError: null
  };
};

const parseJsonMeta = (value) => {
  try {
    const parsed = JSON.parse(value);
    return {
      title: typeof parsed.title === 'string' && parsed.title ? parsed.title : 'Untitled',
      slug: typeof parsed.slug === 'string' ? parsed.slug : '',
      status: typeof parsed.status === 'string' ? parsed.status : '',
      date: typeof parsed.date === 'string' ? parsed.date : '',
      parseError: null
    };
  } catch (error) {
    return {
      title: 'Invalid JSON',
      slug: '',
      status: '',
      date: '',
      parseError: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
};

const parseMeta = (record) => record.format === 'markdown' ? parseMarkdownMeta(record.source) : parseJsonMeta(record.source);

const parseFrontmatter = (sourceText) => {
  const match = sourceText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fields: {}, body: sourceText.trim(), parseError: 'Frontmatter block not found.' };

  const lines = match[1].split(/\r?\n/);
  const fields = {};
  let currentListKey = null;

  for (const line of lines) {
    const listMatch = line.match(/^\s+-\s*"?(.*?)"?\s*$/);
    if (listMatch && currentListKey) {
      fields[currentListKey].push(listMatch[1]);
      continue;
    }

    const fieldMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!fieldMatch) continue;
    const key = fieldMatch[1];
    const raw = fieldMatch[2].trim();

    if (raw === '') {
      fields[key] = [];
      currentListKey = key;
    } else {
      fields[key] = raw.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
      currentListKey = null;
    }
  }

  return { fields, body: match[2].replace(/^\s+|\s+$/g, ''), parseError: null };
};

const parseEventRecord = (record) => {
  const parsed = parseFrontmatter(record.source);
  const fields = parsed.fields;
  return {
    parseError: parsed.parseError,
    data: {
      title: String(fields.title || ''),
      id: String(fields.id || uniqueId()),
      type: String(fields.type || 'tribe_events'),
      status: String(fields.status || 'publish'),
      slug: String(fields.slug || ''),
      date: String(fields.date || ''),
      author: String(fields.author || 'admin'),
      venue: String(fields.venue || ''),
      venue_address: String(fields.venue_address || ''),
      organizer: String(fields.organizer || ''),
      tags: Array.isArray(fields.tags) ? fields.tags : [],
      sliders: Array.isArray(fields.sliders) ? fields.sliders : [],
      body: parsed.body
    }
  };
};

const serializeEventRecord = (data) => {
  const lines = [
    '---',
    `title: "${String(data.title || '').replaceAll('"', '\\"')}"`,
    `id: "${String(data.id || uniqueId())}"`,
    `type: "${String(data.type || 'tribe_events')}"`,
    `status: "${String(data.status || 'publish')}"`,
    `slug: "${String(data.slug || '')}"`,
    `date: "${String(data.date || '')}"`,
    `author: "${String(data.author || 'admin')}"`
  ];

  if (data.venue) lines.push(`venue: "${String(data.venue).replaceAll('"', '\\"')}"`);
  if (data.venue_address) lines.push(`venue_address: "${String(data.venue_address).replaceAll('"', '\\"')}"`);
  if (data.organizer) lines.push(`organizer: "${String(data.organizer).replaceAll('"', '\\"')}"`);
  if ((data.sliders || []).length > 0) {
    lines.push('sliders:');
    for (const sliderId of data.sliders) lines.push(`  - "${String(sliderId).replaceAll('"', '\\"')}"`);
  }
  lines.push('tags:');
  for (const tag of data.tags || []) lines.push(`  - "${String(tag).replaceAll('"', '\\"')}"`);
  lines.push('---', '');
  if (data.body) lines.push(String(data.body).trim(), '');
  return lines.join('\n');
};
const parseJsonRecord = (record) => {
  try {
    return { parseError: null, data: JSON.parse(record.source) };
  } catch (error) {
    return { parseError: error instanceof Error ? error.message : 'Invalid JSON', data: {} };
  }
};

const normalizeSlideUrl = (fileName) => `/media/assets/slides/${fileName}`;

const createSliderSlide = (sliderId, sliderSlug, fileName, index) => ({
  id: uniqueId(),
  title: `Slide ${index + 1}`,
  type: 'ml-slide',
  status: 'publish',
  slug: `${sliderSlug || 'slider'}-image-${index + 1}`,
  date: createTimestamp(),
  author: 'admin',
  renderedContent: '',
  order: index,
  sliderIds: [sliderId],
  image: {
    url: normalizeSlideUrl(fileName)
  }
});

const eventTemplate = (slug) => serializeEventRecord({
  title: 'New Event',
  id: uniqueId(),
  type: 'tribe_events',
  status: 'publish',
  slug,
  date: createTimestamp(),
  author: 'admin',
  venue: '',
  venue_address: '',
  organizer: '',
  tags: ['Symposium'],
  sliders: [],
  body: ''
});

const venueTemplate = (slug) => JSON.stringify({
  id: uniqueId(),
  title: 'New Venue',
  type: 'tribe_venue',
  status: 'publish',
  slug,
  date: createTimestamp(),
  author: 'admin',
  content: '',
  renderedContent: '',
  tags: [],
  relatedVenueIds: [],
  sliderIds: [],
  menuOrder: 0
}, null, 2) + '\n';

const organizerTemplate = (slug) => JSON.stringify({
  id: uniqueId(),
  title: 'New Organizer',
  type: 'tribe_organizer',
  status: 'publish',
  slug,
  date: createTimestamp(),
  author: 'admin',
  content: '',
  renderedContent: '',
  tags: []
}, null, 2) + '\n';

const sliderTemplate = (slug) => JSON.stringify({
  id: uniqueId(),
  title: 'New Slider',
  type: 'ml-slider',
  status: 'publish',
  slug,
  date: createTimestamp(),
  author: 'admin',
  renderedContent: '',
  sliderIds: [],
  slides: []
}, null, 2) + '\n';

const refreshRecordMeta = (record) => {
  const meta = parseMeta(record);
  record.title = meta.title;
  record.slug = meta.slug || undefined;
  record.status = meta.status || undefined;
  record.date = meta.date || undefined;
  record.parseError = meta.parseError;
};

const createRecord = (collection) => {
  const prefix = nextNumericPrefix(state.collections[collection]);
  const baseSlug = collection === 'events' ? 'new-event' : collection === 'vendors' ? 'new-venue' : collection === 'sliders' ? 'new-slider' : 'new-organizer';
  const extension = collectionConfig[collection].extension;
  const fileName = `${prefix}-${baseSlug}${extension}`;
  const relativePath = `${collection}/${fileName}`;
  const sourceText = collection === 'events'
    ? eventTemplate(baseSlug)
    : collection === 'vendors'
      ? venueTemplate(baseSlug)
      : collection === 'sliders'
        ? sliderTemplate(baseSlug)
        : organizerTemplate(baseSlug);

  const record = {
    collection,
    relativePath,
    fileName,
    format: collectionConfig[collection].format,
    title: 'Untitled',
    slug: baseSlug,
    status: 'draft',
    date: createTimestamp(),
    source: sourceText,
    isNew: true,
    isDirty: true,
    parseError: null,
    editorMode: 'form'
  };

  refreshRecordMeta(record);
  state.collections[collection].unshift(record);
  state.activeCollection = collection;
  state.activeRecordPath = relativePath;
  setMessage(`Created a new ${collectionConfig[collection].label.slice(0, -1).toLowerCase()} draft in memory.`);
  render();
};

const getActiveRecord = () => state.collections[state.activeCollection].find((record) => record.relativePath === state.activeRecordPath) || null;

const setMessage = (message, tone = 'info') => {
  state.message = message;
  statusNode.textContent = message;
  statusNode.dataset.tone = tone;
};

const updateRecordSource = (record, nextSource) => {
  record.source = nextSource;
  record.isDirty = true;
  refreshRecordMeta(record);
  render();
};

const updateEventField = (record, key, value) => {
  const parsed = parseEventRecord(record);
  const data = parsed.data;
  data[key] = value;
  updateRecordSource(record, serializeEventRecord(data));
};

const updateJsonField = (record, mutate) => {
  const parsed = parseJsonRecord(record);
  const data = parsed.data;
  mutate(data);
  updateRecordSource(record, `${JSON.stringify(data, null, 2)}\n`);
};

const removeDraft = () => {
  const record = getActiveRecord();
  if (!record || !record.isNew) return;
  const records = state.collections[record.collection];
  const index = records.findIndex((entry) => entry.relativePath === record.relativePath);
  if (index >= 0) records.splice(index, 1);
  const next = records[0] || Object.values(state.collections).flat()[0] || null;
  if (next) {
    state.activeCollection = next.collection;
    state.activeRecordPath = next.relativePath;
  } else {
    state.activeRecordPath = null;
  }
  setMessage(`Discarded ${record.fileName}.`, 'warning');
  render();
};

const renderTabs = () => {
  document.querySelectorAll('[data-collection-tab]').forEach((node) => {
    node.classList.toggle('is-active', node.dataset.collectionTab === state.activeCollection);
  });
};

const collectUniqueValues = (values) => Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));

const getVenueOptions = () => collectUniqueValues([
  ...state.collections.vendors.map((record) => parseMeta(record).title),
  ...state.collections.events.map((record) => parseEventRecord(record).data.venue)
]);

const getOrganizerOptions = () => collectUniqueValues([
  ...state.collections.organizers.map((record) => parseMeta(record).title),
  ...state.collections.events.map((record) => parseEventRecord(record).data.organizer)
]);

const getVenueAddressLookup = () => {
  const entries = new Map();
  for (const record of state.collections.events) {
    const eventData = parseEventRecord(record).data;
    const venue = String(eventData.venue || '').trim();
    const address = String(eventData.venue_address || '').trim();
    if (venue && address && !entries.has(venue)) entries.set(venue, address);
  }
  return entries;
};

const getSliderPreviewEntries = (sliderIds) => {
  const selected = new Set((sliderIds || []).map((value) => String(value)));
  return state.collections.sliders
    .map((record) => {
      const parsed = parseJsonRecord(record).data;
      const id = String(parsed.id || '').trim();
      if (!id || !selected.has(id)) return null;
      const slides = Array.isArray(parsed.slides) ? parsed.slides.filter((slide) => slide?.status !== 'trash') : [];
      return {
        id,
        title: parseMeta(record).title,
        slides
      };
    })
    .filter(Boolean);
};
const getSliderOptions = () => state.collections.sliders
  .map((record) => ({
    id: (() => {
      const parsed = parseJsonRecord(record).data;
      return String(parsed.id || '').trim();
    })(),
    title: parseMeta(record).title
  }))
  .filter((entry) => entry.id)
  .sort((left, right) => left.title.localeCompare(right.title));
const renderRecordList = () => {
  const records = state.collections[state.activeCollection];
  recordCount.textContent = `${records.length} file${records.length === 1 ? '' : 's'}`;
  recordList.innerHTML = records.map((record) => {
    const classes = ['admin-record-link'];
    if (record.relativePath === state.activeRecordPath) classes.push('is-active');
    if (record.isDirty) classes.push('is-dirty');
    return `
      <button type="button" class="${classes.join(' ')}" data-record-path="${escapeHtml(record.relativePath)}">
        <span class="admin-record-title">${escapeHtml(record.title)}</span>
        <span class="admin-record-meta">${escapeHtml(record.fileName)}</span>
      </button>
    `;
  }).join('');
};

const applyEventForm = (record) => {
  const parsed = parseEventRecord(record);
  const data = parsed.data;
  const venueOptions = getVenueOptions();
  const organizerOptions = getOrganizerOptions();
  const sliderOptions = getSliderOptions();

  formHost.innerHTML = `
    <div class="admin-form-grid">
      <label class="archive-control"><span>Title</span><input data-field="title" value="${escapeHtml(data.title)}" /></label>
      <label class="archive-control"><span>Slug</span><input data-field="slug" value="${escapeHtml(data.slug)}" /></label>
      <label class="archive-control"><span>Status</span><select data-field="status"><option value="publish" ${data.status === 'publish' ? 'selected' : ''}>Publish</option><option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Draft</option><option value="private" ${data.status === 'private' ? 'selected' : ''}>Private</option></select></label>
      <label class="archive-control"><span>Author</span><input data-field="author" value="${escapeHtml(data.author)}" /></label>
      <label class="archive-control"><span>Date</span><input type="date" data-date-part value="${escapeHtml(toInputDate(data.date))}" /></label>
      <label class="archive-control"><span>Time</span><input type="time" step="900" data-time-part value="${escapeHtml(toInputTime(data.date))}" /></label>
      <label class="archive-control"><span>Venue</span><select data-field="venue" data-venue-select><option value="">None</option>${venueOptions.map((option) => `<option value="${escapeHtml(option)}" ${data.venue === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>
      <label class="archive-control"><span>Venue Address</span><input data-field="venue_address" value="${escapeHtml(data.venue_address)}" /></label>
      <label class="archive-control"><span>Organizer</span><select data-field="organizer"><option value="">None</option>${organizerOptions.map((option) => `<option value="${escapeHtml(option)}" ${data.organizer === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>
      <div class="archive-control admin-form-full"><span>Sliders</span><div class="admin-select-list">${sliderOptions.length > 0 ? sliderOptions.map((option) => `<label class="admin-check-option"><input type="checkbox" data-slider-option="${escapeHtml(option.id)}" ${data.sliders.includes(option.id) ? 'checked' : ''} /><span>${escapeHtml(option.title)} <code>${escapeHtml(option.id)}</code></span></label>`).join('') : '<p class="empty-state">No sliders available.</p>'}</div></div>
      <div class="admin-form-full admin-slider-preview-wrap"><span class="admin-preview-label">Slideshow Preview</span><div class="admin-slider-preview-list">${getSliderPreviewEntries(data.sliders).length > 0 ? getSliderPreviewEntries(data.sliders).map((slider) => `<section class="admin-slider-preview"><h3>${escapeHtml(slider.title)}</h3><div class="admin-slider-preview-grid">${slider.slides.slice(0, 6).map((slide) => `<img src="${escapeHtml(slide.image?.url || '')}" alt="" />`).join('')}</div></section>`).join('') : '<p class="empty-state">Select one or more sliders to preview their images.</p>'}</div></div>
      <label class="archive-control admin-form-full"><span>Tags</span><input data-list-field="tags" value="${escapeHtml((data.tags || []).join(', '))}" /></label>
      <label class="archive-control admin-form-full"><span>Body</span><textarea data-field="body" class="admin-form-textarea">${escapeHtml(data.body || '')}</textarea></label>
    </div>
  `;

  formHost.querySelectorAll('[data-field]').forEach((node) => {
    node.addEventListener('input', () => updateEventField(record, node.dataset.field, node.value));
    node.addEventListener('change', () => updateEventField(record, node.dataset.field, node.value));
  });

  formHost.querySelectorAll('[data-list-field]').forEach((node) => {
    node.addEventListener('input', () => {
      const items = node.value.split(',').map((value) => value.trim()).filter(Boolean);
      updateEventField(record, node.dataset.listField, items);
    });
  });

  formHost.querySelectorAll('[data-slider-option]').forEach((node) => {
    node.addEventListener('change', () => {
      const selected = Array.from(formHost.querySelectorAll('[data-slider-option]:checked')).map((input) => input.dataset.sliderOption);
      updateEventField(record, 'sliders', selected);
    });
  });

  formHost.querySelector('[data-venue-select]')?.addEventListener('change', (event) => {
    const selectedVenue = event.target.value;
    const addressLookup = getVenueAddressLookup();
    updateEventField(record, 'venue', selectedVenue);
    if (selectedVenue && addressLookup.has(selectedVenue)) {
      updateEventField(record, 'venue_address', addressLookup.get(selectedVenue));
    } else if (!selectedVenue) {
      updateEventField(record, 'venue_address', '');
    }
  });

  const dateInput = formHost.querySelector('[data-date-part]');
  const timeInput = formHost.querySelector('[data-time-part]');
  const syncDateTime = () => updateEventField(record, 'date', combineDateTime(dateInput.value, timeInput.value));
  dateInput?.addEventListener('input', syncDateTime);
  timeInput?.addEventListener('input', syncDateTime);
};
const applySimpleJsonForm = (record, config) => {
  const parsed = parseJsonRecord(record);
  const data = parsed.data;
  formHost.innerHTML = `
    <div class="admin-form-grid">
      <label class="archive-control"><span>Title</span><input data-field="title" value="${escapeHtml(data.title || '')}" /></label>
      <label class="archive-control"><span>Slug</span><input data-field="slug" value="${escapeHtml(data.slug || '')}" /></label>
      <label class="archive-control"><span>Status</span><select data-field="status"><option value="publish" ${(data.status || 'publish') === 'publish' ? 'selected' : ''}>Publish</option><option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Draft</option><option value="private" ${data.status === 'private' ? 'selected' : ''}>Private</option></select></label>
      <label class="archive-control"><span>Author</span><input data-field="author" value="${escapeHtml(data.author || 'admin')}" /></label>
      <label class="archive-control"><span>Date</span><input type="date" data-date-part value="${escapeHtml(toInputDate(data.date || ''))}" /></label>
      <label class="archive-control"><span>Time</span><input type="time" step="900" data-time-part value="${escapeHtml(toInputTime(data.date || ''))}" /></label>
      ${config.extraHtml(data)}
    </div>
  `;

  formHost.querySelectorAll('[data-field]').forEach((node) => {
    node.addEventListener('input', () => updateJsonField(record, (next) => {
      next[node.dataset.field] = node.value;
    }));
  });

  formHost.querySelectorAll('[data-list-field]').forEach((node) => {
    node.addEventListener('input', () => updateJsonField(record, (next) => {
      next[node.dataset.listField] = node.value.split(',').map((value) => value.trim()).filter(Boolean);
    }));
  });

  formHost.querySelectorAll('[data-number-field]').forEach((node) => {
    node.addEventListener('input', () => updateJsonField(record, (next) => {
      next[node.dataset.numberField] = Number(node.value || 0);
    }));
  });

  const dateInput = formHost.querySelector('[data-date-part]');
  const timeInput = formHost.querySelector('[data-time-part]');
  const syncDateTime = () => updateJsonField(record, (next) => {
    next.date = combineDateTime(dateInput.value, timeInput.value);
  });
  dateInput?.addEventListener('input', syncDateTime);
  timeInput?.addEventListener('input', syncDateTime);

  config.bind?.(formHost, record, data);
};

const renderSliderForm = (record) => {
  applySimpleJsonForm(record, {
    extraHtml: (data) => {
      const slides = Array.isArray(data.slides) ? data.slides : [];
      const slideCards = slides.map((slide, index) => {
        const imageUrl = slide?.image?.url || '';
        const matched = knownSlideAssets.find((asset) => asset.mediaUrl === imageUrl);
        return `
          <article class="admin-slide-card">
            <img src="${escapeHtml(imageUrl || '/media/assets/Logo-focus-no-background-black.png')}" alt="" />
            <div class="admin-slide-copy">
              <strong>${escapeHtml(slide.title || `Slide ${index + 1}`)}</strong>
              <span>${escapeHtml(matched?.fileName || imageUrl || 'No image')}</span>
            </div>
            <div class="admin-slide-actions">
              <button type="button" class="slider-button admin-secondary" data-slide-move="up" data-slide-index="${index}" ${index === 0 ? 'disabled' : ''}>Up</button>
              <button type="button" class="slider-button admin-secondary" data-slide-move="down" data-slide-index="${index}" ${index === slides.length - 1 ? 'disabled' : ''}>Down</button>
              <button type="button" class="slider-button admin-secondary" data-slide-remove="${index}">Remove</button>
            </div>
          </article>
        `;
      }).join('');

      const assetButtons = knownSlideAssets.map((asset) => `
        <button type="button" class="admin-asset-chip" data-add-asset="${escapeHtml(asset.fileName)}">${escapeHtml(asset.fileName)}</button>
      `).join('');

      return `
        <label class="archive-control"><span>Rendered Content</span><input data-field="renderedContent" value="${escapeHtml(data.renderedContent || '')}" /></label>
        <label class="archive-control"><span>Slider IDs</span><input data-list-field="sliderIds" value="${escapeHtml((data.sliderIds || []).join(', '))}" /></label>
        <div class="admin-form-full admin-slide-zone" id="admin-slide-zone">
          <p class="eyebrow">Slides</p>
          <p class="admin-note">Drag files from your computer here. Their filenames will be mapped to <code>/media/assets/slides/&lt;name&gt;</code>.</p>
          <div class="admin-slide-drop">Drop slide images here</div>
          <div class="admin-asset-list">${assetButtons}</div>
          <div class="admin-slide-list">${slideCards || '<p class="empty-state">No slides yet.</p>'}</div>
        </div>
      `;
    },
    bind: (host, currentRecord) => {
      const ensureSlides = (next) => {
        if (!Array.isArray(next.slides)) next.slides = [];
        return next.slides;
      };

      const addAssets = (fileNames) => {
        updateJsonField(currentRecord, (next) => {
          const sliderId = String(next.id || uniqueId());
          next.id = sliderId;
          const sliderSlug = String(next.slug || 'slider');
          const slides = ensureSlides(next);
          const filtered = fileNames.filter((name) => knownSlideNames.has(name));
          for (const fileName of filtered) slides.push(createSliderSlide(sliderId, sliderSlug, fileName, slides.length));
          slides.forEach((slide, index) => {
            slide.order = index;
            slide.sliderIds = [sliderId];
            if (!slide.slug || /-image-\d+$/.test(slide.slug)) slide.slug = `${sliderSlug}-image-${index + 1}`;
          });
        });

        const missing = fileNames.filter((name) => !knownSlideNames.has(name));
        if (missing.length > 0) setMessage(`Ignored unknown slide assets: ${missing.join(', ')}`, 'warning');
      };

      host.querySelectorAll('[data-add-asset]').forEach((node) => {
        node.addEventListener('click', () => addAssets([node.dataset.addAsset]));
      });

      host.querySelectorAll('[data-slide-remove]').forEach((node) => {
        node.addEventListener('click', () => updateJsonField(currentRecord, (next) => {
          const slides = ensureSlides(next);
          slides.splice(Number(node.dataset.slideRemove), 1);
          slides.forEach((slide, index) => { slide.order = index; });
        }));
      });

      host.querySelectorAll('[data-slide-move]').forEach((node) => {
        node.addEventListener('click', () => updateJsonField(currentRecord, (next) => {
          const slides = ensureSlides(next);
          const index = Number(node.dataset.slideIndex);
          const target = index + (node.dataset.slideMove === 'up' ? -1 : 1);
          if (target < 0 || target >= slides.length) return;
          const [slide] = slides.splice(index, 1);
          slides.splice(target, 0, slide);
          slides.forEach((entry, order) => { entry.order = order; });
        }));
      });

      const zone = host.querySelector('#admin-slide-zone');
      const drop = host.querySelector('.admin-slide-drop');
      zone?.addEventListener('dragover', (event) => {
        event.preventDefault();
        drop?.classList.add('is-dragover');
      });
      zone?.addEventListener('dragleave', () => drop?.classList.remove('is-dragover'));
      zone?.addEventListener('drop', (event) => {
        event.preventDefault();
        drop?.classList.remove('is-dragover');
        if (event.dataTransfer?.files?.length) addAssets(Array.from(event.dataTransfer.files).map((file) => file.name));
      });
    }
  });
};

const renderVenueForm = (record) => applySimpleJsonForm(record, {
  extraHtml: (data) => `
    <label class="archive-control admin-form-full"><span>Description</span><textarea data-field="content" class="admin-form-textarea">${escapeHtml(data.content || '')}</textarea></label>
    <label class="archive-control"><span>Rendered Content</span><input data-field="renderedContent" value="${escapeHtml(data.renderedContent || '')}" /></label>
    <label class="archive-control"><span>Menu Order</span><input type="number" data-number-field="menuOrder" value="${escapeHtml(String(data.menuOrder || 0))}" /></label>
    <label class="archive-control admin-form-full"><span>Tags</span><input data-list-field="tags" value="${escapeHtml((data.tags || []).join(', '))}" /></label>
  `
});

const renderOrganizerForm = (record) => applySimpleJsonForm(record, {
  extraHtml: (data) => `
    <label class="archive-control admin-form-full"><span>Description</span><textarea data-field="content" class="admin-form-textarea">${escapeHtml(data.content || '')}</textarea></label>
    <label class="archive-control"><span>Rendered Content</span><input data-field="renderedContent" value="${escapeHtml(data.renderedContent || '')}" /></label>
    <label class="archive-control admin-form-full"><span>Tags</span><input data-list-field="tags" value="${escapeHtml((data.tags || []).join(', '))}" /></label>
  `
});
const renderForm = (record) => {
  if (!record) {
    formHost.innerHTML = '';
    return;
  }
  if (record.collection === 'events') return applyEventForm(record);
  if (record.collection === 'sliders') return renderSliderForm(record);
  if (record.collection === 'vendors') return renderVenueForm(record);
  if (record.collection === 'organizers') return renderOrganizerForm(record);
};

const renderEditor = () => {
  const record = getActiveRecord();

  if (!record) {
    title.textContent = 'No file selected';
    badge.textContent = 'Idle';
    collectionNode.textContent = '-';
    pathNode.textContent = '-';
    slugNode.textContent = '-';
    dateNode.textContent = '-';
    formHost.innerHTML = '';
    modeToggle.hidden = true;
    sourceWrap.hidden = true;
    cancelDraftButton.hidden = true;
    isRenderingSource = true;
    source.value = '';
    isRenderingSource = false;
    return;
  }

  title.textContent = record.title;
  badge.textContent = record.parseError ? 'Needs attention' : record.isDirty ? 'Unsaved changes' : record.isNew ? 'New draft' : 'Saved in memory';
  collectionNode.textContent = collectionConfig[record.collection].label;
  pathNode.textContent = `markdown/${record.relativePath}`;
  slugNode.textContent = record.slug || '-';
  dateNode.textContent = record.date || '-';
  cancelDraftButton.hidden = !record.isNew;
  modeToggle.hidden = false;

  modeToggle.querySelectorAll('[data-editor-mode]').forEach((node) => {
    node.classList.toggle('is-active', node.dataset.editorMode === record.editorMode);
  });

  if (record.editorMode === 'source') {
    sourceWrap.hidden = false;
    formHost.innerHTML = '';
    if (source.value !== record.source) {
      isRenderingSource = true;
      source.value = record.source;
      isRenderingSource = false;
    }
  } else {
    sourceWrap.hidden = true;
    renderForm(record);
  }
};

const render = () => {
  renderTabs();
  renderRecordList();
  renderEditor();
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let c = index;
    for (let bit = 0; bit < 8; bit += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[index] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const dosDateTime = (date) => {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
};

const writeUint16 = (view, offset, value) => view.setUint16(offset, value, true);
const writeUint32 = (view, offset, value) => view.setUint32(offset, value, true);

const buildZipBlob = (files) => {
  const encoder = new TextEncoder();
  const now = dosDateTime(new Date());
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.path.replace(/\\/g, '/'));
    const contentBytes = encoder.encode(file.content);
    const checksum = crc32(contentBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, now.dosTime);
    writeUint16(localView, 12, now.dosDate);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, contentBytes.length);
    writeUint32(localView, 22, contentBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    localHeader.set(nameBytes, 30);
    localChunks.push(localHeader, contentBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, now.dosTime);
    writeUint16(centralView, 14, now.dosDate);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, contentBytes.length);
    writeUint32(centralView, 24, contentBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);
    centralChunks.push(centralHeader);

    offset += localHeader.length + contentBytes.length;
  }

  const centralSize = centralChunks.reduce((total, chunk) => total + chunk.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);
  return new Blob([...localChunks, ...centralChunks, endRecord], { type: 'application/zip' });
};

const downloadZip = () => {
  const records = Object.values(state.collections).flat();
  const invalid = records.find((record) => record.parseError);
  if (invalid) return setMessage(`Fix ${invalid.fileName} before exporting the ZIP.`, 'warning');
  const blob = buildZipBlob(records.map((record) => ({ path: `markdown/${record.relativePath}`, content: record.source })));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
  anchor.href = url;
  anchor.download = `vienna-symposium-admin-export-${stamp}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
  setMessage('Downloaded ZIP export.', 'success');
};

document.querySelectorAll('[data-collection-tab]').forEach((node) => {
  node.addEventListener('click', () => {
    state.activeCollection = node.dataset.collectionTab;
    const next = state.collections[state.activeCollection][0];
    state.activeRecordPath = next ? next.relativePath : null;
    render();
  });
});

document.querySelectorAll('[data-create-record]').forEach((node) => {
  node.addEventListener('click', () => createRecord(node.dataset.createRecord));
});

recordList.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('[data-record-path]') : null;
  if (!target) return;
  state.activeRecordPath = target.dataset.recordPath;
  render();
});

modeToggle?.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('[data-editor-mode]') : null;
  const record = getActiveRecord();
  if (!target || !record) return;
  record.editorMode = target.dataset.editorMode;
  render();
});

source.addEventListener('input', () => {
  if (isRenderingSource) return;
  const record = getActiveRecord();
  if (!record) return;
  record.source = source.value;
  record.isDirty = true;
  refreshRecordMeta(record);
  render();
});

document.getElementById('admin-download-zip')?.addEventListener('click', downloadZip);
cancelDraftButton?.addEventListener('click', removeDraft);

setMessage('Admin panel ready. Changes stay in memory until you export a ZIP.');
render();

