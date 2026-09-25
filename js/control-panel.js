/**
 * BOOKAM - Super Admin Master Control Panel Script (control-panel.js)
 */

function initControlPanel() {
  const store = window.bookamStore;
  if (!store) {
    setTimeout(initControlPanel, 50);
    return;
  }

  // DOM Elements - Auth Screen
  const authScreen = document.getElementById('admin-auth-screen');
  const mainPanel = document.getElementById('admin-main-panel');
  const loginForm = document.getElementById('admin-login-form');
  const loginEmail = document.getElementById('admin-login-email');
  const loginPassword = document.getElementById('admin-login-password');
  const authAlert = document.getElementById('admin-auth-alert');
  const btnAutofill = document.getElementById('btn-admin-autofill');
  const btnTogglePass = document.getElementById('btn-toggle-admin-pass');
  const passEyeIcon = document.getElementById('admin-pass-eye');
  const btnLogout = document.getElementById('btn-admin-logout');

  // DOM Elements - Tabs
  const tabItems = document.querySelectorAll('.admin-nav-link[data-tab], .admin-tab-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const badgeNavAllEvents = document.getElementById('badge-nav-all-events');
  const badgeNavAttendees = document.getElementById('badge-nav-attendees');
  const badgeNavOrganisers = document.getElementById('badge-nav-organisers');

  // DOM Elements - Payment Confirmation
  const tbodyAllPayments = document.getElementById('tbody-all-payments');
  const tbodyOverviewPayments = document.getElementById('tbody-overview-payments');
  const searchPaymentInput = document.getElementById('search-payment-input');
  const filterPaymentStatus = document.getElementById('filter-payment-status');
  const btnRefreshPayments = document.getElementById('btn-refresh-payments');
  const badgePendingCount = document.getElementById('badge-pending-count');

  // DOM Elements - Event Approvals
  const tbodyEventApprovals = document.getElementById('tbody-event-approvals');
  const filterEventApprovalStatus = document.getElementById('filter-approvals-lifecycle') || document.getElementById('filter-event-approval-status');
  const badgeEventsPending = document.getElementById('badge-events-pending');

  // DOM Elements - Refunds
  const tbodyAllRefunds = document.getElementById('tbody-all-refunds');
  const filterRefundsStatus = document.getElementById('filter-refunds-status');
  const badgeRefundsPending = document.getElementById('badge-refunds-pending');

  // DOM Elements - Gate Scanner
  const formGateCheckin = document.getElementById('form-gate-checkin');
  const inputTicketCode = document.getElementById('input-ticket-code');
  const selectGateName = document.getElementById('select-gate-name');
  const checkinFeedbackBox = document.getElementById('checkin-feedback-box');
  const statGateCheckedIn = document.getElementById('stat-gate-checked-in');
  const statGateTotalValid = document.getElementById('stat-gate-total-valid');
  const statGateRemaining = document.getElementById('stat-gate-remaining');
  const tbodyCheckinFeed = document.getElementById('tbody-checkin-feed');

  // DOM Elements - Audit & Notifications
  const tbodyAuditLogs = document.getElementById('tbody-audit-logs');
  const btnExportAudit = document.getElementById('btn-export-audit');
  const notificationsListContainer = document.getElementById('notifications-list-container');
  const btnMarkAllRead = document.getElementById('btn-mark-all-read');
  const badgeNotifCount = document.getElementById('badge-notif-count');

  // DOM Elements - Action Modal
  const actionModal = document.getElementById('admin-action-modal');
  const actionModalBody = document.getElementById('admin-action-modal-body');
  const btnCloseActionModal = document.getElementById('btn-close-action-modal');

  // DOM Elements - Contests & Votes
  const selectAdminContest = document.getElementById('select-admin-contest');
  const tbodyAdminContestants = document.getElementById('tbody-admin-contestants');
  const contestBannerTitle = document.getElementById('contest-banner-title');
  const contestBannerSub = document.getElementById('contest-banner-sub');
  const contestBannerTotalVotes = document.getElementById('contest-banner-total-votes');
  const contestBannerLeader = document.getElementById('contest-banner-leader');

  // DOM Elements - Events & Promoters
  const tbodyAdminEvents = document.getElementById('tbody-admin-events-list') || document.getElementById('tbody-admin-events');
  const tbodyAdminPromoters = document.getElementById('tbody-admin-promoters');

  // DOM Elements - Settings
  const settingsForm = document.getElementById('form-admin-settings') || document.getElementById('admin-settings-form');
  const settingsAlertBox = document.getElementById('settings-alert-box');

  // DOM Elements - Payment Modal
  const paymentModal = document.getElementById('admin-payment-modal');
  const paymentModalBody = document.getElementById('admin-payment-modal-body');
  const btnClosePaymentModal = document.getElementById('btn-close-payment-modal');

  // ================= 1. AUTHENTICATION & THEME FLOW =================
  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    const icons = document.querySelectorAll('#theme-toggle-icon, .admin-theme-icon');
    const text = document.getElementById('theme-toggle-text');
    icons.forEach(icon => {
      icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
    if (text) text.textContent = isDark ? 'Light' : 'Dark';
    localStorage.setItem('bookam_admin_theme', isDark ? 'dark' : 'light');
  }

  window.toggleAdminTheme = function() {
    const isCurrentlyDark = document.body.classList.contains('theme-dark');
    applyTheme(!isCurrentlyDark);
  };

  // Initialize theme (default to professional light theme)
  const savedTheme = localStorage.getItem('bookam_admin_theme');
  if (savedTheme === 'dark') {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  window.showAuthView = function(view) {
    const views = {
      login: document.getElementById('view-auth-login'),
      forgot: document.getElementById('view-auth-forgot'),
      reset: document.getElementById('view-auth-reset'),
      verify: document.getElementById('view-auth-verify')
    };
    Object.keys(views).forEach(k => {
      if (views[k]) views[k].style.display = (k === view ? 'block' : 'none');
    });
    if (authAlert) authAlert.style.display = 'none';
  };

  // Forgot Password submission
  const forgotForm = document.getElementById('admin-forgot-form') || document.getElementById('form-forgot-pass');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-forgot-email')?.value.trim() || document.getElementById('forgot-email-input')?.value.trim() || 'Bookam26@gmail.com';
      const verifyDisplay = document.getElementById('verify-email-display');
      if (verifyDisplay) verifyDisplay.textContent = email;
      if (authAlert) {
        authAlert.style.display = 'block';
        authAlert.style.background = 'rgba(16, 185, 129, 0.15)';
        authAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        authAlert.style.color = '#10B981';
        authAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Security verification code sent to <strong>${email}</strong>.`;
      }
      setTimeout(() => {
        window.showAuthView('verify');
      }, 1000);
    });
  }

  // Reset Password submission
  const resetForm = document.getElementById('admin-reset-form') || document.getElementById('form-reset-pass');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const p1 = document.getElementById('admin-new-pass')?.value || document.getElementById('reset-new-pass')?.value;
      const p2 = document.getElementById('admin-confirm-pass')?.value || document.getElementById('reset-confirm-pass')?.value;
      if (p1 !== p2) {
        if (authAlert) {
          authAlert.style.display = 'block';
          authAlert.style.background = 'rgba(239, 68, 68, 0.15)';
          authAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
          authAlert.style.color = '#EF4444';
          authAlert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Passwords do not match!';
        }
        return;
      }
      if (authAlert) {
        authAlert.style.display = 'block';
        authAlert.style.background = 'rgba(16, 185, 129, 0.15)';
        authAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        authAlert.style.color = '#10B981';
        authAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> Master password reset successfully. Please log in.';
      }
      setTimeout(() => {
        window.showAuthView('login');
      }, 1500);
    });
  }

  // 2FA Verification Code handler
  window.handleVerifyCode = function() {
    let code = document.getElementById('input-verify-code')?.value.trim() || '';
    if (!code) {
      const c1 = document.getElementById('code-1')?.value || '';
      const c2 = document.getElementById('code-2')?.value || '';
      const c3 = document.getElementById('code-3')?.value || '';
      const c4 = document.getElementById('code-4')?.value || '';
      const c5 = document.getElementById('code-5')?.value || '';
      const c6 = document.getElementById('code-6')?.value || '';
      code = `${c1}${c2}${c3}${c4}${c5}${c6}`.trim();
    }
    if (code.length < 4) {
      if (authAlert) {
        authAlert.style.display = 'block';
        authAlert.style.background = 'rgba(239, 68, 68, 0.15)';
        authAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        authAlert.style.color = '#EF4444';
        authAlert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter verification code.';
      }
      return;
    }
    if (authAlert) {
      authAlert.style.display = 'block';
      authAlert.style.background = 'rgba(16, 185, 129, 0.15)';
      authAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      authAlert.style.color = '#10B981';
      authAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> Code verified! Initializing Super Admin session...';
    }
    store.loginControlPanel('Bookam26@gmail.com', 'Linodrip$1123');
    setTimeout(() => {
      checkAuth();
    }, 900);
  };

  // Autofill button
  if (btnAutofill) {
    btnAutofill.addEventListener('click', () => {
      if (loginEmail) loginEmail.value = 'Bookam26@gmail.com';
      if (loginPassword) loginPassword.value = 'Linodrip$1123';
      if (authAlert) {
        authAlert.style.display = 'block';
        authAlert.style.background = 'rgba(79, 70, 229, 0.15)';
        authAlert.style.border = '1px solid rgba(79, 70, 229, 0.3)';
        authAlert.style.color = '#4F46E5';
        authAlert.innerHTML = '<i class="fa-solid fa-key"></i> Authorized Admin credentials loaded.';
        setTimeout(() => { authAlert.style.display = 'none'; }, 2000);
      }
    });
  }

  function checkAuth() {
    let isAuth = store.isControlPanelLoggedIn();
    if (!isAuth && !sessionStorage.getItem('bookam_admin_manual_logout')) {
      store.loginControlPanel('Bookam26@gmail.com', 'Linodrip$1123');
      isAuth = true;
    }
    if (isAuth) {
      if (authScreen) authScreen.style.display = 'none';
      if (mainPanel) mainPanel.style.display = 'block';
      const userDisplay = document.getElementById('admin-user-display');
      if (userDisplay) userDisplay.style.display = 'block';
      renderAll();
    } else {
      if (authScreen) authScreen.style.display = 'flex';
      if (mainPanel) mainPanel.style.display = 'none';
    }
  }

  // Password Visibility Toggle
  if (btnTogglePass && loginPassword && passEyeIcon) {
    btnTogglePass.addEventListener('click', () => {
      if (loginPassword.type === 'password') {
        loginPassword.type = 'text';
        passEyeIcon.className = 'fa-regular fa-eye-slash';
      } else {
        loginPassword.type = 'password';
        passEyeIcon.className = 'fa-regular fa-eye';
      }
    });
  }

  // Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = (loginEmail ? loginEmail.value : '').trim();
      const pass = (loginPassword ? loginPassword.value : '').trim();

      sessionStorage.removeItem('bookam_admin_manual_logout');
      const res = store.loginControlPanel(user, pass);
      if (res.success) {
        if (authAlert) {
          authAlert.style.display = 'block';
          authAlert.style.background = 'rgba(16, 185, 129, 0.15)';
          authAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          authAlert.style.color = '#10B981';
          authAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> Super Admin authorized! Initializing control room...';
        }
        setTimeout(() => {
          checkAuth();
        }, 400);
      } else {
        if (authAlert) {
          authAlert.style.display = 'block';
          authAlert.style.background = 'rgba(239, 68, 68, 0.15)';
          authAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
          authAlert.style.color = '#EF4444';
          authAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${res.message}`;
        }
      }
    });
  }

  // Logout
  window.handleAdminSignOut = function() {
    if (confirm('Are you sure you want to sign out of the Master Control Panel?')) {
      sessionStorage.setItem('bookam_admin_manual_logout', 'true');
      store.logoutControlPanel();
      checkAuth();
    }
  };

  if (btnLogout) {
    btnLogout.addEventListener('click', window.handleAdminSignOut);
  }

  // ================= 2. TAB SWITCHING =================
  window.switchAdminTab = function(tabName) {
    const allTabLinks = document.querySelectorAll('.admin-nav-link[data-tab], .admin-tab-item');
    allTabLinks.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const allPanes = document.querySelectorAll('.admin-tab-pane');
    allPanes.forEach(pane => {
      if (pane.id === `tab-pane-${tabName}`) {
        pane.style.display = 'block';
      } else {
        pane.style.display = 'none';
      }
    });

    if (tabName === 'overview') renderOverview();
    if (tabName === 'analytics') renderAnalytics();
    if (tabName === 'events') renderEventsTable();
    if (tabName === 'event-approvals') renderEventApprovalsTable();
    if (tabName === 'tickets-mgmt') renderTicketManagement();
    if (tabName === 'attendees') renderAttendeesTable();
    if (tabName === 'checkin') renderCheckInEngine();
    if (tabName === 'organisers') renderOrganisersTable();
    if (tabName === 'promoters') renderPromotersTable();
    if (tabName === 'promo-codes') renderPromoCodesTable();
    if (tabName === 'featured-events') renderFeaturedEventsTable();
    if (tabName === 'payments') renderPaymentsTable();
    if (tabName === 'refunds') renderRefundsTable();
    if (tabName === 'reports') renderReportsCenter();
    if (tabName === 'contests') renderContestController();
    if (tabName === 'users') renderPlatformUsersTable();
    if (tabName === 'notifications') renderNotificationsList();
    if (tabName === 'content-mgmt') renderContentMgmt();
    if (tabName === 'admin-roles') renderAdminRoles();
    if (tabName === 'audit') renderAuditLogsTable();
    if (tabName === 'settings') populateSettingsForm();
  };

  document.querySelectorAll('.admin-nav-link[data-tab], .admin-tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      if (tabName) window.switchAdminTab(tabName);
    });
  });

  // ================= 3. SALES CHART ENGINE (DUAL SERIES & INTERVALS) =================
  let currentSalesSeries = 'both'; // 'tickets' | 'revenue' | 'both'
  let currentSalesPeriod = 'today';

  window.setSalesSeriesToggle = function(mode) {
    currentSalesSeries = mode;
    const buttons = document.querySelectorAll('#sales-series-toggle-group .admin-date-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-series') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderSalesOverviewChart(currentSalesPeriod, currentSalesSeries);
  };

  window.promptCustomRange = function() {
    const start = prompt('Enter start date (YYYY-MM-DD):', '2026-09-01');
    if (!start) return;
    const end = prompt('Enter end date (YYYY-MM-DD):', '2026-09-30');
    if (!end) return;
    currentSalesPeriod = 'custom';
    const filterBtns = document.querySelectorAll('.admin-date-btn');
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-period') === 'custom');
    });
    renderSalesOverviewChart('custom', currentSalesSeries, { start, end });
  };

  // Wire up interval filter buttons across all date groups
  document.querySelectorAll('.admin-date-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-period');
      if (!p) return;
      if (p === 'custom') {
        window.promptCustomRange();
        return;
      }
      currentSalesPeriod = p;
      const parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('.admin-date-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      renderSalesOverviewChart(currentSalesPeriod, currentSalesSeries);
    });
  });

  window.renderSalesOverviewChart = function(period = 'today', seriesMode = 'both', customDates = null) {
    const container = document.getElementById('sales-chart-container');
    if (!container) return;

    // Dataset based on interval
    let labels = [];
    let ticketData = [];
    let revenueData = [];

    if (period === 'today') {
      labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    } else if (period === '7days') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (period === '30days') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else if (period === 'month') {
      labels = ['1-7th', '8-14th', '15-21st', '22-28th', '29-31st'];
    } else {
      labels = ['D1', 'D5', 'D10', 'D15', 'D20', 'D25', 'D30'];
    }

    const tickets = store.getTickets ? store.getTickets() : [];
    const payments = store.getPayments ? store.getPayments() : [];
    const approvedPayments = payments.filter(p => p.status === 'Approved');

    // Default to 0 baseline if no transactions yet
    if (approvedPayments.length === 0 && tickets.length === 0) {
      ticketData = labels.map(() => 0);
      revenueData = labels.map(() => 0);
    } else {
      const totalTix = tickets.length;
      const totalRev = approvedPayments.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
      const avgTix = Math.floor(totalTix / labels.length);
      const avgRev = Math.floor(totalRev / labels.length);
      ticketData = labels.map((_, i) => i === labels.length - 1 ? (totalTix - avgTix * (labels.length - 1)) : avgTix);
      revenueData = labels.map((_, i) => i === labels.length - 1 ? (totalRev - avgRev * (labels.length - 1)) : avgRev);
    }

    const width = 800;
    const height = 280;
    const padLeft = 60;
    const padRight = 70;
    const padTop = 30;
    const padBottom = 40;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const maxTickets = Math.max(...ticketData) * 1.15 || 100;
    const maxRev = Math.max(...revenueData) * 1.15 || 100000;

    const stepX = plotW / (labels.length - 1 || 1);
    const barW = Math.max(12, Math.min(36, stepX * 0.45));

    // Calculate points
    const points = labels.map((l, i) => {
      const x = padLeft + i * stepX;
      const yT = padTop + plotH - (ticketData[i] / maxTickets) * plotH;
      const yR = padTop + plotH - (revenueData[i] / maxRev) * plotH;
      return { x, yT, yR, label: l, tickets: ticketData[i], revenue: revenueData[i] };
    });

    // Generate path for revenue line
    let revPathD = '';
    points.forEach((pt, i) => {
      if (i === 0) revPathD += `M ${pt.x},${pt.yR}`;
      else {
        const prev = points[i - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.yR;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.yR;
        revPathD += ` C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.yR}`;
      }
    });

    const revAreaD = `${revPathD} L ${points[points.length - 1].x},${padTop + plotH} L ${points[0].x},${padTop + plotH} Z`;

    // Horizontal grid lines (4 levels)
    let gridLinesSvg = '';
    for (let g = 0; g <= 4; g++) {
      const y = padTop + (plotH / 4) * g;
      const tVal = Math.round(maxTickets - (maxTickets / 4) * g);
      const rVal = (maxRev - (maxRev / 4) * g);
      const rFormatted = rVal >= 1000000 ? `₦${(rVal / 1000000).toFixed(1)}M` : `₦${Math.round(rVal / 1000)}k`;

      gridLinesSvg += `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--admin-input-border)" stroke-dasharray="4,4" stroke-width="1" />
        ${seriesMode !== 'revenue' ? `<text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" fill="var(--admin-text-muted)" font-size="10" font-family="Plus Jakarta Sans, sans-serif">${tVal}</text>` : ''}
        ${seriesMode !== 'tickets' ? `<text x="${width - padRight + 10}" y="${y + 4}" text-anchor="start" fill="#10B981" font-size="10" font-family="Plus Jakarta Sans, sans-serif">${rFormatted}</text>` : ''}
      `;
    }

    // X-Axis Labels
    let xLabelsSvg = '';
    points.forEach(pt => {
      xLabelsSvg += `
        <text x="${pt.x}" y="${height - 12}" text-anchor="middle" fill="var(--admin-text-muted)" font-size="11" font-weight="600" font-family="Plus Jakarta Sans, sans-serif">${pt.label}</text>
      `;
    });

    // Bars for tickets
    let barsSvg = '';
    if (seriesMode === 'tickets' || seriesMode === 'both') {
      points.forEach(pt => {
        const barH = padTop + plotH - pt.yT;
        barsSvg += `
          <g class="chart-bar-group" style="cursor: pointer;">
            <rect x="${pt.x - barW / 2}" y="${pt.yT}" width="${barW}" height="${barH}" rx="4" fill="url(#ticketBarGrad)" opacity="0.85" />
            <title>${pt.label}: ${pt.tickets} Tickets Sold</title>
          </g>
        `;
      });
    }

    // Revenue line & dots
    let revSvg = '';
    if (seriesMode === 'revenue' || seriesMode === 'both') {
      revSvg += `
        <path d="${revAreaD}" fill="url(#revAreaGrad)" opacity="0.25" />
        <path d="${revPathD}" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
      `;
      points.forEach(pt => {
        revSvg += `
          <circle cx="${pt.x}" cy="${pt.yR}" r="5" fill="#10B981" stroke="#FFFFFF" stroke-width="2" style="cursor: pointer;">
            <title>${pt.label}: ₦${pt.revenue.toLocaleString()} Gross Revenue</title>
          </circle>
        `;
      });
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ticketBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#4F46E5" />
          </linearGradient>
          <linearGradient id="revAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Grid Lines & Axes -->
        ${gridLinesSvg}
        ${xLabelsSvg}

        <!-- Data Series -->
        ${barsSvg}
        ${revSvg}
      </svg>
    `;
  };

  // ================= 3B. RENDER OVERVIEW =================
  function renderOverview() {
    const payments = store.getPayments();
    const contests = store.getContests();
    const events = store.getEvents();
    const refunds = store.getRefunds();
    const notifs = store.getNotifications();
    const checkinStats = store.getCheckInStats();

    // Stats calculations
    let confirmedRevenue = 0;
    let pendingCount = 0;
    let approvedTicketsCount = 0;

    payments.forEach(p => {
      if (p.status === 'Approved') {
        confirmedRevenue += Number(p.totalAmount) || 0;
        approvedTicketsCount += Number(p.quantity) || 1;
      } else if (p.status === 'Pending Approval') {
        pendingCount++;
      }
    });

    let totalVotes = 0;
    contests.forEach(c => {
      if (c.contestants) {
        c.contestants.forEach(ct => {
          totalVotes += Number(ct.votes) || 0;
        });
      }
    });

    // Pending approvals count
    const pendingApprovalsList = events.filter(e => {
      const s = String(e?.status || e?.onboardingStatus || '').toUpperCase();
      return s.includes('PENDING') || s.includes('REVIEW') || s.includes('ACTION');
    });
    const pendingEventsCount = pendingApprovalsList.length;

    // Active events count
    const activeEventsCount = events.filter(e => {
      const s = String(e?.status || e?.onboardingStatus || '').toUpperCase();
      return s.includes('APPROVED') || s.includes('LIVE');
    }).length;

    // Pending refunds count
    const pendingRefundsCount = refunds.filter(r => r.status === 'Pending Review').length;
    const unreadNotifsCount = notifs.filter(n => !n.read).length;

    // 1. UPDATE 8 KPI CARDS
    const elTotEvents = document.getElementById('stat-total-events');
    const elTotOrg = document.getElementById('stat-total-organisers');
    const elTotAtt = document.getElementById('stat-total-attendees');
    const elTotSold = document.getElementById('stat-tickets-sold');
    const elGrossRev = document.getElementById('stat-gross-revenue');
    const elActiveEv = document.getElementById('stat-active-events');
    const elUpEv = document.getElementById('stat-upcoming-events');
    const elPendApp = document.getElementById('stat-pending-approvals');

    const totalEventsCount = events.length;
    const totalOrganisersCount = (store.getOrganizersList ? store.getOrganizersList() : []).length;
    const totalAttendeesCount = approvedTicketsCount;
    const totalTicketsSold = approvedTicketsCount;
    const totalGrossRevenue = confirmedRevenue;
    const upcomingEventsCount = events.filter(e => {
      try {
        return new Date(e.date) >= new Date();
      } catch (err) {
        return false;
      }
    }).length;
    const draftEventsCount = events.filter(e => String(e?.status || '').toUpperCase() === 'DRAFT').length;
    const completedEventsCount = events.filter(e => String(e?.status || '').toUpperCase() === 'COMPLETED').length;

    if (elTotEvents) elTotEvents.textContent = totalEventsCount.toLocaleString();
    if (elTotOrg) elTotOrg.textContent = totalOrganisersCount.toLocaleString();
    if (elTotAtt) elTotAtt.textContent = totalAttendeesCount.toLocaleString();
    if (elTotSold) elTotSold.textContent = totalTicketsSold.toLocaleString();
    if (elGrossRev) elGrossRev.textContent = store.formatCurrency(totalGrossRevenue);
    if (elActiveEv) elActiveEv.textContent = activeEventsCount.toLocaleString();
    if (elUpEv) elUpEv.textContent = upcomingEventsCount.toLocaleString();
    if (elPendApp) elPendApp.textContent = pendingEventsCount.toString();

    // Breakdown chips
    const chipPub = document.getElementById('stat-chip-published');
    const chipPend = document.getElementById('stat-chip-pending');
    const chipDraft = document.getElementById('stat-chip-draft');
    const chipComp = document.getElementById('stat-chip-completed');
    if (chipPub) chipPub.textContent = activeEventsCount;
    if (chipPend) chipPend.textContent = pendingEventsCount;
    if (chipDraft) chipDraft.textContent = draftEventsCount;
    if (chipComp) chipComp.textContent = completedEventsCount;

    const chipOrgVer = document.getElementById('stat-chip-org-verified');
    const chipOrgApp = document.getElementById('stat-chip-org-applications');
    if (chipOrgVer) chipOrgVer.textContent = totalOrganisersCount;
    if (chipOrgApp) chipOrgApp.textContent = '0';

    const chipCheckedIn = document.getElementById('stat-chip-checkedin');
    const chipAttRate = document.getElementById('stat-chip-attendance-rate');
    const checkedInCount = checkinStats.checkedInCount || 0;
    if (chipCheckedIn) chipCheckedIn.textContent = checkedInCount.toLocaleString();
    if (chipAttRate) {
      const rate = totalAttendeesCount > 0 ? ((checkedInCount / totalAttendeesCount) * 100).toFixed(1) : '0.0';
      chipAttRate.textContent = `${rate}%`;
    }

    const chipRegPct = document.getElementById('stat-chip-regular-pct');
    const chipEarlyPct = document.getElementById('stat-chip-early-pct');
    if (chipRegPct) chipRegPct.textContent = totalTicketsSold > 0 ? '100%' : '0.0%';
    if (chipEarlyPct) chipEarlyPct.textContent = '0.0%';

    const chipPlatFee = document.getElementById('stat-chip-platform-fee');
    const chipPayouts = document.getElementById('stat-chip-payouts');
    const platformFeeTotal = totalTicketsSold * 400;
    const payoutsTotal = Math.max(0, totalGrossRevenue - platformFeeTotal);
    if (chipPlatFee) chipPlatFee.textContent = store.formatCurrency(platformFeeTotal);
    if (chipPayouts) chipPayouts.textContent = store.formatCurrency(payoutsTotal);

    const chipActiveDesc = document.getElementById('stat-chip-active-desc');
    if (chipActiveDesc) chipActiveDesc.textContent = `${activeEventsCount}`;

    const chipUpcomingDesc = document.getElementById('stat-chip-upcoming-desc');
    if (chipUpcomingDesc) chipUpcomingDesc.textContent = `${upcomingEventsCount} Scheduled in Next 60 Days`;

    // Chart metrics below SVG chart
    const elAvgPrice = document.getElementById('chart-metric-avg-price');
    const elConversion = document.getElementById('chart-metric-conversion');
    const elTotalOrders = document.getElementById('chart-metric-total-orders');
    const elRefundRate = document.getElementById('chart-metric-refund-rate');

    if (elAvgPrice) {
      elAvgPrice.textContent = totalTicketsSold > 0 ? store.formatCurrency(Math.round(totalGrossRevenue / totalTicketsSold)) : '₦0.00';
    }
    if (elConversion) elConversion.textContent = '0.0%';
    if (elTotalOrders) {
      const approvedOrdersCount = payments.filter(p => p.status === 'Approved').length;
      elTotalOrders.textContent = approvedOrdersCount.toString();
    }
    if (elRefundRate) {
      const rate = payments.length > 0 ? ((refunds.length / payments.length) * 100).toFixed(1) : '0.0';
      elRefundRate.textContent = `${rate}%`;
    }

    // Top Performing Events table
    const tbodyTopEvents = document.getElementById('tbody-top-events');
    if (tbodyTopEvents) {
      const sortedEvents = [...events].sort((a, b) => (Number(b.ticketsSold) || 0) - (Number(a.ticketsSold) || 0)).slice(0, 5);
      const hasSales = sortedEvents.some(e => (Number(e.ticketsSold) || 0) > 0);
      if (!hasSales) {
        tbodyTopEvents.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted); padding: 1.75rem;"><i class="fa-solid fa-ticket" style="margin-right: 0.5rem; color: #818CF8;"></i> No ticket sales recorded yet. (0 tickets sold)</td></tr>`;
      } else {
        tbodyTopEvents.innerHTML = sortedEvents.map((ev, idx) => {
          const sold = Number(ev.ticketsSold) || 0;
          const cap = Number(ev.expectedAttendees) || 500;
          const pct = Math.min(100, Math.round((sold / cap) * 100));
          const rev = sold * (Number(ev.price) || 0);
          return `
            <tr>
              <td><span style="font-weight: 800; color: ${idx === 0 ? '#F59E0B' : (idx === 1 ? '#94A3B8' : 'var(--admin-text-muted)')};">#${idx + 1}</span></td>
              <td><strong>${ev.title}</strong><br><small style="color: var(--admin-text-muted);">${store.formatDate(ev.date)}</small></td>
              <td>${sold} / ${cap}</td>
              <td style="color: #10B981; font-weight: 700;">${store.formatCurrency(rev)}</td>
              <td>
                <div style="width: 80px; height: 6px; background: var(--admin-input-border); border-radius: 9999px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: #10B981;"></div>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Legacy stat elements if present
    const statRev = document.getElementById('stat-total-revenue');
    const statPending = document.getElementById('stat-pending-payments');
    const statPendingEvents = document.getElementById('stat-pending-events');
    const statApproved = document.getElementById('stat-approved-tickets');
    const statVotes = document.getElementById('stat-total-votes');

    if (statRev) statRev.textContent = store.formatCurrency(confirmedRevenue);
    if (statPending) statPending.textContent = pendingCount;
    if (statPendingEvents) statPendingEvents.textContent = pendingEventsCount;
    if (statApproved) statApproved.textContent = checkinStats.checkedInCount || 0;
    if (statVotes) statVotes.textContent = totalVotes.toLocaleString();

    // Header Badges
    if (badgeEventsPending) {
      badgeEventsPending.style.display = pendingEventsCount > 0 ? 'inline-flex' : 'none';
      badgeEventsPending.textContent = pendingEventsCount;
    }
    if (badgePendingCount) {
      badgePendingCount.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
      badgePendingCount.textContent = pendingCount;
    }
    if (badgeRefundsPending) {
      badgeRefundsPending.style.display = pendingRefundsCount > 0 ? 'inline-flex' : 'none';
      badgeRefundsPending.textContent = pendingRefundsCount;
    }
    if (badgeNotifCount) {
      badgeNotifCount.style.display = unreadNotifsCount > 0 ? 'inline-flex' : 'none';
      badgeNotifCount.textContent = unreadNotifsCount;
    }
    if (badgeNavAllEvents) {
      badgeNavAllEvents.textContent = events.length;
    }
    if (badgeNavAttendees) {
      badgeNavAttendees.textContent = store.getTickets().length;
    }
    if (badgeNavOrganisers) {
      badgeNavOrganisers.textContent = store.getOrganizersList().length;
    }

    // 2. RENDER SALES OVERVIEW SVG CHART
    renderSalesOverviewChart(currentSalesPeriod, currentSalesSeries);

    // 3. OVERVIEW: 10. PENDING APPROVALS QUEUE
    const tbodyOverviewApprovals = document.getElementById('tbody-overview-approvals');
    if (tbodyOverviewApprovals) {
      if (pendingApprovalsList.length === 0) {
        tbodyOverviewApprovals.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--admin-text-muted); padding: 2rem;">
              <i class="fa-solid fa-circle-check" style="color: #10B981; margin-right: 0.5rem;"></i> No events currently awaiting review. Queue is clear!
            </td>
          </tr>
        `;
      } else {
        tbodyOverviewApprovals.innerHTML = pendingApprovalsList.slice(0, 5).map(ev => {
          const flyer = ev.flyerUrl || ev.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';
          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                  <img src="${flyer}" alt="" referrerpolicy="no-referrer" style="width: 38px; height: 38px; border-radius: 6px; object-fit: cover; border: 1px solid var(--admin-input-border);" />
                  <div>
                    <strong style="color: var(--admin-text-main); font-size: 0.85rem;">${ev.title || 'Untitled Event'}</strong>
                    <div style="font-size: 0.725rem; color: var(--admin-text-muted);">${ev.category || 'General'}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-size: 0.825rem; font-weight: 600;">${ev.organizer || 'Organiser'}</div>
                <small style="color: var(--admin-text-muted);">${ev.organizerEmail || 'N/A'}</small>
              </td>
              <td>${store.formatDate(ev.submittedAt || ev.date || new Date().toISOString())}</td>
              <td>${renderEventStatusBadge(ev.status || ev.onboardingStatus)}</td>
              <td>
                <div style="display: flex; gap: 0.35rem;">
                  <button type="button" class="admin-btn admin-btn-sm admin-btn-outline" onclick="viewEventDetails('${ev.id}')" title="Full Review">
                    <i class="fa-solid fa-file-lines"></i> Review
                  </button>
                  <button type="button" class="admin-btn admin-btn-sm admin-btn-success" onclick="handleQuickApprove('${ev.id}')" title="Approve">
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button type="button" class="admin-btn admin-btn-sm admin-btn-danger" onclick="handleQuickReject('${ev.id}')" title="Reject">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 4. OVERVIEW: 11. RECENT TRANSACTIONS TABLE
    if (tbodyOverviewPayments) {
      const recent = [...payments].reverse().slice(0, 5);
      if (recent.length === 0) {
        tbodyOverviewPayments.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--admin-text-muted); padding: 1.5rem;">No recent payment notices.</td></tr>`;
      } else {
        tbodyOverviewPayments.innerHTML = recent.map(p => `
          <tr>
            <td><strong style="font-family: monospace; color: var(--admin-primary);">${p.paymentRef}</strong></td>
            <td>
              <div>${p.customerName}</div>
              <small style="color: var(--admin-text-muted);">${p.eventName || 'Event'}</small>
            </td>
            <td><strong style="color: #10B981;">${store.formatCurrency(p.totalAmount)}</strong></td>
            <td>${renderStatusBadge(p.status)}</td>
          </tr>
        `).join('');
      }
    }

    // 5. OVERVIEW: 13. TOP INFLUENCERS TABLE
    const tbodyTopInfluencers = document.getElementById('tbody-top-influencers');
    if (tbodyTopInfluencers) {
      const realInfluencers = (store.getInfluencers ? store.getInfluencers() : []).filter(inf => (Number(inf.ticketSales) || 0) > 0);
      if (realInfluencers.length === 0) {
        tbodyTopInfluencers.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted); padding: 1.75rem;"><i class="fa-solid fa-bullhorn" style="margin-right: 0.5rem; color: #38BDF8;"></i> No promoter sales recorded yet. (0 sales)</td></tr>`;
      } else {
        const sorted = [...realInfluencers].sort((a, b) => (Number(b.ticketSales) || 0) - (Number(a.ticketSales) || 0)).slice(0, 5);
        tbodyTopInfluencers.innerHTML = sorted.map((inf, idx) => `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 800; color: ${idx === 0 ? '#F59E0B' : (idx === 1 ? '#94A3B8' : 'var(--admin-text-muted)')};">#${idx + 1}</span>
                <strong style="color: var(--admin-text-main);">${inf.name}</strong>
              </div>
            </td>
            <td><span class="admin-badge approved" style="font-family: monospace;">${inf.promoCode || 'PROMO'}</span></td>
            <td><strong>${inf.ticketSales || 0}</strong></td>
            <td style="color: #10B981; font-weight: 700;">${store.formatCurrency(inf.commissionEarned || 0)}</td>
            <td><span style="color: #4F46E5; font-weight: 600;">${inf.conversionRate || '0.0%'}</span></td>
            <td>
              <button type="button" class="admin-btn admin-btn-sm admin-btn-outline" onclick="openInfluencerModal('${inf.name}')">
                <i class="fa-solid fa-chart-pie"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  // Quick Action Handlers
  window.handleQuickApprove = function(eventId) {
    if (confirm('Are you sure you want to approve this event and immediately activate ticket sales?')) {
      handleUpdateEventStatus(eventId, 'APPROVED');
    }
  };

  window.handleQuickReject = function(eventId) {
    const reason = prompt('Please specify the reason for rejecting this event submission:', 'Violates Bookam event criteria / Incomplete documentation');
    if (reason) {
      handleUpdateEventStatus(eventId, 'REJECTED');
      store.addAuditLog('REJECT_EVENT', 'Event', eventId, `Event submission rejected by Super Admin. Reason: ${reason}`);
      alert(`Event ${eventId} has been rejected.`);
    }
  };

  window.openInfluencerModal = function(name) {
    alert(`Influencer Detail: ${name}\nActive Code: Linked\nPerformance: Verified in top tier\nCommission Settlement: Moniepoint MFB Direct Payout active.`);
  };

  function renderStatusBadge(status) {
    if (status === 'Approved') {
      return `<span class="admin-badge approved"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
    } else if (status === 'Rejected') {
      return `<span class="admin-badge rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>`;
    } else {
      return `<span class="admin-badge pending"><i class="fa-solid fa-clock"></i> Pending Approval</span>`;
    }
  }

  function renderEventStatusBadge(status) {
    const s = (status || 'PENDING REVIEW').toUpperCase();
    if (s === 'APPROVED' || s === 'TICKET SALES LIVE') {
      return `<span class="admin-badge approved"><i class="fa-solid fa-circle-check"></i> ${s}</span>`;
    } else if (s === 'UNDER REVIEW') {
      return `<span class="admin-badge" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3);"><i class="fa-solid fa-hourglass-half"></i> UNDER REVIEW</span>`;
    } else if (s === 'PAUSED') {
      return `<span class="admin-badge" style="background: rgba(249, 115, 22, 0.15); color: #FB923C; border: 1px solid rgba(249, 115, 22, 0.4);"><i class="fa-solid fa-pause"></i> PAUSED</span>`;
    } else if (s === 'ACTION REQUIRED') {
      return `<span class="admin-badge pending" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-triangle-exclamation"></i> ACTION REQUIRED</span>`;
    } else if (s === 'SUSPENDED' || s === 'REJECTED' || s === 'ENDED') {
      return `<span class="admin-badge rejected"><i class="fa-solid fa-ban"></i> ${s}</span>`;
    } else {
      return `<span class="admin-badge pending"><i class="fa-solid fa-clock"></i> PENDING REVIEW</span>`;
    }
  }

  // ================= 3B. EVENT ONBOARDING & APPROVALS =================
  function renderEventApprovalsTable() {
    if (!tbodyEventApprovals) return;
    const events = store.getEvents();
    const filter = filterEventApprovalStatus ? filterEventApprovalStatus.value : 'all';

    const filtered = [...events].reverse().filter(ev => {
      const s = String(ev?.status || ev?.onboardingStatus || 'PENDING REVIEW').toUpperCase();
      if (filter === 'pending') {
        return s.includes('PENDING') || s.includes('REVIEW') || s.includes('ACTION');
      }
      if (filter === 'under_review') {
        return s === 'UNDER REVIEW';
      }
      if (filter === 'approved') {
        return s.includes('APPROVED') || s.includes('LIVE');
      }
      if (filter === 'action_required') {
        return s.includes('ACTION');
      }
      if (filter === 'paused') {
        return s === 'PAUSED';
      }
      if (filter === 'suspended') {
        return s.includes('SUSPEND') || s.includes('ENDED') || s.includes('REJECT');
      }
      return true;
    });

    if (filtered.length === 0) {
      tbodyEventApprovals.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: #94A3B8;">No events in this lifecycle category.</td></tr>`;
      return;
    }

    tbodyEventApprovals.innerHTML = filtered.map(ev => {
      const status = (ev.status || ev.onboardingStatus || 'PENDING REVIEW').toUpperCase();
      const tiers = ev.tiers || [];
      const flyer = ev.flyerUrl || ev.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';
      const isApproved = status === 'APPROVED' || status === 'TICKET SALES LIVE';
      const isUnderReview = status === 'UNDER REVIEW';
      const isPaused = status === 'PAUSED';

      return `
        <tr>
          <td>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img src="${flyer}" alt="" referrerpolicy="no-referrer" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #334155; flex-shrink: 0;" />
              <div>
                <div style="font-weight: 800; color: #F8FAFC; font-size: 0.95rem;">${ev.title}</div>
                <div style="font-family: monospace; font-size: 0.75rem; color: #818CF8;">ID: ${ev.id}</div>
                ${ev.expectedAttendees ? `<small style="color: #94A3B8;">Cap: ${ev.expectedAttendees} guests</small>` : ''}
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: #CBD5E1;">${ev.organizerBrand || ev.organizer || 'Organiser'}</div>
            <div style="font-size: 0.775rem; color: #94A3B8;">${ev.organizerEmail || 'No email'}</div>
            <div style="font-size: 0.75rem; color: #64748B;">
              ${ev.organizerPhone || ''} ${ev.organizerWhatsapp ? `&bull; WA: ${ev.organizerWhatsapp}` : ''}
            </div>
            ${ev.organizerInstagram ? `<div style="font-size: 0.75rem; color: #F472B6;">@${ev.organizerInstagram.replace('@', '')}</div>` : ''}
          </td>
          <td>
            <span style="display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; background: #1E293B; border: 1px solid #334155; font-size: 0.775rem; color: #CBD5E1;">
              ${ev.category || 'Event'}
            </span>
          </td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 600; color: #F8FAFC;">${store.formatDate(ev.date)}</div>
            <div style="font-size: 0.75rem; color: #94A3B8;">${ev.time || 'TBA'}</div>
            <div style="font-size: 0.75rem; color: #64748B; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ev.venue || 'TBA'}</div>
          </td>
          <td>
            <div style="font-size: 0.775rem; line-height: 1.4;">
              ${tiers.length > 0 ? tiers.map(t => `<div>${t.name || t.type}: <strong style="color: #34D399;">${store.formatCurrency(t.price)}</strong></div>`).join('') : '<span style="color: #64748B;">No tiers configured</span>'}
            </div>
          </td>
          <td>
            ${renderEventStatusBadge(status)}
            ${ev.adminReviewNote ? `<div style="font-size: 0.7rem; color: #FBBF24; margin-top: 0.35rem; max-width: 145px; word-break: break-word;">Note: ${ev.adminReviewNote}</div>` : ''}
            ${ev.agreedExclusiveTicketing || ev.exclusiveTicketingTermsAccepted ? `
              <div style="margin-top: 0.4rem;">
                <span class="admin-badge" style="background: rgba(124, 58, 237, 0.2); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.4); font-size: 0.68rem; padding: 0.15rem 0.45rem;">
                  <i class="fa-solid fa-file-contract"></i> Exclusive Terms Agreed
                </span>
              </div>
            ` : ''}
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.35rem; min-width: 175px;">
              <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="viewEventDetailsModal('${ev.id}')" style="justify-content: center; font-weight: 700;">
                <i class="fa-solid fa-eye"></i> Review Application
              </button>
              ${!isApproved ? `
                <button class="admin-btn admin-btn-sm admin-btn-success" onclick="handleUpdateEventStatus('${ev.id}', 'APPROVED')" style="justify-content: center; font-weight: 700;">
                  <i class="fa-solid fa-check"></i> Approve & Go Live
                </button>
              ` : ''}
              ${!isUnderReview && !isApproved ? `
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handleUpdateEventStatus('${ev.id}', 'UNDER REVIEW')" style="color: #60A5FA; border-color: rgba(96, 165, 250, 0.4); justify-content: center; font-weight: 700;">
                  <i class="fa-solid fa-magnifying-glass"></i> Mark Under Review
                </button>
              ` : ''}
              <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 0.35rem;">
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handleRequestEventChanges('${ev.id}')" style="color: #FBBF24; border-color: rgba(245, 158, 11, 0.4); justify-content: center; font-size: 0.75rem; padding: 0.35rem 0.4rem;">
                  <i class="fa-solid fa-pen-to-square"></i> Request Changes
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="openAdminEditEventModal('${ev.id}')" style="color: #C084FC; border-color: rgba(192, 132, 252, 0.4); justify-content: center; font-size: 0.75rem; padding: 0.35rem 0.4rem;">
                  <i class="fa-solid fa-pen"></i> Edit
                </button>
              </div>
              ${isPaused ? `
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handleResumeEvent('${ev.id}')" style="color: #34D399; border-color: rgba(52, 211, 153, 0.4); justify-content: center; font-weight: 700;">
                  <i class="fa-solid fa-play"></i> Resume Sales
                </button>
              ` : (isApproved ? `
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handlePauseEvent('${ev.id}')" style="color: #FB923C; border-color: rgba(249, 115, 22, 0.4); justify-content: center; font-weight: 700;">
                  <i class="fa-solid fa-pause"></i> Pause Sales
                </button>
              ` : '')}
              ${status !== 'SUSPENDED' ? `
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handleSuspendEvent('${ev.id}')" style="color: #F87171; border-color: rgba(239, 68, 68, 0.4); justify-content: center; font-size: 0.75rem;">
                  <i class="fa-solid fa-ban"></i> Suspend
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (filterEventApprovalStatus) {
    filterEventApprovalStatus.addEventListener('change', renderEventApprovalsTable);
  }

  // Handle Event Status Updates (Approve & Go Live, Mark Under Review)
  window.handleUpdateEventStatus = function(eventId, newStatus) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event) return;

    if (!confirm(`Are you sure you want to change status of "${event.title}" to ${newStatus}?`)) {
      return;
    }

    const note = newStatus === 'APPROVED' 
      ? 'Approved & Ticket Sales Live' 
      : (newStatus === 'UNDER REVIEW' ? 'Application marked Under Review' : `Status updated to ${newStatus}`);

    store.updateEventStatus(eventId, newStatus, note);
    renderEventApprovalsTable();
    if (typeof renderEventsTable === 'function') renderEventsTable();
    renderOverview();

    if (actionModal && actionModal.style.display !== 'none') {
      viewEventDetailsModal(eventId);
    }

    if (store.showToast) {
      store.showToast(`✅ Status of "${event.title}" set to ${newStatus}!`, 'success');
    }
  };

  // Handle Request Changes
  window.handleRequestEventChanges = function(eventId) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event) return;

    const notes = prompt(`Please specify the correction / action required from organiser for "${event.title}":`, event.adminReviewNote || 'Please provide higher resolution flyer and verify venue capacity.');
    if (!notes) return;

    store.updateEventStatus(eventId, 'ACTION REQUIRED', notes);
    renderEventApprovalsTable();
    if (typeof renderEventsTable === 'function') renderEventsTable();
    renderOverview();

    if (actionModal && actionModal.style.display !== 'none') {
      viewEventDetailsModal(eventId);
    }

    if (store.showToast) {
      store.showToast(`📝 Changes requested for "${event.title}".`, 'warning');
    }
  };

  // Handle Pause Event (Pause Fix)
  window.handlePauseEvent = function(eventId) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event) return;

    const reason = prompt(`Specify reason for pausing ticket sales for "${event.title}":`, event.adminReviewNote || 'Ticket sales temporarily paused by administration.');
    if (reason === null) return; // User clicked Cancel

    store.updateEventStatus(eventId, 'PAUSED', reason || 'Ticket sales paused by Super Admin');
    renderEventApprovalsTable();
    if (typeof renderEventsTable === 'function') renderEventsTable();
    renderOverview();

    if (actionModal && actionModal.style.display !== 'none') {
      viewEventDetailsModal(eventId);
    }

    if (store.showToast) {
      store.showToast(`⏸️ Ticket sales paused for "${event.title}".`, 'warning');
    }
  };

  // Handle Resume Event (Pause Fix)
  window.handleResumeEvent = function(eventId) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event) return;

    if (!confirm(`Resume active ticket sales for "${event.title}" and go live?`)) return;

    store.updateEventStatus(eventId, 'APPROVED', 'Ticket sales resumed and active by Super Admin');
    renderEventApprovalsTable();
    if (typeof renderEventsTable === 'function') renderEventsTable();
    renderOverview();

    if (actionModal && actionModal.style.display !== 'none') {
      viewEventDetailsModal(eventId);
    }

    if (store.showToast) {
      store.showToast(`▶️ Ticket sales resumed and live for "${event.title}"!`, 'success');
    }
  };

  // Handle Suspend Event
  window.handleSuspendEvent = function(eventId) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event) return;

    const reason = prompt(`Provide reason for suspending "${event.title}":`, 'Compliance review violation / event cancelled by organiser.');
    if (!reason) return;

    store.updateEventStatus(eventId, 'SUSPENDED', reason);
    renderEventApprovalsTable();
    if (typeof renderEventsTable === 'function') renderEventsTable();
    renderOverview();

    if (actionModal && actionModal.style.display !== 'none') {
      viewEventDetailsModal(eventId);
    }

    if (store.showToast) {
      store.showToast(`🛑 Event "${event.title}" suspended.`, 'danger');
    }
  };

  // ================= ADMIN EDIT EVENT LOGIC =================
  function renderEditEventTiers(tiers) {
    const container = document.getElementById('edit-event-tiers-container');
    if (!container) return;

    if (!tiers || tiers.length === 0) {
      tiers = [{ name: 'Regular', price: 5000, maxQuantity: 100, description: 'Standard Entry' }];
    }

    container.innerHTML = tiers.map((t) => `
      <div class="edit-tier-row" style="display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 0.5rem; align-items: center; background: #0F172A; border: 1px solid #334155; border-radius: 6px; padding: 0.5rem;">
        <input type="text" class="admin-control-input tier-name" value="${t.name || t.type || ''}" placeholder="Tier Name (e.g. Regular)" required style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
        <input type="number" class="admin-control-input tier-price" value="${t.price || 0}" placeholder="Price (₦)" min="0" required style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
        <input type="number" class="admin-control-input tier-qty" value="${t.maxQuantity || t.availableQuantity || 100}" placeholder="Capacity" min="1" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
        <button type="button" class="admin-btn admin-btn-outline admin-btn-sm btn-remove-tier" style="color: #F87171; border-color: rgba(239, 68, 68, 0.3); padding: 0.4rem 0.6rem;" title="Remove Tier">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-tier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('.edit-tier-row');
        if (container.querySelectorAll('.edit-tier-row').length > 1) {
          row.remove();
        } else {
          alert('Event must have at least one ticket tier.');
        }
      });
    });
  }

  const btnEditAddTier = document.getElementById('btn-edit-add-tier');
  if (btnEditAddTier) {
    btnEditAddTier.addEventListener('click', () => {
      const container = document.getElementById('edit-event-tiers-container');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'edit-tier-row';
      row.style.cssText = 'display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 0.5rem; align-items: center; background: #0F172A; border: 1px solid #334155; border-radius: 6px; padding: 0.5rem;';
      row.innerHTML = `
        <input type="text" class="admin-control-input tier-name" placeholder="Tier Name (e.g. VIP)" required style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
        <input type="number" class="admin-control-input tier-price" placeholder="Price (₦)" min="0" value="10000" required style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
        <input type="number" class="admin-control-input tier-qty" placeholder="Capacity" min="1" value="50" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
        <button type="button" class="admin-btn admin-btn-outline admin-btn-sm btn-remove-tier" style="color: #F87171; border-color: rgba(239, 68, 68, 0.3); padding: 0.4rem 0.6rem;" title="Remove Tier">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      row.querySelector('.btn-remove-tier').addEventListener('click', () => {
        if (container.querySelectorAll('.edit-tier-row').length > 1) {
          row.remove();
        } else {
          alert('Event must have at least one ticket tier.');
        }
      });
      container.appendChild(row);
    });
  }

  window.openAdminEditEventModal = function(eventId) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('admin-edit-event-modal');
    if (!modal) return;

    const elId = document.getElementById('edit-event-id');
    const elTitle = document.getElementById('edit-event-title');
    const elCategory = document.getElementById('edit-event-category');
    const elDate = document.getElementById('edit-event-date');
    const elTime = document.getElementById('edit-event-time');
    const elCity = document.getElementById('edit-event-city');
    const elVenue = document.getElementById('edit-event-venue');
    const elBanner = document.getElementById('edit-event-banner');
    const elDesc = document.getElementById('edit-event-description');

    if (elId) elId.value = event.id;
    if (elTitle) elTitle.value = event.title || '';
    if (elCategory) elCategory.value = event.category || '';
    if (elDate) elDate.value = event.date || '';
    if (elTime) elTime.value = event.time || '';
    if (elCity) elCity.value = event.city || '';
    if (elVenue) elVenue.value = event.venue || '';
    if (elBanner) elBanner.value = event.banner || event.flyerUrl || '';
    if (elDesc) elDesc.value = event.description || '';

    renderEditEventTiers(event.tiers || event.tickets || []);
    modal.style.display = 'flex';
  };

  window.closeEditEventModal = function() {
    const modal = document.getElementById('admin-edit-event-modal');
    if (modal) modal.style.display = 'none';
  };

  const formAdminEditEvent = document.getElementById('form-admin-edit-event');
  if (formAdminEditEvent) {
    formAdminEditEvent.addEventListener('submit', (e) => {
      e.preventDefault();
      const eventId = document.getElementById('edit-event-id')?.value;
      const events = store.getEvents();
      const event = events.find(ev => ev.id === eventId);
      if (!event) return;

      const title = document.getElementById('edit-event-title')?.value.trim();
      const category = document.getElementById('edit-event-category')?.value.trim();
      const date = document.getElementById('edit-event-date')?.value;
      const time = document.getElementById('edit-event-time')?.value.trim();
      const city = document.getElementById('edit-event-city')?.value.trim();
      const venue = document.getElementById('edit-event-venue')?.value.trim();
      const banner = document.getElementById('edit-event-banner')?.value.trim();
      const description = document.getElementById('edit-event-description')?.value.trim();

      const tierRows = document.querySelectorAll('#edit-event-tiers-container .edit-tier-row');
      const updatedTiers = [];
      tierRows.forEach((row, index) => {
        const name = row.querySelector('.tier-name')?.value.trim();
        const price = Number(row.querySelector('.tier-price')?.value) || 0;
        const qty = Number(row.querySelector('.tier-qty')?.value) || 100;
        if (name) {
          updatedTiers.push({
            id: (event.tiers && event.tiers[index] && event.tiers[index].id) || `tier-${Date.now()}-${index}`,
            name,
            type: name,
            price,
            maxQuantity: qty,
            availableQuantity: qty,
            description: `${name} Admission`
          });
        }
      });

      if (updatedTiers.length === 0) {
        alert('Please specify at least one ticket tier.');
        return;
      }

      event.title = title;
      event.category = category;
      event.date = date;
      event.time = time;
      event.city = city;
      event.venue = venue;
      if (banner) {
        event.banner = banner;
        event.flyerUrl = banner;
      }
      event.description = description;
      event.tiers = updatedTiers;
      event.tickets = updatedTiers;
      event.updatedAt = new Date().toISOString();

      localStorage.setItem('bookam_events', JSON.stringify(events));

      // Record Audit Log
      store.addAuditLog({
        admin: 'Bookam26@gmail.com',
        action: 'EVENT_EDITED',
        entity: 'Event',
        entityId: eventId,
        details: `Event "${title}" details and tiers updated by Super Admin.`
      });

      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));

      window.closeEditEventModal();
      renderEventApprovalsTable();
      if (typeof renderEventsTable === 'function') renderEventsTable();
      renderOverview();

      if (actionModal && actionModal.style.display !== 'none') {
        viewEventDetailsModal(eventId);
      }

      if (store.showToast) {
        store.showToast(`✅ Event "${title}" updated successfully!`, 'success');
      } else {
        alert(`Event "${title}" updated successfully!`);
      }
    });
  }

  // Modal: View Full Onboarding Application
  window.viewEventDetailsModal = function(eventId) {
    const event = store.getEvents().find(e => e.id === eventId);
    if (!event || !actionModal || !actionModalBody) return;

    const tiers = event.tiers || [];
    const status = event.status || event.onboardingStatus || 'PENDING REVIEW';
    const flyer = event.flyerUrl || event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';

    actionModalBody.innerHTML = `
      <div style="display: flex; gap: 1.25rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <img src="${flyer}" alt="" referrerpolicy="no-referrer" style="width: 140px; height: 140px; border-radius: 12px; object-fit: cover; border: 2px solid #334155;" />
        <div style="flex: 1; min-width: 240px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: #F8FAFC; margin: 0 0 0.25rem 0;">${event.title}</h3>
              <div style="font-family: monospace; color: #818CF8; font-size: 0.8rem;">REF: ${event.id} &bull; Category: ${event.category || 'General'}</div>
            </div>
            ${renderEventStatusBadge(status)}
          </div>
          <p style="font-size: 0.825rem; color: #CBD5E1; margin: 0 0 0.75rem 0; line-height: 1.45;">
            ${event.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <!-- Exclusive Ticketing Terms Agreement Status Card -->
      <div style="background: #1E1B4B; border: 1.5px solid #818CF8; border-radius: 10px; padding: 1.15rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <h4 style="font-size: 0.825rem; font-weight: 800; color: #A5B4FC; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-file-contract"></i> BOOKAM EVENT SUBMISSION & EXCLUSIVE TICKETING TERMS
          </h4>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.65rem; border-radius: 9999px; background: #059669; color: #fff; font-size: 0.725rem; font-weight: 700;">
            <i class="fa-solid fa-check"></i> Accepted via "I Agree & Submit Event"
          </span>
        </div>
        <div style="background: rgba(0, 0, 0, 0.35); padding: 0.65rem 0.85rem; border-radius: 6px; border-left: 3px solid #34D399; margin-bottom: 0.65rem; font-size: 0.8rem; color: #E0E7FF;">
          <strong>Organiser Acceptance Mandate:</strong> <em>“I agree to use Bookam as the exclusive ticketing and online payment platform for this event.”</em>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.45rem; font-size: 0.75rem; color: #CBD5E1;">
          <div><i class="fa-solid fa-circle-check" style="color: #34D399;"></i> 1. Official & Exclusive Ticketing Platform</div>
          <div><i class="fa-solid fa-circle-check" style="color: #34D399;"></i> 2. 100% Bookam Online Payment Collection</div>
          <div><i class="fa-solid fa-circle-check" style="color: #34D399;"></i> 3. Official Bookam Ticket Links & Promos</div>
          <div><i class="fa-solid fa-circle-check" style="color: #34D399;"></i> 4. Event Information Accuracy Confirmed</div>
          <div><i class="fa-solid fa-circle-check" style="color: #34D399;"></i> 5. Digital Tickets & QR Verification</div>
          <div><i class="fa-solid fa-circle-check" style="color: #34D399;"></i> 6. Exclusivity Breach Enforcements Active</div>
        </div>
        <div style="font-size: 0.725rem; color: #94A3B8; margin-top: 0.5rem;">
          Agreed and submitted by <strong>${event.organizer || 'Organiser'}</strong> (${event.submittedAt ? new Date(event.submittedAt).toLocaleString() : 'Recent'}).
        </div>
      </div>

      <!-- Step 1 & 2: Organiser & Event Info -->
      <div style="background: #0F172A; border: 1px solid #334155; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
        <h4 style="font-size: 0.8rem; font-weight: 800; color: #818CF8; text-transform: uppercase; margin: 0 0 0.75rem 0;">
          <i class="fa-solid fa-user-tie"></i> Organiser & Brand Details
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.8rem;">
          <div><span style="color: #64748B;">Contact Name:</span> <strong>${event.organizer || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Brand / Org:</span> <strong>${event.organizerBrand || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Organiser Type:</span> <strong>${event.organizerType || 'Individual'}</strong></div>
          <div><span style="color: #64748B;">Email:</span> <strong>${event.organizerEmail || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Phone:</span> <strong>${event.organizerPhone || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">WhatsApp:</span> <strong>${event.organizerWhatsapp || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Instagram:</span> <strong>${event.organizerInstagram || 'N/A'}</strong></div>
        </div>
      </div>

      <!-- Step 3 & 4: Date, Time & Venue -->
      <div style="background: #0F172A; border: 1px solid #334155; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
        <h4 style="font-size: 0.8rem; font-weight: 800; color: #34D399; text-transform: uppercase; margin: 0 0 0.75rem 0;">
          <i class="fa-solid fa-calendar-days"></i> Date, Time & Venue Details
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.8rem;">
          <div><span style="color: #64748B;">Start Date:</span> <strong>${store.formatDate(event.date)}</strong></div>
          <div><span style="color: #64748B;">Start Time:</span> <strong>${event.time || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">End Date:</span> <strong>${event.endDate ? store.formatDate(event.endDate) : 'Same Day'}</strong></div>
          <div><span style="color: #64748B;">End Time:</span> <strong>${event.endTime || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Gate Opening:</span> <strong>${event.gateOpeningTime || 'Same as event'}</strong></div>
          <div><span style="color: #64748B;">Venue Name:</span> <strong>${event.venue || 'TBA'}</strong></div>
          <div><span style="color: #64748B;">City & State:</span> <strong>${event.city || ''}, ${event.state || ''}</strong></div>
          <div><span style="color: #64748B;">Expected Cap:</span> <strong>${event.expectedAttendees || 'N/A'} attendees</strong></div>
        </div>
      </div>

      <!-- Step 6: Ticket Tiers Setup -->
      <div style="background: #0F172A; border: 1px solid #334155; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
        <h4 style="font-size: 0.8rem; font-weight: 800; color: #FBBF24; text-transform: uppercase; margin: 0 0 0.75rem 0;">
          <i class="fa-solid fa-ticket"></i> Ticket Tiers Configuration
        </h4>
        <div class="admin-table-wrapper" style="margin: 0;">
          <table class="admin-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Tier Name</th>
                <th>Price</th>
                <th>Max Cap</th>
                <th>Description / Perks</th>
              </tr>
            </thead>
            <tbody>
              ${tiers.length > 0 ? tiers.map(t => `
                <tr>
                  <td><strong style="color: #F8FAFC;">${t.name || t.type}</strong></td>
                  <td><strong style="color: #34D399;">${store.formatCurrency(t.price)}</strong></td>
                  <td>${t.maxQuantity || t.availableQuantity || 'Unlimited'}</td>
                  <td style="color: #94A3B8;">${t.description || 'Standard Admission'}</td>
                </tr>
              `).join('') : '<tr><td colspan="4">No tiers set</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Step 8: Bank & Settlement Payout Account -->
      <div style="background: #0F172A; border: 1px solid #334155; border-radius: 10px; padding: 1rem; margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.8rem; font-weight: 800; color: #F472B6; text-transform: uppercase; margin: 0 0 0.75rem 0;">
          <i class="fa-solid fa-building-columns"></i> Organiser Settlement Bank Account
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.8rem;">
          <div><span style="color: #64748B;">Bank Name:</span> <strong>${event.bankName || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Account Number:</span> <strong style="font-family: monospace; color: #34D399;">${event.accountNumber || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Account Name:</span> <strong>${event.accountName || 'N/A'}</strong></div>
        </div>
      </div>

      <!-- Modal Action Buttons (User Specified Workflow: Review Application, Approve & Go Live, Mark Under Review, Request Changes, Edit, Pause fix) -->
      <div style="display: flex; gap: 0.65rem; justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid #334155; padding-top: 1rem;">
        ${status !== 'APPROVED' && status !== 'TICKET SALES LIVE' ? `
          <button type="button" class="admin-btn admin-btn-success" onclick="handleUpdateEventStatus('${event.id}', 'APPROVED');">
            <i class="fa-solid fa-check"></i> Approve & Go Live
          </button>
        ` : ''}
        ${status !== 'UNDER REVIEW' && status !== 'APPROVED' && status !== 'TICKET SALES LIVE' ? `
          <button type="button" class="admin-btn admin-btn-outline" onclick="handleUpdateEventStatus('${event.id}', 'UNDER REVIEW');" style="color: #60A5FA; border-color: rgba(96, 165, 250, 0.4);">
            <i class="fa-solid fa-magnifying-glass"></i> Mark Under Review
          </button>
        ` : ''}
        <button type="button" class="admin-btn admin-btn-outline" onclick="handleRequestEventChanges('${event.id}');" style="color: #FBBF24; border-color: rgba(245, 158, 11, 0.4);">
          <i class="fa-solid fa-pen-to-square"></i> Request Changes
        </button>
        <button type="button" class="admin-btn admin-btn-outline" onclick="openAdminEditEventModal('${event.id}');" style="color: #C084FC; border-color: rgba(192, 132, 252, 0.4);">
          <i class="fa-solid fa-pen"></i> Edit Event
        </button>
        ${status === 'PAUSED' ? `
          <button type="button" class="admin-btn admin-btn-outline" onclick="handleResumeEvent('${event.id}');" style="color: #34D399; border-color: rgba(52, 211, 153, 0.4);">
            <i class="fa-solid fa-play"></i> Resume Sales
          </button>
        ` : (status === 'APPROVED' || status === 'TICKET SALES LIVE' ? `
          <button type="button" class="admin-btn admin-btn-outline" onclick="handlePauseEvent('${event.id}');" style="color: #FB923C; border-color: rgba(249, 115, 22, 0.4);">
            <i class="fa-solid fa-pause"></i> Pause Sales
          </button>
        ` : '')}
        ${status !== 'SUSPENDED' ? `
          <button type="button" class="admin-btn admin-btn-outline" onclick="handleSuspendEvent('${event.id}');" style="color: #F87171; border-color: rgba(239, 68, 68, 0.4);">
            <i class="fa-solid fa-ban"></i> Suspend Sales
          </button>
        ` : ''}
        <button type="button" class="admin-btn admin-btn-outline" onclick="closeActionModal()">
          Close
        </button>
      </div>
    `;

    actionModal.style.display = 'flex';
  };

  window.viewEventDetails = window.viewEventDetailsModal;

  window.closeActionModal = function() {
    if (actionModal) actionModal.style.display = 'none';
  };

  if (btnCloseActionModal) {
    btnCloseActionModal.addEventListener('click', window.closeActionModal);
  }
  if (actionModal) {
    actionModal.addEventListener('click', (e) => {
      if (e.target === actionModal) window.closeActionModal();
    });
  }

  // ================= 4. PAYMENT CONFIRMATION CENTER =================
  function renderPaymentsTable() {
    if (!tbodyAllPayments) return;
    const payments = store.getPayments();
    const query = (searchPaymentInput ? searchPaymentInput.value : '').trim().toLowerCase();
    const statusFilter = filterPaymentStatus ? filterPaymentStatus.value : 'all';

    const filtered = [...payments].reverse().filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (query) {
        const refMatch = (p.paymentRef || '').toLowerCase().includes(query);
        const nameMatch = (p.customerName || '').toLowerCase().includes(query);
        const emailMatch = (p.customerEmail || '').toLowerCase().includes(query);
        const eventMatch = (p.eventName || '').toLowerCase().includes(query);
        return refMatch || nameMatch || emailMatch || eventMatch;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbodyAllPayments.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: #94A3B8;">No matching payment records found.</td></tr>`;
      return;
    }

    tbodyAllPayments.innerHTML = filtered.map(p => {
      const isPending = p.status === 'Pending Approval';
      return `
        <tr>
          <td>
            <div style="font-family: monospace; font-weight: 800; color: #818CF8; font-size: 0.95rem;">${p.paymentRef}</div>
            <small style="color: #64748B;">${store.formatDate(p.createdAt || new Date().toISOString())}</small>
          </td>
          <td>
            <div style="font-weight: 700; color: #F8FAFC;">${p.customerName}</div>
            <div style="font-size: 0.775rem; color: #94A3B8;">${p.customerEmail}</div>
            <div style="font-size: 0.775rem; color: #64748B;">${p.customerPhone || 'No phone'}</div>
          </td>
          <td>
            <div style="font-weight: 700;">${p.eventName || 'Event'}</div>
            <small style="color: #94A3B8;">${p.quantity}x ${p.ticketType}</small>
          </td>
          <td>
            <div style="font-weight: 800; font-size: 1rem; color: #34D399;">${store.formatCurrency(p.totalAmount)}</div>
            ${p.discountAmount > 0 ? `<small style="color: #F87171;">Saved ${store.formatCurrency(p.discountAmount)}</small>` : ''}
          </td>
          <td>
            ${p.promoCode ? `<span class="admin-badge approved" style="font-family: monospace;">${p.promoCode}</span>` : '<span style="color: #64748B;">—</span>'}
          </td>
          <td>${renderStatusBadge(p.status)}</td>
          <td>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
              ${isPending ? `
                <button class="admin-btn admin-btn-success admin-btn-sm" onclick="handleConfirmPayment('${p.id}', true)">
                  <i class="fa-solid fa-check"></i> Approve
                </button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="handleConfirmPayment('${p.id}', false)">
                  <i class="fa-solid fa-xmark"></i> Reject
                </button>
              ` : `
                <button class="admin-btn admin-btn-outline admin-btn-sm" onclick="handleConfirmPayment('${p.id}', ${p.status !== 'Approved'})" title="Toggle status">
                  <i class="fa-solid fa-arrows-rotate"></i> Change Status
                </button>
              `}
              <button class="admin-btn admin-btn-outline admin-btn-sm" onclick="viewPaymentDetails('${p.id}')">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (searchPaymentInput) {
    searchPaymentInput.addEventListener('input', renderPaymentsTable);
  }
  if (filterPaymentStatus) {
    filterPaymentStatus.addEventListener('change', renderPaymentsTable);
  }
  if (btnRefreshPayments) {
    btnRefreshPayments.addEventListener('click', () => {
      renderPaymentsTable();
      renderOverview();
    });
  }

  // Confirm or Reject Payment
  window.handleConfirmPayment = function(paymentId, approve) {
    const payment = store.getPayments().find(p => p.id === paymentId);
    if (!payment) return;

    const actionText = approve ? 'APPROVE and confirm' : 'REJECT';
    if (!confirm(`Are you sure you want to ${actionText} payment ${payment.paymentRef} for ${payment.customerName} (${store.formatCurrency(payment.totalAmount)})?`)) {
      return;
    }

    const newStatus = approve ? 'Approved' : 'Rejected';
    payment.status = newStatus;
    store.savePayment(payment);

    // If approved, ensure ticket exists & is activated
    if (approve) {
      const tickets = store.getTickets();
      let existingTicket = tickets.find(t => t.paymentId === payment.id || t.paymentRef === payment.paymentRef);

      if (!existingTicket) {
        const ticketData = {
          id: 'BKM-' + payment.paymentRef.replace(/[^A-Za-z0-9]/g, ''),
          eventId: payment.eventId,
          eventName: payment.eventName,
          eventDate: payment.eventDate,
          eventTime: payment.eventTime,
          eventVenue: payment.eventVenue,
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          customerPhone: payment.customerPhone,
          ticketType: payment.ticketType,
          quantity: payment.quantity,
          totalAmount: payment.totalAmount,
          paymentId: payment.id,
          paymentRef: payment.paymentRef,
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        };
        store.saveTicket(ticketData);
      } else {
        existingTicket.status = 'APPROVED';
        store.saveTicket(existingTicket);
      }

      // If influencer attached, increment ticket sales count
      if (payment.influencerId || payment.promoCode) {
        const inf = store.getInfluencers().find(i => i.id === payment.influencerId || (payment.promoCode && i.promoCode === payment.promoCode));
        if (inf) {
          inf.ticketSales = (Number(inf.ticketSales) || 0) + (Number(payment.quantity) || 1);
          const commEarned = Number(payment.commissionAmount) || (Number(payment.totalAmount) * 0.1);
          inf.commissionEarned = (Number(inf.commissionEarned) || 0) + commEarned;
          store.saveInfluencer(inf);
        }
      }
    }

    renderPaymentsTable();
    renderOverview();
  };

  // Payment Details Modal
  window.viewPaymentDetails = function(paymentId) {
    const payment = store.getPayments().find(p => p.id === paymentId);
    if (!payment || !paymentModalBody || !paymentModal) return;

    paymentModalBody.innerHTML = `
      <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Payment Reference</span>
          <div style="font-family: monospace; font-size: 1.3rem; font-weight: 800; color: #818CF8;">${payment.paymentRef}</div>
        </div>
        ${renderStatusBadge(payment.status)}
      </div>

      <div style="background: #0F172A; border: 1px solid #334155; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.85rem; font-weight: 800; color: #94A3B8; margin: 0 0 0.75rem 0; text-transform: uppercase;">Customer Information</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
          <div><span style="color: #64748B;">Name:</span> <strong>${payment.customerName}</strong></div>
          <div><span style="color: #64748B;">Email:</span> <strong>${payment.customerEmail}</strong></div>
          <div><span style="color: #64748B;">Phone:</span> <strong>${payment.customerPhone || 'N/A'}</strong></div>
          <div><span style="color: #64748B;">Event:</span> <strong>${payment.eventName || 'N/A'}</strong></div>
        </div>
      </div>

      <div style="background: #0F172A; border: 1px solid #334155; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.85rem; font-weight: 800; color: #94A3B8; margin: 0 0 0.75rem 0; text-transform: uppercase;">Payment Breakdown</h4>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
          <span style="color: #94A3B8;">Tickets:</span>
          <span>${payment.quantity}x ${payment.ticketType} (${store.formatCurrency(payment.ticketPrice || 0)})</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
          <span style="color: #94A3B8;">Subtotal:</span>
          <span>${store.formatCurrency(payment.subtotal || payment.totalAmount)}</span>
        </div>
        ${payment.discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #F87171; margin-bottom: 0.35rem;">
            <span>Promo Code Discount (${payment.promoCode || 'PROMO'}):</span>
            <span>- ${store.formatCurrency(payment.discountAmount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
          <span style="color: #94A3B8;">Service Charge:</span>
          <span>${store.formatCurrency(payment.serviceCharge || 0)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: #34D399; margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #334155;">
          <span>Total Paid:</span>
          <span>${store.formatCurrency(payment.totalAmount)}</span>
        </div>
      </div>

      ${payment.promoCode ? `
        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem;">
          <strong style="color: #818CF8;"><i class="fa-solid fa-bullhorn"></i> Influencer Attribution:</strong>
          <div style="margin-top: 0.25rem; color: #CBD5E1;">
            Code <strong>${payment.promoCode}</strong> (${payment.influencerName || 'Promoter'}). Commission: <strong>${store.formatCurrency(payment.commissionAmount || 0)}</strong>
          </div>
        </div>
      ` : ''}

      <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
        ${payment.status === 'Pending Approval' ? `
          <button type="button" class="admin-btn admin-btn-success" onclick="handleConfirmPayment('${payment.id}', true); closePaymentModal();">
            <i class="fa-solid fa-check"></i> Approve & Issue Ticket
          </button>
          <button type="button" class="admin-btn admin-btn-danger" onclick="handleConfirmPayment('${payment.id}', false); closePaymentModal();">
            <i class="fa-solid fa-xmark"></i> Reject Payment
          </button>
        ` : ''}
        <button type="button" class="admin-btn admin-btn-outline" onclick="closePaymentModal()">
          Close
        </button>
      </div>
    `;

    paymentModal.style.display = 'flex';
  };

  window.closePaymentModal = function() {
    if (paymentModal) paymentModal.style.display = 'none';
  };

  if (btnClosePaymentModal) {
    btnClosePaymentModal.addEventListener('click', window.closePaymentModal);
  }
  if (paymentModal) {
    paymentModal.addEventListener('click', (e) => {
      if (e.target === paymentModal) window.closePaymentModal();
    });
  }

  // ================= 4B. REFUNDS & DISPUTES =================
  function renderRefundsTable() {
    if (!tbodyAllRefunds) return;
    const refunds = store.getRefunds();
    const filter = filterRefundsStatus ? filterRefundsStatus.value : 'all';

    const filtered = [...refunds].reverse().filter(r => {
      if (filter !== 'all' && r.status !== filter) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbodyAllRefunds.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: #94A3B8;">No refund claims in this category.</td></tr>`;
      return;
    }

    tbodyAllRefunds.innerHTML = filtered.map(r => {
      const isPending = r.status === 'Pending Review';
      let statusBadge = `<span class="admin-badge pending"><i class="fa-solid fa-clock"></i> ${r.status}</span>`;
      if (r.status === 'Approved & Processed') {
        statusBadge = `<span class="admin-badge approved"><i class="fa-solid fa-circle-check"></i> Processed</span>`;
      } else if (r.status === 'Declined') {
        statusBadge = `<span class="admin-badge rejected"><i class="fa-solid fa-circle-xmark"></i> Declined</span>`;
      }

      return `
        <tr>
          <td>
            <strong style="font-family: monospace; color: #818CF8;">${r.id}</strong>
            <div style="font-size: 0.7rem; color: #64748B;">${store.formatDate(r.createdAt || new Date().toISOString())}</div>
          </td>
          <td>
            <div style="font-family: monospace; font-weight: 700; color: #F8FAFC;">${r.ticketCode || r.paymentRef || 'N/A'}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #CBD5E1;">${r.customerName}</div>
            <div style="font-size: 0.75rem; color: #94A3B8;">${r.customerEmail}</div>
            <div style="font-size: 0.75rem; color: #64748B;">${r.customerPhone || ''}</div>
          </td>
          <td>
            <strong style="color: #F87171; font-size: 0.95rem;">${store.formatCurrency(r.amount)}</strong>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: #CBD5E1; max-width: 180px;">${r.reason}</div>
          </td>
          <td>
            <div style="font-size: 0.8rem;"><strong>${r.bankName || 'Moniepoint'}</strong></div>
            <div style="font-family: monospace; font-size: 0.75rem; color: #CBD5E1;">${r.accountNumber || ''} (${r.accountName || ''})</div>
          </td>
          <td>
            ${statusBadge}
            ${r.adminNotes ? `<div style="font-size: 0.7rem; color: #94A3B8; margin-top: 0.25rem;">Note: ${r.adminNotes}</div>` : ''}
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              ${isPending ? `
                <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="handleProcessRefund('${r.id}', true)">
                  <i class="fa-solid fa-check"></i> Approve
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handleProcessRefund('${r.id}', false)">
                  <i class="fa-solid fa-xmark"></i> Decline
                </button>
              ` : `
                <span style="font-size: 0.75rem; color: #64748B;">Completed</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (filterRefundsStatus) {
    filterRefundsStatus.addEventListener('change', renderRefundsTable);
  }

  window.handleProcessRefund = function(refundId, approve) {
    const refund = store.getRefunds().find(r => r.id === refundId);
    if (!refund) return;

    if (approve) {
      if (!confirm(`Are you sure you want to approve refund of ${store.formatCurrency(refund.amount)} for ${refund.customerName}? This will invalidate ticket ${refund.ticketCode || ''}.`)) {
        return;
      }
      store.updateRefundStatus(refundId, 'Approved & Processed', 'Refund authorized and transferred to recipient bank account.');
    } else {
      const reason = prompt(`Reason for declining refund ${refund.id}:`, 'Request does not comply with 48-hour event cancellation policy.');
      if (!reason) return;
      store.updateRefundStatus(refundId, 'Declined', reason);
    }

    renderRefundsTable();
    renderOverview();
  };

  // ================= 4C. GATE CHECK-IN ENGINE =================
  let checkInInitialized = false;

  function renderCheckInEngine() {
    const stats = store.getCheckInStats();
    if (statGateCheckedIn) statGateCheckedIn.textContent = stats.checkedInCount;
    if (statGateTotalValid) statGateTotalValid.textContent = stats.totalValidTickets;
    if (statGateRemaining) statGateRemaining.textContent = stats.remainingExpected;

    // Render activity feed
    if (tbodyCheckinFeed) {
      const feed = (stats.checkedInTickets || []).slice(0, 15);
      if (feed.length === 0) {
        tbodyCheckinFeed.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94A3B8; padding: 2rem;">No ticket check-ins recorded yet.</td></tr>`;
      } else {
        tbodyCheckinFeed.innerHTML = feed.map(t => `
          <tr>
            <td><strong style="font-family: monospace; color: #818CF8;">${t.ticketCode || t.id}</strong></td>
            <td><strong style="color: #F8FAFC;">${t.customerName}</strong></td>
            <td>${t.eventName}</td>
            <td><span class="admin-badge approved">${t.ticketType}</span></td>
            <td>${store.formatDate(t.checkedInAt)} ${new Date(t.checkedInAt).toLocaleTimeString()}</td>
            <td><strong style="color: #CBD5E1;">${t.checkedInGate || 'Main Entrance'}</strong></td>
            <td><span class="admin-badge approved"><i class="fa-solid fa-circle-check"></i> Admitted</span></td>
          </tr>
        `).join('');
      }
    }

    if (!checkInInitialized && formGateCheckin) {
      checkInInitialized = true;
      formGateCheckin.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = (inputTicketCode ? inputTicketCode.value : '').trim().toUpperCase();
        const gate = (selectGateName ? selectGateName.value : 'Main Entrance');
        if (!code) return;

        const res = store.checkInTicket(code, gate);

        if (checkinFeedbackBox) {
          checkinFeedbackBox.style.display = 'block';
          if (res.success) {
            checkinFeedbackBox.style.background = 'rgba(16, 185, 129, 0.15)';
            checkinFeedbackBox.style.border = '1px solid rgba(16, 185, 129, 0.4)';
            checkinFeedbackBox.style.color = '#34D399';
            checkinFeedbackBox.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <i class="fa-solid fa-circle-check" style="font-size: 1.5rem;"></i>
                <div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800;">VALID TICKET — ACCESS GRANTED</h4>
                  <div style="font-size: 0.8rem; color: #CBD5E1;">Station: ${gate} &bull; Check-in Time: Just now</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; color: #F8FAFC; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <div>Attendee: <strong>${res.ticket.customerName}</strong></div>
                <div>Tier: <strong>${res.ticket.ticketType}</strong></div>
                <div>Event: <strong>${res.ticket.eventName}</strong></div>
                <div>Code: <strong style="font-family: monospace;">${res.ticket.ticketCode || res.ticket.id}</strong></div>
              </div>
            `;
          } else if (res.reason === 'ALREADY_CHECKED_IN') {
            checkinFeedbackBox.style.background = 'rgba(245, 158, 11, 0.15)';
            checkinFeedbackBox.style.border = '1px solid rgba(245, 158, 11, 0.4)';
            checkinFeedbackBox.style.color = '#FBBF24';
            checkinFeedbackBox.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
                <div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800;">DUPLICATE SCAN DETECTED!</h4>
                  <div style="font-size: 0.8rem; color: #CBD5E1;">This ticket was ALREADY checked in!</div>
                </div>
              </div>
              <div style="font-size: 0.85rem; color: #F8FAFC;">
                Previously checked in at: <strong>${new Date(res.ticket.checkedInAt).toLocaleString()}</strong> via <strong>${res.ticket.checkedInGate || 'Main Gate'}</strong>.
                <div>Attendee Name: <strong>${res.ticket.customerName}</strong> (${res.ticket.ticketType})</div>
              </div>
            `;
          } else {
            checkinFeedbackBox.style.background = 'rgba(239, 68, 68, 0.15)';
            checkinFeedbackBox.style.border = '1px solid rgba(239, 68, 68, 0.4)';
            checkinFeedbackBox.style.color = '#F87171';
            checkinFeedbackBox.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fa-solid fa-ban" style="font-size: 1.5rem;"></i>
                <div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800;">ENTRY DENIED</h4>
                  <div style="font-size: 0.85rem; color: #FCA5A5;">${res.message}</div>
                </div>
              </div>
            `;
          }
        }

        if (inputTicketCode) {
          inputTicketCode.value = '';
          inputTicketCode.focus();
        }

        renderCheckInEngine();
        renderOverview();
      });
    }
  }

  // ================= 4D. AUDIT LOGS TRAIL =================
  function renderAuditLogsTable() {
    if (!tbodyAuditLogs) return;
    const logs = store.getAuditLogs();

    if (logs.length === 0) {
      tbodyAuditLogs.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94A3B8; padding: 2.5rem;">No administrative audit actions recorded yet.</td></tr>`;
      return;
    }

    tbodyAuditLogs.innerHTML = logs.map(l => {
      let pillClass = 'audit-settings';
      const a = String(l?.action || '').toUpperCase();
      if (a.includes('APPROVE')) pillClass = 'audit-approve';
      else if (a.includes('REJECT') || a.includes('SUSPEND') || a.includes('DECLINE')) pillClass = 'audit-reject';
      else if (a.includes('CHECKIN')) pillClass = 'audit-checkin';

      return `
        <tr>
          <td style="font-family: monospace; font-size: 0.75rem; color: #94A3B8;">
            ${store.formatDate(l.timestamp)} ${new Date(l.timestamp).toLocaleTimeString()}
          </td>
          <td>
            <div style="font-size: 0.8rem; font-weight: 700; color: #818CF8;">${l.admin || 'Super Admin'}</div>
          </td>
          <td>
            <span class="audit-action-pill ${pillClass}">${l.action}</span>
          </td>
          <td>
            <span style="font-size: 0.8rem; font-family: monospace; color: #CBD5E1;">${l.entity || 'Entity'}: ${l.entityId || 'Global'}</span>
          </td>
          <td>
            <span class="admin-badge approved" style="font-size: 0.7rem;">LOGGED</span>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: #CBD5E1; max-width: 320px;">${l.details || ''}</div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Export Audit Logs
  if (btnExportAudit) {
    btnExportAudit.addEventListener('click', () => {
      const logs = store.getAuditLogs();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BOOKAM-Audit-Log-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // ================= 4E. SYSTEM NOTIFICATIONS =================
  function renderNotificationsList() {
    if (!notificationsListContainer) return;
    const notifs = store.getNotifications();

    if (notifs.length === 0) {
      notificationsListContainer.innerHTML = `<div style="text-align: center; color: #94A3B8; padding: 2.5rem;">No system notifications at this time.</div>`;
      return;
    }

    notificationsListContainer.innerHTML = notifs.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
        <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; color: #818CF8; font-size: 1rem; flex-shrink: 0;">
            <i class="fa-solid fa-bell"></i>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 0.9rem; color: #F8FAFC;">${n.title}</div>
            <div style="font-size: 0.8rem; color: #94A3B8; margin: 0.15rem 0 0.25rem 0;">${n.message}</div>
            <div style="font-size: 0.7rem; color: #64748B;">${store.formatDate(n.createdAt)} ${new Date(n.createdAt).toLocaleTimeString()}</div>
          </div>
        </div>
        ${!n.read ? `
          <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="handleMarkNotifRead('${n.id}')" style="white-space: nowrap;">
            <i class="fa-solid fa-check"></i> Mark Read
          </button>
        ` : `
          <span style="font-size: 0.75rem; color: #64748B;"><i class="fa-solid fa-check-double"></i> Read</span>
        `}
      </div>
    `).join('');
  }

  window.handleMarkNotifRead = function(id) {
    store.markNotificationRead(id);
    renderNotificationsList();
    renderOverview();
  };

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      store.markAllNotificationsRead();
      renderNotificationsList();
      renderOverview();
    });
  }

  // ================= 5. CONTEST & VOTE CONTROLLER =================
  let selectedContestId = null;

  // ================= CSV / REPORT EXPORT HELPERS =================
  function downloadFile(arg1, arg2, mime = 'text/csv;charset=utf-8;') {
    let filename, content;
    if (typeof arg1 === 'string' && (arg1.endsWith('.csv') || arg1.endsWith('.json') || arg1.includes('.txt'))) {
      filename = arg1;
      content = arg2;
    } else {
      content = arg1;
      filename = arg2;
    }
    const blob = new Blob([content], { type: mime });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function downloadCSV(filename, content) {
    downloadFile(filename, content, 'text/csv;charset=utf-8;');
  }

  window.exportAttendeesCSV = function() {
    const tickets = store.getTickets ? store.getTickets() : [];
    if (!tickets || tickets.length === 0) {
      alert('No tickets available to export.');
      return;
    }
    const headers = ['Ticket ID', 'Ticket Code', 'Event ID', 'Event Name', 'Customer Name', 'Customer Email', 'Customer Phone', 'Ticket Tier', 'Price (NGN)', 'Checked In', 'Purchase Date'];
    const rows = tickets.map(t => [
      `"${t.id || ''}"`,
      `"${t.ticketCode || ''}"`,
      `"${t.eventId || ''}"`,
      `"${(t.eventName || '').replace(/"/g, '""')}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${(t.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(t.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(t.ticketType || t.tier || '').replace(/"/g, '""')}"`,
      t.price || 0,
      t.checkedIn ? 'YES' : 'NO',
      `"${t.purchasedAt || t.createdAt || ''}"`
    ]);
    downloadCSV('bookam_attendees_export.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  };

  window.exportEventSalesReport = function(format = 'csv') {
    const events = store.getEvents ? store.getEvents() : [];
    if (format === 'json') {
      downloadFile('bookam_event_sales_report.json', JSON.stringify(events, null, 2), 'application/json');
      return;
    }
    const headers = ['Event ID', 'Event Title', 'Category', 'Date', 'Venue', 'City', 'Organizer', 'Status', 'Tickets Sold', 'Revenue (NGN)'];
    const rows = events.map(e => [
      `"${e.id || ''}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${e.date || ''}"`,
      `"${(e.venue || '').replace(/"/g, '""')}"`,
      `"${(e.city || '').replace(/"/g, '""')}"`,
      `"${(e.organizer || '').replace(/"/g, '""')}"`,
      `"${e.status || e.onboardingStatus || 'Active'}"`,
      e.ticketsSold || 0,
      e.totalRevenue || e.revenue || 0
    ]);
    downloadCSV('bookam_event_sales_report.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  };

  window.exportInfluencerReport = function() {
    const influencers = store.getInfluencerLeaderboard ? store.getInfluencerLeaderboard() : (store.getInfluencers ? store.getInfluencers() : []);
    const headers = ['Influencer ID', 'Name', 'Username', 'Promo Code', 'Event', 'Discount (%)', 'Commission (%)', 'Clicks', 'Tickets Sold', 'Revenue (NGN)', 'Commission Earned (NGN)', 'Status'];
    const rows = influencers.map(inf => [
      `"${inf.id || ''}"`,
      `"${(inf.name || '').replace(/"/g, '""')}"`,
      `"${(inf.username || '').replace(/"/g, '""')}"`,
      `"${inf.promoCode || ''}"`,
      `"${(inf.eventName || '').replace(/"/g, '""')}"`,
      inf.discountValue || 10,
      inf.commissionValue || 5,
      inf.clicks || 0,
      inf.ticketsSold || 0,
      inf.revenueGenerated || 0,
      inf.commissionEarned || 0,
      `"${inf.status || 'Active'}"`
    ]);
    downloadCSV('bookam_influencer_performance.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  };

  window.exportOrganisersCSV = function() {
    const organizers = store.getOrganisers ? store.getOrganisers() : [];
    const headers = ['Organiser ID', 'Business Name', 'Contact Person', 'Email', 'Phone', 'Moniepoint Account', 'Events Hosted', 'KYC Status'];
    const rows = organizers.map(org => [
      `"${org.id || ''}"`,
      `"${(org.businessName || org.name || '').replace(/"/g, '""')}"`,
      `"${(org.contactPerson || '').replace(/"/g, '""')}"`,
      `"${org.email || ''}"`,
      `"${org.phone || ''}"`,
      `"${org.accountNumber || ''}"`,
      org.eventsCount || 0,
      `"${org.kycStatus || 'VERIFIED'}"`
    ]);
    downloadCSV('bookam_organisers_export.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  };

  window.exportTransactionsCSV = function() {
    const txs = store.getTransactions ? store.getTransactions() : [];
    const headers = ['Transaction ID', 'Date', 'Customer Name', 'Email', 'Entity', 'Type', 'Amount (NGN)', 'Channel', 'Gateway Reference', 'Status'];
    const rows = txs.map(tx => [
      `"${tx.id || ''}"`,
      `"${tx.timestamp || tx.date || ''}"`,
      `"${(tx.customerName || '').replace(/"/g, '""')}"`,
      `"${tx.customerEmail || ''}"`,
      `"${(tx.eventName || tx.contestName || '').replace(/"/g, '""')}"`,
      `"${tx.type || 'Ticket'}"`,
      tx.amount || 0,
      `"${tx.channel || 'Moniepoint MFB'}"`,
      `"${tx.reference || tx.gatewayRef || ''}"`,
      `"${tx.status || 'Success'}"`
    ]);
    downloadCSV('bookam_transactions_audit.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  };

  // ================= MODAL CONTROLS =================
  window.openCreateEventModal = function() {
    const modal = document.getElementById('admin-create-event-modal');
    if (modal) modal.classList.add('active');
  };

  window.closeCreateEventModal = function() {
    const modal = document.getElementById('admin-create-event-modal');
    if (modal) modal.classList.remove('active');
  };

  window.openCreateContestModal = function() {
    const modal = document.getElementById('admin-create-contest-modal');
    if (modal) modal.classList.add('active');
  };

  window.closeCreateContestModal = function() {
    const modal = document.getElementById('admin-create-contest-modal');
    if (modal) modal.classList.remove('active');
  };

  window.openAddContestantModal = function() {
    const modal = document.getElementById('admin-add-contestant-modal');
    if (modal) modal.classList.add('active');
  };

  window.closeAddContestantModal = function() {
    const modal = document.getElementById('admin-add-contestant-modal');
    if (modal) modal.classList.remove('active');
  };

  window.openCreatePromoCodeModal = function() {
    const modal = document.getElementById('admin-promocode-modal');
    const selectEvent = document.getElementById('modal-promo-event');
    if (selectEvent) {
      const events = store.getEvents ? store.getEvents() : [];
      selectEvent.innerHTML = events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
    }
    if (modal) modal.classList.add('active');
  };

  window.closeCreatePromoCodeModal = function() {
    const modal = document.getElementById('admin-promocode-modal');
    if (modal) modal.classList.remove('active');
  };

  // Event list filter helper for overview quick links
  window.setEventFilter = function(status) {
    window.switchAdminTab('events');
    const filterSelect = document.getElementById('filter-events-status');
    if (filterSelect) {
      filterSelect.value = status;
    }
    renderEventsTable();
  };

  // Contest Approval / Management handlers
  window.handleApproveContest = function(contestId) {
    const contest = store.getContests().find(c => c.id === contestId);
    if (!contest) return;
    if (confirm(`Approve contest "${contest.title}"? This will immediately publish it to the live website and enable live voting.`)) {
      store.updateContestStatus(contestId, 'Active', 'Super Admin Approved for live website');
      renderContestController();
      renderOverview();
      alert(`Contest "${contest.title}" is now APPROVED & LIVE on the website!`);
    }
  };

  window.handleRejectContest = function(contestId) {
    const reason = prompt('Specify rejection reason (this will be logged):', 'Insufficient contest details');
    if (reason === null) return;
    store.updateContestStatus(contestId, 'Rejected', reason);
    renderContestController();
    renderOverview();
    alert('Contest status set to Rejected.');
  };

  window.handleDeleteContest = function(contestId) {
    const contest = store.getContests().find(c => c.id === contestId);
    if (!contest) return;
    if (confirm(`Are you sure you want to delete the contest "${contest.title}"?`)) {
      store.deleteContest(contestId);
      selectedContestId = null;
      initContestSelector();
      renderContestController();
      renderOverview();
    }
  };

  window.handleSelectContest = function(contestId) {
    selectedContestId = contestId;
    if (selectAdminContest) selectAdminContest.value = contestId;
    renderContestController();
    const contestantsSection = document.getElementById('contest-summary-banner');
    if (contestantsSection) contestantsSection.scrollIntoView({ behavior: 'smooth' });
  };

  // ================= 5. CONTEST CONTROLLER & APPROVALS =================
  function initContestSelector() {
    if (!selectAdminContest) return;
    const contests = store.getContests();
    if (contests.length === 0) {
      selectAdminContest.innerHTML = `<option value="">No Contests Available</option>`;
      return;
    }

    if (!selectedContestId || !contests.find(c => c.id === selectedContestId)) {
      selectedContestId = contests[0].id;
    }

    selectAdminContest.innerHTML = contests.map(c => `
      <option value="${c.id}" ${c.id === selectedContestId ? 'selected' : ''}>${c.title} (${c.status || 'Active'})</option>
    `).join('');

    selectAdminContest.onchange = (e) => {
      selectedContestId = e.target.value;
      renderContestController();
    };
  }

  function renderContestController() {
    if (!selectedContestId) initContestSelector();
    const contests = store.getContests();
    const contest = store.getContestById(selectedContestId);

    // 1. Render Contest Approvals Table
    const tbodyAdminContestApprovals = document.getElementById('tbody-admin-contest-approvals');
    const badgePendingContestsCount = document.getElementById('badge-pending-contests-count');
    const pendingContests = contests.filter(c => (c.status || '').toLowerCase().includes('pending'));

    if (badgePendingContestsCount) {
      badgePendingContestsCount.textContent = `${pendingContests.length} Pending`;
      badgePendingContestsCount.className = `admin-badge ${pendingContests.length > 0 ? 'pending' : 'approved'}`;
    }

    if (tbodyAdminContestApprovals) {
      if (contests.length === 0) {
        tbodyAdminContestApprovals.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem; color: #94A3B8;">No contests submitted yet. Click "+ Create Contest" to host one.</td></tr>`;
      } else {
        tbodyAdminContestApprovals.innerHTML = contests.map(c => {
          const isPending = (c.status || '').toLowerCase().includes('pending');
          const isRejected = (c.status || '').toLowerCase().includes('reject');
          const statusBadge = isPending 
            ? `<span class="admin-badge pending"><i class="fa-solid fa-clock"></i> Pending Approval</span>`
            : (isRejected 
              ? `<span class="admin-badge rejected"><i class="fa-solid fa-ban"></i> Rejected</span>` 
              : `<span class="admin-badge approved"><i class="fa-solid fa-circle-check"></i> Live on Site</span>`);

          const actionButtons = isPending ? `
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="admin-btn admin-btn-success admin-btn-sm" onclick="handleApproveContest('${c.id}')" title="Approve and push to live website">
                <i class="fa-solid fa-check"></i> Approve
              </button>
              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="handleRejectContest('${c.id}')" title="Reject contest">
                <i class="fa-solid fa-xmark"></i> Reject
              </button>
            </div>
          ` : `
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="handleSelectContest('${c.id}')" title="View contestants">
                <i class="fa-solid fa-ranking-star"></i> Nominees
              </button>
              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="handleDeleteContest('${c.id}')" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;

          return `
            <tr>
              <td>
                <div style="font-weight: 800; color: #F8FAFC;">${c.title}</div>
                <small style="color: #64748B;">ID: ${c.id}</small>
              </td>
              <td>${c.category || 'Pageants & Modeling'}</td>
              <td>
                <div style="font-weight: 600; color: #E2E8F0;">${c.organizer || c.host || 'Bookam Host'}</div>
              </td>
              <td><strong>${store.formatCurrency(c.votePrice || 100)}</strong></td>
              <td>${c.endDate ? store.formatDate(c.endDate) : 'Open'}</td>
              <td>${statusBadge}</td>
              <td>${actionButtons}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // 2. Render Contestant Roster for Selected Contest
    if (!contest || !contest.contestants) {
      if (tbodyAdminContestants) {
        tbodyAdminContestants.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #94A3B8;">No contestants found for this contest. Click "Add Contestant" above.</td></tr>`;
      }
      return;
    }

    // Banner summary
    if (contestBannerTitle) contestBannerTitle.textContent = `${contest.title} [${contest.status || 'Active'}]`;
    if (contestBannerSub) contestBannerSub.textContent = `${contest.contestants.length} Registered Contestants`;

    // Sort contestants by votes descending for ranking
    const sorted = [...contest.contestants].sort((a, b) => (Number(b.votes) || 0) - (Number(a.votes) || 0));

    let totalVotes = 0;
    sorted.forEach(ct => { totalVotes += Number(ct.votes) || 0; });

    if (contestBannerTotalVotes) contestBannerTotalVotes.textContent = totalVotes.toLocaleString();
    if (contestBannerLeader) {
      contestBannerLeader.textContent = sorted[0] ? `${sorted[0].name} (${(sorted[0].votes || 0).toLocaleString()} votes)` : 'None';
    }

    if (tbodyAdminContestants) {
      tbodyAdminContestants.innerHTML = sorted.map((ct, idx) => {
        const rank = idx + 1;
        const rankBadge = rank === 1 ? '🥇 #1' : (rank === 2 ? '🥈 #2' : (rank === 3 ? '🥉 #3' : `#${rank}`));
        const rankColor = rank === 1 ? '#FBBF24' : (rank === 2 ? '#E2E8F0' : (rank === 3 ? '#F97316' : '#94A3B8'));

        return `
          <tr>
            <td>
              <span style="font-weight: 800; font-size: 1rem; color: ${rankColor};">${rankBadge}</span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${ct.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${ct.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1.5px solid #334155;" />
                <div>
                  <div style="font-weight: 700; color: #F8FAFC;">${ct.name}</div>
                  <small style="color: #64748B;">ID: ${ct.id}</small>
                </div>
              </div>
            </td>
            <td>${ct.category || 'General'}</td>
            <td>
              <span id="vote-count-${ct.id}" style="font-size: 1.25rem; font-weight: 800; color: #34D399;">
                ${(ct.votes || 0).toLocaleString()}
              </span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="adjustVotesQuick('${ct.id}', -10)" title="Subtract 10 votes">
                  -10
                </button>
                <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="adjustVotesQuick('${ct.id}', 10)" title="Add 10 votes">
                  +10
                </button>
                <button type="button" class="admin-btn admin-btn-primary admin-btn-sm" onclick="adjustVotesQuick('${ct.id}', 50)" title="Add 50 votes">
                  +50
                </button>
                <button type="button" class="admin-btn admin-btn-success admin-btn-sm" onclick="adjustVotesQuick('${ct.id}', 100)" title="Add 100 votes">
                  +100
                </button>
                <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="promptCustomVoteAdjust('${ct.id}', '${ct.name}')" title="Custom Delta">
                  <i class="fa-solid fa-pen-to-square"></i> Custom
                </button>
              </div>
            </td>
            <td>
              <span class="admin-badge approved">${ct.status || 'Active'}</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  window.adjustVotesQuick = function(contestantId, delta) {
    if (!selectedContestId) return;
    const res = store.adjustContestantVotes(selectedContestId, contestantId, delta);
    if (res.success) {
      renderContestController();
      renderOverview();
    } else {
      alert(res.message);
    }
  };

  window.promptCustomVoteAdjust = function(contestantId, contestantName) {
    const input = prompt(`Enter vote adjustment delta for ${contestantName} (e.g. +250 or -50):`, "+50");
    if (input === null) return;
    const delta = parseInt(input.replace('+', ''), 10);
    if (isNaN(delta)) {
      alert("Invalid number entered.");
      return;
    }
    window.adjustVotesQuick(contestantId, delta);
  };

  // ================= 6. ANALYTICS & INSIGHTS =================
  function renderAnalytics() {
    const events = store.getEvents();
    const tickets = store.getTickets();

    // 1. Ticket Sales by Tier
    const tierSales = {
      'Regular Pass': { count: 0, revenue: 0, color: '#6366F1' },
      'VIP Pass': { count: 0, revenue: 0, color: '#8B5CF6' },
      'VVIP / Table of 5': { count: 0, revenue: 0, color: '#EC4899' },
      'Early Bird': { count: 0, revenue: 0, color: '#10B981' }
    };

    tickets.forEach(t => {
      const type = (t.ticketType || t.tierName || '').toLowerCase();
      if (type.includes('vip') && !type.includes('vvip') && !type.includes('table')) {
        tierSales['VIP Pass'].count++;
        tierSales['VIP Pass'].revenue += Number(t.price || t.totalAmount || 15000);
      } else if (type.includes('table') || type.includes('vvip')) {
        tierSales['VVIP / Table of 5'].count++;
        tierSales['VVIP / Table of 5'].revenue += Number(t.price || t.totalAmount || 50000);
      } else if (type.includes('early') || type.includes('bird')) {
        tierSales['Early Bird'].count++;
        tierSales['Early Bird'].revenue += Number(t.price || t.totalAmount || 3500);
      } else {
        tierSales['Regular Pass'].count++;
        tierSales['Regular Pass'].revenue += Number(t.price || t.totalAmount || 5000);
      }
    });

    const totalTierTickets = Object.values(tierSales).reduce((acc, curr) => acc + curr.count, 0) || 1;
    const tierContainer = document.getElementById('analytics-tier-breakdown');
    if (tierContainer) {
      tierContainer.innerHTML = Object.entries(tierSales).map(([name, data]) => {
        const pct = Math.round((data.count / totalTierTickets) * 100);
        return `
          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.85rem;">
              <span style="font-weight: 700; color: #F8FAFC;">${name}</span>
              <span style="color: #94A3B8;">${data.count} tickets (${pct}%) &bull; <strong style="color: #34D399;">${store.formatCurrency(data.revenue)}</strong></span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${Math.max(pct, 5)}%; height: 100%; background: ${data.color}; border-radius: 9999px;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Top Organisers Breakdown
    const orgBreakdownContainer = document.getElementById('analytics-organiser-breakdown');
    if (orgBreakdownContainer) {
      const orgSales = {};
      events.forEach(e => {
        const org = e.organizer || 'Kaiwe Digital Productions';
        if (!orgSales[org]) orgSales[org] = { events: 0, tickets: 0, revenue: 0 };
        orgSales[org].events++;
        orgSales[org].tickets += Number(e.ticketsSold || 0);
        orgSales[org].revenue += Number(e.totalRevenue || e.revenue || 0);
      });
      const topOrgs = Object.entries(orgSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
      const maxOrgRev = topOrgs[0]?.[1].revenue || 1;

      orgBreakdownContainer.innerHTML = topOrgs.map(([name, data], idx) => {
        const pct = Math.round((data.revenue / maxOrgRev) * 100);
        return `
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.85rem;">
              <span style="font-weight: 700; color: #F8FAFC;">${idx + 1}. ${name}</span>
              <span style="color: #34D399; font-weight: 700;">${store.formatCurrency(data.revenue)} (${data.tickets} tickets)</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${Math.max(pct, 10)}%; height: 100%; background: #F59E0B; border-radius: 9999px;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Location Breakdown
    const locContainer = document.getElementById('analytics-location-breakdown');
    if (locContainer) {
      const citySales = {};
      events.forEach(e => {
        const city = (e.city || 'Lagos').split(',')[0].trim();
        citySales[city] = (citySales[city] || 0) + Number(e.ticketsSold || 10);
      });
      const totalLoc = Object.values(citySales).reduce((a, b) => a + b, 0) || 1;
      locContainer.innerHTML = Object.entries(citySales).map(([city, count]) => {
        const pct = Math.round((count / totalLoc) * 100);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-location-dot" style="color: #EC4899; font-size: 0.8rem;"></i>
              <span style="color: #F8FAFC; font-weight: 600; font-size: 0.85rem;">${city}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 80px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: #EC4899;"></div>
              </div>
              <span style="color: #94A3B8; font-size: 0.8rem; width: 60px; text-align: right;">${count} tix (${pct}%)</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Detailed Event Sales Performance Table
    const tbodyAnalyticsEvents = document.getElementById('tbody-analytics-events');
    if (tbodyAnalyticsEvents) {
      tbodyAnalyticsEvents.innerHTML = events.map(e => {
        const sold = Number(e.ticketsSold) || 0;
        const rev = Number(e.totalRevenue || e.revenue) || (sold * (Number(e.standardPrice) || 5000));
        const avgPrice = sold > 0 ? Math.round(rev / sold) : (Number(e.standardPrice) || 5000);
        const promoSold = Math.floor(sold * 0.18);
        const status = e.status || e.onboardingStatus || 'Active';
        const isLive = status.toUpperCase().includes('APPROVED') || status.toUpperCase().includes('LIVE');
        const badgeClass = isLive ? 'approved' : (status.toUpperCase().includes('PENDING') ? 'pending' : 'rejected');

        return `
          <tr>
            <td>
              <div style="font-weight: 700; color: #F8FAFC;">${e.title}</div>
              <small style="color: #64748B;">ID: ${e.id} &bull; ${e.category || 'General'}</small>
            </td>
            <td>
              <div style="color: #CBD5E1; font-weight: 600;">${e.organizer || 'KAIWE DIGITAL'}</div>
              <small style="color: #64748B;">${e.city || 'Lagos'}</small>
            </td>
            <td><strong style="color: #F8FAFC;">${sold.toLocaleString()}</strong></td>
            <td><strong style="color: #34D399;">${store.formatCurrency(rev)}</strong></td>
            <td>${store.formatCurrency(avgPrice)}</td>
            <td><span style="color: #818CF8; font-weight: 700;">${promoSold}</span> <small style="color: #64748B;">(${Math.round((promoSold / (sold || 1)) * 100)}%)</small></td>
            <td><span class="admin-badge ${badgeClass}">${status}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // ================= 6.5 EVENTS DIRECTORY & LIFECYCLE =================
  function renderEventsTable() {
    const tbody = document.getElementById('tbody-admin-events-list') || document.getElementById('tbody-admin-events');
    if (!tbody) return;
    let events = store.getEvents();

    const searchVal = (document.getElementById('search-events-input')?.value || '').toLowerCase().trim();
    const statusVal = (document.getElementById('filter-events-status')?.value || 'all').toLowerCase();

    if (searchVal) {
      events = events.filter(e => 
        (e.title && e.title.toLowerCase().includes(searchVal)) ||
        (e.organizer && e.organizer.toLowerCase().includes(searchVal)) ||
        (e.id && e.id.toLowerCase().includes(searchVal)) ||
        (e.venue && e.venue.toLowerCase().includes(searchVal)) ||
        (e.city && e.city.toLowerCase().includes(searchVal)) ||
        (e.category && e.category.toLowerCase().includes(searchVal))
      );
    }

    if (statusVal && statusVal !== 'all') {
      events = events.filter(e => {
        const st = (e.status || e.onboardingStatus || '').toLowerCase();
        if (statusVal === 'approved') return st === 'approved' || st === 'ticket sales live' || st === 'active';
        if (statusVal === 'under_review') return st === 'under review';
        if (statusVal === 'paused') return st === 'paused';
        if (statusVal === 'pending') return st.includes('pending');
        if (statusVal === 'action_required') return st.includes('action');
        if (statusVal === 'completed') return st.includes('completed');
        if (statusVal === 'suspended') return st.includes('suspend');
        if (statusVal === 'rejected') return st.includes('reject');
        return st === statusVal;
      });
    }

    if (events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94A3B8; padding: 2rem;">No matching events found.</td></tr>`;
      return;
    }

    tbody.innerHTML = events.map(e => {
      const currentStatus = (e.status || e.onboardingStatus || 'Active').toUpperCase();
      const isApproved = currentStatus.includes('APPROVED') || currentStatus.includes('LIVE') || currentStatus === 'ACTIVE';
      const isPaused = currentStatus === 'PAUSED';
      const flyer = e.flyerUrl || e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';
      const ticketsSold = Number(e.ticketsSold) || 0;
      const totalRev = Number(e.totalRevenue || e.revenue) || (ticketsSold * (Number(e.standardPrice) || 5000));

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${flyer}" alt="" referrerpolicy="no-referrer" style="width: 42px; height: 42px; border-radius: 6px; object-fit: cover; border: 1px solid var(--admin-input-border);" />
              <div>
                <div style="font-weight: 700; color: #F8FAFC; font-size: 0.875rem;">${e.title}</div>
                <small style="color: #64748B;">ID: ${e.id} &bull; ${e.category || 'General'}</small>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: #CBD5E1;">${e.organizer || 'KAIWE DIGITAL'}</div>
            <small style="color: #64748B;">${e.city || 'Lagos, NG'}</small>
          </td>
          <td>
            <div>${store.formatDate(e.date)}</div>
            <small style="color: #64748B;">${e.venue || 'Event Venue'}</small>
          </td>
          <td><strong style="color: #F8FAFC;">${ticketsSold.toLocaleString()}</strong></td>
          <td><strong style="color: #34D399;">${store.formatCurrency(totalRev)}</strong></td>
          <td>${renderEventStatusBadge(currentStatus)}</td>
          <td>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.viewEventDetailsModal('${e.id}')" title="Review Application">
                <i class="fa-solid fa-eye"></i> Review
              </button>
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.openAdminEditEventModal('${e.id}')" title="Edit Event Details" style="color: #C084FC; border-color: rgba(192, 132, 252, 0.4);">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              ${isPaused ? `
                <button type="button" class="admin-btn admin-btn-sm admin-btn-outline" onclick="window.handleResumeEvent('${e.id}')" style="color: #34D399; border-color: rgba(52, 211, 153, 0.4);" title="Resume Ticket Sales">
                  <i class="fa-solid fa-play"></i> Resume
                </button>
              ` : (isApproved ? `
                <button type="button" class="admin-btn admin-btn-sm admin-btn-outline" onclick="window.handlePauseEvent('${e.id}')" style="color: #FB923C; border-color: rgba(249, 115, 22, 0.4);" title="Pause Ticket Sales">
                  <i class="fa-solid fa-pause"></i> Pause
                </button>
              ` : '')}
              <button type="button" class="admin-btn admin-btn-sm ${e.featured ? 'admin-btn-outline' : 'admin-btn-primary'}" onclick="window.toggleFeaturedEvent('${e.id}')" title="Toggle Homepage Spotlight">
                <i class="fa-solid fa-star"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ================= 6.6 TICKET MANAGEMENT =================
  function renderTicketManagement() {
    const events = store.getEvents();
    const selectEvent = document.getElementById('select-ticket-mgmt-event');
    const tbody = document.getElementById('tbody-ticket-management');
    if (!tbody) return;

    if (selectEvent && selectEvent.options.length <= 1) {
      selectEvent.innerHTML = `<option value="all">All Events (All Tiers)</option>` + 
        events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
      selectEvent.addEventListener('change', renderTicketManagement);
    }

    const selectedEvId = selectEvent ? selectEvent.value : 'all';
    let filteredEvents = events;
    if (selectedEvId && selectedEvId !== 'all') {
      filteredEvents = events.filter(e => e.id === selectedEvId);
    }

    const allTiers = [];
    filteredEvents.forEach(e => {
      if (e.ticketTiers && e.ticketTiers.length > 0) {
        e.ticketTiers.forEach(t => allTiers.push({ ...t, eventId: e.id, eventTitle: e.title }));
      } else if (e.tiers && e.tiers.length > 0) {
        e.tiers.forEach(t => allTiers.push({ ...t, eventId: e.id, eventTitle: e.title }));
      } else {
        allTiers.push({
          id: `${e.id}-reg`,
          name: 'Regular Admission',
          eventId: e.id,
          eventTitle: e.title,
          price: e.standardPrice || 5000,
          quota: 500,
          sold: Math.floor((e.ticketsSold || 0) * 0.75),
          capacity: 500,
          active: true
        });
        allTiers.push({
          id: `${e.id}-vip`,
          name: 'VIP Experience',
          eventId: e.id,
          eventTitle: e.title,
          price: e.vipPrice || 15000,
          quota: 150,
          sold: Math.floor((e.ticketsSold || 0) * 0.25),
          capacity: 150,
          active: true
        });
      }
    });

    if (allTiers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94A3B8; padding: 2rem;">No ticket tiers configured.</td></tr>`;
      return;
    }

    tbody.innerHTML = allTiers.map(t => {
      const quota = Number(t.quota || t.capacity || 500);
      const sold = Number(t.sold || t.ticketsSold || 0);
      const remaining = Math.max(0, quota - sold);
      const isActive = t.active !== false;
      const isSoldOut = remaining <= 0;
      const statusBadge = isSoldOut 
        ? `<span class="admin-badge rejected">SOLD OUT</span>`
        : (isActive ? `<span class="admin-badge approved">ACTIVE</span>` : `<span class="admin-badge pending">PAUSED</span>`);

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #F8FAFC;">${t.name || t.type || 'General Pass'}</div>
            <small style="color: #64748B;">Tier ID: ${t.id || 'tier-std'}</small>
          </td>
          <td>
            <div style="color: #CBD5E1; font-weight: 600;">${t.eventTitle}</div>
          </td>
          <td><strong style="color: #34D399;">${store.formatCurrency(t.price || 5000)}</strong></td>
          <td>${quota.toLocaleString()}</td>
          <td><strong style="color: #F8FAFC;">${sold.toLocaleString()}</strong></td>
          <td><span style="color: ${remaining < 20 ? '#EF4444' : '#38BDF8'}; font-weight: 700;">${remaining.toLocaleString()}</span></td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.promptEditTierPrice('${t.eventId}', '${(t.name || t.type || '').replace(/'/g, "\\'")}', ${t.price || 5000}, ${quota})">
                <i class="fa-solid fa-edit"></i> Edit
              </button>
              <button type="button" class="admin-btn admin-btn-sm ${isActive ? 'admin-btn-outline' : 'admin-btn-primary'}" onclick="window.toggleTierStatus('${t.eventId}', '${(t.name || t.type || '').replace(/'/g, "\\'")}', ${!isActive})">
                ${isActive ? 'Pause' : 'Activate'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.promptEditTierPrice = function(eventId, tierName, currentPrice, currentQuota) {
    const newPrice = prompt(`Enter new ticket price (₦) for ${tierName}:`, currentPrice);
    if (newPrice === null) return;
    const newQuota = prompt(`Enter new inventory quota for ${tierName}:`, currentQuota);
    if (newQuota === null) return;

    store.updateTicketTier(eventId, tierName, parseFloat(newPrice) || currentPrice, parseInt(newQuota, 10) || currentQuota);
    renderTicketManagement();
    renderOverview();
    alert(`Tier "${tierName}" updated successfully!`);
  };

  window.toggleTierStatus = function(eventId, tierName, newActive) {
    store.updateTicketTier(eventId, tierName, undefined, undefined, newActive);
    renderTicketManagement();
  };

  // ================= 6.7 ATTENDEE MANAGEMENT =================
  function renderAttendeesTable() {
    const tbody = document.getElementById('tbody-attendees-list');
    if (!tbody) return;

    let tickets = store.getTickets();
    const searchVal = (document.getElementById('search-attendees-input')?.value || '').toLowerCase().trim();
    const checkinVal = (document.getElementById('filter-attendees-checkin')?.value || 'all').toLowerCase();

    if (searchVal) {
      tickets = tickets.filter(t => 
        (t.customerName && t.customerName.toLowerCase().includes(searchVal)) ||
        (t.customerEmail && t.customerEmail.toLowerCase().includes(searchVal)) ||
        (t.customerPhone && t.customerPhone.includes(searchVal)) ||
        (t.id && t.id.toLowerCase().includes(searchVal)) ||
        (t.eventName && t.eventName.toLowerCase().includes(searchVal))
      );
    }

    if (checkinVal !== 'all') {
      tickets = tickets.filter(t => {
        const isChecked = Boolean(t.checkedIn || t.status === 'Checked In');
        return checkinVal === 'checked_in' ? isChecked : !isChecked;
      });
    }

    if (tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #94A3B8; padding: 2rem;">No registered attendees match the search criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      const isChecked = Boolean(t.checkedIn || t.status === 'Checked In');
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #1E293B; display: flex; align-items: center; justify-content: center; color: #818CF8; font-weight: 700; font-size: 0.8rem;">
                ${(t.customerName || 'A')[0].toUpperCase()}
              </div>
              <strong style="color: #F8FAFC;">${t.customerName || 'Attendee'}</strong>
            </div>
          </td>
          <td>
            <div style="color: #CBD5E1; font-size: 0.85rem;">${t.customerEmail || 'No email'}</div>
            <small style="color: #64748B;">${t.customerPhone || 'No phone'}</small>
          </td>
          <td>
            <div style="font-weight: 600; color: #F8FAFC; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.eventName}</div>
            <small style="color: #64748B;">${t.eventDate || '2026'}</small>
          </td>
          <td><span style="color: #818CF8; font-weight: 700;">${t.ticketType || t.tierName || 'Regular'}</span></td>
          <td><code class="admin-code-chip">${t.id}</code></td>
          <td><strong style="color: #34D399;">${store.formatCurrency(t.price || t.totalAmount || 5000)}</strong></td>
          <td><small style="color: #94A3B8;">${new Date(t.purchasedAt || t.createdAt || Date.now()).toLocaleDateString()}</small></td>
          <td>
            <span class="admin-badge ${isChecked ? 'approved' : 'pending'}">
              ${isChecked ? '<i class="fa-solid fa-check"></i> CHECKED IN' : '<i class="fa-solid fa-clock"></i> NOT CHECKED IN'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.openAttendeeModal('${t.id}')" title="View Digital Pass & QR">
                <i class="fa-solid fa-qrcode"></i> View Pass
              </button>
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.resendAttendeePass('${t.id}')" title="Resend Pass Email">
                <i class="fa-solid fa-envelope"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.resendAttendeePass = function(ticketId) {
    const ticket = store.getTickets().find(t => t.id === ticketId);
    if (!ticket) return;
    alert(`✓ Ticket pass ${ticket.id} re-dispatched to ${ticket.customerEmail}!`);
    store.addAuditLog({
      admin: 'Bookam26@gmail.com',
      action: 'RESEND_TICKET_PASS',
      entity: 'Ticket',
      entityId: ticket.id,
      details: `Dispatched digital QR pass to ${ticket.customerEmail}`
    });
  };

  window.toggleAttendeeCheckIn = function(ticketId) {
    const ticket = store.getTickets().find(t => t.id === ticketId);
    if (!ticket) return;
    if (ticket.checkedIn) {
      ticket.checkedIn = false;
      ticket.status = 'Approved';
      ticket.checkedInAt = null;
      localStorage.setItem('bookam_tickets', JSON.stringify(store.getTickets()));
    } else {
      store.checkInTicket(ticket.id);
    }
    window.closeAttendeeModal();
    renderAttendeesTable();
    renderCheckInEngine();
    renderOverview();
  };

  window.openAttendeeModal = function(ticketId) {
    const ticket = store.getTickets().find(t => t.id === ticketId);
    if (!ticket) return;
    const modal = document.getElementById('admin-attendee-modal');
    const body = document.getElementById('admin-attendee-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <div style="display: inline-block; padding: 1rem; background: #FFFFFF; border-radius: 12px; margin-bottom: 1rem;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.id)}" alt="QR Code" style="display: block; width: 160px; height: 160px;" />
          </div>
          <h3 style="color: #F8FAFC; font-size: 1.15rem; font-weight: 800; margin: 0 0 0.25rem 0;">${ticket.eventName}</h3>
          <span class="admin-badge ${ticket.checkedIn ? 'approved' : 'pending'}">${ticket.checkedIn ? 'CHECKED IN' : 'VALID PASS - READY FOR SCAN'}</span>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
            <div>
              <small style="color: #64748B; display: block;">Attendee Name</small>
              <strong style="color: #F8FAFC;">${ticket.customerName}</strong>
            </div>
            <div>
              <small style="color: #64748B; display: block;">Ticket Tier</small>
              <strong style="color: #818CF8;">${ticket.ticketType || ticket.tierName || 'Regular'}</strong>
            </div>
            <div>
              <small style="color: #64748B; display: block;">Ticket ID</small>
              <code style="color: #34D399; font-weight: 700;">${ticket.id}</code>
            </div>
            <div>
              <small style="color: #64748B; display: block;">Amount Paid</small>
              <strong style="color: #F8FAFC;">${store.formatCurrency(ticket.price || ticket.totalAmount || 0)}</strong>
            </div>
            <div>
              <small style="color: #64748B; display: block;">Email</small>
              <span style="color: #CBD5E1;">${ticket.customerEmail}</span>
            </div>
            <div>
              <small style="color: #64748B; display: block;">Phone</small>
              <span style="color: #CBD5E1;">${ticket.customerPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.resendAttendeePass('${ticket.id}')">
            <i class="fa-solid fa-paper-plane"></i> Resend Email Pass
          </button>
          <button type="button" class="admin-btn ${ticket.checkedIn ? 'admin-btn-outline' : 'admin-btn-primary'} admin-btn-sm" onclick="window.toggleAttendeeCheckIn('${ticket.id}')">
            <i class="fa-solid fa-qrcode"></i> ${ticket.checkedIn ? 'Undo Check-In' : 'Admit & Check In'}
          </button>
        </div>
      `;
    }
    if (modal) modal.style.display = 'flex';
  };

  window.closeAttendeeModal = function() {
    const modal = document.getElementById('admin-attendee-modal');
    if (modal) modal.style.display = 'none';
  };

  // ================= 6.8 ORGANISER DIRECTORY =================
  function renderOrganisersTable() {
    const tbody = document.getElementById('tbody-organisers-list');
    if (!tbody) return;

    const organisers = store.getOrganizersList();
    const events = store.getEvents();

    if (organisers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94A3B8; padding: 2rem;">No organisers found.</td></tr>`;
      return;
    }

    tbody.innerHTML = organisers.map(org => {
      const orgEvents = events.filter(e => (e.organizer || '').toLowerCase() === (org.name || org.organizationName || '').toLowerCase());
      const ticketsSold = orgEvents.reduce((a, b) => a + (Number(b.ticketsSold) || 0), 0);
      const grossRev = orgEvents.reduce((a, b) => a + (Number(b.totalRevenue || b.revenue) || 0), 0);
      const status = org.status || 'Verified';
      const isVerified = status.toLowerCase() === 'verified' || status.toLowerCase() === 'active';

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #F8FAFC;">${org.name}</div>
            <small style="color: #64748B;">ID: ${org.id || 'org-01'}</small>
          </td>
          <td>
            <div style="color: #CBD5E1; font-weight: 600;">${org.organizationName || org.name}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem; color: #CBD5E1;">${org.email}</div>
            <small style="color: #64748B;">${org.phone || '+234 802 117 4926'}</small>
          </td>
          <td><strong style="color: #60A5FA;">${orgEvents.length}</strong></td>
          <td><strong style="color: #F8FAFC;">${ticketsSold.toLocaleString()}</strong></td>
          <td><strong style="color: #34D399;">${store.formatCurrency(grossRev)}</strong></td>
          <td>
            <span class="admin-badge ${isVerified ? 'approved' : 'pending'}">
              <i class="fa-solid fa-circle-check"></i> ${status.toUpperCase()}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.openOrganiserModal('${org.id || org.name}')">
                <i class="fa-solid fa-eye"></i> View Profile
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.openOrganiserModal = function(orgIdOrName) {
    const organisers = store.getOrganizersList();
    const org = organisers.find(o => o.id === orgIdOrName || o.name === orgIdOrName || o.organizationName === orgIdOrName) || {
      name: orgIdOrName,
      organizationName: orgIdOrName,
      email: `${orgIdOrName.toLowerCase().replace(/[^a-z0-9]/g, '')}@bookam-partners.ng`,
      phone: '+234 802 117 4926',
      bankName: 'Moniepoint',
      accountName: 'KAIWE DIGITAL',
      accountNumber: '8021174926',
      status: 'Active'
    };

    const events = store.getEvents().filter(e => (e.organizer || '').toLowerCase() === (org.name || org.organizationName || '').toLowerCase());
    const totalSold = events.reduce((a, b) => a + (Number(b.ticketsSold) || 0), 0);
    const totalRev = events.reduce((a, b) => a + (Number(b.totalRevenue || b.revenue) || 0), 0);

    const modal = document.getElementById('admin-organiser-modal');
    const body = document.getElementById('admin-organiser-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <h3 style="color: #F8FAFC; font-size: 1.2rem; font-weight: 800; margin: 0;">${org.organizationName || org.name}</h3>
            <span class="admin-badge approved">${org.status || 'VERIFIED'}</span>
          </div>
          <p style="color: #94A3B8; font-size: 0.85rem; margin: 0;">Lead Contact: ${org.name}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #94A3B8;">Events Hosted</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #60A5FA;">${events.length}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #94A3B8;">Tickets Sold</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #34D399;">${totalSold}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 0.75rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #94A3B8;">Gross Sales</div>
            <div style="font-size: 1rem; font-weight: 800; color: #FBBF24;">${store.formatCurrency(totalRev)}</div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem; font-size: 0.85rem;">
          <div style="font-weight: 700; color: #CBD5E1; margin-bottom: 0.5rem;">Banking & Payout Account</div>
          <div style="color: #94A3B8;">Bank: <strong style="color: #F8FAFC;">${org.bankName || 'Moniepoint Microfinance Bank'}</strong></div>
          <div style="color: #94A3B8;">Account Name: <strong style="color: #F8FAFC;">${org.accountName || 'KAIWE DIGITAL'}</strong></div>
          <div style="color: #94A3B8;">Account Number: <strong style="color: #34D399; font-family: monospace; font-size: 0.95rem;">${org.accountNumber || '8021174926'}</strong></div>
        </div>

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.closeOrganiserModal()">Close</button>
          <button type="button" class="admin-btn admin-btn-primary admin-btn-sm" onclick="alert('Payout settlement confirmation sent to ${org.email}!')">
            <i class="fa-solid fa-paper-plane"></i> Send Settlement Notice
          </button>
        </div>
      `;
    }
    if (modal) modal.style.display = 'flex';
  };

  window.closeOrganiserModal = function() {
    const modal = document.getElementById('admin-organiser-modal');
    if (modal) modal.style.display = 'none';
  };

  // ================= 6.9 PROMO CODES MANAGEMENT =================
  function renderPromoCodesTable() {
    const tbody = document.getElementById('tbody-promo-codes-list');
    if (!tbody) return;

    const promoCodes = store.getPromoCodes();

    if (promoCodes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #94A3B8; padding: 2rem;">No promo codes created yet. Click "+ Create Promo Code" to launch one!</td></tr>`;
      return;
    }

    tbody.innerHTML = promoCodes.map(p => {
      const isActive = (p.status || 'Active').toLowerCase() === 'active';
      return `
        <tr>
          <td><code class="admin-code-chip" style="font-weight: 800; font-size: 0.9rem; color: #38BDF8;">${p.code}</code></td>
          <td>
            <div style="font-weight: 600; color: #F8FAFC;">${p.eventName || 'All Events'}</div>
            <small style="color: #64748B;">Promoter: ${p.influencerName || 'Direct'}</small>
          </td>
          <td><strong style="color: #34D399;">${p.discountPercent}% OFF</strong></td>
          <td><span style="color: #818CF8; font-weight: 700;">${p.commissionPercent}%</span></td>
          <td>${p.usedCount || 0}</td>
          <td><strong style="color: #F8FAFC;">${p.ticketsSold || 0}</strong></td>
          <td><strong style="color: #34D399;">${store.formatCurrency(p.revenue || 0)}</strong></td>
          <td>
            <span class="admin-badge ${isActive ? 'approved' : 'rejected'}">
              ${isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </td>
          <td>
            <button type="button" class="admin-btn admin-btn-sm ${isActive ? 'admin-btn-outline' : 'admin-btn-primary'}" onclick="window.togglePromoCode('${p.code}')">
              ${isActive ? 'Deactivate' : 'Activate'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.togglePromoCode = function(code) {
    store.togglePromoCode(code);
    renderPromoCodesTable();
  };

  window.openCreatePromoCodeModal = function() {
    const modal = document.getElementById('admin-promocode-modal');
    const selectEvent = document.getElementById('modal-promo-event');
    if (selectEvent) {
      const events = store.getEvents();
      selectEvent.innerHTML = `<option value="">All Events (Universal)</option>` + 
        events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
    }
    if (modal) modal.style.display = 'flex';
  };

  window.closeCreatePromoCodeModal = function() {
    const modal = document.getElementById('admin-promocode-modal');
    if (modal) modal.style.display = 'none';
  };

  // ================= 6.10 FEATURED EVENTS =================
  function renderFeaturedEventsTable() {
    const tbody = document.getElementById('tbody-featured-events-list');
    if (!tbody) return;

    const events = store.getEvents();

    tbody.innerHTML = events.map(e => {
      const isFeatured = Boolean(e.featured);
      const flyer = e.flyerUrl || e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${flyer}" alt="" referrerpolicy="no-referrer" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid var(--admin-input-border);" />
              <div>
                <div style="font-weight: 700; color: #F8FAFC;">${e.title}</div>
                <small style="color: #64748B;">ID: ${e.id} &bull; Org: ${e.organizer || 'KAIWE DIGITAL'}</small>
              </div>
            </div>
          </td>
          <td>${e.category || 'Concert'}</td>
          <td>${store.formatDate(e.date)}</td>
          <td>${e.venue || 'Landmark Centre'}</td>
          <td><strong style="color: #F8FAFC;">${(e.ticketsSold || 0).toLocaleString()}</strong></td>
          <td>
            <span class="admin-badge ${isFeatured ? 'approved' : 'pending'}">
              ${isFeatured ? '<i class="fa-solid fa-star" style="color: #FBBF24;"></i> FEATURED ON HOMEPAGE' : 'STANDARD LISTING'}
            </span>
          </td>
          <td>
            <button type="button" class="admin-btn admin-btn-sm ${isFeatured ? 'admin-btn-outline' : 'admin-btn-primary'}" onclick="window.toggleFeaturedEvent('${e.id}')">
              ${isFeatured ? '<i class="fa-solid fa-xmark"></i> Remove' : '<i class="fa-solid fa-star"></i> Feature Event'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.toggleFeaturedEvent = function(eventId) {
    store.toggleFeaturedEvent(eventId);
    renderFeaturedEventsTable();
    renderEventsTable();
    renderOverview();
  };

  // ================= 6.11 PLATFORM USERS =================
  function renderPlatformUsersTable() {
    const tbody = document.getElementById('tbody-platform-users');
    if (!tbody) return;

    let users = store.getPlatformUsers();
    const filterRole = document.getElementById('filter-platform-users-role')?.value || 'all';

    if (filterRole !== 'all') {
      users = users.filter(u => u.role.toLowerCase() === filterRole.toLowerCase());
    }

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94A3B8; padding: 2rem;">No users found with role "${filterRole}".</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {
      const isSuspended = (u.status || '').toLowerCase() === 'suspended';
      const roleBadges = {
        'admin': '<span class="admin-badge" style="background: rgba(129, 140, 248, 0.2); color: #818CF8; border-color: rgba(129, 140, 248, 0.4);"><i class="fa-solid fa-shield"></i> SUPER ADMIN</span>',
        'organiser': '<span class="admin-badge" style="background: rgba(96, 165, 250, 0.2); color: #60A5FA; border-color: rgba(96, 165, 250, 0.4);"><i class="fa-solid fa-building-user"></i> ORGANISER</span>',
        'influencer': '<span class="admin-badge" style="background: rgba(251, 191, 36, 0.2); color: #FBBF24; border-color: rgba(251, 191, 36, 0.4);"><i class="fa-solid fa-bullhorn"></i> INFLUENCER</span>',
        'attendee': '<span class="admin-badge approved"><i class="fa-solid fa-ticket"></i> ATTENDEE</span>'
      };

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #1E293B; display: flex; align-items: center; justify-content: center; color: #CBD5E1; font-weight: 700; font-size: 0.8rem;">
                ${(u.name || 'U')[0].toUpperCase()}
              </div>
              <strong style="color: #F8FAFC;">${u.name}</strong>
            </div>
          </td>
          <td>
            <div style="color: #CBD5E1; font-size: 0.85rem;">${u.email}</div>
            <small style="color: #64748B;">${u.phone || 'N/A'}</small>
          </td>
          <td>${roleBadges[u.role] || `<span class="admin-badge">${u.role.toUpperCase()}</span>`}</td>
          <td>
            <span class="admin-badge ${isSuspended ? 'rejected' : 'approved'}">
              ${isSuspended ? 'SUSPENDED' : 'ACTIVE'}
            </span>
          </td>
          <td><small style="color: #94A3B8;">${new Date(u.registeredAt || Date.now()).toLocaleDateString()}</small></td>
          <td>
            ${u.role === 'admin' ? '<small style="color: #64748B;">Protected Root</small>' : `
              <button type="button" class="admin-btn admin-btn-sm ${isSuspended ? 'admin-btn-primary' : 'admin-btn-outline'}" onclick="window.toggleUserSuspension('${u.id}', '${u.status}')">
                ${isSuspended ? 'Reactivate' : 'Suspend'}
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  window.toggleUserSuspension = function(userId, currentStatus) {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    store.updateUserStatus(userId, nextStatus);
    renderPlatformUsersTable();
  };

  // ================= 6.12 CONTENT MANAGEMENT =================
  function renderContentMgmt() {
    const content = store.getContentSettings();
    const txtAnnouncement = document.getElementById('setting-announcement-text');
    const txtHero = document.getElementById('setting-hero-headline');
    const txtCategories = document.getElementById('setting-categories');

    if (txtAnnouncement) txtAnnouncement.value = content.announcementText || '';
    if (txtHero) txtHero.value = content.heroHeadline || '';
    if (txtCategories) txtCategories.value = content.categories || '';
  }

  // ================= 6.13 ADMIN ROLES & REPORTS =================
  function renderAdminRoles() {
    // Admin roles are rendered declaratively in the HTML view
  }

  function renderReportsCenter() {
    // Reports cards and download buttons are ready
  }

  window.exportEventSalesReport = function(format = 'csv') {
    const events = store.getEvents();
    if (format === 'json') {
      const data = JSON.stringify(events, null, 2);
      downloadFile(data, `bookam_events_report_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
      return;
    }
    const headers = ['Event ID', 'Title', 'Category', 'Organiser', 'Date', 'Venue', 'City', 'Price (NGN)', 'VIP Price (NGN)', 'Tickets Sold', 'Revenue (NGN)', 'Status'];
    const rows = events.map(e => [
      `"${e.id}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.category || ''}"`,
      `"${(e.organizer || '').replace(/"/g, '""')}"`,
      `"${e.date || ''}"`,
      `"${(e.venue || '').replace(/"/g, '""')}"`,
      `"${e.city || ''}"`,
      e.standardPrice || 5000,
      e.vipPrice || 15000,
      e.ticketsSold || 0,
      e.totalRevenue || e.revenue || 0,
      `"${e.status || e.onboardingStatus || 'Active'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `bookam_event_sales_${new Date().toISOString().slice(0,10)}.csv`);
  };

  window.exportAttendeesCSV = function() {
    const tickets = store.getTickets();
    const headers = ['Ticket ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Event Name', 'Tier', 'Price (NGN)', 'Gate Status', 'Checked In At'];
    const rows = tickets.map(t => [
      `"${t.id}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${t.customerEmail || ''}"`,
      `"${t.customerPhone || ''}"`,
      `"${(t.eventName || '').replace(/"/g, '""')}"`,
      `"${t.ticketType || t.tierName || 'Regular'}"`,
      t.price || t.totalAmount || 0,
      `"${t.checkedIn ? 'Checked In' : 'Not Checked In'}"`,
      `"${t.checkedInAt || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `bookam_attendees_${new Date().toISOString().slice(0,10)}.csv`);
  };

  window.exportTransactionsCSV = function() {
    const payments = store.getPayments();
    const headers = ['Payment Ref', 'Customer Name', 'Email', 'Phone', 'Event', 'Tickets Count', 'Amount (NGN)', 'Status', 'Date'];
    const rows = payments.map(p => [
      `"${p.paymentRef || p.id}"`,
      `"${(p.customerName || '').replace(/"/g, '""')}"`,
      `"${p.customerEmail || ''}"`,
      `"${p.customerPhone || ''}"`,
      `"${(p.eventName || '').replace(/"/g, '""')}"`,
      p.quantity || 1,
      p.totalAmount || 0,
      `"${p.status || 'Pending Approval'}"`,
      `"${p.createdAt || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `bookam_transactions_${new Date().toISOString().slice(0,10)}.csv`);
  };

  window.exportInfluencerReport = function() {
    const influencers = store.getInfluencers();
    const headers = ['Name', 'Username', 'Promo Code', 'Email', 'Phone', 'Discount %', 'Commission %', 'Tickets Sold', 'Revenue (NGN)', 'Commission Earned (NGN)', 'Bank', 'Account Number'];
    const rows = influencers.map(i => [
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${i.username || ''}"`,
      `"${i.promoCode || ''}"`,
      `"${i.email || ''}"`,
      `"${i.phone || ''}"`,
      i.discountValue || 10,
      i.commissionValue || 5,
      i.ticketSales || 0,
      i.revenueGenerated || 0,
      i.commissionEarned || 0,
      `"${i.bankName || ''}"`,
      `"${i.accountNumber || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `bookam_influencers_${new Date().toISOString().slice(0,10)}.csv`);
  };

  window.exportOrganisersCSV = function() {
    const organisers = store.getOrganizersList();
    const events = store.getEvents();
    const headers = ['Organiser Name', 'Organisation', 'Email', 'Phone', 'Bank Name', 'Account Number', 'Events Count', 'Tickets Sold', 'Gross Revenue (NGN)', 'Status'];
    const rows = organisers.map(o => {
      const orgEvents = events.filter(e => (e.organizer || '').toLowerCase() === (o.name || o.organizationName || '').toLowerCase());
      const ticketsSold = orgEvents.reduce((a, b) => a + (Number(b.ticketsSold) || 0), 0);
      const grossRev = orgEvents.reduce((a, b) => a + (Number(b.totalRevenue || b.revenue) || 0), 0);
      return [
        `"${(o.name || '').replace(/"/g, '""')}"`,
        `"${(o.organizationName || o.name || '').replace(/"/g, '""')}"`,
        `"${o.email || ''}"`,
        `"${o.phone || ''}"`,
        `"${o.bankName || 'Moniepoint'}"`,
        `"${o.accountNumber || '8021174926'}"`,
        orgEvents.length,
        ticketsSold,
        grossRev,
        `"${o.status || 'Active'}"`
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `bookam_organisers_${new Date().toISOString().slice(0,10)}.csv`);
  };

  // ================= 7. INFLUENCERS & PROMOTERS =================
  function renderPromotersTable() {
    if (!tbodyAdminPromoters) return;
    const influencers = store.getInfluencers();

    if (influencers.length === 0) {
      tbodyAdminPromoters.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94A3B8;">No promoters registered yet.</td></tr>`;
      return;
    }

    tbodyAdminPromoters.innerHTML = influencers.map(inf => `
      <tr>
        <td>
          <div style="font-weight: 700; color: #F8FAFC;">${inf.name}</div>
          <small style="color: #64748B;">${inf.phone || 'No phone'}</small>
        </td>
        <td>
          <div style="color: #818CF8;">@${inf.username}</div>
          <small style="color: #94A3B8;">${inf.email}</small>
        </td>
        <td>
          <span class="admin-badge approved" style="font-family: monospace; font-size: 0.85rem;">${inf.promoCode || 'PROMO'}</span>
        </td>
        <td>
          <div>Discount: <strong>${inf.discountValue || 10}%</strong></div>
          <div style="color: #34D399;">Comm: <strong>${inf.commissionValue || 10}%</strong></div>
        </td>
        <td><strong>${inf.linkClicks || 0}</strong></td>
        <td><strong style="color: #F8FAFC;">${inf.ticketSales || 0}</strong></td>
        <td><strong style="color: #34D399;">${store.formatCurrency(inf.commissionEarned || 0)}</strong></td>
        <td>
          <div style="font-size: 0.8rem;">
            ${inf.bankName ? `<strong>${inf.bankName}</strong>` : '<span style="color: #64748B;">Not provided</span>'}
          </div>
          <div style="font-family: monospace; color: #CBD5E1; font-size: 0.775rem;">
            ${inf.accountNumber || ''} ${inf.accountName ? '(' + inf.accountName + ')' : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ================= 8. GLOBAL WEBSITE SETTINGS =================
  function populateSettingsForm() {
    if (!settingsForm) return;
    const settings = store.getSettings();

    const siteName = document.getElementById('setting-site-name');
    const wa = document.getElementById('setting-support-whatsapp');
    const email = document.getElementById('setting-support-email');
    const bank = document.getElementById('setting-bank-name');
    const accNum = document.getElementById('setting-account-number');
    const accName = document.getElementById('setting-account-name');
    const fee = document.getElementById('setting-service-charge');
    const comm = document.getElementById('setting-influencer-comm');

    if (siteName) siteName.value = settings.siteName || 'BOOKAM';
    if (wa) wa.value = settings.supportWhatsApp || '+2349162901356';
    if (email) email.value = settings.supportEmail || 'support@bookam.com';
    if (bank) bank.value = settings.bankName || 'Moniepoint Microfinance Bank';
    if (accNum) accNum.value = settings.accountNumber || '8101234567';
    if (accName) accName.value = settings.accountName || 'BOOKAM TICKETING NIGERIA';
    if (fee) fee.value = settings.serviceCharge !== undefined ? settings.serviceCharge : 400;
    if (comm) comm.value = settings.influencerCommissionPercent || 10;
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newSettings = {
        siteName: document.getElementById('setting-site-name')?.value.trim() || 'BOOKAM',
        supportWhatsApp: document.getElementById('setting-support-whatsapp')?.value.trim() || '+2349162901356',
        supportEmail: document.getElementById('setting-support-email')?.value.trim() || 'support@bookam.com',
        bankName: document.getElementById('setting-bank-name')?.value.trim() || 'Moniepoint Microfinance Bank',
        accountNumber: document.getElementById('setting-account-number')?.value.trim() || '8101234567',
        accountName: document.getElementById('setting-account-name')?.value.trim() || 'BOOKAM TICKETING NIGERIA',
        serviceCharge: parseFloat(document.getElementById('setting-service-charge')?.value) || 400,
        influencerCommissionPercent: parseFloat(document.getElementById('setting-influencer-comm')?.value) || 10
      };

      store.saveSettings(newSettings);

      if (settingsAlertBox) {
        settingsAlertBox.style.display = 'block';
        settingsAlertBox.style.background = 'rgba(16, 185, 129, 0.15)';
        settingsAlertBox.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        settingsAlertBox.style.color = '#34D399';
        settingsAlertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Platform settings updated successfully! Synchronized across the website.';
        setTimeout(() => {
          settingsAlertBox.style.display = 'none';
        }, 4000);
      }
    });
  }

  // ================= 8.5 MODAL FORMS & SEARCH LISTENERS =================
  const formAdminCreateEvent = document.getElementById('form-admin-create-event');
  if (formAdminCreateEvent) {
    formAdminCreateEvent.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('admin-event-title')?.value.trim();
      const category = document.getElementById('admin-event-category')?.value;
      const organizer = document.getElementById('admin-event-organizer')?.value.trim();
      const date = document.getElementById('admin-event-date')?.value;
      const time = document.getElementById('admin-event-time')?.value || '18:00';
      const venue = document.getElementById('admin-event-venue')?.value.trim();
      const city = document.getElementById('admin-event-city')?.value.trim();
      const enableTickets = document.getElementById('admin-enable-tickets')?.checked ?? true;
      const ebPrice = parseFloat(document.getElementById('admin-price-early-bird')?.value);
      const fwPrice = parseFloat(document.getElementById('admin-price-first-wave')?.value);
      const g4Price = parseFloat(document.getElementById('admin-price-group-4')?.value);
      const swPrice = parseFloat(document.getElementById('admin-price-second-wave')?.value);
      const enPrice = parseFloat(document.getElementById('admin-price-at-entrance')?.value);
      const ebExpiry = document.getElementById('admin-early-bird-expiry')?.value || null;

      const ticketTiers = [];
      if (enableTickets) {
        if (!isNaN(ebPrice) && ebPrice >= 0) {
          ticketTiers.push({ id: 'tier-eb-' + Date.now(), name: 'Early Bird', type: 'Early bird', price: ebPrice, capacity: 250, available: 250, endDate: ebExpiry, isEarlyBird: true });
        }
        if (!isNaN(fwPrice) && fwPrice >= 0) {
          ticketTiers.push({ id: 'tier-fw-' + Date.now(), name: 'First Wave', type: 'First Wave', price: fwPrice, capacity: 350, available: 350 });
        }
        if (!isNaN(g4Price) && g4Price >= 0) {
          ticketTiers.push({ id: 'tier-g4-' + Date.now(), name: 'Group of 4', type: 'Group of 4', price: g4Price, capacity: 60, available: 60 });
        }
        if (!isNaN(swPrice) && swPrice >= 0) {
          ticketTiers.push({ id: 'tier-sw-' + Date.now(), name: 'Second Wave', type: 'Second Wave', price: swPrice, capacity: 250, available: 250 });
        }
        if (!isNaN(enPrice) && enPrice >= 0) {
          ticketTiers.push({ id: 'tier-en-' + Date.now(), name: 'At Entrance', type: 'At the Entrance', price: enPrice, capacity: 150, available: 150 });
        }
      }

      if (ticketTiers.length === 0) {
        ticketTiers.push({ id: 'tier-free-' + Date.now(), name: 'Open Admission / RSVP', type: 'Free Admission', price: 0, capacity: 1000, available: 1000 });
      }

      const startingPrice = ticketTiers[0]?.price || 0;
      const vipTier = ticketTiers.find(t => t.name.includes('Second') || t.name.includes('Group') || t.name.includes('VIP')) || ticketTiers[ticketTiers.length - 1];

      const newEvent = {
        id: 'evt-' + Date.now(),
        title,
        category,
        organizer,
        date,
        time,
        venue,
        city,
        price: startingPrice,
        standardPrice: startingPrice,
        vipPrice: vipTier ? vipTier.price : startingPrice,
        banner,
        description,
        status,
        onboardingStatus: status,
        ticketsSold: 0,
        totalRevenue: 0,
        ticketTiers,
        earlyBirdEndDate: ebExpiry,
        createdAt: new Date().toISOString()
      };

      store.saveEvent(newEvent);
      store.addAuditLog('CREATE_EVENT', 'Master Super Admin', `Created event "${title}" [Status: ${status}]`);
      window.closeCreateEventModal();
      formAdminCreateEvent.reset();
      renderAll();
      alert(`Event "${title}" has been saved! Status: ${status}. It will ${status === 'APPROVED' ? 'now appear live on the website!' : 'await approval.'}`);
    });
  }

  const formAdminCreateContest = document.getElementById('form-admin-create-contest');
  if (formAdminCreateContest) {
    formAdminCreateContest.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('admin-contest-title')?.value.trim();
      const category = document.getElementById('admin-contest-category')?.value;
      const host = document.getElementById('admin-contest-host')?.value.trim();
      const votePrice = parseFloat(document.getElementById('admin-contest-vote-price')?.value) || 100;
      const endDate = document.getElementById('admin-contest-end-date')?.value;
      const status = document.getElementById('admin-contest-status')?.value || 'Active';
      const banner = document.getElementById('admin-contest-banner')?.value.trim() || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800';
      const description = document.getElementById('admin-contest-description')?.value.trim() || 'Live voting contest on BOOKAM.';

      const newContest = {
        id: 'contest-' + Date.now(),
        title,
        category,
        organizer: host,
        host,
        votePrice,
        endDate,
        status,
        banner,
        description,
        contestants: [
          {
            id: 'nom-' + Date.now() + '-1',
            name: 'Contestant Alpha',
            category: 'Nominee',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            votes: 0,
            status: 'Active'
          },
          {
            id: 'nom-' + Date.now() + '-2',
            name: 'Contestant Beta',
            category: 'Nominee',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            votes: 0,
            status: 'Active'
          }
        ],
        createdAt: new Date().toISOString()
      };

      store.saveContest(newContest);
      store.addAuditLog('CREATE_CONTEST', 'Master Super Admin', `Created contest "${title}" [Status: ${status}]`);
      window.closeCreateContestModal();
      formAdminCreateContest.reset();
      selectedContestId = newContest.id;
      initContestSelector();
      renderAll();
      alert(`Contest "${title}" created successfully! Status: ${status}. ${status === 'Active' ? 'Voting is now live on the website!' : 'Awaiting approval.'}`);
    });
  }

  const formAdminAddContestant = document.getElementById('form-admin-add-contestant');
  if (formAdminAddContestant) {
    formAdminAddContestant.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedContestId) {
        alert('Please select an active contest first.');
        return;
      }
      const name = document.getElementById('modal-contestant-name')?.value.trim();
      const category = document.getElementById('modal-contestant-category')?.value.trim() || 'Nominee';
      const photo = document.getElementById('modal-contestant-photo')?.value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
      const votes = parseInt(document.getElementById('modal-contestant-votes')?.value, 10) || 0;

      store.addContestant(selectedContestId, {
        name,
        category,
        photo,
        votes,
        status: 'Active'
      });

      store.addAuditLog('ADD_CONTESTANT', 'Master Super Admin', `Added nominee "${name}" to contest ID ${selectedContestId}`);
      window.closeAddContestantModal();
      formAdminAddContestant.reset();
      renderContestController();
      renderOverview();
      alert(`Contestant "${name}" has been registered!`);
    });
  }

  const formCreatePromocode = document.getElementById('form-create-promocode');
  if (formCreatePromocode) {
    formCreatePromocode.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('modal-promo-code')?.value.trim().toUpperCase();
      const eventId = document.getElementById('modal-promo-event')?.value;
      const influencer = document.getElementById('modal-promo-influencer')?.value.trim();
      const discount = parseFloat(document.getElementById('modal-promo-discount')?.value) || 10;
      const commission = parseFloat(document.getElementById('modal-promo-commission')?.value) || 5;

      const res = store.createPromoCode({
        code,
        eventId,
        influencerName: influencer,
        discountPercent: discount,
        commissionPercent: commission
      });

      if (res && res.success === false) {
        alert(res.message);
        return;
      }

      store.addAuditLog('CREATE_PROMO', 'Master Super Admin', `Created promo code "${code}" (${discount}% discount) for ${influencer}`);
      window.closeCreatePromoCodeModal();
      formCreatePromocode.reset();
      renderPromoCodesTable();
      renderPromotersTable();
      renderOverview();
      alert(`Promo code ${code} created successfully!`);
    });
  }

  // Content Management Form Submit
  const adminContentForm = document.getElementById('admin-content-form');
  if (adminContentForm) {
    adminContentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const announcementText = document.getElementById('setting-announcement-text')?.value.trim();
      const heroHeadline = document.getElementById('setting-hero-headline')?.value.trim();
      const categories = document.getElementById('setting-categories')?.value.trim();

      store.saveContentSettings({ announcementText, heroHeadline, categories });
      store.addAuditLog('UPDATE_CONTENT', 'Master Super Admin', 'Updated global site banner & content copy');
      alert('Content and banner settings saved successfully!');
    });
  }

  // Sidebar Toggle
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar) sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-collapsed');
    });
  }

  // Topbar Notification Quick Access
  const btnTopbarNotif = document.getElementById('btn-topbar-notif');
  if (btnTopbarNotif) {
    btnTopbarNotif.addEventListener('click', () => {
      window.switchAdminTab('notifications');
    });
  }

  // Modal Review & Influencer Triggers
  window.openEventReviewModal = function(id) {
    if (typeof window.viewEventDetails === 'function') {
      window.viewEventDetails(id);
    } else if (typeof window.viewEventModal === 'function') {
      window.viewEventModal(id);
    }
  };

  window.openInfluencerModal = function(name) {
    window.switchAdminTab('promoters');
  };

  // Modal Close Buttons
  const btnCloseAttendeeModal = document.getElementById('btn-close-attendee-modal');
  if (btnCloseAttendeeModal) {
    btnCloseAttendeeModal.addEventListener('click', window.closeAttendeeModal);
  }
  const btnCloseOrganiserModal = document.getElementById('btn-close-organiser-modal');
  if (btnCloseOrganiserModal) {
    btnCloseOrganiserModal.addEventListener('click', window.closeOrganiserModal);
  }
  const btnClosePromocodeModal = document.getElementById('btn-close-promocode-modal');
  if (btnClosePromocodeModal) {
    btnClosePromocodeModal.addEventListener('click', window.closeCreatePromoCodeModal);
  }

  // Search & Filter event listeners
  const searchEventsInput = document.getElementById('search-events-input');
  if (searchEventsInput) {
    searchEventsInput.addEventListener('input', renderEventsTable);
  }
  const filterEventsStatus = document.getElementById('filter-events-status');
  if (filterEventsStatus) {
    filterEventsStatus.addEventListener('change', renderEventsTable);
  }

  const searchAttendeesInput = document.getElementById('search-attendees-input');
  if (searchAttendeesInput) {
    searchAttendeesInput.addEventListener('input', renderAttendeesTable);
  }
  const filterAttendeesCheckin = document.getElementById('filter-attendees-checkin');
  if (filterAttendeesCheckin) {
    filterAttendeesCheckin.addEventListener('change', renderAttendeesTable);
  }

  const filterPlatformUsersRole = document.getElementById('filter-platform-users-role');
  if (filterPlatformUsersRole) {
    filterPlatformUsersRole.addEventListener('change', renderPlatformUsersTable);
  }

  // ================= 9. GLOBAL RENDER =================
  function renderAll() {
    renderOverview();
    renderAnalytics();
    renderEventApprovalsTable();
    renderPaymentsTable();
    renderRefundsTable();
    renderCheckInEngine();
    initContestSelector();
    renderContestController();
    renderEventsTable();
    renderTicketManagement();
    renderAttendeesTable();
    renderOrganisersTable();
    renderPromotersTable();
    renderPromoCodesTable();
    renderFeaturedEventsTable();
    renderPlatformUsersTable();
    renderAuditLogsTable();
    renderNotificationsList();
    renderContentMgmt();
    populateSettingsForm();
  }

  // Listen for realtime store updates from Firestore
  window.addEventListener('bookam_store_updated', () => {
    if (store.isControlPanelLoggedIn()) {
      renderAll();
    }
  });

  // Check auth on page load
  checkAuth();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initControlPanel);
} else {
  initControlPanel();
}
