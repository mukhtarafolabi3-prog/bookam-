/**
 * BOOKAM - Buy Ticket Form Script (buy-ticket.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id') || 'evt-101';
  let initialType = urlParams.get('type') || 'Regular';
  const refParam = urlParams.get('ref') || sessionStorage.getItem(`bookam_active_ref_${eventId}`);

  const event = store.getEventById(eventId);
  if (!event) {
    window.location.href = 'events.html';
    return;
  }

  // Handle PAUSED status (Pause fix)
  const eventStatus = String(event.status || event.onboardingStatus || 'APPROVED').toUpperCase();
  if (eventStatus === 'PAUSED') {
    const buyForm = document.getElementById('buy-ticket-form');
    if (buyForm) {
      const banner = document.createElement('div');
      banner.style.cssText = 'background: #FFF7ED; border-left: 4px solid #F97316; color: #9A3412; padding: 1rem 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.75rem;';
      banner.innerHTML = `<i class="fa-solid fa-circle-pause" style="font-size: 1.3rem;"></i> <div><strong>Ticket Sales Temporarily Paused</strong><p style="margin: 0.25rem 0 0 0; font-size: 0.85rem;">Ticket sales for this event are currently paused by the organizer or platform. Please check back shortly.</p></div>`;
      buyForm.prepend(banner);
      const submitBtn = buyForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Ticket Sales Paused';
      }
    }
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

  // Render Event Summary Box
  const summaryImg = document.getElementById('sum-banner');
  const summaryTitle = document.getElementById('sum-title');
  const summaryDate = document.getElementById('sum-date');
  const summaryVenue = document.getElementById('sum-venue');

  if (summaryImg) summaryImg.src = event.banner;
  if (summaryTitle) summaryTitle.textContent = event.title;
  if (summaryDate) summaryDate.textContent = store.formatDate(event.date);
  if (summaryVenue) summaryVenue.textContent = event.venue;

  // Form Controls
  const ticketTypeSelect = document.getElementById('buyer-ticket-type');
  const qtyInput = document.getElementById('buyer-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  const promoCodeInput = document.getElementById('buyer-promo-code');
  const btnApplyPromo = document.getElementById('btn-apply-promo');
  const promoFeedback = document.getElementById('promo-feedback');

  const unitPriceElem = document.getElementById('sum-unit-price');
  const qtyTextElem = document.getElementById('sum-qty-text');
  const subtotalElem = document.getElementById('sum-subtotal');
  const discountRow = document.getElementById('sum-discount-row');
  const discountCodeElem = document.getElementById('sum-discount-code');
  const discountAmountElem = document.getElementById('sum-discount-amount');
  const netSubtotalRow = document.getElementById('sum-net-subtotal-row');
  const netSubtotalElem = document.getElementById('sum-net-subtotal');
  const serviceChargeElem = document.getElementById('sum-service-charge');
  const totalAmountElem = document.getElementById('sum-total-amount');

  const sumInfTag = document.getElementById('sum-influencer-tag');
  const sumInfName = document.getElementById('sum-influencer-name');
  const sumInfHandle = document.getElementById('sum-influencer-handle');

  // Applied Promo State
  let appliedPromoResult = null;

  // Populate Ticket Types in Select
  let availableTickets = (event.tickets && event.tickets.length > 0)
    ? event.tickets
    : store.createDefaultTicketTiers();

  // Better Marriages 2.0 strictly only has First Wave ticket
  if (event.title && event.title.toLowerCase().includes('better marriages')) {
    availableTickets = [
      {
        type: 'First Wave',
        name: 'First Wave Ticket',
        price: 5000,
        benefits: ['First Wave Admission', 'Standard Venue Access', 'Fast-track Entry']
      }
    ];
    initialType = 'First Wave';
  }

  function populateTicketTypes() {
    if (!ticketTypeSelect) return;
    const currentVal = ticketTypeSelect.value || initialType;
    const hasCurrent = availableTickets.some(t => t.type === currentVal);
    const selectedVal = hasCurrent ? currentVal : (availableTickets[0] ? availableTickets[0].type : '');

    ticketTypeSelect.innerHTML = availableTickets.map(t => {
      const isEarlyBird = (t.type && String(t.type).toLowerCase().includes('early bird')) || (t.name && String(t.name).toLowerCase().includes('early bird'));
      const endDateVal = t.endDate || (isEarlyBird ? event.earlyBirdEndDate : null);
      let expText = '';
      if (isEarlyBird && endDateVal) {
        const expDate = new Date(endDateVal);
        if (!isNaN(expDate.getTime())) {
          if (new Date() > expDate) {
            expText = ` [EXPIRED on ${expDate.toLocaleDateString()}]`;
          } else {
            expText = ` [Ends ${expDate.toLocaleDateString()}]`;
          }
        }
      }
      return `
        <option value="${t.type}" ${t.type === selectedVal ? 'selected' : ''}>
          ${t.name || t.type}${expText} (${store.formatCurrency(t.price)})
        </option>
      `;
    }).join('');
  }

  populateTicketTypes();

  let currentQty = parseInt(qtyInput ? qtyInput.value : 1) || 1;

  function calculateTotals() {
    const selectedType = ticketTypeSelect ? ticketTypeSelect.value : 'Early bird';
    const ticketObj = availableTickets.find(t => t.type === selectedType) || availableTickets[0] || { price: event.startingPrice || 0 };

    const unitPrice = ticketObj.price;
    const rawSubtotal = unitPrice * currentQty;

    let discountAmount = 0;
    let netSubtotal = rawSubtotal;
    let commissionAmount = 0;

    // Recalculate promo discount if active
    if (appliedPromoResult && appliedPromoResult.valid) {
      const promoCheck = store.validatePromoCode(
        event.id,
        appliedPromoResult.promoCode,
        selectedType,
        rawSubtotal,
        currentQty
      );

      if (promoCheck.valid) {
        appliedPromoResult = promoCheck;
        discountAmount = promoCheck.discountAmount;
        netSubtotal = promoCheck.discountedSubtotal;
        commissionAmount = promoCheck.commissionAmount;

        if (discountRow) discountRow.style.display = 'flex';
        if (discountCodeElem) discountCodeElem.textContent = promoCheck.promoCode;
        if (discountAmountElem) discountAmountElem.textContent = `-${store.formatCurrency(discountAmount)}`;
        if (netSubtotalRow) netSubtotalRow.style.display = 'flex';
        if (netSubtotalElem) netSubtotalElem.textContent = store.formatCurrency(netSubtotal);

        if (sumInfTag && promoCheck.influencer) {
          sumInfTag.style.display = 'flex';
          if (sumInfName) sumInfName.textContent = promoCheck.influencer.name;
          if (sumInfHandle) sumInfHandle.textContent = `@${promoCheck.influencer.username}`;
        }
      } else {
        // Promo no longer valid for this tier or condition
        appliedPromoResult = null;
        if (discountRow) discountRow.style.display = 'none';
        if (netSubtotalRow) netSubtotalRow.style.display = 'none';
        if (sumInfTag) sumInfTag.style.display = 'none';
        if (promoFeedback) {
          promoFeedback.style.display = 'block';
          promoFeedback.style.color = '#DC2626';
          promoFeedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${promoCheck.message}`;
        }
      }
    } else {
      if (discountRow) discountRow.style.display = 'none';
      if (netSubtotalRow) netSubtotalRow.style.display = 'none';
      if (sumInfTag) sumInfTag.style.display = 'none';
    }

    const serviceCharge = netSubtotal > 0 ? 400 : 0; // ₦400 flat service charge for checkout
    const grandTotal = netSubtotal + serviceCharge;

    if (unitPriceElem) unitPriceElem.textContent = store.formatCurrency(unitPrice);
    if (qtyTextElem) qtyTextElem.textContent = currentQty;
    if (subtotalElem) subtotalElem.textContent = store.formatCurrency(rawSubtotal);
    if (serviceChargeElem) serviceChargeElem.textContent = store.formatCurrency(serviceCharge);
    if (totalAmountElem) totalAmountElem.textContent = store.formatCurrency(grandTotal);

    return {
      eventId: event.id,
      eventName: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      ticketType: selectedType,
      unitPrice,
      quantity: currentQty,
      subtotal: rawSubtotal,
      discountAmount,
      discountedSubtotal: netSubtotal,
      serviceCharge,
      totalAmount: grandTotal,
      influencerId: appliedPromoResult?.influencerId || null,
      influencerName: appliedPromoResult?.influencer?.name || null,
      influencerHandle: appliedPromoResult?.influencer?.username || null,
      promoCode: appliedPromoResult?.promoCode || null,
      commissionAmount: commissionAmount || 0,
      commissionType: appliedPromoResult?.commissionType || null,
      commissionValue: appliedPromoResult?.commissionValue || null
    };
  }

  function handleApplyPromo(code) {
    if (!code) {
      if (promoFeedback) {
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#DC2626';
        promoFeedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Please enter a promo code.`;
      }
      return;
    }

    const selectedType = ticketTypeSelect ? ticketTypeSelect.value : 'Early bird';
    const ticketObj = availableTickets.find(t => t.type === selectedType) || availableTickets[0] || { price: event.startingPrice || 0 };
    const rawSubtotal = ticketObj.price * currentQty;

    const result = store.validatePromoCode(event.id, code, selectedType, rawSubtotal, currentQty);

    if (result.valid) {
      appliedPromoResult = result;
      if (promoFeedback) {
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#15803D';
        const discText = result.discountType === 'percentage' ? `${result.discountValue}%` : `₦${result.discountValue.toLocaleString()}`;
        promoFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Code <strong>${result.promoCode}</strong> applied! You get ${discText} off via promoter ${result.influencer.name}.`;
      }
      if (btnApplyPromo) {
        btnApplyPromo.textContent = 'Applied ✓';
        btnApplyPromo.classList.add('btn-primary');
        btnApplyPromo.classList.remove('btn-outline');
      }
    } else {
      appliedPromoResult = null;
      if (promoFeedback) {
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#DC2626';
        promoFeedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${result.message}`;
      }
      if (btnApplyPromo) {
        btnApplyPromo.textContent = 'Apply';
        btnApplyPromo.classList.remove('btn-primary');
        btnApplyPromo.classList.add('btn-outline');
      }
    }
    calculateTotals();
  }

  if (btnApplyPromo && promoCodeInput) {
    btnApplyPromo.addEventListener('click', () => {
      handleApplyPromo(promoCodeInput.value.trim());
    });
    promoCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyPromo(promoCodeInput.value.trim());
      }
    });
  }

  // Auto-apply if referral param or active referrer is detected
  if (refParam) {
    const cleanRef = String(refParam).trim().toLowerCase().replace(/^@/, '');
    const eventInfluencers = store.getInfluencers(eventId);
    const matchedInf = eventInfluencers.find(inf =>
      (inf.username && inf.username.toLowerCase() === cleanRef) ||
      (inf.promoCode && inf.promoCode.toLowerCase() === cleanRef) ||
      (inf.id && inf.id.toLowerCase() === cleanRef)
    );

    if (matchedInf && matchedInf.promoCode) {
      if (promoCodeInput) promoCodeInput.value = matchedInf.promoCode;
      handleApplyPromo(matchedInf.promoCode);
    } else {
      if (sumInfTag) {
        sumInfTag.style.display = 'flex';
        if (sumInfName) sumInfName.textContent = `Ambassador`;
        if (sumInfHandle) sumInfHandle.textContent = `@${cleanRef}`;
      }
    }
  }

  // Quantity Handlers
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        if (qtyInput) qtyInput.value = currentQty;
        calculateTotals();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      if (currentQty < 10) {
        currentQty++;
        if (qtyInput) qtyInput.value = currentQty;
        calculateTotals();
      }
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < 1) val = 1;
      if (val > 10) val = 10;
      currentQty = val;
      qtyInput.value = currentQty;
      calculateTotals();
    });
  }

  if (ticketTypeSelect) {
    ticketTypeSelect.addEventListener('change', calculateTotals);
  }

  // Initial Calculation
  calculateTotals();

  // Listen for realtime store updates from Firestore
  window.addEventListener('bookam_store_updated', () => {
    const freshEvent = store.getEventById(eventId);
    if (freshEvent && freshEvent.tickets && freshEvent.tickets.length > 0) {
      availableTickets = freshEvent.tickets;
      populateTicketTypes();
      calculateTotals();
    }
  });

  // Submit Form -> Order Draft
  const buyForm = document.getElementById('buy-ticket-form');
  if (buyForm) {
    buyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('buyer-name').value.trim();
      const email = document.getElementById('buyer-email').value.trim();
      const phone = document.getElementById('buyer-phone').value.trim();

      const orderData = calculateTotals();
      orderData.customerName = fullName;
      orderData.customerEmail = email;
      orderData.customerPhone = phone;

      store.setCurrentOrder(orderData);
      window.location.href = 'checkout.html';
    });
  }
});
