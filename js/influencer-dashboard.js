/**
 * BOOKAM - Influencer & Promoter Dashboard Script (influencer-dashboard.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) {
    console.error('BookamStore not initialized');
    return;
  }

  // Mobile Drawer Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('active'));
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('active'));
  }

  // Onboarding Guide Toggle
  const btnToggleGuide = document.getElementById('btn-toggle-guide');
  const btnDismissGuide = document.getElementById('btn-dismiss-guide');
  const guideBox = document.getElementById('promoter-guide-box');

  if (btnToggleGuide && guideBox) {
    btnToggleGuide.addEventListener('click', () => {
      if (guideBox.style.display === 'none') {
        guideBox.style.display = 'block';
        btnToggleGuide.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide Guide';
      } else {
        guideBox.style.display = 'none';
        btnToggleGuide.innerHTML = '<i class="fa-regular fa-circle-question"></i> How It Works';
      }
    });
  }

  if (btnDismissGuide && guideBox && btnToggleGuide) {
    btnDismissGuide.addEventListener('click', () => {
      guideBox.style.display = 'none';
      btnToggleGuide.innerHTML = '<i class="fa-regular fa-circle-question"></i> How It Works';
    });
  }

  // URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id');
  const targetRef = urlParams.get('ref');
  const targetEvent = urlParams.get('event');

  // DOM Elements
  const influencerAuthContainer = document.getElementById('influencer-auth-container');
  const influencerDashboardMain = document.getElementById('influencer-dashboard-main');
  const influencerLoginForm = document.getElementById('influencer-login-form');
  const infLoginEmail = document.getElementById('inf-login-email');
  const infLoginPassword = document.getElementById('inf-login-password');
  const infAuthAlert = document.getElementById('inf-auth-alert');
  const btnInfAutofill = document.getElementById('btn-inf-autofill');
  const btnToggleInfPassword = document.getElementById('btn-toggle-inf-password');
  const infEyeIcon = document.getElementById('inf-eye-icon');
  const btnInfLogout = document.getElementById('btn-inf-logout');
  const btnInfTopLogout = document.getElementById('btn-inf-top-logout');
  const btnInfDrawerLogout = document.getElementById('btn-inf-drawer-logout');
  const authPromoterName = document.getElementById('auth-promoter-name');
  const authPromoterEmail = document.getElementById('auth-promoter-email');

  const influencerSelect = document.getElementById('influencer-select');
  const filterStatusSelect = document.getElementById('filter-status');

  let currentInfluencerId = null;

  // --- AUTHENTICATION FLOW ---
  function checkAuth() {
    const isAuth = store.isInfluencerLoggedIn();
    const currentUser = store.getCurrentInfluencer();

    if (!isAuth || !currentUser) {
      if (influencerAuthContainer) influencerAuthContainer.style.display = 'block';
      if (influencerDashboardMain) influencerDashboardMain.style.display = 'none';
      if (btnInfTopLogout) btnInfTopLogout.style.display = 'none';
      if (btnInfDrawerLogout) btnInfDrawerLogout.style.display = 'none';
      return false;
    }

    if (influencerAuthContainer) influencerAuthContainer.style.display = 'none';
    if (influencerDashboardMain) influencerDashboardMain.style.display = 'block';
    if (btnInfTopLogout) btnInfTopLogout.style.display = 'inline-flex';
    if (btnInfDrawerLogout) btnInfDrawerLogout.style.display = 'block';

    if (authPromoterName) authPromoterName.textContent = currentUser.name || 'Official Promoter';
    if (authPromoterEmail) authPromoterEmail.textContent = currentUser.email || 'Bookam26@gmail.com';

    // Set active influencer to logged-in user if available
    currentInfluencerId = currentUser.id || 'inf-bookam26';
    if (influencerSelect) {
      influencerSelect.value = currentInfluencerId;
    }

    initInfluencerSelector();
    renderDashboard();
    return true;
  }

  // --- TAB SWITCHING: LOGIN VS REGISTER ---
  const tabBtnInfLogin = document.getElementById('tab-btn-inf-login');
  const tabBtnInfRegister = document.getElementById('tab-btn-inf-register');
  const viewInfLogin = document.getElementById('view-inf-login');
  const viewInfRegister = document.getElementById('view-inf-register');
  const regInfEvent = document.getElementById('reg-inf-event');
  const regInfUsername = document.getElementById('reg-inf-username');
  const regInfCode = document.getElementById('reg-inf-code');
  const btnRegGenCode = document.getElementById('btn-reg-gen-code');
  const influencerRegisterForm = document.getElementById('influencer-register-form');

  function populateRegistrationEvents() {
    if (!regInfEvent) return;
    const events = store.getEvents();
    if (events.length === 0) {
      regInfEvent.innerHTML = `<option value="evt-001">All BOOKAM Events</option>`;
      return;
    }
    regInfEvent.innerHTML = events.map(e => `
      <option value="${e.id}">${e.title} (${store.formatDate(e.date)})</option>
    `).join('');
  }

  function switchAuthTab(mode) {
    if (infAuthAlert) {
      infAuthAlert.style.display = 'none';
      infAuthAlert.className = 'influencer-auth-alert';
    }

    if (mode === 'register') {
      if (tabBtnInfLogin) tabBtnInfLogin.classList.remove('active');
      if (tabBtnInfRegister) tabBtnInfRegister.classList.add('active');
      if (viewInfLogin) viewInfLogin.style.display = 'none';
      if (viewInfRegister) viewInfRegister.style.display = 'block';
      populateRegistrationEvents();
    } else {
      if (tabBtnInfRegister) tabBtnInfRegister.classList.remove('active');
      if (tabBtnInfLogin) tabBtnInfLogin.classList.add('active');
      if (viewInfRegister) viewInfRegister.style.display = 'none';
      if (viewInfLogin) viewInfLogin.style.display = 'block';
    }
  }

  if (tabBtnInfLogin) {
    tabBtnInfLogin.addEventListener('click', () => switchAuthTab('login'));
  }
  if (tabBtnInfRegister) {
    tabBtnInfRegister.addEventListener('click', () => switchAuthTab('register'));
  }

  // Auto-generate promo code on handle input or button click
  if (btnRegGenCode && regInfCode) {
    btnRegGenCode.addEventListener('click', () => {
      const handle = (regInfUsername ? regInfUsername.value : '') || 'PROMO';
      const clean = handle.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) || 'BOOKAM';
      regInfCode.value = clean + '10';
    });
  }

  if (regInfUsername && regInfCode) {
    regInfUsername.addEventListener('input', () => {
      if (!regInfCode.dataset.userEdited) {
        const clean = regInfUsername.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
        if (clean) regInfCode.value = clean + '10';
      }
    });
    regInfCode.addEventListener('input', () => {
      regInfCode.dataset.userEdited = 'true';
    });
  }

  // Handle Influencer / Promoter Registration
  if (influencerRegisterForm) {
    influencerRegisterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-inf-name')?.value.trim();
      const username = document.getElementById('reg-inf-username')?.value.trim();
      const phone = document.getElementById('reg-inf-phone')?.value.trim();
      const email = document.getElementById('reg-inf-email')?.value.trim();
      const password = document.getElementById('reg-inf-password')?.value;
      const confirmPassword = document.getElementById('reg-inf-confirm-password')?.value;
      const eventId = document.getElementById('reg-inf-event')?.value;
      const promoCode = document.getElementById('reg-inf-code')?.value.trim().toUpperCase();
      const bankName = document.getElementById('reg-inf-bank-name')?.value.trim();
      const accountNumber = document.getElementById('reg-inf-account-num')?.value.trim();
      const accountName = document.getElementById('reg-inf-account-name')?.value.trim();

      if (!name || !username || !email || !password) {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert error';
          infAuthAlert.textContent = 'Please fill out all required fields to register.';
        }
        return;
      }

      if (password.length < 6) {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert error';
          infAuthAlert.textContent = 'Password must be at least 6 characters long.';
        }
        return;
      }

      if (password !== confirmPassword) {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert error';
          infAuthAlert.textContent = 'Passwords do not match. Please verify and re-type.';
        }
        return;
      }

      const res = store.registerInfluencer({
        name,
        username,
        email,
        phone,
        password,
        eventId,
        promoCode,
        bankName,
        accountNumber,
        accountName,
        discountType: 'percentage',
        discountValue: 10,
        commissionType: 'percentage',
        commissionValue: 10
      });

      if (res.success) {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert success';
          infAuthAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Welcome, ${name}! Your promoter account is created. Launching dashboard...`;
        }
        setTimeout(() => {
          checkAuth();
        }, 500);
      } else {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert error';
          infAuthAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${res.message}`;
        }
      }
    });
  }

  // Toggle Password Visibility
  if (btnToggleInfPassword && infLoginPassword && infEyeIcon) {
    btnToggleInfPassword.addEventListener('click', () => {
      if (infLoginPassword.type === 'password') {
        infLoginPassword.type = 'text';
        infEyeIcon.className = 'fa-regular fa-eye-slash';
      } else {
        infLoginPassword.type = 'password';
        infEyeIcon.className = 'fa-regular fa-eye';
      }
    });
  }

  // Login Form Submit
  if (influencerLoginForm) {
    influencerLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = (infLoginEmail.value || '').trim();
      const password = (infLoginPassword.value || '').trim();

      if (!identifier || !password) {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert error';
          infAuthAlert.textContent = 'Please enter both your promoter email/username and password.';
        }
        return;
      }

      const res = store.loginInfluencer(identifier, password);
      if (res.success) {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert success';
          infAuthAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> Login successful! Opening dashboard...';
        }
        setTimeout(() => {
          checkAuth();
        }, 400);
      } else {
        if (infAuthAlert) {
          infAuthAlert.className = 'influencer-auth-alert error';
          infAuthAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${res.message}`;
        }
      }
    });
  }

  // Logout Handlers
  function handleLogout() {
    if (confirm('Are you sure you want to sign out of the Promoter Portal?')) {
      store.logoutInfluencer();
      if (infLoginPassword) infLoginPassword.value = '';
      if (infAuthAlert) {
        infAuthAlert.className = 'influencer-auth-alert';
        infAuthAlert.style.display = 'none';
      }
      checkAuth();
    }
  }

  if (btnInfLogout) btnInfLogout.addEventListener('click', handleLogout);
  if (btnInfTopLogout) btnInfTopLogout.addEventListener('click', handleLogout);
  if (btnInfDrawerLogout) btnInfDrawerLogout.addEventListener('click', handleLogout);

  // 1. Initialize Profile Selector
  function initInfluencerSelector() {
    const allInfluencers = store.getInfluencers();
    if (!influencerSelect) return;

    if (allInfluencers.length === 0) {
      influencerSelect.innerHTML = `<option value="">No promoters found</option>`;
      return;
    }

    influencerSelect.innerHTML = allInfluencers.map(inf => {
      const event = store.getEventById(inf.eventId);
      const eventName = event ? event.title : (inf.eventId || 'Event');
      return `<option value="${inf.id}">${inf.name} (@${inf.username}) — ${eventName}</option>`;
    }).join('');

    // Determine initial selected influencer
    let initialInf = null;
    if (targetId) {
      initialInf = allInfluencers.find(i => i.id === targetId);
    } else if (targetRef) {
      const clean = targetRef.toLowerCase().replace(/^@/, '');
      initialInf = allInfluencers.find(i => i.username?.toLowerCase() === clean || i.promoCode?.toLowerCase() === clean);
    } else if (targetEvent) {
      initialInf = allInfluencers.find(i => i.eventId === targetEvent);
    }

    if (!initialInf && allInfluencers.length > 0) {
      initialInf = allInfluencers[0];
    }

    if (initialInf) {
      currentInfluencerId = initialInf.id;
      influencerSelect.value = initialInf.id;
    }

    influencerSelect.addEventListener('change', (e) => {
      currentInfluencerId = e.target.value;
      renderDashboard();
    });
  }

  // 2. Render Full Dashboard for Active Influencer
  function renderDashboard() {
    if (!currentInfluencerId) return;

    const inf = store.getInfluencerById(currentInfluencerId);
    if (!inf) return;

    const event = store.getEventById(inf.eventId);
    const eventTitle = event ? event.title : 'Event';
    const eventSlug = event ? (event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) : (inf.eventId || 'event');

    // Recalculate synced stats
    store.syncInfluencerStats(inf.id);
    const freshInf = store.getInfluencerById(inf.id);

    // Hero Section
    const heroAvatar = document.getElementById('hero-avatar');
    const heroName = document.getElementById('hero-name');
    const heroStatus = document.getElementById('hero-status-badge');
    const heroHandle = document.getElementById('hero-handle');
    const heroEventTitle = document.getElementById('hero-event-title');
    const heroTotalComm = document.getElementById('hero-total-commission');
    const heroCommRate = document.getElementById('hero-commission-rate');

    if (heroAvatar) heroAvatar.textContent = freshInf.name.charAt(0).toUpperCase();
    if (heroName) heroName.textContent = freshInf.name;
    if (heroStatus) {
      heroStatus.className = freshInf.status === 'Active' ? 'badge badge-green' : 'badge';
      heroStatus.style.background = freshInf.status === 'Active' ? '#DCFCE7' : '#F1F5F9';
      heroStatus.style.color = freshInf.status === 'Active' ? '#15803D' : '#64748B';
      heroStatus.innerHTML = freshInf.status === 'Active' ? '<i class="fa-solid fa-circle-check"></i> Active Promoter' : '<i class="fa-solid fa-pause"></i> Paused';
    }
    if (heroHandle) heroHandle.textContent = `@${freshInf.username} • ${freshInf.email || 'Promoter'}${freshInf.phone ? ' • ' + freshInf.phone : ''}`;
    if (heroEventTitle) heroEventTitle.textContent = eventTitle;
    if (heroTotalComm) heroTotalComm.textContent = store.formatCurrency(freshInf.totalCommissionEarned || 0);

    const commText = freshInf.commissionType === 'percentage'
      ? `${freshInf.commissionValue || 10}% per sale`
      : `₦${Number(freshInf.commissionValue || 1000).toLocaleString()} fixed per ticket`;
    if (heroCommRate) heroCommRate.textContent = `Commission Rate: ${commText}`;

    // Share & Promo Box
    const origin = window.location.origin;
    const path = window.location.pathname.replace('influencer-dashboard.html', '');
    const cleanHandle = (freshInf.username || freshInf.promoCode || freshInf.id).toLowerCase();
    const liveEventUrl = `${origin}${path}event-details.html?id=${freshInf.eventId}&ref=${cleanHandle}`;
    const liveTicketUrl = `${origin}${path}buy-ticket.html?id=${freshInf.eventId}&ref=${cleanHandle}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(liveTicketUrl)}`;

    const shareUrlInput = document.getElementById('promoter-share-url');
    if (shareUrlInput) shareUrlInput.value = liveEventUrl;

    const ticketUrlInput = document.getElementById('promoter-ticket-url');
    if (ticketUrlInput) ticketUrlInput.value = liveTicketUrl;

    const ticketQrImg = document.getElementById('promoter-ticket-qr');
    if (ticketQrImg) ticketQrImg.src = qrUrl;

    const downloadQrBtn = document.getElementById('btn-download-promoter-qr');
    if (downloadQrBtn) {
      downloadQrBtn.href = qrUrl;
      downloadQrBtn.setAttribute('download', `bookam-${cleanHandle}-ticket-qr.png`);
    }

    const promoCodeElem = document.getElementById('promoter-promo-code');
    if (promoCodeElem) promoCodeElem.textContent = freshInf.promoCode;

    const discountPill = document.getElementById('promoter-discount-pill');
    const discText = freshInf.discountType === 'percentage'
      ? `${freshInf.discountValue || 10}% Buyer Discount`
      : `₦${Number(freshInf.discountValue || 1000).toLocaleString()} Buyer Discount`;
    if (discountPill) discountPill.textContent = discText;

    // Quick Share Links
    const shareMessage = `🎟️ Grab your tickets for "${eventTitle}" on BOOKAM! Direct ticket link: ${liveTicketUrl} (Use promo code "${freshInf.promoCode}" for ${discText})`;
    
    const whatsappBtn = document.getElementById('btn-whatsapp-share');
    if (whatsappBtn) {
      whatsappBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    }

    const twitterBtn = document.getElementById('btn-twitter-share');
    if (twitterBtn) {
      twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    }

    const publicEventBtn = document.getElementById('btn-view-public-event');
    if (publicEventBtn) {
      publicEventBtn.href = liveEventUrl;
    }

    // Set initial calculator rate
    const calcRateInput = document.getElementById('calc-rate');
    if (calcRateInput && freshInf.commissionValue) {
      calcRateInput.value = freshInf.commissionValue;
    }
    updateCalculator();

    // KPI Metrics
    const clicks = freshInf.totalClicks || 0;
    const ticketsSold = freshInf.totalTicketsSold || 0;
    const conversionRate = clicks > 0 ? ((ticketsSold / clicks) * 100).toFixed(1) : '0.0';

    const kpiClicks = document.getElementById('kpi-clicks');
    const kpiTickets = document.getElementById('kpi-tickets-sold');
    const kpiConv = document.getElementById('kpi-conversion-rate');
    const kpiVol = document.getElementById('kpi-sales-volume');
    const kpiComm = document.getElementById('kpi-total-commission');
    const kpiPromo = document.getElementById('kpi-promo-uses');

    if (kpiClicks) kpiClicks.textContent = clicks.toLocaleString();
    if (kpiTickets) kpiTickets.textContent = ticketsSold.toLocaleString();
    if (kpiConv) kpiConv.textContent = `${conversionRate}%`;
    if (kpiVol) kpiVol.textContent = store.formatCurrency(freshInf.totalRevenueGenerated || 0);
    if (kpiComm) kpiComm.textContent = store.formatCurrency(freshInf.totalCommissionEarned || 0);
    
    const promoMaxText = freshInf.maxUses ? ` / ${freshInf.maxUses}` : '';
    if (kpiPromo) kpiPromo.textContent = `${(freshInf.usedCount || 0)}${promoMaxText}`;

    // Payout Status Breakdown
    const commissions = store.getCommissions({ influencerId: freshInf.id });
    let pendingAmt = 0;
    let approvedAmt = 0;
    let paidAmt = 0;
    let reversedAmt = 0;

    commissions.forEach(c => {
      const amt = Number(c.commissionAmount) || 0;
      if (c.status === 'Pending') pendingAmt += amt;
      else if (c.status === 'Approved') approvedAmt += amt;
      else if (c.status === 'Paid') paidAmt += amt;
      else if (c.status === 'Reversed') reversedAmt += amt;
    });

    const payoutPending = document.getElementById('payout-pending');
    const payoutApproved = document.getElementById('payout-approved');
    const payoutPaid = document.getElementById('payout-paid');
    const payoutReversed = document.getElementById('payout-reversed');

    if (payoutPending) payoutPending.textContent = store.formatCurrency(pendingAmt);
    if (payoutApproved) payoutApproved.textContent = store.formatCurrency(approvedAmt);
    if (payoutPaid) payoutPaid.textContent = store.formatCurrency(paidAmt);
    if (payoutReversed) payoutReversed.textContent = store.formatCurrency(reversedAmt);

    // Render Table & Mobile Cards
    renderCommissions(commissions);
  }

  // 3. Render Commissions in both Table and Mobile Card Formats
  function renderCommissions(commissionsList) {
    const tbody = document.getElementById('referral-sales-tbody');
    const mobileCardsContainer = document.getElementById('referral-sales-mobile-cards');

    const filterStatus = filterStatusSelect ? filterStatusSelect.value : 'All';
    const filtered = filterStatus === 'All'
      ? commissionsList
      : commissionsList.filter(c => c.status === filterStatus);

    // Sort descending by date
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (filtered.length === 0) {
      const emptyStateHtml = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--gray-500); width: 100%;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #F1F5F9; color: var(--gray-400); display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">
            <i class="fa-solid fa-receipt"></i>
          </div>
          <h4 style="color: var(--dark); font-size: 1rem; margin-bottom: 0.25rem;">No Referral Sales Found</h4>
          <p style="font-size: 0.825rem; color: var(--gray-500); max-width: 380px; margin: 0 auto;">
            Share your link on WhatsApp, TikTok, and X to start generating ticket sales and earning commissions!
          </p>
        </div>
      `;

      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8">${emptyStateHtml}</td></tr>`;
      }
      if (mobileCardsContainer) {
        mobileCardsContainer.innerHTML = emptyStateHtml;
      }
      return;
    }

    // Render Desktop Table Rows
    if (tbody) {
      tbody.innerHTML = filtered.map(c => {
        let statusBadge = '';
        if (c.status === 'Paid') {
          statusBadge = `<span class="badge badge-purple"><i class="fa-solid fa-wallet"></i> Paid</span>`;
        } else if (c.status === 'Approved') {
          statusBadge = `<span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
        } else if (c.status === 'Pending') {
          statusBadge = `<span class="badge badge-yellow"><i class="fa-solid fa-clock"></i> Pending</span>`;
        } else if (c.status === 'Reversed') {
          statusBadge = `<span class="badge" style="background: #FEE2E2; color: #991B1B;"><i class="fa-solid fa-arrow-rotate-left"></i> Reversed</span>`;
        }

        const formattedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const maskedBuyer = c.customerName ? `${c.customerName.split(' ')[0]} ${c.customerName.split(' ')[1] ? c.customerName.split(' ')[1].charAt(0) + '.' : ''}` : 'Customer';

        return `
          <tr style="border-bottom: 1px solid var(--gray-100);">
            <td style="padding: 0.75rem; font-size: 0.825rem; color: var(--gray-500); white-space: nowrap;">${formattedDate}</td>
            <td style="padding: 0.75rem; font-weight: 700; color: var(--dark);">${maskedBuyer}</td>
            <td style="padding: 0.75rem;"><span class="badge badge-purple" style="font-size: 0.75rem;">${c.ticketType || 'Standard'}</span></td>
            <td style="padding: 0.75rem; font-weight: 700;">${c.quantity || 1}</td>
            <td style="padding: 0.75rem; font-weight: 700; color: var(--dark);">${store.formatCurrency(c.orderAmount || 0)}</td>
            <td style="padding: 0.75rem;"><code style="background: #FEF3C7; color: #92400E; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem;">${c.promoCode || '-'}</code></td>
            <td style="padding: 0.75rem; font-weight: 800; color: ${c.status === 'Reversed' ? '#991B1B' : '#15803D'}; white-space: nowrap;">
              ${c.status === 'Reversed' ? '-' : '+'}${store.formatCurrency(c.commissionAmount || 0)}
            </td>
            <td style="padding: 0.75rem;">${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    // Render Mobile Transaction Cards (clean stacked cards with zero clumping)
    if (mobileCardsContainer) {
      mobileCardsContainer.innerHTML = filtered.map(c => {
        let statusBadge = '';
        if (c.status === 'Paid') {
          statusBadge = `<span class="badge badge-purple"><i class="fa-solid fa-wallet"></i> Paid</span>`;
        } else if (c.status === 'Approved') {
          statusBadge = `<span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
        } else if (c.status === 'Pending') {
          statusBadge = `<span class="badge badge-yellow"><i class="fa-solid fa-clock"></i> Pending</span>`;
        } else if (c.status === 'Reversed') {
          statusBadge = `<span class="badge" style="background: #FEE2E2; color: #991B1B;"><i class="fa-solid fa-arrow-rotate-left"></i> Reversed</span>`;
        }

        const formattedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const maskedBuyer = c.customerName ? `${c.customerName.split(' ')[0]} ${c.customerName.split(' ')[1] ? c.customerName.split(' ')[1].charAt(0) + '.' : ''}` : 'Customer';

        return `
          <div class="mobile-sale-card">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-200); padding-bottom: 0.4rem;">
              <span style="font-size: 0.75rem; color: var(--gray-500);"><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
              ${statusBadge}
            </div>
            <div class="mobile-sale-row">
              <span class="mobile-sale-label">Buyer:</span>
              <span class="mobile-sale-val">${maskedBuyer}</span>
            </div>
            <div class="mobile-sale-row">
              <span class="mobile-sale-label">Ticket Type & Qty:</span>
              <span class="mobile-sale-val"><span class="badge badge-purple" style="font-size: 0.75rem;">${c.ticketType || 'Standard'}</span> × ${c.quantity || 1}</span>
            </div>
            <div class="mobile-sale-row">
              <span class="mobile-sale-label">Order Total:</span>
              <span class="mobile-sale-val">${store.formatCurrency(c.orderAmount || 0)}</span>
            </div>
            <div class="mobile-sale-row" style="background: #ECFDF5; padding: 0.35rem 0.5rem; border-radius: 4px; margin-top: 0.2rem;">
              <span class="mobile-sale-label" style="color: #065F46; font-weight: 700;">Your Commission:</span>
              <strong style="color: #047857; font-size: 1rem;">+${store.formatCurrency(c.commissionAmount || 0)}</strong>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Interactive Potential Earnings Calculator
  function updateCalculator() {
    const tickets = Number(document.getElementById('calc-tickets')?.value) || 0;
    const price = Number(document.getElementById('calc-price')?.value) || 0;
    const rate = Number(document.getElementById('calc-rate')?.value) || 0;

    const volume = tickets * price;
    const commission = (volume * rate) / 100;

    const resultText = document.getElementById('calc-result-text');
    const subText = document.getElementById('calc-subtext');

    if (resultText) resultText.textContent = store.formatCurrency(commission);
    if (subText) subText.textContent = `on ${store.formatCurrency(volume)} volume (${tickets} tickets @ ${store.formatCurrency(price)})`;
  }

  const calcTickets = document.getElementById('calc-tickets');
  const calcPrice = document.getElementById('calc-price');
  const calcRate = document.getElementById('calc-rate');

  if (calcTickets) calcTickets.addEventListener('input', updateCalculator);
  if (calcPrice) calcPrice.addEventListener('input', updateCalculator);
  if (calcRate) calcRate.addEventListener('input', updateCalculator);

  // Copy Ticket Link Button
  const btnCopyTicketUrl = document.getElementById('btn-copy-ticket-url');
  if (btnCopyTicketUrl) {
    btnCopyTicketUrl.addEventListener('click', () => {
      const ticketUrlInput = document.getElementById('promoter-ticket-url');
      if (ticketUrlInput) {
        navigator.clipboard.writeText(ticketUrlInput.value).then(() => {
          const original = btnCopyTicketUrl.innerHTML;
          btnCopyTicketUrl.innerHTML = '<i class="fa-solid fa-check"></i> Ticket Link Copied!';
          setTimeout(() => { btnCopyTicketUrl.innerHTML = original; }, 2000);
        });
      }
    });
  }

  // Copy Link Button
  const btnCopyShareUrl = document.getElementById('btn-copy-share-url');
  if (btnCopyShareUrl) {
    btnCopyShareUrl.addEventListener('click', () => {
      const shareUrlInput = document.getElementById('promoter-share-url');
      if (shareUrlInput) {
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
          const original = btnCopyShareUrl.innerHTML;
          btnCopyShareUrl.innerHTML = '<i class="fa-solid fa-check"></i> Link Copied!';
          setTimeout(() => { btnCopyShareUrl.innerHTML = original; }, 2000);
        });
      }
    });
  }

  // Copy Promo Code Button
  const btnCopyPromo = document.getElementById('btn-copy-promo-code');
  if (btnCopyPromo) {
    btnCopyPromo.addEventListener('click', () => {
      const promoCodeElem = document.getElementById('promoter-promo-code');
      if (promoCodeElem) {
        navigator.clipboard.writeText(promoCodeElem.textContent.trim()).then(() => {
          const original = btnCopyPromo.innerHTML;
          btnCopyPromo.innerHTML = '<i class="fa-solid fa-check"></i> Code Copied!';
          setTimeout(() => { btnCopyPromo.innerHTML = original; }, 2000);
        });
      }
    });
  }

  // TikTok Helper Button
  const btnTiktokCopy = document.getElementById('btn-tiktok-copy-helper');
  if (btnTiktokCopy) {
    btnTiktokCopy.addEventListener('click', () => {
      const shareUrlInput = document.getElementById('promoter-share-url');
      if (shareUrlInput) {
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
          const original = btnTiktokCopy.innerHTML;
          btnTiktokCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied to Clipboard for TikTok Bio!';
          setTimeout(() => { btnTiktokCopy.innerHTML = original; }, 2500);
        });
      }
    });
  }

  // Status Filter Change
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', () => {
      if (currentInfluencerId) {
        const commissions = store.getCommissions({ influencerId: currentInfluencerId });
        renderCommissions(commissions);
      }
    });
  }

  // Initialize Auth & Dashboard
  checkAuth();

  // Listen for storage / cross-tab updates
  window.addEventListener('storage', () => {
    if (store.isInfluencerLoggedIn()) {
      renderDashboard();
    } else {
      checkAuth();
    }
  });

  window.addEventListener('bookam_store_updated', () => {
    if (store.isInfluencerLoggedIn()) {
      renderDashboard();
    }
  });
});
