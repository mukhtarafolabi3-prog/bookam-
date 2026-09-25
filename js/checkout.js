/**
 * BOOKAM - Checkout Review Script (checkout.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const order = store.getCurrentOrder();
  if (!order || !order.customerName) {
    window.location.href = 'events.html';
    return;
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

  // Populate Buyer & Event Info
  document.getElementById('chk-buyer-name').textContent = order.customerName;
  document.getElementById('chk-buyer-email').textContent = order.customerEmail;
  document.getElementById('chk-buyer-phone').textContent = order.customerPhone;

  document.getElementById('chk-event-name').textContent = order.eventName;
  document.getElementById('chk-event-date').textContent = store.formatDate(order.eventDate) + ' • ' + order.eventTime;
  document.getElementById('chk-event-venue').textContent = order.eventVenue;

  // Influencer Attribution Tag
  const infBanner = document.getElementById('chk-influencer-banner');
  const infName = document.getElementById('chk-influencer-name');
  const infHandle = document.getElementById('chk-influencer-handle');
  const promoCodeTag = document.getElementById('chk-promo-code');

  if (order.influencerName || order.promoCode) {
    if (infBanner) infBanner.style.display = 'block';
    if (infName) infName.textContent = order.influencerName || 'Promoter';
    if (infHandle) infHandle.textContent = `@${order.influencerHandle || 'promoter'}`;
    if (promoCodeTag) promoCodeTag.textContent = order.promoCode || 'PROMO';
  } else if (infBanner) {
    infBanner.style.display = 'none';
  }

  // Breakdown
  document.getElementById('chk-ticket-type').textContent = `${order.ticketType} Ticket (${order.quantity}x)`;
  document.getElementById('chk-unit-price').textContent = store.formatCurrency(order.unitPrice);
  document.getElementById('chk-subtotal').textContent = store.formatCurrency(order.subtotal);

  const discountRow = document.getElementById('chk-discount-row');
  const discountLabel = document.getElementById('chk-discount-label');
  const discountAmount = document.getElementById('chk-discount-amount');
  const netSubtotalRow = document.getElementById('chk-net-subtotal-row');
  const netSubtotal = document.getElementById('chk-net-subtotal');

  if (order.discountAmount && order.discountAmount > 0) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountLabel) discountLabel.textContent = order.promoCode || 'PROMO';
    if (discountAmount) discountAmount.textContent = `-${store.formatCurrency(order.discountAmount)}`;
    if (netSubtotalRow) netSubtotalRow.style.display = 'flex';
    if (netSubtotal) netSubtotal.textContent = store.formatCurrency(order.discountedSubtotal || (order.subtotal - order.discountAmount));
  } else {
    if (discountRow) discountRow.style.display = 'none';
    if (netSubtotalRow) netSubtotalRow.style.display = 'none';
  }

  // Ensure service fee is set to ₦400 for paid ticket checkouts (0 for complimentary/free passes)
  const currentNetSubtotal = order.discountedSubtotal !== undefined && order.discountedSubtotal !== null
    ? order.discountedSubtotal
    : (order.subtotal - (order.discountAmount || 0));
  const serviceCharge = currentNetSubtotal > 0 ? 400 : 0;
  order.serviceCharge = serviceCharge;
  order.totalAmount = currentNetSubtotal + serviceCharge;
  store.setCurrentOrder(order);

  document.getElementById('chk-service-charge').textContent = store.formatCurrency(order.serviceCharge);
  document.getElementById('chk-total-amount').textContent = store.formatCurrency(order.totalAmount);

  // Reference Code Handling
  const refInput = document.getElementById('chk-payment-ref');
  const genRefBtn = document.getElementById('chk-gen-ref-btn');
  const copyRefBtn = document.getElementById('chk-copy-ref-btn');
  const refEmailText = document.getElementById('chk-ref-email');

  if (refEmailText) refEmailText.textContent = order.customerEmail || 'your email';

  // Generate or populate existing reference
  if (refInput) {
    if (!order.paymentRef) {
      order.paymentRef = 'REF-' + Math.floor(100000 + Math.random() * 900000);
    }
    refInput.value = order.paymentRef;
  }

  if (genRefBtn && refInput) {
    genRefBtn.addEventListener('click', () => {
      const newRef = 'REF-' + Math.floor(100000 + Math.random() * 900000);
      refInput.value = newRef;
      order.paymentRef = newRef;
    });
  }

  if (copyRefBtn && refInput) {
    copyRefBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(refInput.value).then(() => {
        const orig = copyRefBtn.innerHTML;
        copyRefBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { copyRefBtn.innerHTML = orig; }, 2000);
      });
    });
  }

  // Continue to Payment button
  const continueBtn = document.getElementById('chk-continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (refInput && refInput.value.trim()) {
        order.paymentRef = refInput.value.trim();
      } else {
        order.paymentRef = 'REF-' + Math.floor(100000 + Math.random() * 900000);
      }
      store.setCurrentOrder(order);
      window.location.href = 'payment.html';
    });
  }
});
