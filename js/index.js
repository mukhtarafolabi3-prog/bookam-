/**
 * BOOKAM - Landing Page Logic (index.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const featuredGrid = document.getElementById('featured-events-grid');
  const upcomingGrid = document.getElementById('upcoming-events-grid');
  const filterTabs = document.querySelectorAll('.filter-tab');

  // Mobile Drawer Setup
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('active'));
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('active'));
  }

  // --- Hero Carousel Slider Logic ---
  const heroSlides = document.querySelectorAll('.hero-slide');
  const sliderDots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const heroSlider = document.getElementById('hero-slider');

  let currentSlideIndex = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (heroSlides.length === 0) return;

    if (index < 0) {
      currentSlideIndex = heroSlides.length - 1;
    } else if (index >= heroSlides.length) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlideIndex);
    });

    sliderDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlideIndex);
    });
  }

  function nextSlide() {
    showSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    showSlide(currentSlideIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, 4500);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (heroSlides.length > 0) {
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoplay();
      });
    }

    sliderDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) {
          showSlide(idx);
          startAutoplay();
        }
      });
    });

    if (heroSlider) {
      heroSlider.addEventListener('mouseenter', stopAutoplay);
      heroSlider.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
  }

  // Load Contests & Events from store
  const featuredContestsGrid = document.getElementById('featured-contests-grid');
  const featuredEventsGrid = document.getElementById('featured-events-grid');
  const searchForm = document.getElementById('hero-search-form');

  // Helper function to render Contest card HTML
  function renderContestCard(contest) {
    const contestants = contest.contestants || [];
    const totalVotes = contestants.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);
    const votePriceStr = store.formatCurrency(contest.votePrice || 100);

    return `
      <div class="event-card" style="border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden; background: var(--white); display: flex; flex-direction: column;">
        <div class="event-card-banner" style="position: relative; height: 180px; overflow: hidden;">
          <img src="${contest.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${contest.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
          <span class="event-card-category" style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(4px);"><i class="fa-solid fa-trophy"></i> ${contest.category || 'Contest'}</span>
          <span style="position: absolute; top: 12px; right: 12px; background: #10b981; color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;"><i class="fa-solid fa-signal"></i> Voting Open</span>
        </div>
        <div class="event-card-body" style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
          <h3 class="event-card-title" style="font-size: 1.1rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; line-height: 1.3;">${contest.title}</h3>
          
          <p style="font-size: 0.825rem; color: var(--gray-600); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45;">
            ${contest.description || 'Cast verified votes for your favorite contestant in this live competition.'}
          </p>

          <div style="background: var(--gray-50); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.825rem;">
            <div>
              <span style="color: var(--gray-500); display: block; font-size: 0.75rem;">Nominees</span>
              <strong style="color: var(--dark); font-weight: 800;">${contestants.length} Contestants</strong>
            </div>
            <div style="text-align: right;">
              <span style="color: var(--gray-500); display: block; font-size: 0.75rem;">Total Votes</span>
              <strong style="color: var(--primary); font-weight: 800;">${totalVotes.toLocaleString()}</strong>
            </div>
          </div>

          <div class="event-card-footer" style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
            <span class="event-organizer" style="font-size: 0.8rem; font-weight: 700; color: var(--dark-subtle);">
              <i class="fa-solid fa-shield-check" style="color: var(--primary);"></i> ${votePriceStr} / Vote
            </span>
            <a href="contest-details.html?id=${contest.id}" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700;">
              <i class="fa-solid fa-vote-yea"></i> Vote / Leaderboard
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Helper function to render Event card HTML
  function renderEventCard(event) {
    const formattedDate = store.formatDate(event.date);
    const isFreeOrOptional = event.ticketsOptional || event.startingPrice === 0 || (event.tickets && event.tickets.length > 0 && event.tickets.every(t => !t.price || t.price === 0));
    const price = event.startingPrice !== undefined ? event.startingPrice : (event.standardPrice || 0);
    const priceBadge = isFreeOrOptional
      ? `<span style="position: absolute; top: 12px; right: 12px; background: #10B981; color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;"><i class="fa-solid fa-gift"></i> Free / RSVP</span>`
      : `<span style="position: absolute; top: 12px; right: 12px; background: var(--primary); color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">From ${store.formatCurrency(price)}</span>`;

    const ctaLabel = isFreeOrOptional ? 'RSVP / Free Ticket' : 'Buy Ticket';

    return `
      <div class="event-card" style="border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden; background: var(--white); display: flex; flex-direction: column;">
        <div class="event-card-banner" style="position: relative; height: 180px; overflow: hidden;">
          <img src="${event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
          <span class="event-card-category" style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #fff; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(4px);"><i class="fa-solid fa-ticket"></i> ${event.category || 'Live Event'}</span>
          ${priceBadge}
        </div>
        <div class="event-card-body" style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
          <h3 class="event-card-title" style="font-size: 1.1rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; line-height: 1.3;">${event.title}</h3>
          
          <div class="event-card-meta" style="margin-bottom: 1rem; font-size: 0.825rem; color: var(--gray-600); display: flex; flex-direction: column; gap: 0.3rem;">
            <div>
              <i class="fa-regular fa-calendar" style="color: var(--primary);"></i>
              <span>${formattedDate} • ${event.time || '18:00'}</span>
            </div>
            <div>
              <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i>
              <span>${event.venue || 'Venue Location'}, ${event.city || 'Lagos'}</span>
            </div>
          </div>

          <div class="event-card-footer" style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
            <span class="event-organizer" style="font-size: 0.75rem; font-weight: 600; color: var(--dark-subtle);">
              <i class="fa-solid fa-building"></i> ${event.organizer || 'Organized Event'}
            </span>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-sm" style="font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem; ${isFreeOrOptional ? 'background: #10B981; border-color: #10B981;' : ''}">
              <i class="fa-solid fa-ticket"></i> ${ctaLabel}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Unified Render function for featured events & contests
  function renderFeaturedContent() {
    const activeContests = store.getActiveContests ? store.getActiveContests() : store.getContests().filter(c => c.status === 'Active');
    const activeEvents = store.getActiveEvents ? store.getActiveEvents() : store.getEvents().filter(e => store.isEventActive(e));

    // Render Featured Contests
    if (featuredContestsGrid) {
      if (activeContests.length === 0) {
        featuredContestsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 2rem; background: rgba(255,255,255,0.05); border-radius: var(--radius-md); border: 1px dashed rgba(255,255,255,0.2);">
            <i class="fa-solid fa-trophy" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">No Active Contests Live</h3>
            <p style="color: #94a3b8; margin-bottom: 1.5rem;">
              Host a new voting contest right now or approve pending contests in the Control Panel!
            </p>
            <button type="button" class="btn btn-primary btn-sm" id="btn-empty-create-contest" style="background: #F59E0B; border-color: #F59E0B; color: #000; font-weight: 800;">
              <i class="fa-solid fa-trophy"></i> Create Contest Now
            </button>
          </div>
        `;
        document.getElementById('btn-empty-create-contest')?.addEventListener('click', openContestModal);
      } else {
        featuredContestsGrid.innerHTML = activeContests.slice(0, 6).map(c => renderContestCard(c)).join('');
      }
    }

    // Render Featured Events
    if (featuredEventsGrid) {
      if (activeEvents.length === 0) {
        featuredEventsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 2rem; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--gray-300);">
            <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem;">No Live Events Listed</h3>
            <p style="color: var(--dark-subtle); margin-bottom: 1.5rem;">
              Publish an event right now from the homepage or approve pending events in the Master Control Panel!
            </p>
            <button type="button" class="btn btn-primary btn-sm" id="btn-empty-create-event" style="font-weight: 800;">
              <i class="fa-solid fa-plus-circle"></i> Create Event Now
            </button>
          </div>
        `;
        document.getElementById('btn-empty-create-event')?.addEventListener('click', openEventModal);
      } else {
        featuredEventsGrid.innerHTML = activeEvents.slice(0, 12).map(e => renderEventCard(e)).join('');
      }
    }
  }

  // Initial render
  renderFeaturedContent();

  // Re-render automatically when control panel approves or store updates
  window.addEventListener('bookam_store_updated', renderFeaturedContent);

  // ================= MODAL CONTROLLERS & BUTTON WIRING =================
  const eventModal = document.getElementById('home-create-event-modal');
  const contestModal = document.getElementById('home-create-contest-modal');
  const ticketModal = document.getElementById('home-ticket-modal');
  const venueRfpModal = document.getElementById('home-venue-rfp-modal');

  function openEventModal() {
    if (eventModal) {
      eventModal.classList.add('active');
      const dateInput = document.getElementById('home-event-date');
      if (dateInput && !dateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
    }
  }

  function closeEventModal() {
    if (eventModal) eventModal.classList.remove('active');
  }

  function openContestModal() {
    if (contestModal) {
      contestModal.classList.add('active');
      const endDateInput = document.getElementById('home-contest-end-date');
      if (endDateInput && !endDateInput.value) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 14);
        endDateInput.value = futureDate.toISOString().split('T')[0];
      }
    }
  }

  function closeContestModal() {
    if (contestModal) contestModal.classList.remove('active');
  }

  function openTicketModal() {
    if (ticketModal) {
      ticketModal.classList.add('active');
      const queryInput = document.getElementById('input-ticket-query');
      if (queryInput) {
        queryInput.focus();
      }
    }
  }

  function closeTicketModal() {
    if (ticketModal) ticketModal.classList.remove('active');
  }

  function openVenueRfpModal(hallName = '') {
    if (venueRfpModal) {
      venueRfpModal.classList.add('active');
      if (hallName) {
        const hallSelect = document.getElementById('rfp-hall');
        if (hallSelect) {
          for (let opt of hallSelect.options) {
            if (opt.value.includes(hallName) || hallName.includes(opt.value)) {
              hallSelect.value = opt.value;
              break;
            }
          }
        }
      }
      const dateInput = document.getElementById('rfp-date');
      if (dateInput && !dateInput.value) {
        const future = new Date();
        future.setDate(future.getDate() + 30);
        dateInput.value = future.toISOString().split('T')[0];
      }
    }
  }

  function closeVenueRfpModal() {
    if (venueRfpModal) venueRfpModal.classList.remove('active');
  }

  // Expose globally for inline onclick handlers on venue cards
  window.openVenueRfpModal = openVenueRfpModal;
  window.closeVenueRfpModal = closeVenueRfpModal;
  window.openTicketModal = openTicketModal;
  window.closeTicketModal = closeTicketModal;

  // Wire all buttons that trigger Create Event
  const createEventButtons = [
    'btn-header-create-event',
    'btn-drawer-create-event',
    'btn-hero-create-event',
    'btn-section-create-event',
    'btn-spotlight-create-event',
    'btn-why-choose-create'
  ];

  createEventButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mobileNav) mobileNav.classList.remove('active');
        openEventModal();
      });
    }
  });

  // Wire all buttons that trigger Create Contest
  const createContestButtons = [
    'btn-header-create-contest',
    'btn-drawer-create-contest',
    'btn-hero-create-contest',
    'btn-section-create-contest',
    'btn-spotlight-create-contest'
  ];

  createContestButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mobileNav) mobileNav.classList.remove('active');
        openContestModal();
      });
    }
  });

  // Wire Find My Ticket triggers
  const findTicketTriggers = [
    'top-btn-find-ticket',
    'nav-btn-find-ticket',
    'drawer-btn-find-ticket',
    'btn-hero-find-ticket',
    'footer-btn-find-ticket'
  ];

  findTicketTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (mobileNav) mobileNav.classList.remove('active');
        openTicketModal();
      });
    }
  });

  // Close buttons
  document.getElementById('btn-close-home-event-modal')?.addEventListener('click', closeEventModal);
  document.getElementById('btn-cancel-home-event')?.addEventListener('click', closeEventModal);
  document.getElementById('btn-close-home-contest-modal')?.addEventListener('click', closeContestModal);
  document.getElementById('btn-cancel-home-contest')?.addEventListener('click', closeContestModal);
  document.getElementById('btn-close-ticket-modal')?.addEventListener('click', closeTicketModal);
  document.getElementById('btn-close-venue-rfp-modal')?.addEventListener('click', closeVenueRfpModal);
  document.getElementById('btn-cancel-venue-rfp')?.addEventListener('click', closeVenueRfpModal);

  // Helper: File to DataURL reader
  function setupImageUploader({ fileInputId, dropzoneId, urlInputId, previewBoxId, previewImgId, removeBtnId }) {
    const fileInput = document.getElementById(fileInputId);
    const dropzone = document.getElementById(dropzoneId);
    const urlInput = document.getElementById(urlInputId);
    const previewBox = document.getElementById(previewBoxId);
    const previewImg = document.getElementById(previewImgId);
    const removeBtn = document.getElementById(removeBtnId);

    const isLikelyImageFile = (file) => {
      if (!file) return false;
      const hasImageType = !!(file.type && file.type.startsWith('image/'));
      const hasImageExtension = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name || '');
      return hasImageType || hasImageExtension;
    };

    function updatePreview(src) {
      if (src) {
        if (previewImg) previewImg.src = src;
        if (previewBox) previewBox.style.display = 'block';
        if (urlInput) urlInput.value = src;
      } else {
        if (previewBox) previewBox.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (urlInput) urlInput.value = '';
        if (fileInput) fileInput.value = '';
      }
    }

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isLikelyImageFile(file)) {
          alert('Please select a valid image file (PNG, JPG, WebP, SVG).');
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          alert('Image size exceeds 25MB limit. Please upload a smaller image.');
          return;
        }
        try {
          let dataUrl = '';
          if (window.compressImageFile) {
            dataUrl = await window.compressImageFile(file, 1200, 1200, 0.82);
          } else {
            dataUrl = await new Promise((resolve, reject) => {
              const r = new FileReader();
              r.onload = ev => resolve(ev.target.result);
              r.onerror = reject;
              r.readAsDataURL(file);
            });
          }
          updatePreview(dataUrl);
          showToast('Image uploaded and optimized!');
        } catch (err) {
          console.error('Image compression error:', err);
          alert('Failed to process image file.');
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        const val = urlInput.value.trim();
        if (val) {
          updatePreview(val);
        } else {
          if (previewBox) previewBox.style.display = 'none';
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        updatePreview('');
      });
    }

    if (dropzone) {
      dropzone.addEventListener('click', (e) => {
        if (e.target.closest('#btn-org-remove-banner')) return;
        if (fileInput) {
          fileInput.click();
        }
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = 'var(--primary)';
          dropzone.style.background = '#EEF2FF';
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = '#CBD5E1';
          dropzone.style.background = '';
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && isLikelyImageFile(file)) {
          if (fileInput) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change'));
          }
        } else {
          alert('Please drop a valid image file (PNG, JPG, WebP, SVG).');
        }
      });
    }
  }

  // Initialize uploaders for home modals
  setupImageUploader({
    fileInputId: 'home-event-banner-file',
    dropzoneId: 'home-event-dropzone',
    urlInputId: 'home-event-banner',
    previewBoxId: 'home-event-banner-preview-box',
    previewImgId: 'home-event-banner-preview-img',
    removeBtnId: 'btn-remove-home-banner'
  });

  setupImageUploader({
    fileInputId: 'home-contest-banner-file',
    dropzoneId: 'home-contest-dropzone',
    urlInputId: 'home-contest-banner',
    previewBoxId: 'home-contest-banner-preview-box',
    previewImgId: 'home-contest-banner-preview-img',
    removeBtnId: 'btn-remove-home-contest-banner'
  });

  // Click outside to close
  window.addEventListener('click', (e) => {
    if (e.target === eventModal) closeEventModal();
    if (e.target === contestModal) closeContestModal();
    if (e.target === ticketModal) closeTicketModal();
    if (e.target === venueRfpModal) closeVenueRfpModal();
  });

  // ================= FIND MY TICKET SEARCH LOGIC =================
  const formFindTicket = document.getElementById('form-find-ticket');
  const ticketResultBox = document.getElementById('ticket-search-result');

  if (formFindTicket && ticketResultBox) {
    formFindTicket.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('input-ticket-query')?.value.trim();
      if (!query) return;

      const matches = store.searchTickets ? store.searchTickets(query) : [];

      if (matches.length === 0) {
        ticketResultBox.style.display = 'block';
        ticketResultBox.innerHTML = `
          <div style="background: #FEF2F2; border: 1px solid #F87171; border-radius: 8px; padding: 1.25rem; text-align: center; color: #991B1B;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <h4 style="font-weight: 800; font-size: 1rem; margin-bottom: 0.25rem;">No Passes Found for "${query}"</h4>
            <p style="font-size: 0.8rem; margin-bottom: 0.75rem;">
              Double check your Reference ID (e.g. <strong>BKM-2026-000101</strong>) or the email address used during booking.
            </p>
            <div style="font-size: 0.75rem; color: #7F1D1D; background: #FEE2E2; padding: 0.5rem; border-radius: 4px;">
              Try demo references: 
              <button type="button" class="btn btn-sm" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; margin: 0 0.2rem;" onclick="document.getElementById('input-ticket-query').value='BKM-2026-000101'; document.getElementById('form-find-ticket').dispatchEvent(new Event('submit'));">BKM-2026-000101</button>
              or 
              <button type="button" class="btn btn-sm" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; margin: 0 0.2rem;" onclick="document.getElementById('input-ticket-query').value='mukhtarafolabi3@gmail.com'; document.getElementById('form-find-ticket').dispatchEvent(new Event('submit'));">mukhtarafolabi3@gmail.com</button>
            </div>
          </div>
        `;
        return;
      }

      ticketResultBox.style.display = 'block';
      ticketResultBox.innerHTML = `
        <div style="margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--gray-600); font-weight: 700;">
          Found ${matches.length} Verified Digital Pass${matches.length > 1 ? 'es' : ''}:
        </div>
        ${matches.map(ticket => `
          <div class="ticket-pass-card" style="margin-bottom: 1rem;">
            <div class="ticket-pass-header">
              <div>
                <span class="ticket-pass-brand">
                  <i class="fa-solid fa-crown" style="color: #D4AF37;"></i> LANDMARK PRESTIGE ACCESS
                </span>
                <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0 0;">
                  ${ticket.eventName}
                </h4>
              </div>
              <span class="ticket-status-badge status-active">
                <i class="fa-solid fa-check-double"></i> VERIFIED ACTIVE PASS
              </span>
            </div>

            <div class="ticket-pass-body">
              <div>
                <div class="ticket-spec-group">
                  <label>PASS HOLDER / ATTENDEE</label>
                  <div class="val" style="font-size: 1.05rem; font-weight: 800;">${ticket.customerName}</div>
                </div>
                <div class="ticket-spec-group">
                  <label>EMAIL / REGISTRATION</label>
                  <div class="val">${ticket.customerEmail}</div>
                </div>
                <div class="ticket-spec-group">
                  <label>DATE & TIME</label>
                  <div class="val">
                    <i class="fa-regular fa-calendar" style="color: var(--primary);"></i> ${ticket.eventDate} • ${ticket.eventTime || '09:00 AM'}
                  </div>
                </div>
                <div class="ticket-spec-group">
                  <label>VENUE LOCATION</label>
                  <div class="val" style="font-size: 0.825rem;">
                    <i class="fa-solid fa-location-dot" style="color: #D4AF37;"></i> ${ticket.eventVenue || 'Landmark Centre, Victoria Island, Lagos'}
                  </div>
                </div>
                <div class="ticket-spec-group">
                  <label>PASS TIER & QTY</label>
                  <div class="val" style="color: #B45309; font-weight: 800;">
                    ${ticket.ticketType || 'Standard Entry'} (${ticket.quantity || 1} Person${(ticket.quantity || 1) > 1 ? 's' : ''})
                  </div>
                </div>
              </div>

              <div class="ticket-qr-section">
                <div class="ticket-qr-code">
                  <i class="fa-solid fa-qrcode" style="font-size: 5rem; color: #0A1128;"></i>
                </div>
                <div style="font-family: monospace; font-size: 0.725rem; font-weight: 800; color: #0A1128;">
                  ${ticket.id}
                </div>
                <span class="ticket-barcode-label">
                  <i class="fa-solid fa-shield-halved" style="color: #10B981;"></i> Cryptographically Sealed
                </span>
                <button type="button" class="btn btn-sm" style="width: 100%; justify-content: center; font-size: 0.75rem; background: #0A1128; color: #fff; border-radius: 4px;" onclick="window.print()">
                  <i class="fa-solid fa-print"></i> Print / Save Pass
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      `;
    });
  }

  // ================= VENUE RFP SUBMISSION =================
  const formVenueRfp = document.getElementById('form-venue-rfp');
  if (formVenueRfp) {
    formVenueRfp.addEventListener('submit', (e) => {
      e.preventDefault();
      const hall = document.getElementById('rfp-hall')?.value;
      const type = document.getElementById('rfp-type')?.value;
      const attendees = document.getElementById('rfp-attendees')?.value;
      const date = document.getElementById('rfp-date')?.value;
      const days = document.getElementById('rfp-days')?.value;
      const name = document.getElementById('rfp-name')?.value.trim();
      const email = document.getElementById('rfp-email')?.value.trim();
      const phone = document.getElementById('rfp-phone')?.value.trim();
      const notes = document.getElementById('rfp-notes')?.value.trim();

      const rfpRecord = {
        hall,
        type,
        attendees,
        date,
        days,
        name,
        email,
        phone,
        notes
      };

      const created = store.saveVenueRfp ? store.saveVenueRfp(rfpRecord) : { id: 'RFP-' + Date.now().toString().slice(-6) };
      formVenueRfp.reset();
      closeVenueRfpModal();

      showToast(`Venue RFP ${created.id} submitted for Landmark Africa! We will contact you within 24 hours.`);
      alert(`🏛️ Landmark Africa RFP Submitted Successfully!\n\nReference: ${created.id}\nVenue: ${hall}\nExpected Date: ${date} (${days} Days)\nAttendees: ${attendees}\n\nOur convention sales team and banquet managers have received your inquiry. We will contact you at ${email} with floor plans, power provisions, and catering tariffs.`);
    });
  }

  // Auto-set early bird expiry default in Home create event modal
  // ================= CREATE EVENT (REPLICATED ORGANIZER DASHBOARD FORM) =================
  if (window.initBookamCreateEventForm) {
    window.initBookamCreateEventForm({
      formId: 'create-event-form',
      modalId: 'home-create-event-modal',
      onSuccess: (savedEvt) => {
        closeEventModal();
        if (typeof renderFeaturedContent === 'function') renderFeaturedContent();
        showToast(`🎉 Event "${savedEvt?.title || 'Event'}" is now LIVE on BOOKAM!`);
      }
    });
  }

  // ================= FORM SUBMISSION: CREATE CONTEST =================
  const formHomeCreateContest = document.getElementById('form-home-create-contest');
  if (formHomeCreateContest) {
    formHomeCreateContest.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('home-contest-title')?.value.trim();
      const category = document.getElementById('home-contest-category')?.value;
      const host = document.getElementById('home-contest-host')?.value.trim();
      const email = document.getElementById('home-contest-email')?.value.trim();
      const phone = document.getElementById('home-contest-phone')?.value.trim();
      const votePrice = parseFloat(document.getElementById('home-contest-vote-price')?.value) || 100;
      const endDate = document.getElementById('home-contest-end-date')?.value;
      const banner = document.getElementById('home-contest-banner')?.value.trim() || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80';
      const description = document.getElementById('home-contest-description')?.value.trim() || 'Live voting contest on BOOKAM.';

      const contestants = [];
      const nom1 = document.getElementById('home-nominee-1')?.value.trim();
      const nom2 = document.getElementById('home-nominee-2')?.value.trim();
      const nom3 = document.getElementById('home-nominee-3')?.value.trim();
      const nom4 = document.getElementById('home-nominee-4')?.value.trim();

      if (nom1) contestants.push({ id: 'nom-' + Date.now() + '-1', name: nom1, category: category || 'Nominee', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', votes: 0, status: 'Active' });
      if (nom2) contestants.push({ id: 'nom-' + Date.now() + '-2', name: nom2, category: category || 'Nominee', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', votes: 0, status: 'Active' });
      if (nom3) contestants.push({ id: 'nom-' + Date.now() + '-3', name: nom3, category: category || 'Nominee', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', votes: 0, status: 'Active' });
      if (nom4) contestants.push({ id: 'nom-' + Date.now() + '-4', name: nom4, category: category || 'Nominee', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', votes: 0, status: 'Active' });

      const newContest = {
        id: 'contest-' + Date.now(),
        title,
        category,
        organizer: host,
        host,
        hostEmail: email,
        hostPhone: phone,
        votePrice,
        endDate,
        status: 'Pending Review',
        banner,
        description,
        contestants,
        createdAt: new Date().toISOString()
      };

      store.saveContest(newContest);
      store.addAuditLog('SUBMIT_CONTEST', host, `Submitted contest "${title}" from Homepage for Admin Approval`);
      formHomeCreateContest.reset();
      closeContestModal();
      showToast(`Contest "${title}" submitted! Once approved in the Control Panel, voting will go live.`);
      alert(`🏆 Contest "${title}" Submitted Successfully!\n\nYour contest is now queued in the Master Control Panel under "Contest Approvals & Registry".\n\nOnce the Super Admin clicks "Approve", live voting will open immediately across the website!`);
    });
  }

  // Search Form Submit
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyword = document.getElementById('search-keyword')?.value.trim() || '';
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.set('search', keyword);
      window.location.href = `events.html?${queryParams.toString()}`;
    });
  }
});

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
window.showToast = showToast;
