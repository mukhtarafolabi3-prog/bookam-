/**
 * BOOKAM - Event Details Page Logic (event-details.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id') || 'evt-101';
  const refParam = urlParams.get('ref') || sessionStorage.getItem(`bookam_active_ref_${eventId}`);
  const event = store.getEventById(eventId);

  if (!event) {
    window.location.href = 'events.html';
    return;
  }

  // Record referral click & show influencer referral banner if applicable
  let activeInfluencer = null;
  if (refParam) {
    store.recordInfluencerClick(eventId, refParam);
    sessionStorage.setItem(`bookam_active_ref_${eventId}`, refParam);
    const cleanRef = String(refParam).trim().toLowerCase().replace(/^@/, '');
    const eventInfluencers = store.getInfluencers(eventId);
    activeInfluencer = eventInfluencers.find(inf =>
      (inf.username && inf.username.toLowerCase() === cleanRef) ||
      (inf.promoCode && inf.promoCode.toLowerCase() === cleanRef) ||
      (inf.id && inf.id.toLowerCase() === cleanRef)
    );
  }

  const isExpired = !store.isEventActive(event);

  if (isExpired) {
    const mainContainer = document.querySelector('main') || document.body;
    const expiredBanner = document.createElement('div');
    expiredBanner.className = 'container';
    expiredBanner.style.marginTop = '1.5rem';
    expiredBanner.innerHTML = `
      <div style="background: var(--amber-100); border-left: 4px solid var(--amber-500); color: #92400E; padding: 1.25rem; border-radius: var(--radius-sm); font-size: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 1.5rem;"></i>
          <div>
            <strong>This Event Has Expired</strong>
            <p style="font-size: 0.875rem; margin: 0;">The date for this event (${store.formatDate(event.date)}) has passed. This event is no longer listed on the public website.</p>
          </div>
        </div>
        <a href="events.html" class="btn btn-primary btn-sm">Explore Active Events</a>
      </div>
    `;
    mainContainer.prepend(expiredBanner);
  } else if (String(event.status || event.onboardingStatus || '').toUpperCase() === 'PAUSED') {
    const mainContainer = document.querySelector('main') || document.body;
    const pausedBanner = document.createElement('div');
    pausedBanner.className = 'container';
    pausedBanner.style.marginTop = '1.5rem';
    pausedBanner.innerHTML = `
      <div style="background: #FFF7ED; border-left: 4px solid #F97316; color: #9A3412; padding: 1.25rem; border-radius: var(--radius-sm); font-size: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <i class="fa-solid fa-circle-pause" style="font-size: 1.5rem;"></i>
          <div>
            <strong>Ticket Sales Temporarily Paused</strong>
            <p style="font-size: 0.875rem; margin: 0;">Online ticket sales for this event are temporarily paused. Please check back shortly.</p>
          </div>
        </div>
        <a href="events.html" class="btn btn-primary btn-sm">Explore Active Events</a>
      </div>
    `;
    mainContainer.prepend(pausedBanner);
  } else if (activeInfluencer && activeInfluencer.status === 'Active') {
    const mainContainer = document.querySelector('main') || document.body;
    const discountText = activeInfluencer.discountType === 'percentage' ? `${activeInfluencer.discountValue}% OFF` : `₦${activeInfluencer.discountValue.toLocaleString()} OFF`;
    const refBanner = document.createElement('div');
    refBanner.className = 'container';
    refBanner.style.marginTop = '1.25rem';
    refBanner.innerHTML = `
      <div style="background: #F3E8FF; border-left: 4px solid var(--primary); color: #581C87; padding: 1rem 1.25rem; border-radius: var(--radius-sm); font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;">
            ${activeInfluencer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>Referred by ${activeInfluencer.name} (@${activeInfluencer.username})</strong>
            <p style="font-size: 0.85rem; margin: 0; color: #6B21A8;">
              Your promo code <code style="background: white; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 800; color: var(--primary);">${activeInfluencer.promoCode}</code> gives you <strong>${discountText}</strong> at checkout!
            </p>
          </div>
        </div>
        <span class="badge badge-purple" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
          <i class="fa-solid fa-gift"></i> Promo Active
        </span>
      </div>
    `;
    mainContainer.prepend(refBanner);
  }

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

  // Populate Banner & Main Details
  const bannerImg = document.getElementById('details-banner-img');
  const catBadge = document.getElementById('details-category-badge');
  const eventTitle = document.getElementById('details-title');
  const eventDate = document.getElementById('details-date');
  const eventTime = document.getElementById('details-time');
  const eventVenue = document.getElementById('details-venue');
  const eventOrganizer = document.getElementById('details-organizer');
  const eventDescription = document.getElementById('details-description');
  const highlightsContainer = document.getElementById('details-highlights');

  if (bannerImg) bannerImg.src = event.banner;
  if (catBadge) catBadge.textContent = event.category;
  if (eventTitle) eventTitle.textContent = event.title;
  if (eventDate) eventDate.textContent = store.formatDate(event.date);
  if (eventTime) eventTime.textContent = event.time;
  if (eventVenue) eventVenue.textContent = event.venue;
  if (eventOrganizer) eventOrganizer.textContent = event.organizer;
  if (eventDescription) eventDescription.textContent = event.description;

  // Highlights
  if (highlightsContainer && event.highlights) {
    highlightsContainer.innerHTML = event.highlights.map(h => `
      <li>
        <i class="fa-solid fa-circle-check"></i>
        <span>${h}</span>
      </li>
    `).join('');
  }

  // Ticket Options Selection
  const ticketOptionsContainer = document.getElementById('ticket-options-container');
  let selectedTicketType = event.tickets && event.tickets[0] ? event.tickets[0].type : 'Early bird';
  const revealedPrices = new Set(); // Track tiers where user clicked to view payment price

  function renderTicketOptions() {
    if (!ticketOptionsContainer) return;

    // Ensure we have tickets available
    let ticketsList = (event.tickets && event.tickets.length > 0)
      ? event.tickets
      : store.createDefaultTicketTiers();

    if (event.title && event.title.toLowerCase().includes('better marriages')) {
      ticketsList = [
        {
          type: 'First Wave',
          name: 'First Wave Ticket',
          price: 5000,
          benefits: ['First Wave Admission', 'Standard Venue Access', 'Fast-track Entry']
        }
      ];
      selectedTicketType = 'First Wave';
    }

    ticketOptionsContainer.innerHTML = ticketsList.map(t => {
      const isSelected = t.type === selectedTicketType;
      const isRevealed = revealedPrices.has(t.type);

      // Check Early Bird Expiry
      const isEarlyBird = (t.type && String(t.type).toLowerCase().includes('early bird')) || (t.name && String(t.name).toLowerCase().includes('early bird'));
      const endDateVal = t.endDate || (isEarlyBird ? event.earlyBirdEndDate : null);
      let isEarlyBirdExpired = false;
      let formattedEndDate = '';

      if (isEarlyBird && endDateVal) {
        const expDate = new Date(endDateVal);
        if (!isNaN(expDate.getTime())) {
          isEarlyBirdExpired = new Date() > expDate;
          formattedEndDate = expDate.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      }

      return `
        <div class="ticket-type-option ${isSelected ? 'selected' : ''} ${isEarlyBirdExpired ? 'expired-tier' : ''}" data-type="${t.type}" style="${isEarlyBirdExpired ? 'opacity: 0.85; border-color: #CBD5E1; background: #F8FAFC;' : ''}">
          <div class="ticket-type-header">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <input type="radio" name="ticket_selection" value="${t.type}" ${isSelected ? 'checked' : ''} />
              <span class="ticket-type-title">${t.name || t.type}</span>
              ${isEarlyBird && formattedEndDate ? (
                isEarlyBirdExpired
                  ? `<span style="font-size: 0.725rem; background: #FEE2E2; color: #991B1B; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700; border: 1px solid #FCA5A5;"><i class="fa-solid fa-clock"></i> Ended ${formattedEndDate}</span>`
                  : `<span style="font-size: 0.725rem; background: #FEF3C7; color: #92400E; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700; border: 1px solid #FCD34D;"><i class="fa-solid fa-hourglass-half"></i> Ends ${formattedEndDate}</span>`
              ) : ''}
            </div>
            
            ${isRevealed ? `
              <span class="ticket-type-price" style="color: var(--primary); font-weight: 800;">
                ${store.formatCurrency(t.price)}
              </span>
            ` : `
              <button type="button" class="btn-reveal-price" data-type="${t.type}">
                <i class="fa-solid fa-eye"></i> View Price for Payment
              </button>
            `}
          </div>
          <ul class="ticket-type-benefits">
            ${(t.benefits || []).map(b => `<li><i class="fa-solid fa-check"></i> ${b}</li>`).join('')}
          </ul>
        </div>
      `;
    }).join('');

    // Attach option click handlers
    document.querySelectorAll('.ticket-type-option').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-reveal-price')) return; // handled separately
        selectedTicketType = card.dataset.type;
        renderTicketOptions();
      });
    });

    // Attach reveal price button handlers
    document.querySelectorAll('.btn-reveal-price').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        revealedPrices.add(type);
        selectedTicketType = type;
        renderTicketOptions();
      });
    });
  }

  renderTicketOptions();

  // Listen for realtime store updates from Firestore
  window.addEventListener('bookam_store_updated', () => {
    const freshEvent = store.getEventById(eventId);
    if (freshEvent) {
      Object.assign(event, freshEvent);
      if (event.tickets && event.tickets.length > 0) {
        if (!event.tickets.some(t => t.type === selectedTicketType)) {
          selectedTicketType = event.tickets[0].type;
        }
      }
      renderTicketOptions();
    }
  });

  // Buy Ticket CTA Button
  const buyTicketBtn = document.getElementById('buy-ticket-btn');
  if (buyTicketBtn) {
    if (isExpired) {
      buyTicketBtn.disabled = true;
      buyTicketBtn.style.opacity = '0.5';
      buyTicketBtn.style.cursor = 'not-allowed';
      buyTicketBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Event Ended';
    } else {
      buyTicketBtn.addEventListener('click', () => {
        const refQuery = refParam ? `&ref=${encodeURIComponent(refParam)}` : '';
        window.location.href = `buy-ticket.html?id=${event.id}&type=${selectedTicketType}${refQuery}`;
      });
    }
  }

  // Call For Ambassadors - Personal Ticket Link & QR Generator
  const inlineHandleInput = document.getElementById('inline-ambassador-handle');
  const btnInlineGen = document.getElementById('btn-inline-gen-link');
  const inlineResultBox = document.getElementById('inline-link-result');
  const inlineTicketUrl = document.getElementById('inline-ticket-url');
  const btnInlineCopy = document.getElementById('btn-inline-copy');
  const inlineQrImg = document.getElementById('inline-qr-preview');
  const inlineShareWa = document.getElementById('inline-share-wa');
  const inlineViewAdPoster = document.getElementById('inline-view-ad-poster');
  const btnFullPortal = document.getElementById('btn-full-ambassador-portal');

  if (btnFullPortal) {
    btnFullPortal.href = `careers.html?event=${encodeURIComponent(event.id)}`;
  }

  if (inlineHandleInput && refParam) {
    inlineHandleInput.value = String(refParam).replace(/^@/, '');
  }

  function generateInlineAmbassadorLink() {
    let handle = inlineHandleInput ? inlineHandleInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
    if (!handle) handle = 'ambassador';

    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://bookam.ng';
    const pathParts = window.location.pathname.split('/');
    pathParts.pop();
    const basePath = pathParts.join('/');
    const pathPrefix = basePath.endsWith('/') ? basePath : (basePath ? `${basePath}/` : '/');

    const personalTicketUrl = `${origin}${pathPrefix}buy-ticket.html?id=${encodeURIComponent(event.id)}&ref=${encodeURIComponent(handle)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(personalTicketUrl)}`;

    if (inlineTicketUrl) inlineTicketUrl.value = personalTicketUrl;
    if (inlineQrImg) inlineQrImg.src = qrUrl;

    if (inlineShareWa) {
      const waMsg = encodeURIComponent(`🎟️ Get tickets for ${event.title} directly with my personal ambassador link: ${personalTicketUrl}`);
      inlineShareWa.href = `https://wa.me/?text=${waMsg}`;
    }

    if (inlineViewAdPoster) {
      inlineViewAdPoster.href = `careers.html?event=${encodeURIComponent(event.id)}&ref=${encodeURIComponent(handle)}`;
    }

    if (btnFullPortal) {
      btnFullPortal.href = `careers.html?event=${encodeURIComponent(event.id)}&ref=${encodeURIComponent(handle)}`;
    }

    if (inlineResultBox) {
      inlineResultBox.style.display = 'block';
    }
  }

  if (btnInlineGen) {
    btnInlineGen.addEventListener('click', generateInlineAmbassadorLink);
  }

  if (btnInlineCopy && inlineTicketUrl) {
    btnInlineCopy.addEventListener('click', () => {
      inlineTicketUrl.select();
      navigator.clipboard.writeText(inlineTicketUrl.value).then(() => {
        const originalText = btnInlineCopy.innerHTML;
        btnInlineCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btnInlineCopy.classList.remove('btn-primary');
        btnInlineCopy.classList.add('btn-secondary');
        setTimeout(() => {
          btnInlineCopy.innerHTML = originalText;
          btnInlineCopy.classList.remove('btn-secondary');
          btnInlineCopy.classList.add('btn-primary');
        }, 2000);
      });
    });
  }
});
