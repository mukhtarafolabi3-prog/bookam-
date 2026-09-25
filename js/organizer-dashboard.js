/**
 * BOOKAM - Organizer Dashboard Script (organizer-dashboard.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  // Guard: Organizer Registration / Sign In check
  if (!store.isOrganizerLoggedIn()) {
    window.location.href = 'organizer-register.html?mode=login';
    return;
  }

  const organizer = store.getCurrentOrganizer();

  // Populate Organizer Profile Details
  const dashOrgName = document.getElementById('dash-org-name');
  const dashOrgEmail = document.getElementById('dash-org-email');
  const dashOrgBank = document.getElementById('dash-org-bank');
  const navOrgBadge = document.getElementById('nav-org-badge');

  if (dashOrgName) dashOrgName.textContent = organizer.organizationName || organizer.name;
  if (dashOrgEmail) dashOrgEmail.textContent = organizer.email;
  if (dashOrgBank) dashOrgBank.textContent = `Moniepoint - KAIWE DIGITAL (8021174926)`;
  if (navOrgBadge) navOrgBadge.innerHTML = `<i class="fa-solid fa-user-circle" style="color: var(--primary);"></i> ${organizer.organizationName || organizer.name}`;

  // Logout Handlers
  function handleLogout(e) {
    if (e) e.preventDefault();
    store.logoutOrganizer();
    window.location.href = 'organizer-register.html?mode=login';
  }

  const logoutBtns = document.querySelectorAll('#dash-logout-btn, #nav-logout-btn, #mobile-logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });

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

  // Tabs Setup
  const tabs = document.querySelectorAll('.dash-tab');
  const tabContents = document.querySelectorAll('.dash-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = 'block';
    });
  });

  // Clear Processed Payments Button
  const clearProcessedPaymentsBtn = document.getElementById('btn-clear-processed-payments');
  if (clearProcessedPaymentsBtn) {
    clearProcessedPaymentsBtn.addEventListener('click', () => {
      if (confirm('Clear all approved and rejected payment logs from the pending tab?')) {
        store.clearProcessedPayments();
        refreshDashboard();
      }
    });
  }

  // Delete All Approved Tickets Button
  const deleteAllTicketsBtn = document.getElementById('btn-delete-all-tickets');
  if (deleteAllTicketsBtn) {
    deleteAllTicketsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete ALL approved active tickets? This action cannot be undone.')) {
        store.deleteAllTickets();
        refreshDashboard();
      }
    });
  }

  // Delete All Expired Events Button
  const deleteExpiredEventsBtn = document.getElementById('btn-delete-expired-events');
  if (deleteExpiredEventsBtn) {
    deleteExpiredEventsBtn.addEventListener('click', () => {
      const count = store.deleteExpiredEvents();
      if (count > 0) {
        alert(`Successfully removed ${count} expired event(s). Dashboard updated!`);
      } else {
        alert('No expired events found to delete.');
      }
      refreshDashboard();
    });
  }

  // Reset Metrics to Zero Button
  const resetMetricsBtn = document.getElementById('btn-reset-metrics-zero');
  if (resetMetricsBtn) {
    resetMetricsBtn.addEventListener('click', () => {
      if (confirm('Reset Total Platform Revenue to ₦0.00, Active People / Voters to 0, and Approved Passes to 0?')) {
        store.resetPlatformMetricsToZero();
        refreshDashboard();
      }
    });
  }

  // Tab Create Event Button
  const createEventTabBtn = document.getElementById('btn-create-event-tab');
  const createModal = document.getElementById('create-event-modal');
  if (createEventTabBtn && createModal) {
    createEventTabBtn.addEventListener('click', () => {
      createModal.classList.add('active');
    });
  }

  // Render Dashboard
  function refreshDashboard() {
    const payments = store.getPayments();
    const tickets = store.getTickets();
    const events = store.getEvents();
    const contests = store.getContests();

    // Active Events currently on the website
    const activeEvents = store.getActiveEvents();
    const activeEventIds = new Set(activeEvents.map(e => e.id));

    // Stats
    const pendingPayments = payments.filter(p => p.status === 'Pending Approval' || p.status === 'Pending');
    const approvedPayments = payments.filter(p => p.status === 'Approved');

    // Revenue Rule: Count revenue from active events and contest votes
    const activeApprovedEventPayments = approvedPayments.filter(p => p.eventId && activeEventIds.has(p.eventId));
    const eventRevenue = activeApprovedEventPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const votePayments = approvedPayments.filter(p => p.type === 'Contest Vote');
    const contestRevenue = votePayments.reduce((sum, p) => sum + (p.total || p.totalAmount || 0), 0);

    const totalRevenue = eventRevenue + contestRevenue;

    // Active Tickets count (tickets for active events)
    const activeTicketsCount = tickets.filter(t => t.eventId && activeEventIds.has(t.eventId)).length;

    // People Directory Count
    const peopleList = compilePeopleDirectory(payments, tickets);

    const elPending = document.getElementById('stat-pending-count');
    if (elPending) elPending.textContent = pendingPayments.length;

    const elTickets = document.getElementById('stat-tickets-count');
    if (elTickets) elTickets.textContent = activeTicketsCount;

    const elRevenue = document.getElementById('stat-revenue');
    if (elRevenue) elRevenue.textContent = store.formatCurrency(totalRevenue);

    const elEvents = document.getElementById('stat-events-count');
    if (elEvents) elEvents.textContent = activeEvents.length;

    const elContests = document.getElementById('stat-contests-count');
    if (elContests) elContests.textContent = contests.length;

    const elPeople = document.getElementById('stat-people-count');
    if (elPeople) elPeople.textContent = peopleList.length;

    // 0. Render Real-Time Incoming Payments Hub & Alert System
    renderIncomingPaymentsHub(pendingPayments);
    checkNewPendingPayments(pendingPayments);

    // Render Activity Table
    renderActivityTable(payments, tickets);

    // Render People Directory Table
    renderPeopleTable(peopleList);

    // Render Pending / Moderation Table
    renderPendingTable(payments);

    // Render Approved Tickets Table
    renderTicketsTable(tickets);

    // Render Events Table
    renderEventsTable(events);

    // Render Contests Table
    renderContestsTable(contests);

    // Render Influencers & Commissions Suite
    renderInfluencersSection();
  }

  // --- INFLUENCER & COMMISSION MARKETING SUITE ---
  const influencerModal = document.getElementById('influencer-modal');
  const btnAddInfluencerOpen = document.getElementById('btn-add-influencer-open');
  const closeInfluencerModalBtn = document.getElementById('close-influencer-modal');
  const btnCancelInfluencer = document.getElementById('btn-cancel-influencer');
  const influencerForm = document.getElementById('influencer-form');
  const infEventFilter = document.getElementById('influencer-event-filter');
  const infSearchInput = document.getElementById('influencer-search-input');
  const commStatusFilter = document.getElementById('commission-status-filter');
  const btnGenPromoCode = document.getElementById('btn-gen-promo-code');

  const infDiscountType = document.getElementById('inf-input-discount-type');
  const infDiscountLabel = document.getElementById('inf-discount-label');
  const infCommissionType = document.getElementById('inf-input-commission-type');
  const infCommissionLabel = document.getElementById('inf-commission-label');

  let isCustomModalPromoCode = false;

  function updateModalAutoPromoCode() {
    if (isCustomModalPromoCode) return;
    const name = document.getElementById('inf-input-name')?.value.trim() || '';
    const username = document.getElementById('inf-input-username')?.value.trim() || '';
    const discType = document.getElementById('inf-input-discount-type')?.value || 'percentage';
    const discVal = parseFloat(document.getElementById('inf-input-discount-val')?.value) || (discType === 'fixed' ? 1000 : 10);
    const eventId = document.getElementById('inf-input-event')?.value || null;
    const codeInput = document.getElementById('inf-input-code');
    if (codeInput) {
      codeInput.value = store.generatePromoCode(name || username || 'PROMO', discVal, discType, eventId);
    }
  }

  const infNameInput = document.getElementById('inf-input-name');
  const infUsernameInput = document.getElementById('inf-input-username');
  const infDiscValInput = document.getElementById('inf-input-discount-val');
  const infCodeInput = document.getElementById('inf-input-code');
  const infEventSelect = document.getElementById('inf-input-event');

  if (infNameInput) {
    infNameInput.addEventListener('input', () => {
      // Auto-fill username if empty
      if (infUsernameInput && (!infUsernameInput.value || !isCustomModalPromoCode)) {
        const cleanHandle = infNameInput.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
        if (cleanHandle) infUsernameInput.value = cleanHandle;
      }
      updateModalAutoPromoCode();
    });
  }

  if (infUsernameInput) {
    infUsernameInput.addEventListener('input', () => {
      updateModalAutoPromoCode();
    });
  }

  if (infDiscValInput) {
    infDiscValInput.addEventListener('input', () => {
      updateModalAutoPromoCode();
    });
  }

  if (infEventSelect) {
    infEventSelect.addEventListener('change', () => {
      updateModalAutoPromoCode();
    });
  }

  if (infCodeInput) {
    infCodeInput.addEventListener('input', () => {
      isCustomModalPromoCode = true;
    });
  }

  if (infDiscountType) {
    infDiscountType.addEventListener('change', () => {
      if (infDiscountLabel) {
        infDiscountLabel.textContent = infDiscountType.value === 'percentage' ? 'Discount Percentage (%) *' : 'Fixed Discount Amount (₦) *';
      }
      if (infDiscValInput) {
        if (infDiscountType.value === 'fixed' && (!infDiscValInput.value || infDiscValInput.value === '10' || infDiscValInput.value === '15')) {
          infDiscValInput.value = 1000;
        } else if (infDiscountType.value === 'percentage' && (!infDiscValInput.value || infDiscValInput.value === '1000')) {
          infDiscValInput.value = 10;
        }
      }
      updateModalAutoPromoCode();
    });
  }

  if (infCommissionType) {
    infCommissionType.addEventListener('change', () => {
      if (infCommissionLabel) {
        infCommissionLabel.textContent = infCommissionType.value === 'percentage' ? 'Commission Rate (%) *' : 'Fixed Commission Amount (₦) *';
      }
    });
  }

  if (btnGenPromoCode) {
    btnGenPromoCode.addEventListener('click', () => {
      isCustomModalPromoCode = false;
      updateModalAutoPromoCode();
    });
  }

  function populateEventDropdowns() {
    const events = store.getEvents();
    const eventSelect = document.getElementById('inf-input-event');
    const filterSelect = document.getElementById('influencer-event-filter');

    if (eventSelect) {
      const currentVal = eventSelect.value;
      eventSelect.innerHTML = events.map(e => `
        <option value="${e.id}">${e.title} (${store.formatDate(e.date)})</option>
      `).join('');
      if (currentVal && events.some(e => e.id === currentVal)) {
        eventSelect.value = currentVal;
      }
    }

    if (filterSelect) {
      const currentFilter = filterSelect.value || 'ALL';
      filterSelect.innerHTML = `
        <option value="ALL">All Events (${events.length})</option>
        ${events.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}
      `;
      if (currentFilter && (currentFilter === 'ALL' || events.some(e => e.id === currentFilter))) {
        filterSelect.value = currentFilter;
      }
    }
  }

  function openInfluencerModal(influencerId = null, preselectedEventId = null) {
    populateEventDropdowns();
    if (!influencerModal || !influencerForm) return;

    influencerForm.reset();
    const editIdInput = document.getElementById('inf-edit-id');
    const modalTitle = document.getElementById('inf-modal-title');
    const submitText = document.getElementById('inf-submit-text');

    if (influencerId) {
      isCustomModalPromoCode = true;
      const inf = store.getInfluencerById(influencerId);
      if (!inf) return;
      if (editIdInput) editIdInput.value = inf.id;
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit Influencer: ${inf.name}`;
      if (submitText) submitText.textContent = 'Update Influencer';

      document.getElementById('inf-input-event').value = inf.eventId || '';
      document.getElementById('inf-input-name').value = inf.name || '';
      document.getElementById('inf-input-username').value = inf.username || '';
      document.getElementById('inf-input-email').value = inf.email || '';
      document.getElementById('inf-input-phone').value = inf.phone || '';
      if (document.getElementById('inf-input-password')) document.getElementById('inf-input-password').value = inf.password || '';
      if (document.getElementById('inf-input-bank-name')) document.getElementById('inf-input-bank-name').value = inf.bankName || '';
      if (document.getElementById('inf-input-account-num')) document.getElementById('inf-input-account-num').value = inf.accountNumber || '';
      if (document.getElementById('inf-input-account-name')) document.getElementById('inf-input-account-name').value = inf.accountName || '';
      document.getElementById('inf-input-code').value = inf.promoCode || '';
      document.getElementById('inf-input-discount-type').value = inf.discountType || 'percentage';
      document.getElementById('inf-input-discount-val').value = inf.discountValue || 10;
      document.getElementById('inf-input-commission-type').value = inf.commissionType || 'percentage';
      document.getElementById('inf-input-commission-val').value = inf.commissionValue || 5;
      document.getElementById('inf-input-tiers').value = (inf.applicableTiers && inf.applicableTiers[0]) || 'all';
      document.getElementById('inf-input-usage-limit').value = inf.usageLimit || '';
      document.getElementById('inf-input-status').value = inf.status || 'Active';
      document.getElementById('inf-input-start').value = inf.startDate || '';
      document.getElementById('inf-input-end').value = inf.endDate || '';
    } else {
      isCustomModalPromoCode = false;
      if (editIdInput) editIdInput.value = '';
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--primary);"></i> Add Event Influencer / Promoter`;
      if (submitText) submitText.textContent = 'Save Influencer';

      if (preselectedEventId) {
        const eventSelect = document.getElementById('inf-input-event');
        if (eventSelect) eventSelect.value = preselectedEventId;
      }
      document.getElementById('inf-input-discount-val').value = 10;
      document.getElementById('inf-input-commission-val').value = 5;
      document.getElementById('inf-input-status').value = 'Active';
      
      // Auto-generate promo code right away
      updateModalAutoPromoCode();
    }

    if (infDiscountType) infDiscountType.dispatchEvent(new Event('change'));
    if (infCommissionType) infCommissionType.dispatchEvent(new Event('change'));

    influencerModal.style.display = 'flex';
  }

  function closeInfluencerModal() {
    if (influencerModal) influencerModal.style.display = 'none';
  }

  if (btnAddInfluencerOpen) {
    btnAddInfluencerOpen.addEventListener('click', () => openInfluencerModal());
  }
  if (closeInfluencerModalBtn) {
    closeInfluencerModalBtn.addEventListener('click', closeInfluencerModal);
  }
  if (btnCancelInfluencer) {
    btnCancelInfluencer.addEventListener('click', closeInfluencerModal);
  }
  if (influencerModal) {
    influencerModal.addEventListener('click', (e) => {
      if (e.target === influencerModal) closeInfluencerModal();
    });
  }

  if (influencerForm) {
    influencerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('inf-edit-id')?.value;
      const eventId = document.getElementById('inf-input-event')?.value;
      const name = document.getElementById('inf-input-name')?.value.trim();
      const username = document.getElementById('inf-input-username')?.value.trim().toLowerCase().replace(/^@/, '');
      const email = document.getElementById('inf-input-email')?.value.trim();
      const phone = document.getElementById('inf-input-phone')?.value.trim();
      const existingInf = editId ? store.getInfluencers().find(i => i.id === editId) : null;
      const password = document.getElementById('inf-input-password')?.value.trim() || (existingInf ? existingInf.password : 'Promote@' + Math.floor(1000 + Math.random() * 9000));
      const bankName = document.getElementById('inf-input-bank-name')?.value.trim() || '';
      const accountNumber = document.getElementById('inf-input-account-num')?.value.trim() || '';
      const accountName = document.getElementById('inf-input-account-name')?.value.trim() || '';
      const promoCode = document.getElementById('inf-input-code')?.value.trim().toUpperCase();
      const discountType = document.getElementById('inf-input-discount-type')?.value;
      const discountValue = parseFloat(document.getElementById('inf-input-discount-val')?.value) || 0;
      const commissionType = document.getElementById('inf-input-commission-type')?.value;
      const commissionValue = parseFloat(document.getElementById('inf-input-commission-val')?.value) || 0;
      const tierVal = document.getElementById('inf-input-tiers')?.value || 'all';
      const usageLimit = parseInt(document.getElementById('inf-input-usage-limit')?.value) || 0;
      const status = document.getElementById('inf-input-status')?.value || 'Active';
      const startDate = document.getElementById('inf-input-start')?.value || '';
      const endDate = document.getElementById('inf-input-end')?.value || '';

      const targetEvent = store.getEventById(eventId);

      // Check for code uniqueness within event
      const existing = store.getInfluencerByPromoCode(promoCode, eventId);
      if (existing && (!editId || existing.id !== editId)) {
        alert(`Promo code "${promoCode}" is already in use for this event! Please choose a unique code.`);
        return;
      }

      const influencerPayload = {
        id: editId || undefined,
        eventId,
        eventName: targetEvent ? targetEvent.title : 'Event',
        name,
        username,
        email,
        phone,
        password,
        bankName,
        accountNumber,
        accountName,
        promoCode,
        discountType,
        discountValue,
        commissionType,
        commissionValue,
        applicableTiers: [tierVal],
        usageLimit,
        status,
        startDate,
        endDate
      };

      store.saveInfluencer(influencerPayload);
      closeInfluencerModal();
      refreshDashboard();
      alert(`Influencer ${name} (@${username}) successfully ${editId ? 'updated' : 'created'}!`);
    });
  }

  // Influencer table & actions
  function renderInfluencersSection() {
    populateEventDropdowns();

    const selectedEventId = infEventFilter ? infEventFilter.value : 'ALL';
    const filterEventParam = selectedEventId === 'ALL' ? null : selectedEventId;
    const searchVal = infSearchInput ? infSearchInput.value.toLowerCase().trim() : '';

    const summary = store.getInfluencerStatsSummary(filterEventParam);
    const leaderboard = store.getInfluencerLeaderboard(filterEventParam);

    // Update stats cards
    const elInfCount = document.getElementById('inf-stat-total-count');
    const elClicks = document.getElementById('inf-stat-clicks');
    const elTickets = document.getElementById('inf-stat-tickets');
    const elRev = document.getElementById('inf-stat-revenue');
    const elCommTotal = document.getElementById('inf-stat-commission-total');
    const elConvRate = document.getElementById('inf-stat-conversion-rate');
    const elBadge = document.getElementById('influencers-count-badge');

    if (elInfCount) elInfCount.textContent = summary.totalInfluencers;
    if (elClicks) elClicks.textContent = summary.totalClicks.toLocaleString();
    if (elTickets) elTickets.textContent = summary.totalTicketsSold.toLocaleString();
    if (elRev) elRev.textContent = store.formatCurrency(summary.totalRevenueGenerated);
    if (elCommTotal) elCommTotal.textContent = store.formatCurrency(summary.totalCommissionEarned);
    if (elConvRate) elConvRate.textContent = `${summary.conversionRate}%`;
    if (elBadge) elBadge.textContent = `${summary.totalInfluencers} Promoters Active`;

    // Filter leaderboard for search
    let filteredList = leaderboard;
    if (searchVal) {
      filteredList = leaderboard.filter(inf => 
        (inf.name && inf.name.toLowerCase().includes(searchVal)) ||
        (inf.username && inf.username.toLowerCase().includes(searchVal)) ||
        (inf.promoCode && inf.promoCode.toLowerCase().includes(searchVal)) ||
        (inf.email && inf.email.toLowerCase().includes(searchVal)) ||
        (inf.eventName && inf.eventName.toLowerCase().includes(searchVal))
      );
    }

    const tbody = document.getElementById('influencers-tbody');
    if (tbody) {
      if (filteredList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; padding: 3rem; color: var(--gray-500);">
              <i class="fa-solid fa-bullhorn" style="font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; display: block;"></i>
              No influencers found matching filter. Click <strong>"+ Add Influencer / Promoter"</strong> to onboard a promoter!
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filteredList.map(inf => {
          const discountLabel = inf.discountType === 'percentage' ? `${inf.discountValue}% OFF` : `₦${inf.discountValue.toLocaleString()} OFF`;
          const commissionLabel = inf.commissionType === 'percentage' ? `${inf.commissionValue}% per ticket` : `₦${inf.commissionValue.toLocaleString()} / ticket`;
          const usageDisplay = inf.usageLimit > 0 ? `${inf.usedCount || 0} / ${inf.usageLimit} uses` : `${inf.usedCount || 0} uses (unlimited)`;
          const isActive = inf.status === 'Active';
          const convRate = inf.clicks > 0 ? ((inf.ticketsSold / inf.clicks) * 100).toFixed(1) : '0.0';

          // Canonical referral URL format: bookam.ng/e/[eventSlug]?ref=[influencerSlug]
          const eventSlug = inf.eventId || 'event';
          const publicRefLink = `${window.location.origin}/event-details.html?id=${inf.eventId}&ref=${inf.username || inf.id}`;
          const formattedDisplayLink = `bookam.ng/e/${eventSlug}?ref=${inf.username || inf.id}`;

          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div style="width: 36px; height: 36px; border-radius: 50%; background: #FAF5FF; border: 1.5px solid #E9D5FF; color: var(--primary); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">
                    ${(inf.name || 'I').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style="color: var(--dark);">${inf.name}</strong>
                    <div style="font-size: 0.775rem; color: var(--primary); font-weight: 700;">@${inf.username}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">${inf.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-weight: 700; color: var(--dark); font-size: 0.85rem; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${inf.eventName}">
                  ${inf.eventName}
                </div>
                <span style="font-size: 0.725rem; color: var(--gray-500);">${inf.eventId}</span>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.2rem;">
                  <code style="background: #FAF5FF; border: 1px solid #E9D5FF; color: var(--primary); padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 800; font-family: monospace;">${inf.promoCode}</code>
                  <button onclick="window.copyInfluencerCode('${inf.promoCode}')" class="btn btn-outline btn-sm" style="padding: 0.15rem 0.35rem; font-size: 0.7rem;" title="Copy promo code">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                </div>
                <span class="badge badge-green" style="font-size: 0.7rem;">${discountLabel}</span>
              </td>
              <td>
                <strong style="color: #6B21A8; font-size: 0.825rem;">${commissionLabel}</strong>
                <div style="font-size: 0.725rem; color: var(--gray-500);">${usageDisplay}</div>
              </td>
              <td>
                <strong style="color: #4338CA;">${(inf.clicks || 0).toLocaleString()}</strong>
                <div style="font-size: 0.725rem; color: var(--gray-500);">${convRate}% conv</div>
              </td>
              <td>
                <strong style="color: var(--dark); font-size: 0.95rem;">${(inf.ticketsSold || 0).toLocaleString()}</strong>
                <div style="font-size: 0.725rem; color: var(--gray-500);">tickets</div>
              </td>
              <td>
                <strong style="color: #10B981; font-size: 0.95rem;">${store.formatCurrency(inf.revenueGenerated || 0)}</strong>
              </td>
              <td>
                <strong style="color: var(--primary); font-size: 0.95rem;">${store.formatCurrency(inf.commissionEarned || 0)}</strong>
              </td>
              <td>
                <button onclick="window.toggleInfluencerStatus('${inf.id}')" class="badge ${isActive ? 'badge-green' : 'badge-amber'}" style="cursor: pointer; border: none;" title="Click to toggle status">
                  <i class="fa-solid fa-${isActive ? 'circle-check' : 'pause'}"></i> ${inf.status}
                </button>
              </td>
              <td>
                <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; align-items: center;">
                  <button onclick="window.copyInfluencerLink('${publicRefLink}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;" title="Copy Unique Referral Link (${formattedDisplayLink})">
                    <i class="fa-solid fa-link"></i> Link
                  </button>
                  <button onclick="window.shareInfluencerWhatsApp('${inf.name.replace(/'/g, "\\'")}', '${inf.eventName.replace(/'/g, "\\'")}', '${inf.promoCode}', '${discountLabel}', '${publicRefLink}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; color: #15803D; border-color: #86EFAC;" title="Share on WhatsApp">
                    <i class="fa-brands fa-whatsapp"></i>
                  </button>
                  <a href="influencer-dashboard.html?id=${inf.id}" target="_blank" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;" title="Open Influencer Portal">
                    <i class="fa-solid fa-gauge"></i> Portal
                  </a>
                  <button onclick="window.editInfluencer('${inf.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.45rem; font-size: 0.75rem;" title="Edit Influencer">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button onclick="window.deleteInfluencerRecord('${inf.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.45rem; font-size: 0.75rem; color: var(--red-500); border-color: #FCA5A5;" title="Delete Influencer">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Commissions Table
    renderCommissionsTable(filterEventParam);
  }

  function renderCommissionsTable(eventId = null) {
    const tbody = document.getElementById('commissions-tbody');
    if (!tbody) return;

    const statusFilter = commStatusFilter ? commStatusFilter.value : 'ALL';
    let commissions = store.getCommissions(eventId);

    if (statusFilter !== 'ALL') {
      commissions = commissions.filter(c => c.status === statusFilter);
    }

    if (commissions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--gray-500);">
            No commission payouts recorded yet matching filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = commissions.map(c => {
      const formattedDate = new Date(c.createdAt || Date.now()).toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      let statusBadge = `<span class="badge badge-amber"><i class="fa-solid fa-clock"></i> Pending</span>`;
      if (c.status === 'Approved') statusBadge = `<span class="badge badge-purple"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
      if (c.status === 'Paid') statusBadge = `<span class="badge badge-green"><i class="fa-solid fa-hand-holding-dollar"></i> Paid</span>`;
      if (c.status === 'Reversed') statusBadge = `<span class="badge badge-amber" style="background: #FEE2E2; color: #991B1B;"><i class="fa-solid fa-rotate-left"></i> Reversed</span>`;

      return `
        <tr>
          <td><code style="font-weight: 800; color: var(--dark); font-size: 0.85rem;">${c.id}</code></td>
          <td><span style="font-size: 0.8rem; color: var(--gray-500);">${formattedDate}</span></td>
          <td>
            <strong style="color: var(--dark);">${c.influencerName || 'Promoter'}</strong>
            <div style="font-size: 0.75rem; color: var(--primary); font-family: monospace;">${c.promoCode ? 'Code: ' + c.promoCode : ''}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--dark); font-size: 0.85rem; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${c.eventName}
            </div>
          </td>
          <td>
            <strong style="color: var(--dark);">${c.customerName || 'Customer'}</strong>
            <div style="font-size: 0.75rem; color: var(--gray-500);">${c.ticketType} (${c.quantity}x)</div>
          </td>
          <td><strong>${store.formatCurrency(c.orderTotal || 0)}</strong></td>
          <td><strong style="color: var(--primary); font-size: 0.95rem;">${store.formatCurrency(c.commissionAmount || 0)}</strong></td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
              ${c.status === 'Pending' ? `
                <button onclick="window.updateCommissionStatus('${c.id}', 'Approved')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                  <i class="fa-solid fa-check"></i> Approve
                </button>
              ` : ''}
              ${c.status === 'Approved' ? `
                <button onclick="window.updateCommissionStatus('${c.id}', 'Paid')" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #15803D; border-color: #86EFAC;">
                  <i class="fa-solid fa-hand-holding-dollar"></i> Mark Paid
                </button>
              ` : ''}
              ${c.status !== 'Reversed' && c.status !== 'Paid' ? `
                <button onclick="window.updateCommissionStatus('${c.id}', 'Reversed')" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.45rem; font-size: 0.75rem; color: var(--red-500); border-color: #FCA5A5;" title="Reverse commission">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              ` : ''}
              ${c.status === 'Paid' ? `
                <span style="font-size: 0.775rem; color: #15803D; font-weight: 700;"><i class="fa-solid fa-check-double"></i> Settled</span>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Influencer Window functions
  window.editInfluencer = function(influencerId) {
    openInfluencerModal(influencerId);
  };

  window.toggleInfluencerStatus = function(influencerId) {
    store.toggleInfluencerStatus(influencerId);
    refreshDashboard();
  };

  window.deleteInfluencerRecord = function(influencerId) {
    if (confirm('Permanently delete this influencer/promoter profile and their tracking metrics?')) {
      store.deleteInfluencer(influencerId);
      refreshDashboard();
    }
  };

  window.updateCommissionStatus = function(commissionId, newStatus) {
    store.updateCommissionStatus(commissionId, newStatus);
    refreshDashboard();
  };

  window.jumpToEventInfluencers = function(eventId) {
    const tabs = document.querySelectorAll('.dash-tab');
    const tabContents = document.querySelectorAll('.dash-tab-content');
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.style.display = 'none');

    const infTabBtn = document.querySelector('.dash-tab[data-target="tab-influencers"]');
    const infTabContent = document.getElementById('tab-influencers');
    if (infTabBtn) infTabBtn.classList.add('active');
    if (infTabContent) infTabContent.style.display = 'block';

    if (infEventFilter) {
      infEventFilter.value = eventId;
    }
    renderInfluencersSection();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  window.copyInfluencerLink = function(link) {
    navigator.clipboard.writeText(link).then(() => {
      alert(`Referral link copied to clipboard:\n${link}`);
    }).catch(() => {
      prompt('Copy this referral link:', link);
    });
  };

  window.copyInfluencerCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      alert(`Promo code copied: ${code}`);
    });
  };

  window.shareInfluencerWhatsApp = function(infName, eventName, promoCode, discountText, link) {
    const text = encodeURIComponent(
      `🎟️ Get your tickets for "${eventName}" on BOOKAM!\n\n` +
      `🔥 Use my promo code *${promoCode}* to get *${discountText}* on your order!\n\n` +
      `👉 Click here to buy now: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (infEventFilter) {
    infEventFilter.addEventListener('change', () => renderInfluencersSection());
  }
  if (infSearchInput) {
    infSearchInput.addEventListener('input', () => renderInfluencersSection());
  }
  if (commStatusFilter) {
    commStatusFilter.addEventListener('change', () => renderInfluencersSection());
  }

  // --- ACTIVITY LOGS & PEOPLE DIRECTORY HELPERS ---
  function compileActivityLogs(payments, tickets) {
    const logs = [];

    payments.forEach(p => {
      const isVote = p.type === 'Contest Vote';
      logs.push({
        id: p.id,
        timestamp: p.createdAt || new Date().toISOString(),
        customerName: p.customerName || 'Valued Voter',
        customerEmail: p.customerEmail || 'N/A',
        customerPhone: p.customerPhone || 'N/A',
        type: isVote ? 'VOTE' : (p.status === 'Approved' ? 'APPROVED' : 'PENDING'),
        typeLabel: isVote ? 'Contest Vote Submission' : 'Event Ticket Order',
        targetName: p.eventName || 'Contest/Event',
        quantity: p.quantity || p.voteCount || 1,
        amount: p.totalAmount || p.total || 0,
        refCode: p.paymentRef || p.id,
        status: p.status || 'Pending Approval'
      });
    });

    tickets.forEach(t => {
      if (!logs.some(l => l.id === t.paymentId)) {
        logs.push({
          id: t.id,
          timestamp: t.approvedAt || new Date().toISOString(),
          customerName: t.customerName || 'Valued Attendee',
          customerEmail: t.customerEmail || 'N/A',
          customerPhone: t.customerPhone || 'N/A',
          type: 'APPROVED',
          typeLabel: 'Active Pass Issued',
          targetName: t.eventName || 'Event Pass',
          quantity: t.quantity || 1,
          amount: t.totalAmount || 0,
          refCode: t.id,
          status: 'Approved & Sent'
        });
      }
    });

    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return logs;
  }

  function compilePeopleDirectory(payments, tickets) {
    const peopleMap = new Map();

    const processPerson = (name, email, phone, votes, tix, amt, date) => {
      if (!email) return;
      const key = email.toLowerCase().trim();
      const existing = peopleMap.get(key) || {
        name: name || 'Valued User',
        email: key,
        phone: phone || 'N/A',
        totalVotes: 0,
        totalTickets: 0,
        totalSpent: 0,
        lastActive: date || new Date().toISOString()
      };

      if (name && name !== 'Valued User') existing.name = name;
      if (phone && phone !== 'N/A') existing.phone = phone;
      existing.totalVotes += Number(votes) || 0;
      existing.totalTickets += Number(tix) || 0;
      existing.totalSpent += Number(amt) || 0;

      if (new Date(date) > new Date(existing.lastActive)) {
        existing.lastActive = date;
      }

      peopleMap.set(key, existing);
    };

    payments.forEach(p => {
      const isVote = p.type === 'Contest Vote';
      processPerson(
        p.customerName,
        p.customerEmail,
        p.customerPhone,
        isVote ? (p.quantity || 1) : 0,
        !isVote ? (p.quantity || 1) : 0,
        p.totalAmount || p.total || 0,
        p.createdAt
      );
    });

    tickets.forEach(t => {
      processPerson(
        t.customerName,
        t.customerEmail,
        t.customerPhone,
        0,
        t.quantity || 1,
        t.totalAmount || 0,
        t.approvedAt
      );
    });

    const peopleList = Array.from(peopleMap.values());
    peopleList.sort((a, b) => b.totalSpent - a.totalSpent);
    return peopleList;
  }

  // Render Activity Stream Table
  function renderActivityTable(payments, tickets) {
    const tbody = document.getElementById('activity-tbody');
    if (!tbody) return;

    const typeFilter = document.getElementById('activity-type-filter') ? document.getElementById('activity-type-filter').value : 'ALL';
    const searchVal = document.getElementById('activity-search-input') ? document.getElementById('activity-search-input').value.toLowerCase().trim() : '';

    let logs = compileActivityLogs(payments, tickets);

    // Apply Filters
    if (typeFilter !== 'ALL') {
      if (typeFilter === 'VOTE') logs = logs.filter(l => l.type === 'VOTE');
      else if (typeFilter === 'TICKET') logs = logs.filter(l => (l.typeLabel || '').includes('Ticket'));
      else if (typeFilter === 'PENDING') logs = logs.filter(l => l.status === 'Pending Approval');
      else if (typeFilter === 'APPROVED') logs = logs.filter(l => (l.status || '').includes('Approved'));
    }

    if (searchVal) {
      logs = logs.filter(l => 
        (l.customerName && l.customerName.toLowerCase().includes(searchVal)) ||
        (l.customerEmail && l.customerEmail.toLowerCase().includes(searchVal)) ||
        (l.refCode && String(l.refCode).toLowerCase().includes(searchVal)) ||
        (l.targetName && l.targetName.toLowerCase().includes(searchVal))
      );
    }

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: var(--gray-500);">
            <i class="fa-solid fa-bolt" style="font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; display: block;"></i>
            No active people interactions recorded yet matching filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const formattedDate = new Date(l.timestamp).toLocaleString('en-NG', {
        dateStyle: 'short',
        timeStyle: 'short'
      });

      let badgeClass = 'badge-purple';
      if (l.status === 'Pending Approval') badgeClass = 'badge-amber';
      else if (String(l.status || '').includes('Approved')) badgeClass = 'badge-green';
      else if (String(l.status || '').includes('Rejected')) badgeClass = 'badge-red';

      const paymentItem = store.getPayments().find(p => p.id === l.id || p.paymentRef === l.refCode);
      let actionCell = '';
      if (paymentItem) {
        if (paymentItem.status === 'Pending Approval' || paymentItem.status === 'Pending') {
          actionCell = `
            <div style="display: flex; gap: 0.3rem;">
              <button class="btn btn-sm" style="background: #10B981; color: #fff; font-size: 0.725rem; font-weight: 800; padding: 0.25rem 0.5rem; border: none; border-radius: 4px;" onclick="approvePayment('${paymentItem.id}')" title="Approve Payment">
                <i class="fa-solid fa-check"></i>
              </button>
              <button class="btn btn-sm" style="background: #EF4444; color: #fff; font-size: 0.725rem; font-weight: 800; padding: 0.25rem 0.5rem; border: none; border-radius: 4px;" onclick="rejectPayment('${paymentItem.id}')" title="Reject Payment">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          `;
        } else if (paymentItem.status === 'Approved') {
          actionCell = `
            <button class="btn btn-sm" style="background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; font-size: 0.725rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px;" onclick="rejectPayment('${paymentItem.id}')" title="Reject / Revoke Payment">
              <i class="fa-solid fa-ban"></i> Reject
            </button>
          `;
        } else if (paymentItem.status === 'Rejected') {
          actionCell = `
            <button class="btn btn-sm" style="background: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; font-size: 0.725rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px;" onclick="approvePayment('${paymentItem.id}')" title="Re-instate / Accept Payment">
              <i class="fa-solid fa-rotate-left"></i> Accept
            </button>
          `;
        }
      } else {
        actionCell = `<span style="font-size: 0.75rem; color: var(--gray-400);">&bull;</span>`;
      }

      return `
        <tr>
          <td><span style="font-size: 0.8rem; color: var(--gray-500);">${formattedDate}</span></td>
          <td><strong style="color: var(--dark);">${l.customerName}</strong></td>
          <td>
            <div style="font-size: 0.8rem;">
              <div><i class="fa-regular fa-envelope" style="color: var(--primary);"></i> ${l.customerEmail}</div>
              <div><i class="fa-solid fa-phone" style="color: var(--primary);"></i> ${l.customerPhone}</div>
            </div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${l.typeLabel}</span>
          </td>
          <td><strong style="color: var(--dark); font-size: 0.85rem;">${l.targetName}</strong></td>
          <td><strong>${l.quantity}x</strong></td>
          <td><strong style="color: var(--primary);">${store.formatCurrency(l.amount)}</strong></td>
          <td><code style="background: var(--gray-100); padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700;">${l.refCode}</code></td>
          <td>${actionCell}</td>
        </tr>
      `;
    }).join('');
  }

  // Render People Directory Table
  function renderPeopleTable(peopleList) {
    const tbody = document.getElementById('people-tbody');
    if (!tbody) return;

    const searchVal = document.getElementById('people-search-input') ? document.getElementById('people-search-input').value.toLowerCase().trim() : '';

    let filtered = peopleList;
    if (searchVal) {
      filtered = peopleList.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchVal)) ||
        (p.email && p.email.toLowerCase().includes(searchVal)) ||
        (p.phone && p.phone.toLowerCase().includes(searchVal))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--gray-500);">
            <i class="fa-solid fa-users-slash" style="font-size: 2rem; color: var(--gray-400); margin-bottom: 0.5rem; display: block;"></i>
            No voters or attendees found in directory.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const lastActiveDate = new Date(p.lastActive).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                ${p.name.charAt(0).toUpperCase()}
              </div>
              <strong style="color: var(--dark);">${p.name}</strong>
            </div>
          </td>
          <td><a href="mailto:${p.email}" style="color: var(--primary); font-weight: 600;">${p.email}</a></td>
          <td>${p.phone}</td>
          <td><strong style="color: var(--dark);">${p.totalVotes.toLocaleString()} Votes</strong></td>
          <td><span class="badge badge-purple">${p.totalTickets} Tickets</span></td>
          <td><strong style="color: #10b981;">${store.formatCurrency(p.totalSpent)}</strong></td>
          <td><span style="font-size: 0.8rem; color: var(--gray-500);">${lastActiveDate}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Setup listeners for search inputs in Activity and People tabs
  const activityFilterSelect = document.getElementById('activity-type-filter');
  const activitySearchInput = document.getElementById('activity-search-input');
  const peopleSearchInput = document.getElementById('people-search-input');

  if (activityFilterSelect) {
    activityFilterSelect.addEventListener('change', () => {
      renderActivityTable(store.getPayments(), store.getTickets());
    });
  }
  if (activitySearchInput) {
    activitySearchInput.addEventListener('input', () => {
      renderActivityTable(store.getPayments(), store.getTickets());
    });
  }
  if (peopleSearchInput) {
    peopleSearchInput.addEventListener('input', () => {
      const peopleList = compilePeopleDirectory(store.getPayments(), store.getTickets());
      renderPeopleTable(peopleList);
    });
  }

  // --- REAL-TIME INCOMING PAYMENTS HUB & APPROVAL SUITE ---
  function playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }

  function playNotificationBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // D6
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Just now';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  }

  function buildTicketDispatchUrls(ticket) {
    const origin = window.location.origin;
    const ticketUrl = `${origin}/ticket.html?id=${encodeURIComponent(ticket.id)}`;
    const custEmail = ticket.customerEmail || ticket.dispatchedTo || '';
    const custName = ticket.customerName || 'Attendee';
    const eventName = ticket.eventName || 'Event';
    const dateFormatted = store.formatDate ? store.formatDate(ticket.eventDate) : (ticket.eventDate || '');
    const venue = ticket.eventVenue || 'Venue';
    const ticketType = ticket.ticketType || 'Standard Pass';
    const qty = ticket.quantity || 1;
    const cleanPhone = (ticket.customerPhone || '').replace(/[^0-9]/g, '');

    const emailSubject = `[BOOKAM TICKET PASS] Official Ticket for ${eventName} - Pass #${ticket.id}`;
    const emailBody = `Hi ${custName},

Your payment has been approved and verified! Your official entry ticket pass is ready.

==================================================
🎟️ BOOKAM OFFICIAL EVENT PASS
==================================================
Event: ${eventName}
Pass Number: ${ticket.id}
Attendee: ${custName}
Package: ${ticketType} (${qty}x)
Date: ${dateFormatted}
Venue: ${venue}
Status: VERIFIED & ACTIVE
==================================================

👉 ACCESS & SCAN YOUR DIGITAL TICKET PASS:
${ticketUrl}

IMPORTANT INSTRUCTIONS:
- Present this digital pass with the QR code at the entrance for scanning.
- You can print or download your pass from the link above.
- For queries or support, reply to this email or contact support@bookam.ng.

Thank you!
The BOOKAM Team`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(custEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(custEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const whatsappText = encodeURIComponent(`Hi ${custName}! 🎟️ Your official ticket for *${eventName}* has been approved and issued (Pass #${ticket.id}). Access your active QR entry pass here: ${ticketUrl}`);
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappText}` : `https://wa.me/?text=${whatsappText}`;

    return {
      gmailUrl,
      mailtoUrl,
      whatsappUrl,
      emailSubject,
      emailBody,
      ticketUrl,
      custEmail,
    };
  }

  function showApprovalToast({ customerName, customerEmail, amount, ref, ticketId, isVote, generatedTicket }) {
    const container = document.getElementById('realtime-payment-toast-container');
    if (!container) return;

    const dispatchInfo = generatedTicket ? buildTicketDispatchUrls(generatedTicket) : null;

    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events: auto;
      background: #FFFFFF;
      border: 1.5px solid #10B981;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.25);
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      animation: slideInRight 0.3s ease-out;
      position: relative;
    `;

    toast.innerHTML = `
      <div style="width: 38px; height: 38px; border-radius: 50%; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
          <strong style="color: #065F46; font-size: 0.95rem;">Payment Approved & Verified!</strong>
          <span style="font-size: 0.725rem; color: #059669; font-weight: 700; background: #D1FAE5; padding: 0.1rem 0.45rem; border-radius: 9999px;">CONFIRMED</span>
        </div>
        <p style="margin: 0 0 0.35rem 0; font-size: 0.825rem; color: #334155; line-height: 1.4;">
          <strong>${customerName}</strong>'s payment of <strong>${store.formatCurrency(amount)}</strong> (Ref: <code>${ref || 'Transfer'}</code>) has been approved.
          ${ticketId ? `<br/><span style="color: var(--primary); font-weight: 700;">Official Pass: ${ticketId}</span> for <strong>${customerEmail}</strong>.` : 'Votes verified and recorded.'}
        </p>
        ${dispatchInfo ? `
          <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap;">
            <a href="${dispatchInfo.gmailUrl}" target="_blank" class="btn btn-sm" style="background: #EA4335; color: white; border: none; font-size: 0.75rem; padding: 0.3rem 0.65rem; border-radius: 6px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem;">
              <i class="fa-brands fa-google"></i> Open & Send in Gmail
            </a>
            <a href="${dispatchInfo.ticketUrl}" target="_blank" class="btn btn-sm" style="background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; font-size: 0.75rem; padding: 0.3rem 0.65rem; border-radius: 6px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem;">
              <i class="fa-solid fa-qrcode"></i> View Pass
            </a>
          </div>
        ` : ''}
      </div>
      <button style="background: none; border: none; color: #94A3B8; font-size: 1.1rem; cursor: pointer; padding: 0; margin-left: 0.25rem;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 7000);
  }

  function showNewPaymentAlert(p) {
    const container = document.getElementById('realtime-payment-toast-container');
    if (!container) return;

    playNotificationBeep();

    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events: auto;
      background: #FFFFFF;
      border: 1.5px solid #F59E0B;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.3);
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      animation: slideInRight 0.3s ease-out;
    `;

    toast.innerHTML = `
      <div style="width: 38px; height: 38px; border-radius: 50%; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0;">
        <i class="fa-solid fa-bell fa-shake"></i>
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
          <strong style="color: #92400E; font-size: 0.95rem;">🚨 New Incoming Payment!</strong>
          <span style="font-size: 0.725rem; color: #B45309; font-weight: 700; background: #FDE68A; padding: 0.1rem 0.45rem; border-radius: 9999px;">AWAITING APPROVAL</span>
        </div>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.825rem; color: #334155; line-height: 1.4;">
          <strong>${p.customerName}</strong> sent <strong>${store.formatCurrency(p.totalAmount || p.total || 0)}</strong> for <em>${p.eventName || 'Ticket'}</em>.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn btn-primary btn-sm" style="background: #10B981; border-color: #10B981; font-size: 0.78rem; font-weight: 800; padding: 0.35rem 0.75rem;" onclick="approvePayment('${p.id}'); this.closest('.toast-item')?.remove();">
            <i class="fa-solid fa-check"></i> Approve Now
          </button>
          <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.78rem; padding: 0.35rem 0.65rem;" onclick="document.getElementById('incoming-payments-hub')?.scrollIntoView({ behavior: 'smooth' }); this.closest('.toast-item')?.remove();">
            View in Inbox
          </button>
        </div>
      </div>
      <button style="background: none; border: none; color: #94A3B8; font-size: 1.1rem; cursor: pointer; padding: 0;" onclick="this.parentElement.remove()">&times;</button>
    `;
    toast.className = 'toast-item';

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 400);
      }
    }, 8000);
  }

  let knownPendingPaymentIds = new Set();
  let isFirstLoad = true;

  function checkNewPendingPayments(pendingList) {
    const currentIds = new Set(pendingList.map(p => p.id));
    if (!isFirstLoad) {
      pendingList.forEach(p => {
        if (!knownPendingPaymentIds.has(p.id)) {
          showNewPaymentAlert(p);
        }
      });
    }
    knownPendingPaymentIds = currentIds;
    isFirstLoad = false;
  }

  // Render Top Incoming Payments Hub
  function renderIncomingPaymentsHub(pendingList) {
    const container = document.getElementById('incoming-payments-container');
    const badgeCount = document.getElementById('incoming-badge-count');
    const tabBadge = document.getElementById('dash-tab-pending-badge');
    const btnApproveAll = document.getElementById('btn-approve-all-incoming');
    const btnRejectAll = document.getElementById('btn-reject-all-incoming');

    if (badgeCount) badgeCount.textContent = pendingList.length;

    if (tabBadge) {
      if (pendingList.length > 0) {
        tabBadge.textContent = pendingList.length;
        tabBadge.style.display = 'inline-block';
      } else {
        tabBadge.style.display = 'none';
      }
    }

    if (btnApproveAll) {
      btnApproveAll.style.display = pendingList.length > 1 ? 'inline-flex' : 'none';
    }
    if (btnRejectAll) {
      btnRejectAll.style.display = pendingList.length > 1 ? 'inline-flex' : 'none';
    }

    if (!container) return;

    if (pendingList.length === 0) {
      container.innerHTML = `
        <div style="padding: 1.75rem 1rem; text-align: center; color: #64748B;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem auto; font-size: 1.25rem;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div style="font-weight: 800; color: #0F172A; font-size: 1rem; margin-bottom: 0.25rem;">All Payments Cleared & Up to Date!</div>
          <div style="font-size: 0.85rem; color: #64748B; max-width: 520px; margin: 0 auto;">
            As soon as anyone makes a transfer on checkout, it will arrive right here instantly with a live alert so you can review and approve it.
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = pendingList.map(p => {
      const isVote = p.type === 'Contest Vote' || p.contestId;
      const itemTitle = p.eventName || (isVote ? 'Contest Vote' : 'Event Ticket');
      const itemDesc = isVote ? `Vote submission (${p.quantity || p.voteCount || 1} votes)` : `${p.ticketType || 'Standard Pass'} (${p.quantity || 1}x)`;
      const amt = p.totalAmount || p.total || 0;
      const initial = (p.customerName || 'U').charAt(0).toUpperCase();

      return `
        <div class="incoming-payment-card" style="background: #FFFFFF; border: 1.5px solid #FDE68A; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 0.85rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #FEF3C7; color: #D97706; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; border: 1.5px solid #FDE68A; flex-shrink: 0;">
                ${initial}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <strong style="color: #0F172A; font-size: 1.05rem;">${p.customerName || 'Customer'}</strong>
                  <span class="badge badge-amber" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">
                    <i class="fa-solid fa-clock"></i> Awaiting Your Approval
                  </span>
                </div>
                <div style="font-size: 0.825rem; color: #64748B; display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.15rem;">
                  <span><i class="fa-regular fa-envelope" style="color: var(--primary);"></i> ${p.customerEmail}</span>
                  <span><i class="fa-solid fa-phone" style="color: var(--primary);"></i> ${p.customerPhone || 'N/A'}</span>
                  <span><i class="fa-regular fa-clock"></i> ${formatTimeAgo(p.createdAt)}</span>
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <span style="font-size: 0.725rem; text-transform: uppercase; font-weight: 700; color: #64748B; display: block;">Amount Paid</span>
              <div style="font-size: 1.35rem; font-weight: 900; color: #059669; font-family: monospace;">
                ${store.formatCurrency(amt)}
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.85rem;">
            <div>
              <span style="color: #64748B; font-size: 0.75rem; display: block; font-weight: 600;">Event / Item</span>
              <strong style="color: #0F172A;">${itemTitle}</strong>
            </div>
            <div>
              <span style="color: #64748B; font-size: 0.75rem; display: block; font-weight: 600;">Package / Quantity</span>
              <span class="badge badge-purple" style="font-size: 0.75rem;">${itemDesc}</span>
            </div>
            <div>
              <span style="color: #64748B; font-size: 0.75rem; display: block; font-weight: 600;">Payment Reference</span>
              <code style="background: #EEF2FF; color: var(--primary); padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 800; font-family: monospace;">${p.paymentRef}</code>
            </div>
            <div>
              <span style="color: #64748B; font-size: 0.75rem; display: block; font-weight: 600;">Bank Transfer Details</span>
              <strong style="color: #0F172A;">${p.senderBank || 'Direct Transfer'} &bull; ${p.senderName || p.customerName}</strong>
            </div>
          </div>

          <!-- Bottom Action Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; padding-top: 0.25rem;">
            <div style="font-size: 0.8rem; color: #059669; display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">
              <i class="fa-solid fa-shield-halved"></i> Approving activates the official entry QR pass & dispatches email notification.
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button type="button" class="btn btn-outline btn-sm" style="color: #EF4444; border-color: #FCA5A5; font-size: 0.85rem; font-weight: 700;" onclick="rejectPayment('${p.id}')">
                <i class="fa-solid fa-xmark"></i> Reject Payment
              </button>
              <button type="button" class="btn btn-primary btn-sm" style="background: #10B981; border-color: #10B981; font-size: 0.9rem; font-weight: 800; padding: 0.5rem 1.25rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);" onclick="approvePayment('${p.id}')">
                <i class="fa-solid fa-circle-check"></i> Accept / Approve Payment
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Top Hub Buttons
  const btnRefreshIncoming = document.getElementById('btn-refresh-incoming');
  if (btnRefreshIncoming) {
    btnRefreshIncoming.addEventListener('click', () => {
      btnRefreshIncoming.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Syncing...';
      refreshDashboard();
      setTimeout(() => {
        btnRefreshIncoming.innerHTML = '<i class="fa-solid fa-rotate"></i> Sync Live';
      }, 500);
    });
  }

  const btnApproveAllIncoming = document.getElementById('btn-approve-all-incoming');
  if (btnApproveAllIncoming) {
    btnApproveAllIncoming.addEventListener('click', () => {
      const payments = store.getPayments();
      const pending = payments.filter(p => p.status === 'Pending Approval' || p.status === 'Pending');
      if (pending.length === 0) return;
      if (confirm(`Approve all ${pending.length} pending payment(s) and issue official passes now?`)) {
        pending.forEach(p => {
          store.updatePaymentStatus(p.id, 'Approved');
          if (p.type !== 'Contest Vote' && !p.contestId) {
            store.generateTicketForPayment(p);
          }
        });
        playSuccessChime();
        refreshDashboard();
        alert(`🎉 All ${pending.length} payment(s) approved and tickets dispatched!`);
      }
    });
  }

  const btnRejectAllIncoming = document.getElementById('btn-reject-all-incoming');
  if (btnRejectAllIncoming) {
    btnRejectAllIncoming.addEventListener('click', () => {
      const payments = store.getPayments();
      const pending = payments.filter(p => p.status === 'Pending Approval' || p.status === 'Pending');
      if (pending.length === 0) return;
      if (confirm(`Are you sure you want to REJECT all ${pending.length} pending payment(s)?\n\nNo ticket passes will be issued and promoter commissions will be cancelled.`)) {
        pending.forEach(p => {
          store.updatePaymentStatus(p.id, 'Rejected', { reason: 'Bulk rejected by organizer' });
        });
        refreshDashboard();
        alert(`❌ All ${pending.length} payment(s) have been rejected.`);
      }
    });
  }

  // 1. Pending & Full Payments Moderation Table
  let activePaymentFilter = 'PENDING';

  function renderPendingTable(allPayments) {
    const payments = allPayments || store.getPayments();
    const tbody = document.getElementById('pending-tbody');
    if (!tbody) return;

    const pendingList = payments.filter(p => p.status === 'Pending Approval' || p.status === 'Pending');
    const approvedList = payments.filter(p => p.status === 'Approved');
    const rejectedList = payments.filter(p => p.status === 'Rejected');

    // Update filter count labels
    const elPendingCount = document.getElementById('pay-filter-pending-count');
    const elAllCount = document.getElementById('pay-filter-all-count');
    const elApprovedCount = document.getElementById('pay-filter-approved-count');
    const elRejectedCount = document.getElementById('pay-filter-rejected-count');

    if (elPendingCount) elPendingCount.textContent = pendingList.length;
    if (elAllCount) elAllCount.textContent = payments.length;
    if (elApprovedCount) elApprovedCount.textContent = approvedList.length;
    if (elRejectedCount) elRejectedCount.textContent = rejectedList.length;

    // Filter display list based on active filter
    let displayList = payments;
    if (activePaymentFilter === 'PENDING') displayList = pendingList;
    else if (activePaymentFilter === 'APPROVED') displayList = approvedList;
    else if (activePaymentFilter === 'REJECTED') displayList = rejectedList;

    if (displayList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: var(--gray-500);">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; color: var(--gray-400); margin-bottom: 0.5rem; display: block;"></i>
            No payments found in "${activePaymentFilter}" queue.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = displayList.map(p => {
      const isVote = p.type === 'Contest Vote' || p.contestId;
      const itemTitle = p.eventName || (isVote ? 'Contest Vote' : 'Event Ticket');
      const itemQty = isVote ? `${p.quantity || p.voteCount || 1} votes` : `${p.ticketType || 'Pass'} (${p.quantity || 1}x)`;
      const amt = p.totalAmount || p.total || 0;
      const isApproved = p.status === 'Approved';
      const isRejected = p.status === 'Rejected';
      const isPending = !isApproved && !isRejected;

      let statusBadge = `<span class="badge badge-amber"><i class="fa-solid fa-clock"></i> Pending Approval</span>`;
      if (isApproved) {
        statusBadge = `<span class="badge badge-green" style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
      } else if (isRejected) {
        statusBadge = `
          <span class="badge badge-red" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>
          ${p.rejectionReason ? `<div style="font-size: 0.72rem; color: #DC2626; margin-top: 0.25rem; max-width: 180px; line-height: 1.2;">Reason: ${p.rejectionReason}</div>` : ''}
        `;
      }

      return `
        <tr>
          <td>
            <strong style="color: var(--dark); font-size: 0.95rem;">${p.customerName || 'Customer'}</strong>
            <div style="font-size: 0.75rem; color: var(--gray-400); margin-top: 0.15rem;">${formatTimeAgo(p.createdAt)}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem;">
              <div><i class="fa-regular fa-envelope" style="color: var(--primary);"></i> ${p.customerEmail}</div>
              <div><i class="fa-solid fa-phone" style="color: var(--primary);"></i> ${p.customerPhone || 'N/A'}</div>
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--dark); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemTitle}">
              ${itemTitle}
            </div>
          </td>
          <td>
            <span class="badge badge-purple">${itemQty}</span>
          </td>
          <td>
            <strong style="color: #059669; font-size: 1rem; font-family: monospace;">${store.formatCurrency(amt)}</strong>
          </td>
          <td>
            <code style="background: var(--gray-100); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; color: var(--dark);">
              ${p.paymentRef}
            </code>
            ${p.senderBank ? `<div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.2rem;">${p.senderBank} &bull; ${p.senderName || ''}</div>` : ''}
          </td>
          <td>
            ${statusBadge}
          </td>
          <td>
            <div class="action-btns" style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
              ${isPending ? `
                <button class="btn btn-sm" style="background: #10B981; color: #fff; font-weight: 800; border: none; padding: 0.35rem 0.65rem; border-radius: 4px; font-size: 0.78rem;" onclick="approvePayment('${p.id}')">
                  <i class="fa-solid fa-check"></i> Accept
                </button>
                <button class="btn btn-sm" style="background: #EF4444; color: #fff; font-weight: 800; border: none; padding: 0.35rem 0.65rem; border-radius: 4px; font-size: 0.78rem;" onclick="rejectPayment('${p.id}')">
                  <i class="fa-solid fa-xmark"></i> Reject
                </button>
              ` : (isApproved ? `
                <button class="btn btn-sm" style="background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; font-weight: 700; padding: 0.3rem 0.55rem; border-radius: 4px; font-size: 0.75rem;" onclick="rejectPayment('${p.id}')" title="Reject / Revoke payment">
                  <i class="fa-solid fa-ban"></i> Reject
                </button>
              ` : `
                <button class="btn btn-sm" style="background: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; font-weight: 700; padding: 0.3rem 0.55rem; border-radius: 4px; font-size: 0.75rem;" onclick="approvePayment('${p.id}')" title="Re-instate / Accept payment">
                  <i class="fa-solid fa-rotate-left"></i> Accept
                </button>
              `)}
              <button class="btn-outline" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; color: var(--red-500); border-color: #FCA5A5;" onclick="deletePaymentRecord('${p.id}')" title="Delete Payment Record">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Bind filter button clicks
  document.querySelectorAll('.payment-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-filter-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--gray-600)';
        b.style.border = '1px solid var(--gray-200)';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      activePaymentFilter = btn.dataset.filter || 'ALL';
      renderPendingTable(store.getPayments());
    });
  });

  const btnSyncPayments = document.getElementById('btn-sync-payments');
  if (btnSyncPayments) {
    btnSyncPayments.addEventListener('click', () => {
      btnSyncPayments.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Syncing...';
      refreshDashboard();
      setTimeout(() => {
        btnSyncPayments.innerHTML = '<i class="fa-solid fa-rotate"></i> Sync Live Payments';
      }, 500);
    });
  }

  // Delete Payment Record
  window.deletePaymentRecord = function(paymentId) {
    if (confirm('Permanently delete this payment record from the dashboard?')) {
      store.deletePayment(paymentId);
      refreshDashboard();
    }
  };

  // Approve Payment Flow - Instantly generates active ticket & dispatches to customer email
  window.approvePayment = function(paymentId) {
    const payments = store.getPayments();
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    // 1. Update Payment Status to Approved (persists to Firestore & localStorage)
    store.updatePaymentStatus(paymentId, 'Approved');

    let generatedItem = null;

    // 2. Handle Contest Vote vs Event Ticket Pass
    if (payment.type === 'Contest Vote' || payment.contestId) {
      if (store.recordContestVotePayment) {
        store.recordContestVotePayment(payment);
      }
    } else {
      // Automatically generate unique active ticket and record email dispatch
      generatedItem = store.generateTicketForPayment(payment);
    }

    // Play pleasant confirmation audio chime
    playSuccessChime();

    // Show high-visibility notification toast with 1-click Gmail action
    showApprovalToast({
      customerName: payment.customerName || 'Customer',
      customerEmail: payment.customerEmail || 'Customer',
      amount: payment.totalAmount || payment.total || 0,
      ref: payment.paymentRef,
      ticketId: generatedItem ? generatedItem.id : null,
      isVote: payment.type === 'Contest Vote',
      generatedTicket: generatedItem,
    });

    // Refresh view immediately
    refreshDashboard();

    // 3. Trigger backend background mailer if configured
    if (generatedItem && payment.customerEmail) {
      fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payment.customerEmail,
          ticketId: generatedItem.id,
          customerName: payment.customerName || 'Attendee',
          eventName: generatedItem.eventName,
          eventDate: generatedItem.eventDate,
          eventTime: generatedItem.eventTime,
          eventVenue: generatedItem.eventVenue,
          ticketType: generatedItem.ticketType,
          quantity: generatedItem.quantity,
          totalAmount: generatedItem.totalAmount,
          appUrl: window.location.origin
        })
      }).then(r => r.json()).then(res => {
        console.log('Automated ticket email response:', res);
        const statusBox = document.getElementById('modal-delivery-status-box');
        const statusTitle = document.getElementById('modal-delivery-status-title');
        const statusDesc = document.getElementById('modal-delivery-status-desc');
        const footerStatus = document.getElementById('modal-footer-status');

        if (res && res.success) {
          if (statusBox) {
            statusBox.style.background = '#ECFDF5';
            statusBox.style.borderColor = '#10B981';
          }
          if (statusTitle) {
            statusTitle.style.color = '#065F46';
            statusTitle.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10B981;"></i> Automated Background Email Delivered!';
          }
          if (statusDesc) {
            statusDesc.style.color = '#047857';
            statusDesc.textContent = `A verified ticket confirmation email was sent directly to ${payment.customerEmail}. You can also send a direct copy from your personal Gmail below.`;
          }
          if (footerStatus) {
            footerStatus.innerHTML = '<i class="fa-solid fa-envelope-circle-check" style="color: #10B981;"></i> Automated email sent to ' + payment.customerEmail;
          }
        }
      }).catch(err => {
        console.warn('Background mailer error:', err);
      });
    }

    // 4. Display the Email Dispatch Delivery Hub Modal to the organizer
    if (generatedItem) {
      window.openEmailModal(generatedItem);
    }
  };

  // Email Dispatch Modal Logic
  const emailModal = document.getElementById('email-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');

  function closeEmailModal() {
    if (emailModal) emailModal.style.display = 'none';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEmailModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeEmailModal);
  if (emailModal) {
    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) closeEmailModal();
    });
  }

  window.openEmailModal = function(ticket) {
    if (!ticket || !emailModal) return;

    const dispatch = buildTicketDispatchUrls(ticket);

    const recElem = document.getElementById('modal-recipient-email');
    if (recElem) recElem.textContent = dispatch.custEmail;

    const targetEmailElem = document.getElementById('modal-status-target-email');
    if (targetEmailElem) targetEmailElem.textContent = dispatch.custEmail;

    const subjElem = document.getElementById('modal-email-subject');
    if (subjElem) subjElem.textContent = dispatch.emailSubject;

    const eventTitleElem = document.getElementById('modal-event-title');
    if (eventTitleElem) eventTitleElem.textContent = ticket.eventName;

    const custGreetElem = document.getElementById('modal-customer-greeting');
    if (custGreetElem) custGreetElem.textContent = `Hi ${ticket.customerName || 'Attendee'},`;

    const ticketIdElem = document.getElementById('modal-ticket-id');
    if (ticketIdElem) ticketIdElem.textContent = ticket.id;

    const ticketDateElem = document.getElementById('modal-ticket-date');
    if (ticketDateElem) ticketDateElem.textContent = store.formatDate ? store.formatDate(ticket.eventDate) : ticket.eventDate;

    const ticketVenueElem = document.getElementById('modal-ticket-venue');
    if (ticketVenueElem) ticketVenueElem.textContent = ticket.eventVenue;

    const ticketTypeElem = document.getElementById('modal-ticket-type');
    if (ticketTypeElem) ticketTypeElem.textContent = ticket.ticketType;

    const ticketQtyElem = document.getElementById('modal-ticket-qty');
    if (ticketQtyElem) ticketQtyElem.textContent = `${ticket.quantity}x`;

    // 1-Click Send in Gmail button
    const gmailBtn = document.getElementById('modal-send-gmail-btn');
    if (gmailBtn) {
      gmailBtn.href = dispatch.gmailUrl;
      gmailBtn.innerHTML = `<i class="fa-brands fa-google" style="font-size: 1.15rem;"></i> Open & Send via Gmail to ${dispatch.custEmail} (1-Click)`;
    }

    // WhatsApp Button
    const waBtn = document.getElementById('modal-send-whatsapp-btn');
    if (waBtn) {
      waBtn.href = dispatch.whatsappUrl;
    }

    // Default Mailto button
    const mailtoBtn = document.getElementById('modal-mailto-btn');
    if (mailtoBtn) {
      mailtoBtn.href = dispatch.mailtoUrl;
    }

    // Copy Ticket Pass Text button
    const copyBtn = document.getElementById('modal-copy-ticket-btn');
    if (copyBtn) {
      copyBtn.onclick = function() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(dispatch.emailBody).then(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10B981;"></i> Copied Pass!';
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Pass Text';
            }, 2500);
          }).catch(() => {
            alert('Ticket pass details copied!');
          });
        } else {
          alert('Ticket pass details ready to send:\n\n' + dispatch.emailBody);
        }
      };
    }

    // View live ticket pass
    const viewBtn = document.getElementById('modal-view-ticket-btn');
    if (viewBtn) {
      viewBtn.href = dispatch.ticketUrl;
    }

    // Reset status box default state
    const statusBox = document.getElementById('modal-delivery-status-box');
    const statusTitle = document.getElementById('modal-delivery-status-title');
    const statusDesc = document.getElementById('modal-delivery-status-desc');
    if (statusBox) {
      statusBox.style.background = '#FEF3C7';
      statusBox.style.borderColor = '#F59E0B';
    }
    if (statusTitle) {
      statusTitle.style.color = '#92400E';
      statusTitle.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #D97706;"></i> Ensure Client Receives Email';
    }
    if (statusDesc) {
      statusDesc.style.color = '#78350F';
      statusDesc.innerHTML = `Click <strong>"Open & Send via Gmail (1-Click)"</strong> below to instantly deliver this official pass to <strong>${dispatch.custEmail}</strong> from your Gmail with pre-loaded ticket details and verified QR pass link.`;
    }

    emailModal.style.display = 'flex';
  };

  // Modal Rejection Setup
  let activeRejectPaymentId = null;
  const rejectModal = document.getElementById('reject-payment-modal');
  const rejectModalCloseBtn = document.getElementById('reject-modal-close-btn');
  const btnCancelRejectModal = document.getElementById('btn-cancel-reject-modal');
  const btnConfirmRejectModal = document.getElementById('btn-confirm-reject-modal');
  const rejectReasonSelect = document.getElementById('reject-modal-reason-select');
  const rejectCustomReasonInput = document.getElementById('reject-modal-custom-reason');

  if (rejectReasonSelect && rejectCustomReasonInput) {
    rejectReasonSelect.addEventListener('change', () => {
      if (rejectReasonSelect.value === 'CUSTOM') {
        rejectCustomReasonInput.style.display = 'block';
        rejectCustomReasonInput.focus();
      } else {
        rejectCustomReasonInput.style.display = 'none';
      }
    });
  }

  function closeRejectModal() {
    if (rejectModal) rejectModal.style.display = 'none';
    activeRejectPaymentId = null;
    if (rejectCustomReasonInput) {
      rejectCustomReasonInput.value = '';
      rejectCustomReasonInput.style.display = 'none';
    }
    if (rejectReasonSelect) rejectReasonSelect.value = 'Bank transfer not received in Moniepoint account';
  }

  if (rejectModalCloseBtn) rejectModalCloseBtn.addEventListener('click', closeRejectModal);
  if (btnCancelRejectModal) btnCancelRejectModal.addEventListener('click', closeRejectModal);
  if (rejectModal) {
    rejectModal.addEventListener('click', (e) => {
      if (e.target === rejectModal) closeRejectModal();
    });
  }

  if (btnConfirmRejectModal) {
    btnConfirmRejectModal.addEventListener('click', () => {
      if (!activeRejectPaymentId) return;
      const payment = store.getPayments().find(p => p.id === activeRejectPaymentId);
      const ref = payment ? payment.paymentRef : activeRejectPaymentId;

      let reason = rejectReasonSelect ? rejectReasonSelect.value : 'Payment rejected by organizer';
      if (reason === 'CUSTOM' && rejectCustomReasonInput) {
        reason = rejectCustomReasonInput.value.trim() || 'Payment rejected by organizer';
      }

      store.updatePaymentStatus(activeRejectPaymentId, 'Rejected', { reason });
      closeRejectModal();
      refreshDashboard();

      // Show toast
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '2rem';
      toast.style.right = '2rem';
      toast.style.background = '#DC2626';
      toast.style.color = '#FFFFFF';
      toast.style.padding = '0.9rem 1.4rem';
      toast.style.borderRadius = '10px';
      toast.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.4)';
      toast.style.zIndex = '999999';
      toast.style.fontWeight = '700';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '0.65rem';
      toast.innerHTML = `<i class="fa-solid fa-circle-xmark" style="font-size: 1.25rem;"></i> <div>Payment <strong>${ref}</strong> REJECTED<div style="font-size: 0.775rem; font-weight: 500; opacity: 0.9;">Reason: ${reason}</div></div>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4500);
    });
  }

  // Reject Payment Flow
  window.rejectPayment = function(paymentId) {
    const payment = store.getPayments().find(p => p.id === paymentId);
    if (!payment) return;

    if (rejectModal) {
      activeRejectPaymentId = paymentId;

      const custName = document.getElementById('reject-modal-cust-name');
      const custEmail = document.getElementById('reject-modal-cust-email');
      const itemTitle = document.getElementById('reject-modal-item-title');
      const refCode = document.getElementById('reject-modal-ref');
      const amount = document.getElementById('reject-modal-amount');

      if (custName) custName.textContent = payment.customerName || 'Customer';
      if (custEmail) custEmail.textContent = payment.customerEmail || 'N/A';
      if (itemTitle) itemTitle.textContent = payment.eventName || (payment.type === 'Contest Vote' ? 'Contest Vote' : 'Event Ticket');
      if (refCode) refCode.textContent = payment.paymentRef || payment.id;
      if (amount) amount.textContent = store.formatCurrency(payment.totalAmount || payment.total || 0);

      rejectModal.style.display = 'flex';
    } else {
      const ref = payment.paymentRef || paymentId;
      if (confirm(`Are you sure you want to REJECT this payment request (${ref})?\n\nNo ticket will be issued.`)) {
        store.updatePaymentStatus(paymentId, 'Rejected', { reason: 'Rejected by organizer' });
        refreshDashboard();
      }
    }
  };

  // 2. Approved Tickets Table
  function renderTicketsTable(ticketsList) {
    const tbody = document.getElementById('tickets-tbody');
    if (!tbody) return;

    if (ticketsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--gray-500);">
            No approved tickets yet. Approve a pending payment to issue tickets.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = ticketsList.map(t => {
      const isRevoked = t.status === 'REVOKED' || t.status === 'Cancelled';
      return `
      <tr>
        <td>
          <code style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">${t.id}</code>
        </td>
        <td>
          <strong style="color: var(--dark);">${t.customerName}</strong><br/>
          <span style="font-size: 0.8rem; color: var(--primary); font-family: monospace;">
            <i class="fa-regular fa-envelope"></i> ${t.customerEmail}
          </span>
        </td>
        <td>
          <strong style="color: var(--dark);">${t.eventName}</strong>
        </td>
        <td>
          <span class="badge badge-purple">${t.ticketType} (${t.quantity}x)</span>
        </td>
        <td>
          ${isRevoked ? `
            <span class="badge badge-red" style="font-size: 0.775rem; background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;">
              <i class="fa-solid fa-ban"></i> REVOKED
            </span>
          ` : `
            <span class="badge badge-green" style="font-size: 0.775rem;">
              <i class="fa-solid fa-circle-check"></i> ACTIVE & Sent
            </span>
          `}
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--gray-500);">${store.formatDate(t.approvedAt)}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button onclick="openEmailModalByTicketId('${t.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.775rem;">
              <i class="fa-solid fa-envelope"></i> View Email
            </button>
            <a href="ticket.html?id=${t.id}" target="_blank" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.775rem;">
              <i class="fa-solid fa-qrcode"></i> Ticket
            </a>
            ${t.paymentId && !isRevoked ? `
              <button onclick="rejectPayment('${t.paymentId}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.775rem; color: #DC2626; border-color: #FCA5A5; font-weight: 700;" title="Reject Payment & Revoke Pass">
                <i class="fa-solid fa-ban"></i> Reject
              </button>
            ` : ''}
            <button onclick="deleteTicketRecord('${t.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.775rem; color: var(--red-500); border-color: #FCA5A5;" title="Delete Ticket">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
  }

  // Delete Ticket Record
  window.deleteTicketRecord = function(ticketId) {
    if (confirm('Permanently delete this ticket record?')) {
      store.deleteTicket(ticketId);
      refreshDashboard();
    }
  };

  window.openEmailModalByTicketId = function(ticketId) {
    const ticket = store.getTicketById(ticketId);
    if (ticket) {
      store.resendTicketEmail(ticketId);
      window.openEmailModal(ticket);
    }
  };

  // Delete Event Record
  window.deleteEventRecord = function(eventId) {
    if (confirm('Permanently delete this event from the website and dashboard? Its revenue will automatically subtract from the total revenue.')) {
      store.deleteEvent(eventId);
      refreshDashboard();
    }
  };

  // 3. Events Table
  function renderEventsTable(eventsList) {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) return;

    if (eventsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--gray-500);">
            No events found. Click "+ Create Event" above to publish your first event!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = eventsList.map(e => {
      const isActive = store.isEventActive(e);
      const statusBadge = isActive
        ? `<span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Live on Site</span>`
        : `<span class="badge" style="background: var(--gray-200); color: var(--gray-500);"><i class="fa-solid fa-clock-rotate-left"></i> Expired</span>`;

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${e.banner}" alt="${e.title}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" />
              <div>
                <strong style="color: var(--dark); display: block;">${e.title}</strong>
                <span style="font-size: 0.75rem; color: var(--gray-500);">${e.id}</span>
              </div>
            </div>
          </td>
          <td><span class="badge badge-purple">${e.category}</span></td>
          <td>${store.formatDate(e.date)}</td>
          <td>${statusBadge}</td>
          <td>${e.venue}</td>
          <td><strong>${store.formatCurrency(e.startingPrice)}</strong></td>
          <td>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
              ${isActive ? `
                <a href="event-details.html?id=${e.id}" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                  View Public Page
                </a>
              ` : `
                <span style="font-size: 0.8rem; color: var(--gray-500); font-style: italic;">Archived</span>
              `}
              <button onclick="window.jumpToEventInfluencers('${e.id}')" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; color: var(--primary); border-color: var(--primary);" title="Marketing → Influencers for this event">
                <i class="fa-solid fa-bullhorn"></i> Influencers
              </button>
              <button onclick="deleteEventRecord('${e.id}')" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.5rem; font-size: 0.775rem; color: var(--red-500); border-color: #FCA5A5;" title="Delete Event">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. Contests Table
  function renderContestsTable(contestsList) {
    const tbody = document.getElementById('contests-tbody');
    if (!tbody) return;

    if (contestsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--gray-500);">
            No voting contests found. Click "+ Create New Contest" above to publish your first contest!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = contestsList.map(c => {
      const nominees = c.contestants || [];
      const totalVotes = nominees.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);
      const totalRev = totalVotes * (c.votePrice || 100);

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${c.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${c.title}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" />
              <div>
                <strong style="color: var(--dark); display: block;">${c.title}</strong>
                <span style="font-size: 0.75rem; color: var(--gray-500);">${c.id}</span>
              </div>
            </div>
          </td>
          <td><span class="badge badge-purple">${c.category || 'Pageant'}</span></td>
          <td><strong>${nominees.length}</strong> Nominees</td>
          <td><strong>${store.formatCurrency(c.votePrice || 100)}</strong></td>
          <td><strong style="color: var(--primary);">${totalVotes.toLocaleString()}</strong></td>
          <td><strong style="color: #10b981;">${store.formatCurrency(totalRev)}</strong></td>
          <td>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
              <a href="contest-details.html?id=${c.id}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                <i class="fa-solid fa-eye"></i> View Page
              </a>
              <button onclick="openManageNomineesModal('${c.id}')" class="btn btn-primary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                <i class="fa-solid fa-users"></i> Manage Nominees
              </button>
              <button onclick="deleteContestRecord('${c.id}')" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.5rem; font-size: 0.775rem; color: var(--red-500); border-color: #FCA5A5;" title="Delete Contest">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Delete Contest Record
  window.deleteContestRecord = function(contestId) {
    if (confirm('Permanently delete this voting contest and all its nominee records?')) {
      store.deleteContest(contestId);
      refreshDashboard();
    }
  };

  // Populate Bank Select Dropdowns (Nigerian Banks)
  function populateBankDropdowns() {
    const banks = store.getNigerianBanks ? store.getNigerianBanks() : [
      { name: "Moniepoint Microfinance Bank", code: "50515" },
      { name: "Access Bank", code: "044" },
      { name: "Guaranty Trust Bank (GTB)", code: "058" },
      { name: "Zenith Bank", code: "057" },
      { name: "United Bank for Africa (UBA)", code: "033" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "Kuda Bank", code: "50211" },
      { name: "OPay", code: "999992" },
      { name: "PalmPay", code: "999991" }
    ];

    const evtBankSelect = document.getElementById('evt-reg-settle-bank');
    const cntBankSelect = document.getElementById('cnt-settle-bank');

    const bankOptionsHtml = '<option value="" disabled selected>Select Bank...</option>' + banks.map(b => `<option value="${b.name || ''}">${b.name || ''}</option>`).join('');

    if (evtBankSelect) evtBankSelect.innerHTML = bankOptionsHtml;
    if (cntBankSelect) cntBankSelect.innerHTML = bankOptionsHtml;
  }

  populateBankDropdowns();

  // Dynamic Custom Ticket Tiers Builder
  const customTiersContainer = document.getElementById('custom-ticket-tiers-container');
  const btnAddCustomTier = document.getElementById('btn-add-custom-tier');
  let customTierCounter = 1;

  if (btnAddCustomTier && customTiersContainer) {
    btnAddCustomTier.addEventListener('click', () => {
      customTierCounter++;
      const tierDiv = document.createElement('div');
      tierDiv.className = 'custom-tier-row';
      tierDiv.style.cssText = 'background: #fff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 0.5rem; align-items: center;';
      tierDiv.innerHTML = `
        <input type="text" class="form-control tier-custom-name" placeholder="Tier Name (e.g. Backstage Pass ${customTierCounter})" required style="font-size: 0.8rem;" />
        <input type="number" class="form-control tier-custom-price" placeholder="Price (₦)" min="0" required style="font-size: 0.8rem;" />
        <input type="number" class="form-control tier-custom-qty" placeholder="Quantity (e.g. 50)" min="1" value="100" style="font-size: 0.8rem;" />
        <button type="button" class="btn btn-outline btn-sm btn-remove-tier" style="color: var(--red-500); border-color: #FCA5A5; padding: 0.4rem 0.6rem;">&times;</button>
      `;
      customTiersContainer.appendChild(tierDiv);

      tierDiv.querySelector('.btn-remove-tier').addEventListener('click', () => {
        tierDiv.remove();
      });
    });
  }

  // Dynamic Influencers Builder in Create Event Form (Automatic Promo Code Generation)
  const eventInfluencersList = document.getElementById('event-influencers-list');
  const btnAddEventInfluencer = document.getElementById('btn-add-event-influencer');
  let eventInfluencerCounter = 1;

  function bindAutoPromoCodeToRow(row) {
    const nameInput = row.querySelector('.inf-name-field');
    const codeInput = row.querySelector('.inf-code-field');
    const discSelect = row.querySelector('.inf-discount-type');
    if (!nameInput || !codeInput || !discSelect) return;

    let isCustom = false;

    const computeAndSetCode = () => {
      if (isCustom) return;
      const name = nameInput.value.trim();
      const discType = discSelect.value;
      const discVal = discType === 'percent15' ? 15 : (discType === 'fixed' ? 1000 : 10);
      codeInput.value = store.generatePromoCode(name || 'PROMO', discVal, discType);
    };

    nameInput.addEventListener('input', () => {
      isCustom = false;
      computeAndSetCode();
    });

    discSelect.addEventListener('change', () => {
      computeAndSetCode();
    });

    codeInput.addEventListener('input', () => {
      isCustom = true;
    });

    // Auto compute initial code
    computeAndSetCode();
  }

  // Bind initial row(s)
  if (eventInfluencersList) {
    const existingRows = eventInfluencersList.querySelectorAll('.inf-tier-row');
    existingRows.forEach(row => bindAutoPromoCodeToRow(row));
  }

  if (btnAddEventInfluencer && eventInfluencersList) {
    btnAddEventInfluencer.addEventListener('click', () => {
      const currentRows = eventInfluencersList.querySelectorAll('.inf-tier-row');
      if (currentRows.length >= 5) {
        alert('Maximum 5 influencers allowed per event registration.');
        return;
      }

      eventInfluencerCounter++;
      const initialCode = `INF${eventInfluencerCounter}10`;
      const rowDiv = document.createElement('div');
      rowDiv.className = 'inf-tier-row';
      rowDiv.style.cssText = 'background: #fff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: center;';
      rowDiv.innerHTML = `
        <div>
          <label style="font-size: 0.7rem; font-weight: 700; color: var(--gray-500); display: block; margin-bottom: 0.2rem;">Influencer Name</label>
          <input type="text" class="form-control inf-name-field" placeholder="Influencer ${eventInfluencerCounter} Name" style="font-size: 0.8rem;" required />
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 700; color: var(--primary); display: block; margin-bottom: 0.2rem;">Promo Code (Auto)</label>
          <input type="text" class="form-control inf-code-field" placeholder="PROMO CODE" value="${initialCode}" style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; font-family: monospace; background: #FAF5FF; border-color: #D8B4FE; color: var(--primary);" title="Auto-generated promo code" required />
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 700; color: var(--gray-500); display: block; margin-bottom: 0.2rem;">Customer Discount</label>
          <select class="form-control inf-discount-type" style="font-size: 0.8rem;">
            <option value="percent">10% Discount</option>
            <option value="percent15">15% Discount</option>
            <option value="fixed">₦1,000 Off</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 700; color: var(--gray-500); display: block; margin-bottom: 0.2rem;">Commission %</label>
          <input type="number" class="form-control inf-comm-field" placeholder="Commission %" value="10" min="0" max="100" style="font-size: 0.8rem;" />
        </div>
        <button type="button" class="btn btn-outline btn-sm btn-remove-inf" style="color: var(--red-500); border-color: #FCA5A5; padding: 0.4rem 0.6rem; margin-top: 1rem;">&times;</button>
      `;
      eventInfluencersList.appendChild(rowDiv);

      bindAutoPromoCodeToRow(rowDiv);

      rowDiv.querySelector('.btn-remove-inf').addEventListener('click', () => {
        rowDiv.remove();
      });
    });
  }

  // Dynamic Contestants Builder in Create Contest Form
  const contestBuilderList = document.getElementById('contest-builder-contestants-list');
  const btnAddBuilderContestant = document.getElementById('btn-add-builder-contestant');

  function addContestantRowToBuilder(defaultName = '', defaultBio = '', defaultPhoto = '') {
    if (!contestBuilderList) return;
    const count = contestBuilderList.children.length + 1;
    const code = String(count).padStart(3, '0');

    const card = document.createElement('div');
    card.className = 'contestant-builder-row';
    card.style.cssText = 'background: #fff; border: 1px solid #FDE68A; border-radius: var(--radius-sm); padding: 0.85rem;';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span class="badge badge-purple" style="font-weight: 800; font-size: 0.75rem;">Contestant #${code}</span>
        ${count > 1 ? '<button type="button" class="btn-remove-builder-c btn btn-outline btn-sm" style="color: var(--red-500); border: none; padding: 0 0.4rem; font-size: 1.1rem;">&times;</button>' : ''}
      </div>
      <div class="form-grid" style="grid-template-columns: 1.5fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
        <input type="text" class="form-control cnt-b-name" placeholder="Full Name (e.g. Chisom Adeleke)" value="${defaultName}" required style="font-size: 0.8rem;" />
        <input type="text" class="form-control cnt-b-code" placeholder="Code" value="${code}" required style="font-size: 0.8rem; font-weight: 700;" />
      </div>
      <div class="form-grid" style="grid-template-columns: 1.5fr 1.5fr; gap: 0.5rem;">
        <input type="url" class="form-control cnt-b-photo" placeholder="Photo URL" value="${defaultPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" required style="font-size: 0.8rem;" />
        <input type="text" class="form-control cnt-b-bio" placeholder="Bio / Department / Region" value="${defaultBio}" style="font-size: 0.8rem;" />
      </div>
    `;
    contestBuilderList.appendChild(card);

    const removeBtn = card.querySelector('.btn-remove-builder-c');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => card.remove());
    }
  }

  // Prepopulate 2 contestant slots in builder
  if (contestBuilderList && contestBuilderList.children.length === 0) {
    addContestantRowToBuilder('Blessing Okafor', 'Final Year Mass Comm Student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    addContestantRowToBuilder('Zainab Bello', 'Level 300 Computer Science', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80');
  }

  if (btnAddBuilderContestant) {
    btnAddBuilderContestant.addEventListener('click', () => {
      addContestantRowToBuilder();
    });
  }

  // --- EVENT SUBMISSION & EXCLUSIVE TICKETING TERMS WORKFLOW ---
  let pendingEventSubmission = null;
  let pendingInfluencersToSave = [];

  const createEventOpenBtn = document.getElementById('btn-create-event-tab');
  const openCreateEventTop = document.getElementById('open-create-event-top');
  const openCreateEventBanner = document.getElementById('open-create-event-banner');
  const createEventModal = document.getElementById('create-event-modal');
  const closeEventModalBtn = document.getElementById('close-create-modal');
  const cancelEventModalBtn = document.getElementById('cancel-create-modal');
  const createEventForm = document.getElementById('create-event-form');

  // Terms Agreement Modal Elements
  const eventTermsModal = document.getElementById('event-terms-agreement-modal');
  const closeTermsModalBtn = document.getElementById('close-terms-agreement-modal');
  const btnBackToEventForm = document.getElementById('btn-back-to-event-form');
  const chkExclusiveAgree = document.getElementById('chk-exclusive-ticketing-agree');
  const btnConfirmExclusiveSubmit = document.getElementById('btn-confirm-exclusive-submit');

  const openEventModal = () => {
    if (createEventModal) createEventModal.style.display = 'flex';
  };

  const closeEventModal = () => {
    if (createEventModal) createEventModal.style.display = 'none';
  };

  if (createEventOpenBtn) createEventOpenBtn.addEventListener('click', openEventModal);
  if (openCreateEventTop) openCreateEventTop.addEventListener('click', openEventModal);
  if (openCreateEventBanner) openCreateEventBanner.addEventListener('click', openEventModal);
  if (closeEventModalBtn) closeEventModalBtn.addEventListener('click', closeEventModal);
  if (cancelEventModalBtn) cancelEventModalBtn.addEventListener('click', closeEventModal);

  // Toggle Exclusive Agreement Submit Button
  if (chkExclusiveAgree && btnConfirmExclusiveSubmit) {
    chkExclusiveAgree.addEventListener('change', () => {
      btnConfirmExclusiveSubmit.disabled = !chkExclusiveAgree.checked;
      btnConfirmExclusiveSubmit.style.opacity = chkExclusiveAgree.checked ? '1' : '0.5';
      btnConfirmExclusiveSubmit.style.cursor = chkExclusiveAgree.checked ? 'pointer' : 'not-allowed';
    });
  }

  // Back from terms modal to event modal
  if (btnBackToEventForm && eventTermsModal && createEventModal) {
    btnBackToEventForm.addEventListener('click', () => {
      eventTermsModal.style.display = 'none';
      createEventModal.style.display = 'flex';
    });
  }

  if (closeTermsModalBtn && eventTermsModal) {
    closeTermsModalBtn.addEventListener('click', () => {
      eventTermsModal.style.display = 'none';
    });
  }

  // Banner / Ticket Image Upload Handler
  const orgBannerDropzone = document.getElementById('org-banner-dropzone');
  const orgBannerFileInput = document.getElementById('org-banner-file');
  const orgBannerPreviewBox = document.getElementById('org-banner-preview-box');
  const orgBannerPreviewImg = document.getElementById('org-banner-preview-img');
  const orgBannerPlaceholder = document.getElementById('org-banner-placeholder');
  const btnOrgRemoveBanner = document.getElementById('btn-org-remove-banner');
  const inputBanner = document.getElementById('input-banner');

  if (orgBannerDropzone && orgBannerFileInput) {
    orgBannerDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-org-remove-banner')) return;
      orgBannerFileInput.click();
    });

    const handleOrgBannerFile = async (file) => {
      if (!file || !file.type.startsWith('image/')) {
        alert('Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert('Image size exceeds 25MB limit.');
        return;
      }

      if (orgBannerPlaceholder) {
        orgBannerPlaceholder.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.6rem; color: var(--primary);"></i>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark); margin-top: 0.35rem;">
            Compressing &amp; uploading image...
          </div>
          <div style="font-size: 0.75rem; color: var(--gray-500);">${file.name}</div>
        `;
      }

      try {
        let dataUrl = '';
        if (window.compressImageFile) {
          dataUrl = await window.compressImageFile(file, 1200, 1200, 0.82);
        } else {
          dataUrl = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = e => resolve(e.target.result);
            r.onerror = reject;
            r.readAsDataURL(file);
          });
        }

        if (inputBanner) inputBanner.value = dataUrl;
        if (orgBannerPreviewImg) orgBannerPreviewImg.src = dataUrl;
        if (orgBannerPreviewBox) orgBannerPreviewBox.style.display = 'block';
        if (orgBannerPlaceholder) {
          orgBannerPlaceholder.style.display = 'none';
          orgBannerPlaceholder.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary);"></i>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark);">
              Click to upload or drag &amp; drop event flyer / ticket image
            </div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">This image will be used for tickets, passes, and public booking cards</div>
          `;
        }
        if (typeof updateModalAmbassadorFlyerAndLink === 'function') {
          updateModalAmbassadorFlyerAndLink();
        }
      } catch (err) {
        console.error('Image compression error:', err);
        alert('Failed to process image. Please try another image.');
        if (orgBannerPlaceholder) {
          orgBannerPlaceholder.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary);"></i>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark);">
              Click to upload or drag &amp; drop event flyer / ticket image
            </div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">This image will be used for tickets, passes, and public booking cards</div>
          `;
        }
      }
    };

    orgBannerFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleOrgBannerFile(file);
    });

    ['dragenter', 'dragover'].forEach(name => {
      orgBannerDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        orgBannerDropzone.style.borderColor = 'var(--primary)';
        orgBannerDropzone.style.background = '#F5F3FF';
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      orgBannerDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        orgBannerDropzone.style.borderColor = '#CBD5E1';
        orgBannerDropzone.style.background = '#fff';
      });
    });

    orgBannerDropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) handleOrgBannerFile(file);
    });

    if (btnOrgRemoveBanner) {
      btnOrgRemoveBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        if (inputBanner) inputBanner.value = '';
        if (orgBannerFileInput) orgBannerFileInput.value = '';
        if (orgBannerPreviewBox) orgBannerPreviewBox.style.display = 'none';
        if (orgBannerPlaceholder) orgBannerPlaceholder.style.display = 'flex';
      });
    }

    if (inputBanner) {
      inputBanner.addEventListener('input', () => {
        const val = inputBanner.value.trim();
        if (val && (val.startsWith('http') || val.startsWith('data:'))) {
          if (orgBannerPreviewImg) orgBannerPreviewImg.src = val;
          if (orgBannerPreviewBox) orgBannerPreviewBox.style.display = 'block';
          if (orgBannerPlaceholder) orgBannerPlaceholder.style.display = 'none';
        } else if (!val) {
          if (orgBannerPreviewBox) orgBannerPreviewBox.style.display = 'none';
          if (orgBannerPlaceholder) orgBannerPlaceholder.style.display = 'flex';
        }
      });
    }
  }

  // Toggle ticket section in organizer dashboard
  const chkEnableAllTickets = document.getElementById('chk-enable-all-tickets');
  const orgTicketsWrapper = document.getElementById('org-tickets-wrapper');
  if (chkEnableAllTickets && orgTicketsWrapper) {
    chkEnableAllTickets.addEventListener('change', () => {
      orgTicketsWrapper.style.display = chkEnableAllTickets.checked ? 'block' : 'none';
    });
  }

  // Auto-set early bird expiry default on date change
  const inputEventDate = document.getElementById('input-date');
  const inputEarlyBirdEnd = document.getElementById('input-early-bird-end');
  if (inputEventDate && inputEarlyBirdEnd) {
    inputEventDate.addEventListener('change', () => {
      if (inputEventDate.value && !inputEarlyBirdEnd.value) {
        const d = new Date(inputEventDate.value);
        d.setDate(d.getDate() - 2);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        inputEarlyBirdEnd.value = `${yyyy}-${mm}-${dd}T23:59`;
      }
    });
  }

  // Real-Time Ambassador Flyer & Personal Ticket Link Synchronization for Create Event Modal
  const chkModalEnableAmbassadors = document.getElementById('chk-modal-enable-ambassadors');
  const modalAmbassadorSuite = document.getElementById('modal-ambassador-suite');
  const modalAmbHandleInput = document.getElementById('modal-amb-handle-input');
  const modalPersonalTicketUrl = document.getElementById('modal-personal-ticket-url');
  const btnModalCopyPersonalUrl = document.getElementById('btn-modal-copy-personal-url');
  const btnModalTestTicketLink = document.getElementById('btn-modal-test-ticket-link');
  const btnModalShareWa = document.getElementById('btn-modal-share-wa');
  const modalFlyerTopScene = document.getElementById('modal-flyer-top-scene');
  const modalFlyerEventBadge = document.getElementById('modal-flyer-event-badge');
  const modalFlyerRepName = document.getElementById('modal-flyer-rep-name');
  const modalFlyerPriceTag = document.getElementById('modal-flyer-price-tag');
  const modalFlyerQrImg = document.getElementById('modal-flyer-qr-img');
  const modalFlyerQrCaption = document.getElementById('modal-flyer-qr-caption');
  const btnModalDownloadFlyerQr = document.getElementById('btn-modal-download-flyer-qr');
  const btnModalPrintFlyer = document.getElementById('btn-modal-print-flyer');

  function updateModalAmbassadorFlyerAndLink() {
    const rawHandle = modalAmbHandleInput?.value.trim().replace(/^@/, '') || 'ambassador';
    const cleanHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'ambassador';
    const eventTitle = document.getElementById('input-title')?.value.trim() || 'Your Event Name';
    const bannerVal = document.getElementById('input-banner')?.value.trim();

    // Check ticket pricing
    const ticketsEnabled = chkEnableAllTickets ? chkEnableAllTickets.checked : true;
    let minPrice = Infinity;

    if (ticketsEnabled) {
      if (document.getElementById('chk-tier-early')?.checked) {
        const p = parseFloat(document.getElementById('input-early-bird')?.value);
        if (!isNaN(p) && p < minPrice) minPrice = p;
      }
      if (document.getElementById('chk-tier-first')?.checked || document.getElementById('chk-tier-reg')?.checked) {
        const p = parseFloat(document.getElementById('input-first-wave')?.value);
        if (!isNaN(p) && p < minPrice) minPrice = p;
      }
      if (document.getElementById('chk-tier-group')?.checked) {
        const p = parseFloat(document.getElementById('input-group-4')?.value);
        if (!isNaN(p) && p < minPrice) minPrice = p;
      }
      if (document.getElementById('chk-tier-second')?.checked || document.getElementById('chk-tier-vip')?.checked) {
        const p = parseFloat(document.getElementById('input-second-wave')?.value);
        if (!isNaN(p) && p < minPrice) minPrice = p;
      }
      if (document.getElementById('chk-tier-entrance')?.checked || document.getElementById('chk-tier-vvip')?.checked) {
        const p = parseFloat(document.getElementById('input-entrance')?.value);
        if (!isNaN(p) && p < minPrice) minPrice = p;
      }
      document.querySelectorAll('.custom-tier-row').forEach(row => {
        const p = parseFloat(row.querySelector('.tier-custom-price')?.value);
        if (!isNaN(p) && p < minPrice) minPrice = p;
      });
    }

    const isZeroPrice = !ticketsEnabled || minPrice === Infinity || minPrice <= 0;

    // Generate ticket URL with ambassador referral
    const origin = window.location.origin;
    const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const personalUrl = `${origin}${path}buy-ticket.html?ref=${encodeURIComponent(cleanHandle)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(personalUrl)}`;

    if (modalFlyerRepName) modalFlyerRepName.textContent = cleanHandle;
    if (modalFlyerEventBadge) modalFlyerEventBadge.textContent = eventTitle;
    if (modalPersonalTicketUrl) modalPersonalTicketUrl.value = personalUrl;

    if (modalFlyerQrImg) modalFlyerQrImg.src = qrApiUrl;
    if (btnModalDownloadFlyerQr) {
      btnModalDownloadFlyerQr.href = qrApiUrl;
      btnModalDownloadFlyerQr.setAttribute('download', `flyer-qr-${cleanHandle}.png`);
    }
    if (btnModalTestTicketLink) btnModalTestTicketLink.href = personalUrl;
    if (btnModalShareWa) {
      btnModalShareWa.href = `https://wa.me/?text=${encodeURIComponent(`🎟️ Get official tickets & passes for "${eventTitle}" via my link: ${personalUrl}`)}`;
    }

    // Dynamic 0 QR Code vs Paid Pass styling
    if (modalFlyerPriceTag && modalFlyerQrCaption) {
      if (isZeroPrice) {
        modalFlyerPriceTag.innerHTML = '<i class="fa-solid fa-qrcode"></i> ₦0 Free Ticket QR Pass';
        modalFlyerPriceTag.style.background = '#DCFCE7';
        modalFlyerPriceTag.style.color = '#15803D';
        modalFlyerPriceTag.style.borderColor = '#86EFAC';
        modalFlyerQrCaption.innerHTML = '<i class="fa-solid fa-qrcode"></i> SCAN FOR ₦0 FREE PASS';
      } else {
        modalFlyerPriceTag.innerHTML = `<i class="fa-solid fa-ticket"></i> Ticket QR Pass (from ₦${minPrice.toLocaleString()})`;
        modalFlyerPriceTag.style.background = '#FAF5FF';
        modalFlyerPriceTag.style.color = '#7C3AED';
        modalFlyerPriceTag.style.borderColor = '#D8B4FE';
        modalFlyerQrCaption.innerHTML = '<i class="fa-solid fa-qrcode"></i> SCAN TO GET TICKET';
      }
    }

    if (modalFlyerTopScene && bannerVal && (bannerVal.startsWith('http') || bannerVal.startsWith('data:'))) {
      modalFlyerTopScene.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(15,23,42,0.85)), url('${bannerVal}')`;
    }
  }

  // Toggle ambassador section visibility
  if (chkModalEnableAmbassadors && modalAmbassadorSuite) {
    chkModalEnableAmbassadors.addEventListener('change', () => {
      modalAmbassadorSuite.style.display = chkModalEnableAmbassadors.checked ? 'grid' : 'none';
    });
  }

  if (modalAmbHandleInput) {
    modalAmbHandleInput.addEventListener('input', updateModalAmbassadorFlyerAndLink);
  }

  const inputTitleField = document.getElementById('input-title');
  if (inputTitleField) {
    inputTitleField.addEventListener('input', updateModalAmbassadorFlyerAndLink);
  }

  // Listen to ticket price changes in modal
  document.querySelectorAll('#org-tickets-wrapper input').forEach(inp => {
    inp.addEventListener('input', updateModalAmbassadorFlyerAndLink);
    inp.addEventListener('change', updateModalAmbassadorFlyerAndLink);
  });
  if (chkEnableAllTickets) {
    chkEnableAllTickets.addEventListener('change', updateModalAmbassadorFlyerAndLink);
  }

  // Copy personal ticket link
  if (btnModalCopyPersonalUrl && modalPersonalTicketUrl) {
    btnModalCopyPersonalUrl.addEventListener('click', () => {
      modalPersonalTicketUrl.select();
      navigator.clipboard.writeText(modalPersonalTicketUrl.value).then(() => {
        const originalHtml = btnModalCopyPersonalUrl.innerHTML;
        btnModalCopyPersonalUrl.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btnModalCopyPersonalUrl.style.background = '#10B981';
        setTimeout(() => {
          btnModalCopyPersonalUrl.innerHTML = originalHtml;
          btnModalCopyPersonalUrl.style.background = '';
        }, 2000);
      });
    });
  }

  // Print flyer
  if (btnModalPrintFlyer) {
    btnModalPrintFlyer.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial update
  updateModalAmbassadorFlyerAndLink();

  // Intercept Event Host Form Submission
  if (createEventForm) {
    createEventForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate Section 8 check confirmations
      for (let i = 1; i <= 7; i++) {
        const chk = document.getElementById(`chk-host-agree-${i}`);
        if (chk && !chk.checked) {
          alert(`Please agree to confirmation clause #${i} before submitting.`);
          return;
        }
      }

      // Gather Event Form Data
      const orgName = document.getElementById('evt-reg-org-name')?.value.trim() || '';
      const brandName = document.getElementById('evt-reg-brand-name')?.value.trim() || '';
      const phone = document.getElementById('evt-reg-phone')?.value.trim();
      const email = document.getElementById('evt-reg-email')?.value.trim() || '';
      const whatsapp = document.getElementById('evt-reg-whatsapp')?.value.trim();
      const instagram = document.getElementById('evt-reg-instagram')?.value.trim();
      const orgType = document.getElementById('evt-reg-org-type')?.value || '';

      const title = document.getElementById('input-title').value.trim();
      const category = document.getElementById('input-category').value;
      const description = document.getElementById('input-description').value.trim();
      const date = document.getElementById('input-date').value;
      const time = document.getElementById('input-time').value.trim();
      const endTime = document.getElementById('evt-reg-end-time')?.value.trim() || '';
      const venueName = document.getElementById('evt-reg-venue-name')?.value.trim() || '';
      const venueAddress = document.getElementById('evt-reg-venue-address')?.value.trim() || '';
      const city = document.getElementById('input-venue').value.trim();
      const fullVenue = venueName ? `${venueName}, ${city}` : city;

      const banner = document.getElementById('input-banner').value.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
      const extraImages = document.getElementById('evt-reg-extra-images')?.value.trim();
      const promoVideo = document.getElementById('evt-reg-video')?.value.trim();

      // Ticket tiers (Optional)
      const enableTickets = chkEnableAllTickets ? chkEnableAllTickets.checked : true;
      const tierPrices = {};

      if (enableTickets) {
        if (document.getElementById('chk-tier-early')?.checked) {
          const val = parseFloat(document.getElementById('input-early-bird')?.value);
          if (!isNaN(val) && val >= 0) tierPrices['Early bird'] = val;
        }
        if (document.getElementById('chk-tier-first')?.checked || document.getElementById('chk-tier-reg')?.checked) {
          const val = parseFloat(document.getElementById('input-first-wave')?.value);
          if (!isNaN(val) && val >= 0) tierPrices['First Wave'] = val;
        }
        if (document.getElementById('chk-tier-group')?.checked) {
          const val = parseFloat(document.getElementById('input-group-4')?.value);
          if (!isNaN(val) && val >= 0) tierPrices['Group of 4'] = val;
        }
        if (document.getElementById('chk-tier-second')?.checked || document.getElementById('chk-tier-vip')?.checked) {
          const val = parseFloat(document.getElementById('input-second-wave')?.value);
          if (!isNaN(val) && val >= 0) tierPrices['Second Wave'] = val;
        }
        if (document.getElementById('chk-tier-entrance')?.checked || document.getElementById('chk-tier-vvip')?.checked) {
          const val = parseFloat(document.getElementById('input-entrance')?.value);
          if (!isNaN(val) && val >= 0) tierPrices['At the Entrance'] = val;
        }

        // Custom Added Tiers
        const customRows = document.querySelectorAll('.custom-tier-row');
        customRows.forEach(row => {
          const cName = row.querySelector('.tier-custom-name')?.value.trim();
          const cPrice = parseFloat(row.querySelector('.tier-custom-price')?.value);
          if (cName && !isNaN(cPrice)) tierPrices[cName] = cPrice;
        });
      }

      const earlyBirdEndDate = document.getElementById('input-early-bird-end')?.value || null;
      const hasPaidTiers = enableTickets && Object.keys(tierPrices).length > 0 && Object.values(tierPrices).some(p => p > 0);
      const ticketsOptional = !hasPaidTiers;

      const tickets = hasPaidTiers
        ? store.createDefaultTicketTiers(tierPrices, earlyBirdEndDate)
        : [
            {
              type: 'Free Admission',
              name: 'Open Admission / RSVP',
              price: 0,
              benefits: ['Free Community Entry', 'Complimentary Admission', 'Instant Digital Pass Delivery']
            }
          ];

      const startingPrice = hasPaidTiers ? (Math.min(...Object.values(tierPrices).filter(p => p > 0)) || 0) : 0;

      // Support & Settlement Details
      const attendance = document.getElementById('evt-reg-attendance')?.value;
      const techSupport = document.getElementById('evt-reg-tech-support')?.value;
      const wristbands = document.getElementById('evt-reg-wristbands')?.value;
      const specialReqs = document.getElementById('evt-reg-special-reqs')?.value.trim();

      const settleName = document.getElementById('evt-reg-settle-name')?.value.trim() || '';
      const settleBank = document.getElementById('evt-reg-settle-bank')?.value.trim();
      const settleAccount = document.getElementById('evt-reg-settle-account')?.value.trim();
      const settlePref = document.getElementById('evt-reg-settle-pref')?.value || '';

      // Collect Influencers to provision
      pendingInfluencersToSave = [];
      const useInf = document.getElementById('rad-inf-yes')?.checked;
      if (useInf) {
        const infRows = document.querySelectorAll('.inf-tier-row');
        infRows.forEach(row => {
          const infName = row.querySelector('.inf-name-field')?.value.trim();
          let infCode = row.querySelector('.inf-code-field')?.value.trim().toUpperCase();
          const infDiscType = row.querySelector('.inf-discount-type')?.value;
          const infComm = parseFloat(row.querySelector('.inf-comm-field')?.value) || 10;
          const discValue = infDiscType === 'fixed' ? 1000 : (infDiscType === 'percent15' ? 15 : 10);
          const discType = infDiscType === 'fixed' ? 'fixed' : 'percentage';

          if (infName) {
            if (!infCode) {
              infCode = store.generatePromoCode(infName, discValue, discType);
            }
            pendingInfluencersToSave.push({
              name: infName,
              code: infCode,
              discountType: discType,
              discountValue: discValue,
              commissionType: 'percentage',
              commissionValue: infComm
            });
          }
        });
      }

      // Structure pending object
      pendingEventSubmission = {
        title,
        category,
        date,
        time,
        endTime,
        venue: fullVenue,
        venueAddress,
        city,
        organizer: brandName || orgName || organizer.organizationName || organizer.name,
        organizerContact: {
          name: orgName,
          brand: brandName,
          phone,
          email,
          whatsapp,
          instagram,
          type: orgType
        },
        organizerId: organizer.id || 'org-admin-001',
        banner,
        extraImages: extraImages ? extraImages.split(',').map(s => s.trim()) : [],
        promoVideo,
        startingPrice: startingPrice,
        ticketsOptional: ticketsOptional,
        description,
        featured: true,
        highlights: ['Verified Event Pass', 'Instant QR Entry Ticket', 'Exclusive Bookam Pass'],
        tickets,
        support: { attendance, techSupport, wristbands, specialReqs },
        settlement: {
          accountName: settleName,
          bankName: settleBank,
          accountNumber: settleAccount,
          preference: settlePref
        },
        callForAmbassadors: document.getElementById('chk-modal-enable-ambassadors')?.checked ?? true,
        agreedExclusiveTicketing: true,
        exclusiveTicketingTermsAccepted: true,
        status: 'TICKET SALES LIVE',
        onboardingStatus: 'APPROVED',
        approvedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };

      // Persist event into store immediately - GO LIVE IMMEDIATELY
      const savedEvt = store.saveEvent(pendingEventSubmission);

      // Provision Tracked Influencers if any
      if (pendingInfluencersToSave && pendingInfluencersToSave.length > 0 && savedEvt && savedEvt.id) {
        pendingInfluencersToSave.forEach(inf => {
          store.saveInfluencer({
            eventId: savedEvt.id,
            name: inf.name,
            username: inf.name.toLowerCase().replace(/\s+/g, ''),
            email: `${inf.name.toLowerCase().replace(/\s+/g, '')}@promo.bookam.ng`,
            phone: '',
            promoCode: inf.code,
            discountType: inf.discountType,
            discountValue: inf.discountValue,
            commissionType: inf.commissionType,
            commissionValue: inf.commissionValue
          });
        });
      }

      // Close Form Modal immediately
      closeEventModal();

      // Reset form state so previously entered information disappears from form
      if (createEventForm) {
        createEventForm.reset();
        if (orgBannerPreviewBox) orgBannerPreviewBox.style.display = 'none';
        if (orgBannerPlaceholder) {
          orgBannerPlaceholder.style.display = 'flex';
          orgBannerPlaceholder.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary);"></i>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark);">
              Click to upload or drag &amp; drop event flyer / ticket image
            </div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">This image will be used for tickets, passes, and public booking cards</div>
          `;
        }
        if (inputBanner) inputBanner.value = '';
        if (orgBannerFileInput) orgBannerFileInput.value = '';
        document.querySelectorAll('#create-event-form .custom-tier-row').forEach(r => r.remove());
        document.querySelectorAll('#create-event-form .inf-tier-row').forEach(r => r.remove());
      }
      pendingEventSubmission = null;
      pendingInfluencersToSave = [];

      // Re-render dashboard and populate dropdowns with new live event
      refreshDashboard();
      populateEventDropdowns();

      // Automatically focus filter on new live event
      const evtFilter = document.getElementById('event-filter-select');
      if (evtFilter && savedEvt && savedEvt.id) {
        evtFilter.value = savedEvt.id;
        currentEventFilter = savedEvt.id;
        refreshDashboard();
      }

      alert(`🎉 SUCCESS! "${savedEvt.title}" is now officially LIVE on BOOKAM! Ticket sales, ambassador links, and QR codes are active immediately.`);
    });
  }

  // Handle "I Agree & Submit Event" Click from the Agreement Modal (Fallback)
  if (btnConfirmExclusiveSubmit) {
    btnConfirmExclusiveSubmit.addEventListener('click', () => {
      if (!pendingEventSubmission) return;

      if (!chkExclusiveAgree || !chkExclusiveAgree.checked) {
        alert('You must check the agreement box before submitting.');
        return;
      }

      // Persist event into store
      const savedEvt = store.saveEvent(pendingEventSubmission);

      // Provision Tracked Influencers if any
      if (pendingInfluencersToSave && pendingInfluencersToSave.length > 0 && savedEvt && savedEvt.id) {
        pendingInfluencersToSave.forEach(inf => {
          store.saveInfluencer({
            eventId: savedEvt.id,
            name: inf.name,
            username: inf.name.toLowerCase().replace(/\s+/g, ''),
            email: `${inf.name.toLowerCase().replace(/\s+/g, '')}@promo.bookam.ng`,
            phone: '',
            promoCode: inf.code,
            discountType: inf.discountType,
            discountValue: inf.discountValue,
            commissionType: inf.commissionType,
            commissionValue: inf.commissionValue
          });
        });
      }

      // Hide agreement modal
      if (eventTermsModal) eventTermsModal.style.display = 'none';

      // Reset form
      if (createEventForm) createEventForm.reset();
      pendingEventSubmission = null;
      pendingInfluencersToSave = [];

      // Re-render and notify
      refreshDashboard();
      populateEventDropdowns();

      alert(`🎉 SUCCESS! "${savedEvt.title}" is now uploaded and officially live on BOOKAM with Exclusive Ticketing!`);
    });
  }

  // --- FULL CONTEST CREATION FORM MODAL LOGIC ---
  const createContestOpenBtn = document.getElementById('btn-create-contest-open');
  const openCreateContestTop = document.getElementById('open-create-contest-top');
  const openCreateContestBanner = document.getElementById('open-create-contest-banner');
  const createContestModal = document.getElementById('create-contest-modal');
  const closeContestModalBtn = document.getElementById('close-contest-modal');
  const cancelContestModalBtn = document.getElementById('cancel-contest-modal');
  const createContestForm = document.getElementById('create-contest-form');

  const openContestModal = () => {
    if (createContestModal) createContestModal.style.display = 'flex';
  };

  const closeContestModal = () => {
    if (createContestModal) createContestModal.style.display = 'none';
  };

  if (createContestOpenBtn) createContestOpenBtn.addEventListener('click', openContestModal);
  if (openCreateContestTop) openCreateContestTop.addEventListener('click', openContestModal);
  if (openCreateContestBanner) openCreateContestBanner.addEventListener('click', openContestModal);
  if (closeContestModalBtn) closeContestModalBtn.addEventListener('click', closeContestModal);
  if (cancelContestModalBtn) cancelContestModalBtn.addEventListener('click', closeContestModal);

  if (createContestForm) {
    createContestForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check Section 10 terms
      for (let i = 1; i <= 6; i++) {
        const chk = document.getElementById(`chk-cnt-agree-${i}`);
        if (chk && !chk.checked) {
          alert(`Please agree to contest term #${i} before publishing.`);
          return;
        }
      }

      // Section 1
      const orgName = document.getElementById('cnt-org-name')?.value.trim() || organizer.name;
      const orgBrand = document.getElementById('cnt-org-brand')?.value.trim() || organizer.organizationName;
      const orgPhone = document.getElementById('cnt-org-phone')?.value.trim();
      const orgEmail = document.getElementById('cnt-org-email')?.value.trim();
      const orgWhatsapp = document.getElementById('cnt-org-whatsapp')?.value.trim();
      const orgInstagram = document.getElementById('cnt-org-instagram')?.value.trim();

      // Section 2
      const title = document.getElementById('cnt-input-title').value.trim();
      const category = document.getElementById('cnt-input-category').value;
      const description = document.getElementById('cnt-input-desc').value.trim();
      const banner = document.getElementById('cnt-input-banner').value.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
      const startDate = document.getElementById('cnt-input-start').value;
      const endDate = document.getElementById('cnt-input-end').value;

      // Section 3: Collect Contestants from builder
      const contestants = [];
      const contestantRows = document.querySelectorAll('.contestant-builder-row');
      contestantRows.forEach((row, idx) => {
        const cName = row.querySelector('.cnt-b-name')?.value.trim();
        const cCode = row.querySelector('.cnt-b-code')?.value.trim() || String(idx + 1).padStart(3, '0');
        const cPhoto = row.querySelector('.cnt-b-photo')?.value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
        const cBio = row.querySelector('.cnt-b-bio')?.value.trim() || '';

        if (cName) {
          contestants.push({
            id: `cst-${Date.now()}-${idx}`,
            name: cName,
            code: cCode,
            photo: cPhoto,
            bio: cBio,
            votes: 0
          });
        }
      });

      // Section 4: Voting setup
      const votingType = document.getElementById('cnt-input-voting-type')?.value || 'Paid';
      const votePrice = parseFloat(document.getElementById('cnt-input-price')?.value) || 100;
      const minVotes = parseInt(document.getElementById('cnt-input-min-votes')?.value) || 1;
      const multipleVotes = document.getElementById('cnt-input-multivote')?.value || 'Yes';

      // Section 5: Rules & Structure
      const eligibility = document.getElementById('cnt-input-eligibility')?.value.trim();
      const prizes = document.getElementById('cnt-input-prizes')?.value.trim();
      const publicWeight = parseInt(document.getElementById('cnt-weight-public')?.value) || 100;
      const judgesWeight = parseInt(document.getElementById('cnt-weight-judges')?.value) || 0;
      const otherWeight = parseInt(document.getElementById('cnt-weight-other')?.value) || 0;

      // Section 6: Leaderboard Settings
      const showLeaderboard = document.getElementById('cnt-input-show-board')?.value || 'Yes';
      const showVoteCounts = document.getElementById('cnt-input-show-counts')?.value || 'Yes';
      const showRanks = document.getElementById('cnt-input-show-ranks')?.value || 'Yes';

      // Section 9: Settlement
      const settleName = document.getElementById('cnt-settle-name')?.value.trim() || 'KAIWE DIGITAL';
      const settleBank = document.getElementById('cnt-settle-bank')?.value.trim() || 'Moniepoint';
      const settleAccount = document.getElementById('cnt-settle-account')?.value.trim() || '8021174926';

      const newContest = {
        title,
        category,
        description,
        banner,
        startDate,
        endDate,
        votePrice,
        votingType,
        minVotes,
        multipleVotes,
        eligibility,
        prizes,
        judgingWeights: { public: publicWeight, judges: judgesWeight, other: otherWeight },
        leaderboardSettings: { showLeaderboard, showVoteCounts, showRanks },
        organizerId: organizer.id || 'org-admin-001',
        organizerName: orgBrand || orgName || organizer.organizationName || organizer.name,
        organizerContact: { name: orgName, brand: orgBrand, phone: orgPhone, email: orgEmail, whatsapp: orgWhatsapp, instagram: orgInstagram },
        settlement: { accountName: settleName, bankName: settleBank, accountNumber: settleAccount },
        status: 'Active',
        contestants: contestants
      };

      const savedContest = store.saveContest(newContest);
      createContestForm.reset();
      closeContestModal();
      refreshDashboard();

      alert(`🏆 Success! Contest "${savedContest.title}" with ${contestants.length} contestants has been created and published!`);
    });
  }

  // Manage Nominees Modal Logic
  let activeContestForNominees = null;
  const manageNomineesModal = document.getElementById('manage-nominees-modal');
  const closeNomineesModalBtn = document.getElementById('close-nominees-modal');
  const addNomineeForm = document.getElementById('add-nominee-form');
  const nomineesTbody = document.getElementById('nominees-tbody');

  window.openManageNomineesModal = function(contestId) {
    activeContestForNominees = store.getContestById(contestId);
    if (!activeContestForNominees) return;

    document.getElementById('nominee-modal-title').textContent = `Manage Nominees: ${activeContestForNominees.title}`;
    document.getElementById('nominee-modal-subtitle').textContent = `Total Contestants: ${(activeContestForNominees.contestants || []).length}`;

    renderNomineesModalTable();

    if (manageNomineesModal) manageNomineesModal.style.display = 'flex';
  };

  function renderNomineesModalTable() {
    if (!activeContestForNominees || !nomineesTbody) return;
    const contestants = activeContestForNominees.contestants || [];

    if (contestants.length === 0) {
      nomineesTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--gray-500);">No contestants added yet. Use the form above to add a contestant.</td></tr>`;
      return;
    }

    nomineesTbody.innerHTML = contestants.map(c => {
      const shareLink = `${window.location.origin}/contestant.html?contest=${activeContestForNominees.id}&code=${c.code}`;
      return `
        <tr>
          <td><strong style="color: var(--primary); font-family: monospace;">#${c.code || '000'}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <img src="${c.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" style="width: 34px; height: 34px; object-fit: cover; border-radius: 50%;" />
              <div>
                <strong style="color: var(--dark);">${c.name}</strong><br/>
                <span style="font-size: 0.75rem; color: var(--gray-500);">${c.bio || ''}</span>
              </div>
            </div>
          </td>
          <td><strong style="color: var(--primary);">${(c.votes || 0).toLocaleString()}</strong></td>
          <td>
            <div style="display: flex; gap: 0.25rem; align-items: center;">
              <a href="contestant.html?contest=${activeContestForNominees.id}&code=${c.code}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" title="View Contestant Hub">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Hub
              </a>
              <button onclick="navigator.clipboard.writeText('${shareLink}'); alert('Copied contestant link to clipboard!');" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" title="Copy Voting Link">
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
          </td>
          <td>
            <button onclick="deleteNomineeRecord('${activeContestForNominees.id}', '${c.id}')" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--red-500); border-color: #FCA5A5;">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.deleteNomineeRecord = function(contestId, contestantId) {
    if (confirm('Remove this contestant from the contest?')) {
      store.deleteContestant(contestId, contestantId);
      activeContestForNominees = store.getContestById(contestId);
      renderNomineesModalTable();
      refreshDashboard();
    }
  };

  if (closeNomineesModalBtn && manageNomineesModal) {
    closeNomineesModalBtn.addEventListener('click', () => {
      manageNomineesModal.style.display = 'none';
    });
  }

  if (addNomineeForm) {
    addNomineeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeContestForNominees) return;

      const name = document.getElementById('nom-input-name').value.trim();
      const code = document.getElementById('nom-input-code').value.trim() || String((activeContestForNominees.contestants || []).length + 1).padStart(3, '0');
      const photo = document.getElementById('nom-input-photo').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      const bio = document.getElementById('nom-input-bio').value.trim();

      store.addContestant(activeContestForNominees.id, {
        name,
        code,
        photo,
        bio,
        votes: 0
      });

      addNomineeForm.reset();
      activeContestForNominees = store.getContestById(activeContestForNominees.id);
      renderNomineesModalTable();
      refreshDashboard();
    });
  }

  // File Upload Helper for Organizer Forms
  function setupOrganizerUploader({ fileInputId, dropzoneId, urlInputId, previewBoxId, previewImgId, removeBtnId }) {
    const fileInput = document.getElementById(fileInputId);
    const dropzone = document.getElementById(dropzoneId);
    const urlInput = document.getElementById(urlInputId);
    const previewBox = document.getElementById(previewBoxId);
    const previewImg = document.getElementById(previewImgId);
    const removeBtn = document.getElementById(removeBtnId);

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
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file (PNG, JPG, WebP).');
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
        if (e.target !== removeBtn && !removeBtn?.contains(e.target)) {
          fileInput?.click();
        }
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = 'var(--primary)';
          dropzone.style.background = '#F5F3FF';
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = '#CBD5E1';
          dropzone.style.background = '#fff';
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          if (fileInput) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change'));
          }
        }
      });
    }
  }

  // Initialize uploaders
  setupOrganizerUploader({
    fileInputId: 'org-banner-file',
    dropzoneId: 'org-banner-dropzone',
    urlInputId: 'input-banner',
    previewBoxId: 'org-banner-preview-box',
    previewImgId: 'org-banner-preview-img',
    removeBtnId: 'btn-org-remove-banner'
  });

  setupOrganizerUploader({
    fileInputId: 'org-cnt-banner-file',
    dropzoneId: 'org-cnt-banner-dropzone',
    urlInputId: 'cnt-input-banner',
    previewBoxId: 'org-cnt-banner-preview-box',
    previewImgId: 'org-cnt-banner-preview-img',
    removeBtnId: 'btn-org-remove-cnt-banner'
  });

  // Initial dashboard load
  refreshDashboard();

  // Real-time listener for multi-device sync
  window.addEventListener('bookam_store_updated', () => {
    refreshDashboard();
  });
});
