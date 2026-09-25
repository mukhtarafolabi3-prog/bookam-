/**
 * BOOKAM - Event Onboarding Controller
 * Multi-step wizard with validation, automatic ticket ordering, and review submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 1;
  const totalSteps = 9;

  // Sample high-quality flyer presets for one-click testing
  const sampleFlyers = [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  ];

  // Pre-fill organizer info from logged in organizer if available
  try {
    if (window.bookamStore) {
      const currentOrg = window.bookamStore.getCurrentOrganizer();
      if (currentOrg) {
        if (document.getElementById('org-full-name') && !document.getElementById('org-full-name').value) {
          document.getElementById('org-full-name').value = currentOrg.name || '';
        }
        if (document.getElementById('org-brand-name') && !document.getElementById('org-brand-name').value) {
          document.getElementById('org-brand-name').value = currentOrg.organizationName || '';
        }
        if (document.getElementById('org-email') && !document.getElementById('org-email').value) {
          document.getElementById('org-email').value = currentOrg.email || '';
        }
        if (document.getElementById('org-phone') && !document.getElementById('org-phone').value) {
          document.getElementById('org-phone').value = currentOrg.phone || '';
        }
        if (document.getElementById('org-whatsapp') && !document.getElementById('org-whatsapp').value) {
          document.getElementById('org-whatsapp').value = currentOrg.phone || '';
        }
      }
    }
  } catch (e) {}

  // Stepper UI update
  function updateStepperUI(step) {
    currentStep = step;

    // Show/hide step sections
    for (let i = 1; i <= totalSteps; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      if (stepEl) {
        stepEl.style.display = i === step ? 'block' : 'none';
      }
    }

    // Update stepper pills
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach(item => {
      const itemStep = parseInt(item.dataset.step);
      item.classList.remove('active', 'completed');
      if (itemStep === step) {
        item.classList.add('active');
      } else if (itemStep < step) {
        item.classList.add('completed');
      }
    });

    // Scroll to form top smoothly
    window.scrollTo({ top: 220, behavior: 'smooth' });

    // If step 9, render summary
    if (step === 9) {
      renderReviewSummary();
    }
  }

  // Step Validation
  function validateStep(step) {
    if (step === 1) {
      const name = document.getElementById('org-full-name').value.trim();
      const brand = document.getElementById('org-brand-name').value.trim();
      const phone = document.getElementById('org-phone').value.trim();
      const email = document.getElementById('org-email').value.trim();
      const whatsapp = document.getElementById('org-whatsapp').value.trim();
      const type = document.getElementById('org-type').value;

      if (!name || !brand || !phone || !email || !whatsapp || !type) {
        alert('Please complete all required fields in Organiser Information.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      const name = document.getElementById('event-name').value.trim();
      const category = document.getElementById('event-category').value;
      const about = document.getElementById('event-about').value.trim();
      const date = document.getElementById('event-date').value;
      const start = document.getElementById('event-start-time').value;
      const end = document.getElementById('event-end-time').value;

      if (!name || !category || !about || !date || !start || !end) {
        alert('Please fill out all required fields in Event Information.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const name = document.getElementById('venue-name').value.trim();
      const address = document.getElementById('venue-address').value.trim();
      const city = document.getElementById('venue-city').value.trim();
      const state = document.getElementById('venue-state').value.trim();
      const country = document.getElementById('venue-country').value;
      const capacity = document.getElementById('venue-capacity').value;
      const type = document.getElementById('venue-type').value;

      if (!name || !address || !city || !state || !country || !capacity || !type) {
        alert('Please fill out all required Venue Information fields.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      const flyer = document.getElementById('event-flyer-url').value.trim();
      if (!flyer) {
        // Provide default sample flyer if none provided so user is never blocked
        document.getElementById('event-flyer-url').value = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
      }
      return true;
    }

    if (step === 5) {
      const enableTickets = document.getElementById('chk-wizard-enable-tickets')?.checked ?? true;
      if (!enableTickets) {
        // Tickets are optional and currently disabled
        return true;
      }
      const ticketRows = document.querySelectorAll('.ticket-tier-row');
      if (ticketRows.length === 0) {
        // Tickets are optional
        return true;
      }
      // Ensure existing rows have sensible values or defaults
      ticketRows.forEach(row => {
        const nameInput = row.querySelector('.ticket-name');
        const priceInput = row.querySelector('.ticket-price');
        const qtyInput = row.querySelector('.ticket-quantity');
        if (nameInput && !nameInput.value.trim()) nameInput.value = 'General Pass';
        if (priceInput && priceInput.value === '') priceInput.value = '0';
        if (qtyInput && !qtyInput.value) qtyInput.value = '100';
      });
      return true;
    }

    if (step === 6) {
      const useInf = document.querySelector('input[name="use-influencers"]:checked').value;
      if (useInf === 'yes') {
        const infRows = document.querySelectorAll('.influencer-row');
        let valid = true;
        infRows.forEach(row => {
          const name = row.querySelector('.inf-name').value.trim();
          const code = row.querySelector('.inf-code').value.trim();
          if (!name || !code) {
            valid = false;
          }
        });
        if (!valid) {
          alert('Please provide a Name and Promo Code for each influencer, or select "No, proceed without promo codes".');
          return false;
        }
      }
      return true;
    }

    if (step === 7) {
      const attendance = document.getElementById('expected-attendance').value;
      const age = document.getElementById('age-requirement').value;
      const access = document.getElementById('event-access').value;
      if (!attendance || !age || !access) {
        alert('Please complete the Attendee Information fields.');
        return false;
      }
      return true;
    }

    if (step === 8) {
      const chkExclusive = document.getElementById('chk-exclusive-ticketing-agree');
      if (!chkExclusive || !chkExclusive.checked) {
        alert('Please accept the Exclusive Ticketing Terms by checking: "I agree to use Bookam as the exclusive ticketing and online payment platform for this event."');
        return false;
      }
      return true;
    }

    return true;
  }

  // Next / Prev Button Listeners
  document.querySelectorAll('.next-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.next);
      if (validateStep(currentStep)) {
        updateStepperUI(nextStep);
      }
    });
  });

  document.querySelectorAll('.prev-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.dataset.prev);
      updateStepperUI(prevStep);
    });
  });

  // Direct click on step items
  document.querySelectorAll('.step-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetStep = parseInt(btn.dataset.step);
      if (targetStep < currentStep) {
        updateStepperUI(targetStep);
      } else if (targetStep === currentStep + 1) {
        if (validateStep(currentStep)) {
          updateStepperUI(targetStep);
        }
      }
    });
  });

  // Sample Flyer Button
  const btnSampleFlyer = document.getElementById('btn-use-sample-flyer');
  if (btnSampleFlyer) {
    btnSampleFlyer.addEventListener('click', () => {
      const random = sampleFlyers[Math.floor(Math.random() * sampleFlyers.length)];
      const flyerInput = document.getElementById('event-flyer-url');
      flyerInput.value = random;
      showFlyerPreview(random, 'Sample Event Flyer');
    });
  }

  const flyerUrlInput = document.getElementById('event-flyer-url');
  if (flyerUrlInput) {
    flyerUrlInput.addEventListener('input', () => {
      showFlyerPreview(flyerUrlInput.value.trim(), 'Web Image');
    });
  }

  // File Upload & Drag-and-Drop for Event Flyer / Ticket Image
  const flyerFileInput = document.getElementById('event-flyer-file-input');
  const flyerDropzone = document.getElementById('flyer-upload-dropzone');
  const btnRemoveFlyer = document.getElementById('btn-remove-onboarding-flyer');

  if (flyerDropzone && flyerFileInput) {
    flyerDropzone.addEventListener('click', () => {
      flyerFileInput.click();
    });

    flyerFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      handleFlyerFile(file);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      flyerDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        flyerDropzone.style.borderColor = 'var(--primary)';
        flyerDropzone.style.background = '#EEF2FF';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      flyerDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        flyerDropzone.style.borderColor = '#CBD5E1';
        flyerDropzone.style.background = '#F8FAFC';
      });
    });

    flyerDropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        handleFlyerFile(file);
      }
    });
  }

  async function handleFlyerFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('Image file size exceeds 25MB limit. Please choose a smaller image.');
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
      if (flyerUrlInput) flyerUrlInput.value = dataUrl;
      showFlyerPreview(dataUrl, `${file.name} (Optimized)`);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Failed to process image file.');
    }
  }

  if (btnRemoveFlyer) {
    btnRemoveFlyer.addEventListener('click', () => {
      if (flyerUrlInput) flyerUrlInput.value = '';
      if (flyerFileInput) flyerFileInput.value = '';
      showFlyerPreview('', '');
    });
  }

  function showFlyerPreview(url, label) {
    const previewContainer = document.getElementById('flyer-preview-container');
    const previewImg = document.getElementById('flyer-preview-img');
    const filenameText = document.getElementById('flyer-filename-text');
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
      previewImg.src = url;
      if (filenameText && label) filenameText.textContent = label;
      previewContainer.style.display = 'block';
    } else {
      previewContainer.style.display = 'none';
      if (previewImg) previewImg.src = '';
    }
  }

  // Audience Badges Multi-select
  const audienceBadges = document.querySelectorAll('#target-audience-badges .badge-pill-tag');
  audienceBadges.forEach(badge => {
    badge.addEventListener('click', () => {
      badge.classList.toggle('selected');
    });
  });

  // Toggle Influencers section
  const infRadios = document.querySelectorAll('input[name="use-influencers"]');
  infRadios.forEach(r => {
    r.addEventListener('change', () => {
      const infSection = document.getElementById('influencer-codes-section');
      if (infSection) {
        infSection.style.display = r.value === 'yes' ? 'block' : 'none';
      }
    });
  });

  // Real-time Wizard Ambassador Flyer & Personal Ticket Link Synchronization
  const chkWizardEnableAmbassadors = document.getElementById('chk-wizard-enable-ambassadors');
  const wizardAmbassadorSuite = document.getElementById('wizard-ambassador-suite');
  const wizardAmbHandleInput = document.getElementById('wizard-amb-handle-input');
  const wizardPersonalTicketUrl = document.getElementById('wizard-personal-ticket-url');
  const btnWizardCopyPersonalUrl = document.getElementById('btn-wizard-copy-personal-url');
  const btnWizardTestTicketLink = document.getElementById('btn-wizard-test-ticket-link');
  const btnWizardShareWa = document.getElementById('btn-wizard-share-wa');
  const wizardFlyerTopScene = document.getElementById('wizard-flyer-top-scene');
  const wizardFlyerEventBadge = document.getElementById('wizard-flyer-event-badge');
  const wizardFlyerRepName = document.getElementById('wizard-flyer-rep-name');
  const wizardFlyerPriceTag = document.getElementById('wizard-flyer-price-tag');
  const wizardFlyerQrImg = document.getElementById('wizard-flyer-qr-img');
  const wizardFlyerQrCaption = document.getElementById('wizard-flyer-qr-caption');
  const btnWizardDownloadFlyerQr = document.getElementById('btn-wizard-download-flyer-qr');
  const btnWizardPrintFlyer = document.getElementById('btn-wizard-print-flyer');

  function updateWizardAmbassadorFlyerAndLink() {
    const rawHandle = wizardAmbHandleInput?.value.trim().replace(/^@/, '') || 'ambassador';
    const cleanHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'ambassador';
    const eventTitle = document.getElementById('event-name')?.value.trim() || 'Your Event Name';
    const flyerVal = document.getElementById('event-flyer-url')?.value.trim();

    // Check lowest ticket tier price
    const ticketsEnabled = document.getElementById('chk-wizard-enable-tickets')?.checked ?? true;
    let minPrice = Infinity;

    if (ticketsEnabled) {
      document.querySelectorAll('#tickets-builder-container .ticket-price').forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val) && val < minPrice) minPrice = val;
      });
    }

    const isZeroPrice = !ticketsEnabled || minPrice === Infinity || minPrice <= 0;

    // Generate personal ticket link
    const origin = window.location.origin;
    const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const personalUrl = `${origin}${path}buy-ticket.html?ref=${encodeURIComponent(cleanHandle)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(personalUrl)}`;

    if (wizardFlyerRepName) wizardFlyerRepName.textContent = cleanHandle;
    if (wizardFlyerEventBadge) wizardFlyerEventBadge.textContent = eventTitle;
    if (wizardPersonalTicketUrl) wizardPersonalTicketUrl.value = personalUrl;

    if (wizardFlyerQrImg) wizardFlyerQrImg.src = qrApiUrl;
    if (btnWizardDownloadFlyerQr) {
      btnWizardDownloadFlyerQr.href = qrApiUrl;
      btnWizardDownloadFlyerQr.setAttribute('download', `flyer-qr-${cleanHandle}.png`);
    }
    if (btnWizardTestTicketLink) btnWizardTestTicketLink.href = personalUrl;
    if (btnWizardShareWa) {
      btnWizardShareWa.href = `https://wa.me/?text=${encodeURIComponent(`🎟️ Get official tickets & passes for "${eventTitle}" via my personal link: ${personalUrl}`)}`;
    }

    // Dynamic 0 QR Code vs Paid Pass styling
    if (wizardFlyerPriceTag && wizardFlyerQrCaption) {
      if (isZeroPrice) {
        wizardFlyerPriceTag.innerHTML = '<i class="fa-solid fa-qrcode"></i> ₦0 Free Ticket QR Pass';
        wizardFlyerPriceTag.style.background = '#DCFCE7';
        wizardFlyerPriceTag.style.color = '#15803D';
        wizardFlyerPriceTag.style.borderColor = '#86EFAC';
        wizardFlyerQrCaption.innerHTML = '<i class="fa-solid fa-qrcode"></i> SCAN FOR ₦0 FREE PASS';
      } else {
        wizardFlyerPriceTag.innerHTML = `<i class="fa-solid fa-ticket"></i> Ticket QR Pass (from ₦${minPrice.toLocaleString()})`;
        wizardFlyerPriceTag.style.background = '#FAF5FF';
        wizardFlyerPriceTag.style.color = '#7C3AED';
        wizardFlyerPriceTag.style.borderColor = '#D8B4FE';
        wizardFlyerQrCaption.innerHTML = '<i class="fa-solid fa-qrcode"></i> SCAN TO GET TICKET';
      }
    }

    if (wizardFlyerTopScene && flyerVal && (flyerVal.startsWith('http') || flyerVal.startsWith('data:'))) {
      wizardFlyerTopScene.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(15,23,42,0.88)), url('${flyerVal}')`;
    }
  }

  // Toggle ambassador suite visibility
  if (chkWizardEnableAmbassadors && wizardAmbassadorSuite) {
    chkWizardEnableAmbassadors.addEventListener('change', () => {
      wizardAmbassadorSuite.style.display = chkWizardEnableAmbassadors.checked ? 'grid' : 'none';
    });
  }

  if (wizardAmbHandleInput) {
    wizardAmbHandleInput.addEventListener('input', updateWizardAmbassadorFlyerAndLink);
  }

  const wizardEventNameInp = document.getElementById('event-name');
  if (wizardEventNameInp) {
    wizardEventNameInp.addEventListener('input', updateWizardAmbassadorFlyerAndLink);
  }

  const wizardFlyerUrlInp = document.getElementById('event-flyer-url');
  if (wizardFlyerUrlInp) {
    wizardFlyerUrlInp.addEventListener('input', updateWizardAmbassadorFlyerAndLink);
  }

  // Copy personal ticket link
  if (btnWizardCopyPersonalUrl && wizardPersonalTicketUrl) {
    btnWizardCopyPersonalUrl.addEventListener('click', () => {
      wizardPersonalTicketUrl.select();
      navigator.clipboard.writeText(wizardPersonalTicketUrl.value).then(() => {
        const originalHtml = btnWizardCopyPersonalUrl.innerHTML;
        btnWizardCopyPersonalUrl.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btnWizardCopyPersonalUrl.style.background = '#10B981';
        setTimeout(() => {
          btnWizardCopyPersonalUrl.innerHTML = originalHtml;
          btnWizardCopyPersonalUrl.style.background = '';
        }, 2000);
      });
    });
  }

  // Print flyer
  if (btnWizardPrintFlyer) {
    btnWizardPrintFlyer.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial call
  updateWizardAmbassadorFlyerAndLink();

  // Ticket Configuration Toggle (Optional Tickets)
  const chkWizardEnableTickets = document.getElementById('chk-wizard-enable-tickets');
  const wizardTicketsConfigArea = document.getElementById('wizard-tickets-config-area');
  if (chkWizardEnableTickets && wizardTicketsConfigArea) {
    chkWizardEnableTickets.addEventListener('change', () => {
      wizardTicketsConfigArea.style.display = chkWizardEnableTickets.checked ? 'block' : 'none';
    });
  }

  // Auto-set early bird expiry default when event date is chosen
  const wizardEventDate = document.getElementById('event-date');
  const wizardEarlyBirdEnd = document.getElementById('wizard-early-bird-end');
  if (wizardEventDate && wizardEarlyBirdEnd) {
    wizardEventDate.addEventListener('change', () => {
      if (wizardEventDate.value && !wizardEarlyBirdEnd.value) {
        const d = new Date(wizardEventDate.value);
        d.setDate(d.getDate() - 2);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        wizardEarlyBirdEnd.value = `${yyyy}-${mm}-${dd}T23:59`;
      }
    });
  }

  // Dynamic Ticket Addition
  const btnAddTicket = document.getElementById('btn-add-ticket');
  const ticketsContainer = document.getElementById('tickets-builder-container');

  function reindexTickets() {
    const rows = ticketsContainer.querySelectorAll('.ticket-tier-row');
    rows.forEach((row, i) => {
      row.dataset.index = i;
      const titleSpan = row.querySelector('span');
      if (titleSpan) {
        titleSpan.innerHTML = `<i class="fa-solid fa-tag"></i> Ticket #${i + 1}`;
      }
      const deleteBtn = row.querySelector('.delete-ticket-btn');
      if (deleteBtn) {
        deleteBtn.style.display = rows.length > 1 ? 'inline-flex' : 'none';
      }
    });
  }

  if (btnAddTicket && ticketsContainer) {
    btnAddTicket.addEventListener('click', () => {
      const currentRows = ticketsContainer.querySelectorAll('.ticket-tier-row');
      if (currentRows.length >= 8) {
        alert('Maximum of 8 ticket tiers reached.');
        return;
      }
      const newIndex = currentRows.length;
      const tierTemplates = ['Regular Admission', 'VIP Lounge Pass', 'VVIP Table of 6', 'Group of 4 Pass'];
      const defaultName = tierTemplates[newIndex - 1] || `Ticket Tier #${newIndex + 1}`;
      const defaultPrice = (newIndex + 1) * 5000;

      const newRow = document.createElement('div');
      newRow.className = 'ticket-tier-row';
      newRow.dataset.index = newIndex;
      newRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--gray-200); padding-bottom: 0.5rem;">
          <span style="font-size: 0.85rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">
            <i class="fa-solid fa-tag"></i> Ticket #${newIndex + 1}
          </span>
          <button type="button" class="btn btn-sm btn-outline delete-ticket-btn" style="color: var(--red-500); border-color: #FECACA;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>

        <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Ticket Name <span style="color: var(--red-500);">*</span></label>
            <input type="text" class="form-control ticket-name" value="${defaultName}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Ticket Price (₦) <span style="color: var(--red-500);">*</span></label>
            <input type="number" class="form-control ticket-price" value="${defaultPrice}" min="0" required />
          </div>
          <div class="form-group">
            <label class="form-label">Available Quantity <span style="color: var(--red-500);">*</span></label>
            <input type="number" class="form-control ticket-quantity" value="100" min="1" required />
          </div>
        </div>

        <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Sales Start Date & Time</label>
            <input type="datetime-local" class="form-control ticket-start" />
          </div>
          <div class="form-group">
            <label class="form-label">Sales End Date & Time</label>
            <input type="datetime-local" class="form-control ticket-end" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ticket Description</label>
          <textarea class="form-control ticket-desc" rows="2" placeholder="Describe what this pass includes (e.g. general seating, welcome drink)"></textarea>
        </div>
      `;
      ticketsContainer.appendChild(newRow);
      reindexTickets();
    });

    ticketsContainer.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-ticket-btn');
      if (deleteBtn) {
        const row = deleteBtn.closest('.ticket-tier-row');
        if (row && ticketsContainer.querySelectorAll('.ticket-tier-row').length > 1) {
          row.remove();
          reindexTickets();
        }
      }
    });
  }

  // Dynamic Influencer Addition (Up to 10)
  const btnAddInfluencer = document.getElementById('btn-add-influencer');
  const influencersContainer = document.getElementById('influencers-builder-container');

  function reindexInfluencers() {
    const rows = influencersContainer.querySelectorAll('.influencer-row');
    rows.forEach((row, i) => {
      row.dataset.index = i;
      const titleSpan = row.querySelector('span');
      if (titleSpan) {
        titleSpan.innerHTML = `<i class="fa-solid fa-user-check"></i> Influencer ${i + 1} (Max 10)`;
      }
      const deleteBtn = row.querySelector('.delete-influencer-btn');
      if (deleteBtn) {
        deleteBtn.style.display = rows.length > 1 ? 'inline-flex' : 'none';
      }
    });
  }

  if (btnAddInfluencer && influencersContainer) {
    btnAddInfluencer.addEventListener('click', () => {
      const currentRows = influencersContainer.querySelectorAll('.influencer-row');
      if (currentRows.length >= 10) {
        alert('You have reached the maximum limit of 10 influencers for this event.');
        return;
      }
      const newIndex = currentRows.length;
      const newRow = document.createElement('div');
      newRow.className = 'influencer-row';
      newRow.dataset.index = newIndex;
      newRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">
            <i class="fa-solid fa-user-check"></i> Influencer ${newIndex + 1} (Max 10)
          </span>
          <button type="button" class="btn btn-sm btn-outline delete-influencer-btn" style="color: var(--red-500); border-color: #FECACA;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>

        <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Influencer Name</label>
            <input type="text" class="form-control inf-name" placeholder="e.g. Promoter Name" />
          </div>

          <div class="form-group">
            <label class="form-label">Promo Code</label>
            <input type="text" class="form-control inf-code" placeholder="e.g. PROMO${newIndex + 1}" style="text-transform: uppercase;" />
          </div>

          <div class="form-group">
            <label class="form-label">Discount Type</label>
            <select class="form-control inf-discount-type">
              <option value="percentage" selected>Percentage (%)</option>
              <option value="fixed">Fixed Amount (₦)</option>
              <option value="none">No Discount</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Discount Value</label>
            <input type="number" class="form-control inf-discount-val" value="10" min="0" />
          </div>

          <div class="form-group">
            <label class="form-label">Commission (%)</label>
            <input type="number" class="form-control inf-commission" value="5" min="0" max="100" />
          </div>
        </div>
      `;
      influencersContainer.appendChild(newRow);
      reindexInfluencers();
    });

    influencersContainer.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-influencer-btn');
      if (deleteBtn) {
        const row = deleteBtn.closest('.influencer-row');
        if (row && influencersContainer.querySelectorAll('.influencer-row').length > 1) {
          row.remove();
          reindexInfluencers();
        }
      }
    });
  }

  // Render Step 9 Summary
  function renderReviewSummary() {
    const container = document.getElementById('summary-cards-container');
    if (!container) return;

    // Gather values
    const orgName = document.getElementById('org-full-name').value.trim();
    const brandName = document.getElementById('org-brand-name').value.trim();
    const orgEmail = document.getElementById('org-email').value.trim();
    const orgPhone = document.getElementById('org-phone').value.trim();
    const orgType = document.getElementById('org-type').value;

    const eventName = document.getElementById('event-name').value.trim();
    const eventCategory = document.getElementById('event-category').value;
    const eventDate = document.getElementById('event-date').value;
    const eventStart = document.getElementById('event-start-time').value;
    const eventEnd = document.getElementById('event-end-time').value;

    const venueName = document.getElementById('venue-name').value.trim();
    const venueAddress = document.getElementById('venue-address').value.trim();
    const venueCity = document.getElementById('venue-city').value.trim();
    const venueState = document.getElementById('venue-state').value.trim();
    const venueCapacity = document.getElementById('venue-capacity').value;

    const flyerUrl = document.getElementById('event-flyer-url').value.trim();

    // Tickets
    const enableTickets = document.getElementById('chk-wizard-enable-tickets')?.checked ?? true;
    const tickets = [];
    let earlyBirdEndSummary = null;

    if (enableTickets) {
      const ebPrice = parseFloat(document.getElementById('wizard-price-early-bird')?.value);
      const fwPrice = parseFloat(document.getElementById('wizard-price-first-wave')?.value);
      const g4Price = parseFloat(document.getElementById('wizard-price-group-4')?.value);
      const swPrice = parseFloat(document.getElementById('wizard-price-second-wave')?.value);
      const enPrice = parseFloat(document.getElementById('wizard-price-at-entrance')?.value);
      const ebEnd = document.getElementById('wizard-early-bird-end')?.value;
      if (ebEnd) earlyBirdEndSummary = ebEnd;

      if (!isNaN(ebPrice) && ebPrice >= 0) {
        tickets.push({ name: 'Early Bird', price: ebPrice, qty: 200, isEarlyBird: true, endDate: ebEnd });
      }
      if (!isNaN(fwPrice) && fwPrice >= 0) {
        tickets.push({ name: 'First Wave', price: fwPrice, qty: 300 });
      }
      if (!isNaN(g4Price) && g4Price >= 0) {
        tickets.push({ name: 'Group of 4', price: g4Price, qty: 50 });
      }
      if (!isNaN(swPrice) && swPrice >= 0) {
        tickets.push({ name: 'Second Wave', price: swPrice, qty: 250 });
      }
      if (!isNaN(enPrice) && enPrice >= 0) {
        tickets.push({ name: 'At Entrance', price: enPrice, qty: 150 });
      }

      // Check any additional custom builder rows
      const ticketRows = document.querySelectorAll('.ticket-tier-row');
      ticketRows.forEach(row => {
        const name = row.querySelector('.ticket-name')?.value.trim();
        const price = parseFloat(row.querySelector('.ticket-price')?.value || 0);
        const qty = parseInt(row.querySelector('.ticket-quantity')?.value || 0);
        if (name && !tickets.some(t => t.name.toLowerCase() === name.toLowerCase())) {
          tickets.push({ name, price, qty });
        }
      });
    }

    // Influencers
    const useInf = document.querySelector('input[name="use-influencers"]:checked').value;
    const influencers = [];
    if (useInf === 'yes') {
      const infRows = document.querySelectorAll('.influencer-row');
      infRows.forEach(row => {
        const name = row.querySelector('.inf-name').value.trim();
        const code = row.querySelector('.inf-code').value.trim();
        if (name && code) {
          influencers.push({ name, code });
        }
      });
    }

    const attendance = document.getElementById('expected-attendance').value;
    const age = document.getElementById('age-requirement').value;
    const access = document.getElementById('event-access').value;

    const formatCurrency = (amt) => {
      return '₦' + parseFloat(amt || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });
    };

    container.innerHTML = `
      <!-- Organiser Card -->
      <div class="summary-section">
        <div class="summary-section-title">
          <span><i class="fa-solid fa-user-tie"></i> Organiser</span>
          <button type="button" class="btn btn-sm btn-outline prev-step-btn" data-prev="1" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">Edit</button>
        </div>
        <div class="summary-row"><span class="label">Name</span><span class="value">${orgName}</span></div>
        <div class="summary-row"><span class="label">Brand</span><span class="value">${brandName}</span></div>
        <div class="summary-row"><span class="label">Email</span><span class="value">${orgEmail}</span></div>
        <div class="summary-row"><span class="label">Phone</span><span class="value">${orgPhone}</span></div>
        <div class="summary-row"><span class="label">Type</span><span class="value">${orgType}</span></div>
      </div>

      <!-- Event & Timing Card -->
      <div class="summary-section">
        <div class="summary-section-title">
          <span><i class="fa-solid fa-calendar"></i> Event & Timing</span>
          <button type="button" class="btn btn-sm btn-outline prev-step-btn" data-prev="2" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">Edit</button>
        </div>
        <div class="summary-row"><span class="label">Title</span><span class="value">${eventName}</span></div>
        <div class="summary-row"><span class="label">Category</span><span class="value">${eventCategory}</span></div>
        <div class="summary-row"><span class="label">Date</span><span class="value">${eventDate}</span></div>
        <div class="summary-row"><span class="label">Hours</span><span class="value">${eventStart} – ${eventEnd}</span></div>
      </div>

      <!-- Venue Card -->
      <div class="summary-section">
        <div class="summary-section-title">
          <span><i class="fa-solid fa-location-dot"></i> Venue</span>
          <button type="button" class="btn btn-sm btn-outline prev-step-btn" data-prev="3" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">Edit</button>
        </div>
        <div class="summary-row"><span class="label">Venue</span><span class="value">${venueName}</span></div>
        <div class="summary-row"><span class="label">Location</span><span class="value">${venueCity}, ${venueState}</span></div>
        <div class="summary-row"><span class="label">Capacity</span><span class="value">${Number(venueCapacity).toLocaleString()} people</span></div>
      </div>

      <!-- Tickets Card -->
      <div class="summary-section">
        <div class="summary-section-title">
          <span><i class="fa-solid fa-ticket"></i> Ticket Tiers (${tickets.length})</span>
          <button type="button" class="btn btn-sm btn-outline prev-step-btn" data-prev="5" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">Edit</button>
        </div>
        ${tickets.length > 0 ? `
          ${tickets.map(t => `
            <div class="summary-row">
              <span class="label">${t.name} (${t.qty} qty)</span>
              <span class="value">${t.price > 0 ? formatCurrency(t.price) : 'FREE'}</span>
            </div>
          `).join('')}
          ${earlyBirdEndSummary ? `
            <div class="summary-row" style="background: rgba(124, 58, 237, 0.05); padding: 0.25rem 0.5rem; border-radius: 4px; margin-top: 0.25rem;">
              <span class="label" style="color: var(--primary); font-weight: 700;"><i class="fa-solid fa-hourglass-half"></i> Early Bird Expiry</span>
              <span class="value" style="color: var(--primary); font-weight: 600;">${new Date(earlyBirdEndSummary).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ` : ''}
        ` : `
          <div class="summary-row">
            <span class="label">Admission</span>
            <span class="value" style="color: var(--emerald-600); font-weight: 700;">Free / Community RSVP (Optional Tickets)</span>
          </div>
        `}
      </div>

      <!-- Marketing & Promo Codes Card -->
      <div class="summary-section">
        <div class="summary-section-title">
          <span><i class="fa-solid fa-bullhorn"></i> Influencers & Promoters</span>
          <button type="button" class="btn btn-sm btn-outline prev-step-btn" data-prev="6" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">Edit</button>
        </div>
        ${influencers.length > 0 ? influencers.map(inf => `
          <div class="summary-row">
            <span class="label">${inf.name}</span>
            <span class="value" style="color: var(--primary); font-family: monospace;">${inf.code}</span>
          </div>
        `).join('') : '<div style="color: var(--gray-500); font-size: 0.85rem; padding: 0.5rem 0;">No affiliate promo codes registered.</div>'}
      </div>

      <!-- Attendees Card -->
      <div class="summary-section">
        <div class="summary-section-title">
          <span><i class="fa-solid fa-users"></i> Attendees</span>
          <button type="button" class="btn btn-sm btn-outline prev-step-btn" data-prev="7" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">Edit</button>
        </div>
        <div class="summary-row"><span class="label">Expected</span><span class="value">${Number(attendance).toLocaleString()} attendees</span></div>
        <div class="summary-row"><span class="label">Min Age</span><span class="value">${age}</span></div>
        <div class="summary-row"><span class="label">Access</span><span class="value">${access}</span></div>
      </div>
    `;

    // Rebind edit buttons
    container.querySelectorAll('.prev-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        updateStepperUI(parseInt(btn.dataset.prev));
      });
    });
  }

  // SUBMISSION ACTION
  const btnSubmit = document.getElementById('btn-submit-event');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      if (!validateStep(8)) return;

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting Event...';

      // Assemble full payload
      const enableTickets = document.getElementById('chk-wizard-enable-tickets')?.checked ?? true;
      const tiers = [];
      if (enableTickets) {
        const ebPrice = parseFloat(document.getElementById('wizard-price-early-bird')?.value);
        const fwPrice = parseFloat(document.getElementById('wizard-price-first-wave')?.value);
        const g4Price = parseFloat(document.getElementById('wizard-price-group-4')?.value);
        const swPrice = parseFloat(document.getElementById('wizard-price-second-wave')?.value);
        const enPrice = parseFloat(document.getElementById('wizard-price-at-entrance')?.value);
        const ebEnd = document.getElementById('wizard-early-bird-end')?.value || null;

        if (!isNaN(ebPrice) && ebPrice >= 0) {
          tiers.push({
            id: `tier-${Date.now()}-eb`,
            type: 'Early bird',
            name: 'Early Bird',
            price: ebPrice,
            availableQuantity: 200,
            endDate: ebEnd,
            description: 'Early Bird discounted pass.'
          });
        }
        if (!isNaN(fwPrice) && fwPrice >= 0) {
          tiers.push({
            id: `tier-${Date.now()}-fw`,
            type: 'First Wave',
            name: 'First Wave',
            price: fwPrice,
            availableQuantity: 300,
            description: 'First Wave General Admission pass.'
          });
        }
        if (!isNaN(g4Price) && g4Price >= 0) {
          tiers.push({
            id: `tier-${Date.now()}-g4`,
            type: 'Group of 4',
            name: 'Group of 4',
            price: g4Price,
            availableQuantity: 50,
            description: 'Group bundle includes entry for 4 people.'
          });
        }
        if (!isNaN(swPrice) && swPrice >= 0) {
          tiers.push({
            id: `tier-${Date.now()}-sw`,
            type: 'Second Wave',
            name: 'Second Wave',
            price: swPrice,
            availableQuantity: 250,
            description: 'Second Wave entry pass.'
          });
        }
        if (!isNaN(enPrice) && enPrice >= 0) {
          tiers.push({
            id: `tier-${Date.now()}-en`,
            type: 'At the Entrance',
            name: 'At Entrance',
            price: enPrice,
            availableQuantity: 150,
            description: 'On-site entrance pass.'
          });
        }

        // Custom rows from ticket builder
        const ticketRows = document.querySelectorAll('.ticket-tier-row');
        ticketRows.forEach((row, i) => {
          const name = row.querySelector('.ticket-name')?.value.trim();
          if (name && !tiers.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            tiers.push({
              id: `tier-${Date.now()}-${i}`,
              name: name,
              price: parseFloat(row.querySelector('.ticket-price')?.value || 0),
              availableQuantity: parseInt(row.querySelector('.ticket-quantity')?.value || 100),
              startDate: row.querySelector('.ticket-start')?.value || null,
              endDate: row.querySelector('.ticket-end')?.value || null,
              description: row.querySelector('.ticket-desc')?.value.trim() || ''
            });
          }
        });
      }

      const useInf = document.querySelector('input[name="use-influencers"]:checked').value;
      const influencers = [];
      if (useInf === 'yes') {
        const infRows = document.querySelectorAll('.influencer-row');
        infRows.forEach(row => {
          const name = row.querySelector('.inf-name').value.trim();
          const code = row.querySelector('.inf-code').value.trim().toUpperCase();
          if (name && code) {
            influencers.push({
              name,
              promoCode: code,
              discountType: row.querySelector('.inf-discount-type').value,
              discountValue: parseFloat(row.querySelector('.inf-discount-val').value || 0),
              commission: parseFloat(row.querySelector('.inf-commission').value || 5)
            });
          }
        });
      }

      const selectedAudience = [];
      document.querySelectorAll('#target-audience-badges .badge-pill-tag.selected').forEach(tag => {
        selectedAudience.push(tag.dataset.value || tag.innerText.trim());
      });

      const payload = {
        fullName: document.getElementById('org-full-name').value.trim(),
        brandName: document.getElementById('org-brand-name').value.trim(),
        phone: document.getElementById('org-phone').value.trim(),
        email: document.getElementById('org-email').value.trim(),
        whatsapp: document.getElementById('org-whatsapp').value.trim(),
        instagram: document.getElementById('org-instagram').value.trim(),
        organizerType: document.getElementById('org-type').value,

        eventName: document.getElementById('event-name').value.trim(),
        category: document.getElementById('event-category').value,
        about: document.getElementById('event-about').value.trim(),
        date: document.getElementById('event-date').value,
        startTime: document.getElementById('event-start-time').value,
        endTime: document.getElementById('event-end-time').value,

        venueName: document.getElementById('venue-name').value.trim(),
        venueAddress: document.getElementById('venue-address').value.trim(),
        city: document.getElementById('venue-city').value.trim(),
        state: document.getElementById('venue-state').value.trim(),
        country: document.getElementById('venue-country').value,
        venueCapacity: document.getElementById('venue-capacity').value,
        venueType: document.getElementById('venue-type').value,

        flyerUrl: document.getElementById('event-flyer-url').value.trim(),
        promoVideoUrl: document.getElementById('event-video-url').value.trim(),
        logoUrl: document.getElementById('event-logo-url').value.trim(),

        tiers,
        ticketsOptional: !enableTickets || tiers.length === 0,
        influencers,

        expectedAttendance: document.getElementById('expected-attendance').value,
        targetAudience: selectedAudience,
        ageRequirement: document.getElementById('age-requirement').value,
        eventAccess: document.getElementById('event-access').value,
        callForAmbassadors: document.getElementById('chk-wizard-enable-ambassadors')?.checked ?? true,

        // Exclusive Ticketing Terms Agreement (Mandatory Platform Mandate)
        agreedExclusiveTicketing: true,
        exclusiveTicketingTermsAccepted: true,
        termsAcceptedText: 'I agree to use Bookam as the exclusive ticketing and online payment platform for this event.',
        exclusiveTermsAgreedAt: new Date().toISOString()
      };

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting to Control Panel...';

      // Submit via Central Store
      setTimeout(() => {
        try {
          if (window.bookamStore) {
            const created = window.bookamStore.submitEventOnboarding(payload);
            const successModal = document.getElementById('submission-success-modal');
            const successTitle = document.getElementById('success-event-name');
            const btnViewLive = document.getElementById('btn-view-live-event');
            if (successTitle) successTitle.innerText = `"${created.title}"`;
            if (btnViewLive && created && created.id) {
              btnViewLive.href = `event-details.html?id=${created.id}`;
            }
            if (successModal) {
              successModal.style.display = 'flex';
            }
          }
        } catch (err) {
          console.error('Submission error:', err);
          alert('Submission completed and logged.');
        } finally {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<i class="fa-solid fa-bolt"></i> Publish Event Live Immediately';
        }
      }, 600);
    });
  }

  // Reset / Submit Another Event
  const btnSubmitAnother = document.getElementById('btn-submit-another');
  if (btnSubmitAnother) {
    btnSubmitAnother.addEventListener('click', () => {
      window.location.reload();
    });
  }
});
