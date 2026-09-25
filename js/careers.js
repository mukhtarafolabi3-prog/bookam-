/**
 * BOOKAM - Ambassador Network & Careers Controller
 * Handles Call for Ambassadors, Advertisement Side QR Code,
 * and Personal Ticket Link Generation Engine.
 */

import './store.js';

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;

  // Base path resolution for local dev & hosted environments
  const origin = window.location.origin;
  const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

  // Mode Switcher Tabs (Personal Ticket Link vs Application Form)
  const tabBtnCreateLink = document.getElementById('tab-btn-create-link');
  const tabBtnApplyForm = document.getElementById('tab-btn-apply-form');
  const viewCreateTicketLink = document.getElementById('view-personal-ticket-link');
  const viewAmbassadorApp = document.getElementById('view-ambassador-application');

  function switchTab(target) {
    if (target === 'create-link') {
      if (tabBtnCreateLink) {
        tabBtnCreateLink.style.background = 'var(--primary)';
        tabBtnCreateLink.style.color = '#fff';
        tabBtnCreateLink.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
      }
      if (tabBtnApplyForm) {
        tabBtnApplyForm.style.background = 'transparent';
        tabBtnApplyForm.style.color = 'var(--dark-subtle)';
        tabBtnApplyForm.style.boxShadow = 'none';
      }
      if (viewCreateTicketLink) viewCreateTicketLink.style.display = 'block';
      if (viewAmbassadorApp) viewAmbassadorApp.style.display = 'none';
    } else {
      if (tabBtnApplyForm) {
        tabBtnApplyForm.style.background = 'var(--primary)';
        tabBtnApplyForm.style.color = '#fff';
        tabBtnApplyForm.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
      }
      if (tabBtnCreateLink) {
        tabBtnCreateLink.style.background = 'transparent';
        tabBtnCreateLink.style.color = 'var(--dark-subtle)';
        tabBtnCreateLink.style.boxShadow = 'none';
      }
      if (viewCreateTicketLink) viewCreateTicketLink.style.display = 'none';
      if (viewAmbassadorApp) viewAmbassadorApp.style.display = 'block';
    }
  }

  if (tabBtnCreateLink) tabBtnCreateLink.addEventListener('click', () => switchTab('create-link'));
  if (tabBtnApplyForm) tabBtnApplyForm.addEventListener('click', () => switchTab('apply-form'));

  // --- PERSONAL TICKET LINK ENGINE ---
  const eventSelect = document.getElementById('tool-event-select');
  const handleInput = document.getElementById('tool-ambassador-handle');
  const promoInput = document.getElementById('tool-promo-code');
  const btnGenerateToolLink = document.getElementById('btn-generate-tool-link');

  const ticketUrlInput = document.getElementById('tool-ticket-url');
  const btnCopyTicketUrl = document.getElementById('btn-copy-ticket-url');
  const toolQrImage = document.getElementById('tool-qr-image');
  const btnDownloadQr = document.getElementById('btn-download-tool-qr');
  const toolTestTicketLink = document.getElementById('tool-test-ticket-link');
  const toolEventDetailsLink = document.getElementById('tool-event-details-link');

  const toolShareWhatsapp = document.getElementById('tool-share-whatsapp');
  const toolShareX = document.getElementById('tool-share-x');
  const toolCopyTiktok = document.getElementById('tool-copy-tiktok-helper');

  // Advertisement Flyer Elements
  const adQrImg = document.getElementById('ad-qr-img');
  const adQrBadge = document.getElementById('ad-qr-badge');
  const adPosterEventTitle = document.getElementById('ad-poster-event-title');
  const adPosterHandleText = document.getElementById('ad-poster-handle-text');
  const btnDownloadFlyerQr = document.getElementById('btn-download-flyer-qr');
  const btnPrintFlyer = document.getElementById('btn-print-flyer');

  // Check URL Parameters (e.g. careers.html?event=evt-101&ref=chioma)
  const urlParams = new URLSearchParams(window.location.search);
  const targetEventId = urlParams.get('event') || urlParams.get('id');
  const targetHandle = urlParams.get('ref') || urlParams.get('handle');

  if (targetHandle && handleInput) {
    handleInput.value = targetHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  }

  // Populate events into dropdown
  function populateEvents() {
    if (!eventSelect) return;
    const events = (store && store.getEvents) ? store.getEvents() : [];

    if (events.length === 0) {
      eventSelect.innerHTML = '<option value="evt-001">Sixteen Beach Festival 2026 (Lagos)</option>';
      return;
    }

    eventSelect.innerHTML = events.map(evt => {
      const dateStr = evt.date ? ` - ${evt.date}` : '';
      const isSelected = targetEventId && evt.id === targetEventId ? 'selected' : '';
      return `<option value="${evt.id}" ${isSelected}>${evt.title}${dateStr}</option>`;
    }).join('');

    // If targetEventId was specified and exists, select it
    if (targetEventId && events.some(e => e.id === targetEventId)) {
      eventSelect.value = targetEventId;
    }
  }

  populateEvents();

  // Generate ticket link & sync with advertisement flyer
  function generatePersonalTicketLink() {
    const eventId = eventSelect ? eventSelect.value : 'evt-001';
    let handle = handleInput ? handleInput.value.trim().toLowerCase().replace(/^@/, '') : 'ambassador';
    if (!handle) handle = 'ambassador';

    const events = (store && store.getEvents) ? store.getEvents() : [];
    const currentEvent = events.find(e => e.id === eventId) || events[0] || { title: 'Sixteen Beach Festival 2026' };

    // Build URLs:
    // 1. Direct Ticket Purchase URL: sends customer right into buy-ticket checkout with promo/ref
    const ticketUrl = `${origin}${path}buy-ticket.html?id=${eventId}&ref=${encodeURIComponent(handle)}`;
    // 2. Event Overview URL
    const eventDetailsUrl = `${origin}${path}event-details.html?id=${eventId}&ref=${encodeURIComponent(handle)}`;

    // Generate High-Res QR Code for Personal Ticket Link
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticketUrl)}`;

    // Update form output controls
    if (ticketUrlInput) ticketUrlInput.value = ticketUrl;
    if (toolQrImage) toolQrImage.src = qrUrl;
    if (btnDownloadQr) {
      btnDownloadQr.href = qrUrl;
      btnDownloadQr.setAttribute('download', `bookam-${handle}-${eventId}-ticket-qr.png`);
    }
    if (toolTestTicketLink) toolTestTicketLink.href = ticketUrl;
    if (toolEventDetailsLink) toolEventDetailsLink.href = eventDetailsUrl;

    // Social Sharing Messages
    const shareMessage = `🎟️ Hey! Buy your official tickets for "${currentEvent.title}" with instant QR delivery on BOOKAM via my personal link here: ${ticketUrl}`;

    if (toolShareWhatsapp) {
      toolShareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    }
    if (toolShareX) {
      toolShareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎟️ Get your tickets for "${currentEvent.title}" on @BookAmNg! Use my personal link: ${ticketUrl}`)}`;
    }

    // SYNC ADVERTISEMENT FLYER (Poster Side)
    if (adQrImg) {
      adQrImg.src = qrUrl;
    }
    if (adQrBadge) {
      adQrBadge.title = `Scan to buy tickets for ${currentEvent.title} (Ambassador: @${handle})`;
    }
    if (adPosterEventTitle) {
      adPosterEventTitle.textContent = currentEvent.title;
    }
    if (adPosterHandleText) {
      adPosterHandleText.textContent = handle;
    }
    if (btnDownloadFlyerQr) {
      btnDownloadFlyerQr.href = qrUrl;
      btnDownloadFlyerQr.setAttribute('download', `flyer-qr-${handle}-${eventId}.png`);
    }
  }

  // Initial generation
  generatePersonalTicketLink();

  // Print Flyer Handler
  if (btnPrintFlyer) {
    btnPrintFlyer.addEventListener('click', () => {
      window.print();
    });
  }

  // Change / Click triggers
  if (btnGenerateToolLink) {
    btnGenerateToolLink.addEventListener('click', () => {
      generatePersonalTicketLink();
      if (store && store.showToast) {
        store.showToast('✅ Personal ticket link and flyer QR code generated!', 'success');
      }
    });
  }

  if (eventSelect) {
    eventSelect.addEventListener('change', generatePersonalTicketLink);
  }

  if (handleInput) {
    handleInput.addEventListener('input', () => {
      // Auto sanitize input
      handleInput.value = handleInput.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      generatePersonalTicketLink();
    });
  }

  // Copy Ticket URL helper
  if (btnCopyTicketUrl && ticketUrlInput) {
    btnCopyTicketUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(ticketUrlInput.value).then(() => {
        if (store && store.showToast) {
          store.showToast('📋 Personal ticket link copied to clipboard!', 'success');
        } else {
          alert('Link copied to clipboard!');
        }
      }).catch(() => {
        ticketUrlInput.select();
        document.execCommand('copy');
        if (store && store.showToast) store.showToast('📋 Copied!', 'success');
      });
    });
  }

  // Copy TikTok Bio Helper
  if (toolCopyTiktok && ticketUrlInput) {
    toolCopyTiktok.addEventListener('click', () => {
      navigator.clipboard.writeText(ticketUrlInput.value).then(() => {
        if (store && store.showToast) {
          store.showToast('📱 Link copied! Paste into your TikTok / IG bio.', 'success');
        }
      });
    });
  }

  // Role selection pills in Application Form
  const roleButtons = document.querySelectorAll('#role-pill-group .form-pill-btn');
  const roleInput = document.getElementById('amb-selected-role');

  if (roleButtons && roleInput) {
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const selectedRole = btn.getAttribute('data-role') || 'Campus Ambassador';
        roleInput.value = selectedRole;
      });
    });
  }

  // Ambassador Application Form
  const form = document.getElementById('ambassador-application-form');
  const successBox = document.getElementById('ambassador-success-box');
  const btnSubmitAnother = document.getElementById('btn-submit-another-ambassador');
  const successTicketUrl = document.getElementById('success-personal-ticket-url');
  const successQrImg = document.getElementById('success-personal-qr-img');
  const btnCopySuccessTicketLink = document.getElementById('btn-copy-success-ticket-link');

  if (form && successBox) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('amb-full-name')?.value.trim();
      const phone = document.getElementById('amb-phone')?.value.trim();
      const social = document.getElementById('amb-social')?.value.trim();
      const location = document.getElementById('amb-location')?.value.trim();
      const role = roleInput ? roleInput.value : 'Ambassador';
      const note = document.getElementById('amb-note')?.value.trim();

      if (!fullName || !phone || !social || !location || !note) {
        if (store && store.showToast) {
          store.showToast('Please fill in all required fields to submit your application.', 'warning');
        } else {
          alert('Please fill in all required fields.');
        }
        return;
      }

      const cleanHandle = social.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'ambassador';
      const events = (store && store.getEvents) ? store.getEvents() : [];
      const primaryEvent = events[0] || { id: 'evt-001', title: 'Sixteen Beach Festival 2026' };

      // Activate Personal Ticket URL for the candidate
      const activatedTicketUrl = `${origin}${path}buy-ticket.html?id=${primaryEvent.id}&ref=${cleanHandle}`;
      const activatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activatedTicketUrl)}`;

      if (successTicketUrl) successTicketUrl.value = activatedTicketUrl;
      if (successQrImg) successQrImg.src = activatedQrUrl;

      // Also update advertisement flyer
      if (adQrImg) adQrImg.src = activatedQrUrl;

      const application = {
        id: 'amb-' + Date.now().toString().slice(-6),
        jobId: 'bookam-ambassador-2026',
        roleTitle: `Ambassador Network (${role})`,
        fullName,
        email: `${cleanHandle}@ambassador.bookam.app`,
        phone,
        location,
        socialHandle: social,
        personalTicketLink: activatedTicketUrl,
        portfolio: `Social Handle: ${social}`,
        experience: 'Ambassador Candidate',
        expectedSalary: '10% Commission + VIP Access',
        coverNote: note,
        status: 'Approved & Link Activated',
        submittedAt: new Date().toISOString()
      };

      if (store && store.saveJobApplication) {
        store.saveJobApplication(application);
      } else {
        const apps = JSON.parse(localStorage.getItem('bookam_career_applications') || '[]');
        apps.unshift(application);
        localStorage.setItem('bookam_career_applications', JSON.stringify(apps));
      }

      // Hide form, reveal success box
      form.style.display = 'none';
      successBox.style.display = 'block';

      if (store && store.showToast) {
        store.showToast(`🎉 Welcome ${fullName}! Your personal ticket link is now live!`, 'success');
      }

      // Smooth scroll to success box
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Copy success ticket link
  if (btnCopySuccessTicketLink && successTicketUrl) {
    btnCopySuccessTicketLink.addEventListener('click', () => {
      navigator.clipboard.writeText(successTicketUrl.value).then(() => {
        if (store && store.showToast) {
          store.showToast('📋 Personal ticket link copied!', 'success');
        } else {
          alert('Copied personal ticket link!');
        }
      });
    });
  }

  if (btnSubmitAnother && form && successBox) {
    btnSubmitAnother.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successBox.style.display = 'none';
      if (roleButtons && roleButtons.length > 0) {
        roleButtons.forEach(b => b.classList.remove('active'));
        roleButtons[0].classList.add('active');
        if (roleInput) roleInput.value = roleButtons[0].getAttribute('data-role');
      }
    });
  }
});

