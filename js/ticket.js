/**
 * BOOKAM - Ticket Display & QR Code Generator Script (ticket.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  const refParam = urlParams.get('ref');

  let ticket = null;
  if (ticketId) {
    ticket = store.getTicketById(ticketId);
  }

  if (!ticket && refParam) {
    ticket = store.getTickets().find(t => t.paymentRef === refParam || t.paymentId === refParam);
    if (!ticket) {
      // Check payment status directly
      const payRes = store.checkPaymentConfirmation(refParam);
      if (payRes.found && payRes.payment) {
        const p = payRes.payment;
        ticket = {
          id: 'BKM-' + (p.paymentRef ? p.paymentRef.replace(/[^A-Za-z0-9]/g, '') : 'PASS'),
          eventName: p.eventName || 'Event',
          eventDate: p.eventDate || '2026-10-01',
          eventTime: p.eventTime || '10:00 AM',
          eventVenue: p.eventVenue || 'Venue Center',
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          customerPhone: p.customerPhone,
          ticketType: p.ticketType,
          quantity: p.quantity,
          status: p.status === 'Approved' ? 'APPROVED' : p.status
        };
      }
    }
  }

  // Fallback if no ID specified: pick the latest ticket or mock approved ticket
  if (!ticket) {
    const tickets = store.getTickets();
    if (tickets.length > 0) {
      ticket = tickets[0];
    } else {
      // Create a demonstration ticket
      ticket = {
        id: 'BKM-2026-000001',
        eventName: 'Global Tech Summit & AI Expo 2026',
        eventDate: '2026-09-15',
        eventTime: '09:00 AM - 05:00 PM',
        eventVenue: 'Tech Hub Center, San Francisco / Online',
        customerName: 'Alex Morgan',
        customerEmail: 'alex.morgan@example.com',
        customerPhone: '+1 (555) 234-5678',
        ticketType: 'VIP All-Access',
        quantity: 2,
        status: 'APPROVED'
      };
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

  function renderTicket(t) {
    if (!t) return;
    document.getElementById('tkt-number').textContent = t.id;
    document.getElementById('tkt-customer-name').textContent = t.customerName || 'Guest Attendee';
    document.getElementById('tkt-customer-email').textContent = t.customerEmail || '';
    document.getElementById('tkt-customer-phone').textContent = t.customerPhone || '';

    document.getElementById('tkt-event-title').textContent = t.eventName || 'Event';
    document.getElementById('tkt-event-venue').textContent = t.eventVenue || '';
    document.getElementById('tkt-event-date').textContent = store.formatDate(t.eventDate);
    document.getElementById('tkt-event-time').textContent = t.eventTime || '08:00 AM';
    document.getElementById('tkt-ticket-type').textContent = `${t.ticketType || 'Pass'} (${t.quantity || 1}x)`;

    // Update Status Badge if Revoked/Rejected
    const statusEl = document.querySelector('.ticket-status-approved, .ticket-status-revoked');
    if (statusEl) {
      if (t.status === 'REVOKED' || t.status === 'Cancelled' || t.status === 'Rejected') {
        statusEl.className = 'ticket-status-revoked';
        statusEl.style.background = '#FEE2E2';
        statusEl.style.color = '#DC2626';
        statusEl.style.borderColor = '#FCA5A5';
        statusEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> PAYMENT REJECTED &amp; PASS REVOKED';
      } else {
        statusEl.className = 'ticket-status-approved';
        statusEl.style.background = '';
        statusEl.style.color = '';
        statusEl.style.borderColor = '';
        statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> APPROVED';
      }
    }

    // Generate QR Code
    const qrContainer = document.getElementById('qrcode-box');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      const qrText = `BOOKAM-TICKET|ID:${t.id}|EVENT:${t.eventName}|NAME:${t.customerName}|STATUS:${t.status}`;

      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
          text: qrText,
          width: 160,
          height: 160,
          colorDark: '#1F2937',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrText)}`;
        const img = document.createElement('img');
        img.src = qrImgUrl;
        img.alt = 'Ticket QR Code';
        img.style.width = '160px';
        img.style.height = '160px';
        qrContainer.appendChild(img);
      }
    }

    // Configure Email Pass to Gmail button
    const origin = window.location.origin;
    const ticketUrl = `${origin}/ticket.html?id=${encodeURIComponent(t.id)}`;
    const custEmail = t.customerEmail || '';
    const custName = t.customerName || 'Attendee';
    const eventName = t.eventName || 'Event';
    const emailSubject = `[BOOKAM TICKET PASS] My Official Ticket for ${eventName} - #${t.id}`;
    const emailBody = `Hi ${custName},

Here is your official active ticket pass for ${eventName}:

==================================================
🎟️ BOOKAM EVENT PASS
==================================================
Event: ${eventName}
Pass ID: ${t.id}
Attendee: ${custName}
Date: ${store.formatDate ? store.formatDate(t.eventDate) : t.eventDate}
Time: ${t.eventTime || '08:00 AM'}
Venue: ${t.eventVenue}
Package: ${t.ticketType || 'Pass'} (${t.quantity || 1}x)
Status: ACTIVE & VERIFIED
==================================================

👉 ACCESS & SCAN YOUR PASS:
${ticketUrl}

Present this QR pass on your phone at entry!`;

    const emailBtn = document.getElementById('tkt-email-btn');
    if (emailBtn) {
      emailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(custEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    }

    const waBtn = document.getElementById('tkt-whatsapp-btn');
    if (waBtn) {
      const waText = encodeURIComponent(`🎟️ My official ticket pass for *${eventName}* (Pass #${t.id}): ${ticketUrl}`);
      waBtn.href = `https://wa.me/?text=${waText}`;
    }
  }

  // Populate Ticket Fields
  renderTicket(ticket);

  window.addEventListener('bookam_store_updated', () => {
    let updated = null;
    if (ticketId) updated = store.getTicketById(ticketId);
    if (!updated && refParam) {
      updated = store.getTickets().find(t => t.paymentRef === refParam || t.paymentId === refParam);
      if (!updated) {
        const payRes = store.checkPaymentConfirmation(refParam);
        if (payRes && payRes.found && payRes.payment) {
          const p = payRes.payment;
          updated = payRes.ticket || {
            id: 'BKM-' + (p.paymentRef ? p.paymentRef.replace(/[^A-Za-z0-9]/g, '') : 'PASS'),
            eventName: p.eventName,
            eventDate: p.eventDate,
            eventTime: p.eventTime || '08:00 AM',
            eventVenue: p.eventVenue,
            customerName: p.customerName,
            customerEmail: p.customerEmail,
            customerPhone: p.customerPhone,
            ticketType: p.ticketType,
            quantity: p.quantity,
            status: p.status === 'Approved' ? 'APPROVED' : p.status
          };
        }
      }
    }
    if (updated) renderTicket(updated);
  });

  // Async online check if opened directly with ref or id
  if (refParam || ticketId) {
    store.checkPaymentConfirmationOnline(ticketId || refParam).then(res => {
      if (res && res.found) {
        if (res.ticket) {
          renderTicket(res.ticket);
        } else if (res.payment && res.payment.status === 'Approved') {
          const t = store.generateTicketForPayment(res.payment);
          if (t) renderTicket(t);
        }
      }
    }).catch(e => console.warn('Ticket online verification sync error:', e));
  }

  // Print Ticket Button
  const printBtn = document.getElementById('print-ticket-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Download Ticket Button
  const downloadBtn = document.getElementById('download-ticket-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
