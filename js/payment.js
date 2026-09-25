/**
 * BOOKAM - Manual Bank Transfer Payment Script (payment.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const urlParams = new URLSearchParams(window.location.search);
  const checkRefParam = urlParams.get('checkRef') || urlParams.get('ref');

  let order = store.getCurrentOrder();

  const mainPaymentContent = document.getElementById('payment-main-content');
  const successState = document.getElementById('payment-success-state');

  // If no active order and no checkRef, show lookup mode instead of bouncing away
  if ((!order || !order.customerName) && !checkRefParam) {
    if (mainPaymentContent) {
      mainPaymentContent.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); margin-bottom: 2rem;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #EEF2FF; color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">
            <i class="fa-solid fa-receipt"></i>
          </div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem;">Payment & Ticket Portal</h2>
          <p style="color: var(--gray-600); max-width: 500px; margin: 0 auto 1.5rem; font-size: 0.9rem;">
            You can verify the approval status of an existing bank transfer below, or choose an event to book tickets.
          </p>
          <a href="events.html" class="btn btn-primary">
            <i class="fa-solid fa-compass"></i> Browse Events & Buy Tickets
          </a>
        </div>
      `;
    }
  }

  const organizer = store.getOrganizer();

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

  // Populate Bank Transfer Info if order exists
  let paymentRef = '';
  if (order && order.customerName) {
    paymentRef = order.paymentRef || ('REF-' + Math.floor(100000 + Math.random() * 900000));

    if (document.getElementById('pay-bank-name')) document.getElementById('pay-bank-name').textContent = organizer.bankName;
    if (document.getElementById('pay-account-name')) document.getElementById('pay-account-name').textContent = organizer.accountName;
    if (document.getElementById('pay-account-number')) document.getElementById('pay-account-number').textContent = organizer.accountNumber;
    if (document.getElementById('pay-amount')) document.getElementById('pay-amount').textContent = store.formatCurrency(order.totalAmount);
    
    const refInput = document.getElementById('pay-reference-input');
    if (refInput) {
      refInput.value = paymentRef;
      refInput.addEventListener('input', () => {
        const noticeElem = document.getElementById('pay-ref-notice');
        if (noticeElem) noticeElem.textContent = refInput.value.trim() || paymentRef;
      });
    }

    const noticeRefElem = document.getElementById('pay-ref-notice');
    if (noticeRefElem) noticeRefElem.textContent = paymentRef;

    const noticeEmailElem = document.getElementById('notice-cust-email');
    if (noticeEmailElem) noticeEmailElem.textContent = order.customerEmail || 'your email';

    // Populate Customer Details
    if (document.getElementById('pay-customer-name')) document.getElementById('pay-customer-name').textContent = order.customerName;
    if (document.getElementById('pay-customer-email')) document.getElementById('pay-customer-email').textContent = order.customerEmail;
    if (document.getElementById('pay-customer-phone')) document.getElementById('pay-customer-phone').textContent = order.customerPhone;
    if (document.getElementById('pay-event-title')) document.getElementById('pay-event-title').textContent = order.eventName;
    if (document.getElementById('pay-ticket-details')) document.getElementById('pay-ticket-details').textContent = `${order.ticketType} (${order.quantity}x)`;
  }

  // Copy Buttons
  window.copyText = function(text, elementId) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById(elementId);
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
      }
    }).catch(err => {
      console.error('Copy failed', err);
    });
  };

  // Real-time verification tracker
  let activeTrackingRef = null;

  function updatePaymentTracker(payment) {
    const trackerBox = document.getElementById('payment-status-tracker-box');
    const badge = document.getElementById('live-payment-status-badge');
    const msg = document.getElementById('live-tracker-msg');
    const viewBtn = document.getElementById('btn-view-approved-ticket');
    const emailBtn = document.getElementById('btn-email-approved-ticket');
    const topBadge = document.getElementById('success-status-badge');
    const topIcon = document.getElementById('success-state-icon');
    const topHeading = document.getElementById('success-heading');
    const successSubtext = document.getElementById('success-subtext');

    if (!payment || !trackerBox) return;

    if (payment.status === 'Approved') {
      if (badge) {
        badge.className = 'badge badge-green';
        badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Approved & Pass Active';
      }
      if (topBadge) {
        topBadge.className = 'badge badge-green';
        topBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Payment Status: Approved by Organizer';
      }
      if (topIcon) {
        topIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10B981;"></i>';
      }
      if (topHeading) {
        topHeading.textContent = 'Payment Approved by Organizer!';
      }
      if (successSubtext) {
        successSubtext.innerHTML = `Great news! The event organizer has confirmed and approved your transfer. Your official active QR entry ticket has been issued for <strong>${payment.customerName}</strong>.`;
      }
      if (msg) {
        msg.innerHTML = `Your transfer with reference <strong>${payment.paymentRef}</strong> was approved by the event organizer. Your official QR pass is active and ready to access below.`;
      }
      if (viewBtn) {
        viewBtn.style.display = 'inline-flex';
        // Locate associated ticket
        const tkt = store.getTickets().find(t => t.paymentId === payment.id || t.paymentRef === payment.paymentRef || t.customerEmail === payment.customerEmail);
        const passId = tkt ? tkt.id : `BKM-${payment.paymentRef.replace(/[^A-Za-z0-9]/g, '')}`;
        viewBtn.href = tkt ? `ticket.html?id=${tkt.id}` : `ticket.html?ref=${payment.paymentRef}`;

        if (emailBtn) {
          const origin = window.location.origin;
          const ticketUrl = `${origin}/ticket.html?id=${encodeURIComponent(passId)}`;
          const custEmail = payment.customerEmail || '';
          const custName = payment.customerName || 'Attendee';
          const eventName = payment.eventName || 'Event';
          const subject = encodeURIComponent(`[BOOKAM PASS] My Ticket for ${eventName} - #${passId}`);
          const body = encodeURIComponent(`Hi ${custName},\n\nHere is your official verified event entry pass for ${eventName}:\n\nPass ID: ${passId}\nEvent: ${eventName}\nAttendee: ${custName}\n\n👉 View & Scan Your Pass:\n${ticketUrl}\n\nPresent this QR code pass at check-in!`);

          emailBtn.style.display = 'inline-flex';
          emailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(custEmail)}&su=${subject}&body=${body}`;
        }
      }
      const verifyOnlineBtn = document.getElementById('btn-verify-online-now');
      if (verifyOnlineBtn) verifyOnlineBtn.style.display = 'none';
    } else if (payment.status === 'Rejected') {
      if (badge) {
        badge.className = 'badge badge-red';
        badge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Payment Rejected by Organizer';
      }
      if (topBadge) {
        topBadge.className = 'badge badge-red';
        topBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Payment Status: Rejected';
      }
      if (topIcon) {
        topIcon.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #EF4444;"></i>';
      }
      if (topHeading) {
        topHeading.textContent = 'Payment Transfer Rejected';
      }
      if (successSubtext) {
        successSubtext.innerHTML = `The organizer was unable to verify this bank transfer reference <strong>${payment.paymentRef}</strong>.`;
      }
      if (msg) {
        msg.innerHTML = `This transfer was rejected on the organizer dashboard. Please verify your bank receipt or contact BOOKAM organizer support for assistance.`;
      }
      if (viewBtn) viewBtn.style.display = 'none';
      if (emailBtn) emailBtn.style.display = 'none';
      const verifyOnlineBtn = document.getElementById('btn-verify-online-now');
      if (verifyOnlineBtn) verifyOnlineBtn.style.display = 'none';
    } else {
      // Pending Approval state
      if (badge) {
        badge.className = 'badge badge-amber';
        badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pending Organizer Approval';
      }
      if (topBadge) {
        topBadge.className = 'badge badge-amber';
        topBadge.innerHTML = '<i class="fa-solid fa-clock"></i> Payment Status: Awaiting Organizer Approval';
      }
      if (topIcon) {
        topIcon.innerHTML = '<i class="fa-solid fa-clock" style="color: #F59E0B;"></i>';
      }
      if (topHeading) {
        topHeading.textContent = 'Payment Notice Submitted for Approval';
      }
      if (successSubtext) {
        successSubtext.innerHTML = `Your transfer notice has been sent to the event organizer. As soon as the organizer reviews and accepts your payment on the organizer dashboard, your official ticket pass will be generated.`;
      }
      if (msg) {
        msg.innerHTML = `Your transfer notice with reference <strong>${payment.paymentRef}</strong> is awaiting verification on the organizer dashboard. This page updates live as soon as the organizer approves or rejects.`;
      }
      if (viewBtn) viewBtn.style.display = 'none';
      if (emailBtn) emailBtn.style.display = 'none';
      const verifyOnlineBtn = document.getElementById('btn-verify-online-now');
      if (verifyOnlineBtn) {
        verifyOnlineBtn.style.display = 'none';
      }
    }
  }

  async function checkActiveTracking() {
    if (!activeTrackingRef) return;
    const res = await store.checkPaymentConfirmationOnline(activeTrackingRef);
    if (res && res.found) {
      updatePaymentTracker(res.payment);
    }
  }

  // Interactive Payment Submission Flow (Submits to Organizer Dashboard for manual approval)
  async function startOnlineVerificationFlow(ref, senderDetails = {}) {
    const modal = document.getElementById('online-verify-modal');
    if (modal) modal.style.display = 'flex';

    const stepConnect = document.getElementById('step-connect');
    const stepMatch = document.getElementById('step-match');
    const stepApprove = document.getElementById('step-approve');
    const stepTicket = document.getElementById('step-ticket');
    const modalTitle = document.getElementById('verify-modal-title');
    const modalDesc = document.getElementById('verify-modal-desc');
    const modalFooter = document.getElementById('verify-modal-footer');
    const modalSpinner = document.getElementById('verify-spinner-box');
    const modalViewTicketBtn = document.getElementById('btn-modal-view-ticket');

    const setStep = (el, state, text) => {
      if (!el) return;
      const iconSpan = el.querySelector('.step-icon');
      const textSpan = el.querySelector('span:last-child');
      if (state === 'active') {
        el.style.color = '#0F172A';
        el.style.fontWeight = '700';
        if (iconSpan) iconSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color: var(--primary);"></i>';
      } else if (state === 'done') {
        el.style.color = '#047857';
        el.style.fontWeight = '600';
        if (iconSpan) iconSpan.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10B981;"></i>';
      }
      if (text && textSpan) textSpan.textContent = text;
    };

    // Step 1: Organizer Connection
    setStep(stepConnect, 'active', 'Connecting to BOOKAM Organizer Network...');
    await new Promise(r => setTimeout(r, 450));
    setStep(stepConnect, 'done', 'Connected to BOOKAM Organizer Portal');

    // Step 2: Register Reference & Details
    setStep(stepMatch, 'active', `Registering transaction reference ${ref}...`);
    await new Promise(r => setTimeout(r, 450));
    setStep(stepMatch, 'done', `Reference ${ref} registered with sender details`);

    // Step 3: Deliver to Organizer Dashboard Inbox
    setStep(stepApprove, 'active', 'Submitting payment details to organizer dashboard queue...');
    await new Promise(r => setTimeout(r, 450));
    setStep(stepApprove, 'done', 'Delivered to organizer approval queue');

    // Step 4: Awaiting Organizer Review
    setStep(stepTicket, 'active', 'Awaiting organizer manual review & approval...');
    await new Promise(r => setTimeout(r, 400));
    setStep(stepTicket, 'done', 'Queued for Organizer Decision (Accept / Reject)');

    // Update modal completion UI
    if (modalSpinner) {
      modalSpinner.style.background = '#FEF3C7';
      modalSpinner.innerHTML = '<i class="fa-solid fa-clock" style="color: #D97706; font-size: 2rem;"></i>';
    }
    if (modalTitle) modalTitle.textContent = 'Submitted for Organizer Approval!';
    if (modalDesc) modalDesc.textContent = 'Your transfer notice has been sent to the organizer dashboard. As soon as the organizer reviews and accepts your payment, your pass will unlock automatically.';

    // Switch main screen to pending submission view
    if (mainPaymentContent) mainPaymentContent.style.display = 'none';
    if (successState) {
      successState.style.display = 'block';
      const refElem = document.getElementById('success-ref-code');
      if (refElem) refElem.textContent = ref;
      const emailElem = document.getElementById('success-cust-email');
      if (emailElem && order) emailElem.textContent = order.customerEmail;
      
      const topBadge = document.getElementById('success-status-badge');
      if (topBadge) {
        topBadge.className = 'badge badge-amber';
        topBadge.innerHTML = '<i class="fa-solid fa-clock"></i> Payment Status: Awaiting Organizer Approval';
      }
      const topHeading = document.getElementById('success-heading');
      if (topHeading) {
        topHeading.textContent = 'Payment Notice Submitted!';
      }
      const topIcon = document.getElementById('success-state-icon');
      if (topIcon) {
        topIcon.innerHTML = '<i class="fa-solid fa-clock" style="color: #F59E0B;"></i>';
      }
      const viewBtn = document.getElementById('btn-view-approved-ticket');
      if (viewBtn) viewBtn.style.display = 'none';
      const emailBtn = document.getElementById('btn-email-approved-ticket');
      if (emailBtn) emailBtn.style.display = 'none';

      const trackerMsg = document.getElementById('live-tracker-msg');
      if (trackerMsg) {
        trackerMsg.innerHTML = `Your transfer with reference <strong>${ref}</strong> has been delivered to the organizer. This screen monitors live status and will unlock your digital pass the moment the organizer approves.`;
      }
    }

    setTimeout(() => {
      if (modal) modal.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);

    // Start auto-tracking interval
    activeTrackingRef = ref;
    setInterval(checkActiveTracking, 2500);
  }

  // Expose to window for lookup cards
  window.runOnlineVerification = async function(ref) {
    if (!ref) return;
    await startOnlineVerificationFlow(ref);
    if (lookupInput && lookupInput.value.trim()) {
      await performLookup(lookupInput.value.trim());
    }
  };

  // Click "I HAVE PAID — VERIFY ONLINE NOW" Button
  const confirmBtn = document.getElementById('confirm-payment-btn');
  const refInput = document.getElementById('pay-reference-input');

  if (confirmBtn && order) {
    confirmBtn.addEventListener('click', async () => {
      const finalRef = (refInput && refInput.value.trim()) ? refInput.value.trim() : paymentRef;
      activeTrackingRef = finalRef;

      const senderName = document.getElementById('pay-sender-name')?.value.trim() || '';
      const senderBank = document.getElementById('pay-sender-bank')?.value.trim() || '';

      const paymentData = {
        eventId: order.eventId,
        eventName: order.eventName,
        eventDate: order.eventDate,
        eventTime: order.eventTime,
        eventVenue: order.eventVenue,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        ticketType: order.ticketType,
        ticketPrice: order.unitPrice,
        quantity: order.quantity,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount || 0,
        discountedSubtotal: order.discountedSubtotal || order.subtotal,
        serviceCharge: order.serviceCharge,
        totalAmount: order.totalAmount,
        influencerId: order.influencerId || null,
        influencerName: order.influencerName || null,
        influencerHandle: order.influencerHandle || null,
        promoCode: order.promoCode || null,
        commissionAmount: order.commissionAmount || 0,
        commissionType: order.commissionType || null,
        commissionValue: order.commissionValue || null,
        paymentRef: finalRef,
        bankName: organizer.bankName || 'Moniepoint',
        accountName: organizer.accountName || 'KAIWE DIGITAL',
        accountNumber: organizer.accountNumber || '8021174926',
        senderName: senderName || null,
        senderBank: senderBank || null,
        status: 'Pending Approval'
      };

      // Save to localStorage & Firestore
      store.savePayment(paymentData);

      // Trigger instant online verification flow
      await startOnlineVerificationFlow(finalRef, { senderName, senderBank });
    });
  }

  // Live Status Refresh Button in Tracker
  const btnCheckLive = document.getElementById('btn-check-live-status');
  if (btnCheckLive) {
    btnCheckLive.addEventListener('click', async () => {
      btnCheckLive.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Delivery...';
      await checkActiveTracking();
      setTimeout(() => {
        btnCheckLive.innerHTML = '<i class="fa-solid fa-rotate"></i> Re-check Status';
      }, 500);
    });
  }

  // Payment Confirmation Lookup Tool
  const lookupForm = document.getElementById('payment-lookup-form');
  const lookupInput = document.getElementById('lookup-ref-input');
  const lookupResultBox = document.getElementById('lookup-result-box');

  async function performLookup(query) {
    if (!query || !lookupResultBox) return;
    const res = await store.checkPaymentConfirmationOnline(query);

    lookupResultBox.style.display = 'block';
    if (!res || !res.found) {
      lookupResultBox.style.background = '#FEF2F2';
      lookupResultBox.style.border = '1px solid #FECACA';
      lookupResultBox.innerHTML = `
        <div style="color: #991B1B; font-size: 0.9rem;">
          <i class="fa-solid fa-circle-exclamation"></i> No payment record found matching <strong>"${query}"</strong>. 
          Please verify your reference number (e.g. <code>REF-123456</code>) or email address.
        </div>
      `;
      return;
    }

    const p = res.payment;
    const isApproved = p.status === 'Approved';
    const isRejected = p.status === 'Rejected';

    lookupResultBox.style.background = isApproved ? '#F0FDF4' : (isRejected ? '#FEF2F2' : '#FFFBEB');
    lookupResultBox.style.border = `1px solid ${isApproved ? '#BBF7D0' : (isRejected ? '#FECACA' : '#FDE68A')}`;

    const badgeClass = isApproved ? 'badge-green' : (isRejected ? 'badge-red' : 'badge-amber');
    const badgeIcon = isApproved ? 'fa-circle-check' : (isRejected ? 'fa-circle-xmark' : 'fa-clock');
    const statusLabel = isApproved ? 'Successful' : (isRejected ? 'Rejected' : (p.status || 'Pending'));

    // Find linked ticket
    const ticket = res.ticket || store.getTickets().find(t => t.paymentId === p.id || t.paymentRef === p.paymentRef || t.customerEmail === p.customerEmail);

    lookupResultBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; font-weight: 700;">Reference</span>
          <div style="font-weight: 800; font-family: monospace; font-size: 1.1rem; color: var(--dark);">${p.paymentRef}</div>
        </div>
        <span class="badge ${badgeClass}" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
          <i class="fa-solid ${badgeIcon}"></i> Status: ${statusLabel}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; font-size: 0.85rem; margin-bottom: 1rem; background: rgba(255,255,255,0.7); padding: 0.75rem; border-radius: var(--radius-sm);">
        <div><span style="color: var(--gray-500);">Event:</span> <strong>${p.eventName || 'Event'}</strong></div>
        <div><span style="color: var(--gray-500);">Customer:</span> <strong>${p.customerName}</strong></div>
        <div><span style="color: var(--gray-500);">Amount:</span> <strong>${store.formatCurrency(p.totalAmount)}</strong></div>
        <div><span style="color: var(--gray-500);">Tickets:</span> <strong>${p.quantity}x ${p.ticketType}</strong></div>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
        ${isApproved ? `
          <a href="ticket.html?${ticket ? 'id=' + ticket.id : 'ref=' + p.paymentRef}" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-ticket"></i> View Official Entry Pass
          </a>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(p.customerEmail || '')}&su=${encodeURIComponent(`[BOOKAM PASS] Official Ticket for ${p.eventName || 'Event'} - #${ticket ? ticket.id : p.paymentRef}`)}&body=${encodeURIComponent(`Hi ${p.customerName},\n\nYour verified ticket pass for ${p.eventName} is ready:\nPass ID: ${ticket ? ticket.id : p.paymentRef}\nVenue: ${p.eventVenue || 'Venue'}\nDate: ${p.eventDate || ''}\n\nView Pass: ${window.location.origin}/ticket.html?${ticket ? 'id=' + ticket.id : 'ref=' + p.paymentRef}`)}" target="_blank" class="btn btn-outline btn-sm" style="color: #EA4335; border-color: #FCA5A5; text-decoration: none;">
            <i class="fa-brands fa-google"></i> Open Pass in Gmail
          </a>
        ` : `
          <div style="font-size: 0.85rem; color: #92400E; display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
            <span><i class="fa-solid fa-clock"></i> Awaiting Organizer Decision: The event organizer is reviewing this transfer on the dashboard.</span>
            <button type="button" class="btn btn-outline btn-sm" onclick="performLookup('${p.paymentRef}')">
              <i class="fa-solid fa-rotate"></i> Re-check Status
            </button>
          </div>
        `}
      </div>
    `;
  }

  if (lookupForm && lookupInput) {
    lookupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      performLookup(lookupInput.value.trim());
    });
  }

  // If checkRef was in URL, auto run
  if (checkRefParam) {
    if (lookupInput) lookupInput.value = checkRefParam;
    performLookup(checkRefParam);
  }

  // Listen for realtime store updates (e.g. from organizer approval)
  window.addEventListener('bookam_store_updated', () => {
    checkActiveTracking();
    if (lookupInput && lookupInput.value.trim() && lookupResultBox && lookupResultBox.style.display !== 'none') {
      performLookup(lookupInput.value.trim());
    }
  });

  // Background poller every 4 seconds for immediate feedback
  setInterval(() => {
    checkActiveTracking();
  }, 4000);
});
