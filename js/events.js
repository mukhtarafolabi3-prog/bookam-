/**
 * BOOKAM - Events Directory Script (events.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const eventsGrid = document.getElementById('events-list-grid');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('filter-search');
  const stateSelect = document.getElementById('filter-state');
  const sortSelect = document.getElementById('filter-sort');
  const clearBtn = document.getElementById('clear-filters-btn');
  const statePills = document.querySelectorAll('.state-pill');

  // New Event Modal Elements
  const createModal = document.getElementById('create-event-modal');
  const openModalBtn = document.getElementById('open-create-modal');
  const closeModalBtn = document.getElementById('close-create-modal');
  const createForm = document.getElementById('create-event-form');

  // Mobile Drawer Setup
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');

  function closeMobileNav() {
    if (mobileNav) {
      mobileNav.classList.remove('active', 'open');
    }
    if (mobileNavBackdrop) {
      mobileNavBackdrop.classList.remove('active');
    }
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.add('active', 'open');
      if (mobileNavBackdrop) mobileNavBackdrop.classList.add('active');
    });
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileNav);
  }

  // Parse URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';
  const initialState = urlParams.get('state') || '';
  const autoOpenCreate = urlParams.get('create') === 'true';

  if (searchInput && initialSearch) searchInput.value = initialSearch;
  if (stateSelect) {
    if (initialState) {
      stateSelect.value = initialState;
    } else if (initialSearch) {
      for (const opt of stateSelect.options) {
        if (opt.value && (opt.value.toLowerCase() === initialSearch.toLowerCase() || initialSearch.toLowerCase().includes(opt.value.toLowerCase()))) {
          stateSelect.value = opt.value;
          break;
        }
      }
    }
  }

  // Auto open modal if URL has ?create=true
  if (autoOpenCreate && createModal) {
    createModal.classList.add('active');
  }

  // Update State Pills active appearance
  function updatePillStates(activeState) {
    statePills.forEach(pill => {
      const pillState = pill.getAttribute('data-state') || '';
      if ((!activeState && !pillState) || (activeState && pillState.toLowerCase() === activeState.toLowerCase())) {
        pill.style.background = 'var(--primary)';
        pill.style.color = '#fff';
        pill.style.borderColor = 'var(--primary)';
      } else {
        pill.style.background = '#F1F5F9';
        pill.style.color = '#1E293B';
        pill.style.borderColor = '#CBD5E1';
      }
    });
  }

  // Setup pill click listeners
  statePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetState = pill.getAttribute('data-state') || '';
      if (stateSelect) {
        stateSelect.value = targetState;
      }
      updatePillStates(targetState);
      renderEvents();
    });
  });

  // Render Function for Events Directory
  function renderEvents() {
    let events = store.getActiveEvents();

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedState = stateSelect ? stateSelect.value.toLowerCase().trim() : '';
    const selectedSort = sortSelect ? sortSelect.value : 'upcoming';

    updatePillStates(selectedState);

    // Filter
    let filtered = events.filter(item => {
      if (!item) return false;
      const itemState = (item.state || '').toLowerCase();
      const itemVenue = (item.venue || '').toLowerCase();
      const itemCity = (item.city || '').toLowerCase();
      const itemAddress = (item.venueAddress || '').toLowerCase();
      const itemLocationStr = `${itemState} ${itemCity} ${itemVenue} ${itemAddress}`;

      // Search keyword matches title, state, venue, city, description, or organizer
      const matchSearch = !searchTerm ||
        itemLocationStr.includes(searchTerm) ||
        (item.title && String(item.title).toLowerCase().includes(searchTerm)) ||
        (item.description && String(item.description).toLowerCase().includes(searchTerm)) ||
        (item.organizer && String(item.organizer).toLowerCase().includes(searchTerm)) ||
        (item.category && String(item.category).toLowerCase().includes(searchTerm));

      // Nigerian State Filter
      const matchState = !selectedState ||
        itemState.includes(selectedState) ||
        itemLocationStr.includes(selectedState);

      return matchSearch && matchState;
    });

    // Sort
    if (selectedSort === 'price-low') {
      filtered.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
    } else if (selectedSort === 'price-high') {
      filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
    } else if (selectedSort === 'title') {
      filtered.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    } else {
      // Upcoming date sort
      filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }

    // Update Counter
    if (resultsCount) {
      const stateLabel = selectedState ? ` in ${selectedState.toUpperCase()}` : '';
      resultsCount.textContent = `${filtered.length} Live Event${filtered.length === 1 ? '' : 's'}${stateLabel}`;
    }

    if (filtered.length === 0) {
      eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--gray-300);">
          <i class="fa-solid fa-location-dot" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--dark); margin-bottom: 0.5rem;">No Events Found</h3>
          <p style="color: var(--dark-subtle); margin-bottom: 1.5rem;">No events match ${selectedState ? `state "${selectedState}"` : 'your search'}. Try searching another Nigerian state or clear filters.</p>
          <button id="reset-search-btn" class="btn btn-primary btn-sm">Show All Events</button>
        </div>
      `;
      document.getElementById('reset-search-btn')?.addEventListener('click', clearFilters);
      return;
    }

    eventsGrid.innerHTML = filtered.map(item => renderEventCard(item)).join('');
  }

  function renderEventCard(event) {
    const formattedDate = store.formatDate(event.date);
    const isTicketsOptional = event.ticketsOptional || event.startingPrice === 0 || (!event.tickets || event.tickets.length === 0 || event.tickets.every(t => !t.price || t.price === 0));
    const minPrice = event.startingPrice !== undefined ? event.startingPrice : (event.tickets ? Math.min(...Object.values(event.tickets).map(t => Number(t.price) || 0)) : 0);
    const formattedPrice = isTicketsOptional ? 'Free / RSVP' : store.formatCurrency(minPrice);
    const ctaText = isTicketsOptional ? 'View & RSVP' : 'Buy Tickets';
    const ctaIcon = isTicketsOptional ? 'fa-solid fa-circle-check' : 'fa-solid fa-ticket';

    const priceMeta = isTicketsOptional
      ? `<span class="badge" style="background: #10B981; color: #fff; font-size: 0.775rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 4px;"><i class="fa-solid fa-gift"></i> Free / RSVP</span>`
      : `From <strong style="color: var(--primary);">${formattedPrice}</strong>`;

    const stateDisplay = event.state || 'Nigeria';
    const locationDisplay = event.venue || event.venueAddress || 'Venue Location';

    return `
      <div class="event-card" style="border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden; background: var(--white); display: flex; flex-direction: column;">
        <div class="event-card-banner" style="position: relative; height: 190px; overflow: hidden;">
          <img src="${event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
          <span class="event-card-category" style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(4px);"><i class="fa-solid fa-location-dot" style="color: #38bdf8;"></i> ${stateDisplay}</span>
          <span style="position: absolute; top: 12px; right: 12px; background: #6366f1; color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;"><i class="fa-solid fa-calendar"></i> ${formattedDate}</span>
        </div>
        <div class="event-card-body" style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
          <h3 class="event-card-title" style="font-size: 1.15rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; line-height: 1.3;">${event.title}</h3>
          
          <p style="font-size: 0.825rem; color: var(--gray-600); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45;">
            ${event.description || ''}
          </p>

          <div style="background: var(--gray-50); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.825rem;">
            <div>
              <span style="color: var(--gray-500); display: block; font-size: 0.75rem;">State & Location</span>
              <strong style="color: var(--dark); font-weight: 800;"><i class="fa-solid fa-map-pin" style="color: var(--primary); font-size: 0.75rem;"></i> ${stateDisplay} &bull; ${locationDisplay}</strong>
            </div>
            <div style="text-align: right;">
              <span style="color: var(--gray-500); display: block; font-size: 0.75rem;">Time</span>
              <strong style="color: var(--primary); font-weight: 800;">${event.time || '18:00 WAT'}</strong>
            </div>
          </div>

          <div class="event-card-footer" style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
            <span class="event-organizer" style="font-size: 0.825rem; font-weight: 700; color: var(--dark-subtle);">
              ${priceMeta}
            </span>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; ${isTicketsOptional ? 'background: #10B981; border-color: #10B981;' : ''}">
              <i class="${ctaIcon}"></i> ${ctaText}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function clearFilters() {
    if (searchInput) searchInput.value = '';
    if (stateSelect) stateSelect.value = '';
    if (sortSelect) sortSelect.value = 'upcoming';
    updatePillStates('');
    renderEvents();
  }

  // Event Listeners for Filters
  searchInput?.addEventListener('input', renderEvents);
  stateSelect?.addEventListener('change', renderEvents);
  sortSelect?.addEventListener('change', renderEvents);
  clearBtn?.addEventListener('click', clearFilters);

  // Real-time update when events are approved in Control Panel
  window.addEventListener('bookam_store_updated', renderEvents);

  // Modal Setup
  if (openModalBtn && createModal) {
    openModalBtn.addEventListener('click', () => {
      createModal.classList.add('active');
      createModal.style.display = 'flex';
    });
  }
  if (closeModalBtn && createModal) {
    closeModalBtn.addEventListener('click', () => {
      createModal.classList.remove('active');
      createModal.style.display = 'none';
    });
  }
  if (createModal) {
    createModal.addEventListener('click', (e) => {
      if (e.target === createModal) {
        createModal.classList.remove('active');
        createModal.style.display = 'none';
      }
    });
  }

  // Initialize Replicated Comprehensive Create Event Form
  if (window.initBookamCreateEventForm) {
    window.initBookamCreateEventForm({
      formId: 'create-event-form',
      modalId: 'create-event-modal',
      onSuccess: (savedEvt) => {
        renderEvents();
      }
    });
  }

  // Initial render
  renderEvents();
});
