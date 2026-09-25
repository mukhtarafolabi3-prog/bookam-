/**
 * BOOKAM - Contest Details & Live Voting Logic
 */

import './store.js';

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  // Get Contest ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const contestId = urlParams.get('id') || 'cnt-001';
  const autoContestantParam = urlParams.get('contestant') || urlParams.get('cst') || urlParams.get('code');

  let currentContest = store.getContestById(contestId);
  if (!currentContest) {
    const activeList = store.getContests();
    currentContest = activeList[0];
  }

  let selectedContestant = null;
  let activeShareContestant = null;
  let lastVoteResult = null;
  let voteQuantity = 10;
  let selectedPaymentMethod = 'Bank Transfer';

  // DOM Elements
  const cntBgImg = document.getElementById('cnt-bg-img');
  const cntBanner = document.getElementById('cnt-banner');
  const cntCategory = document.getElementById('cnt-category');
  const cntStatus = document.getElementById('cnt-status');
  const cntTitle = document.getElementById('cnt-title');
  const cntDesc = document.getElementById('cnt-desc');
  const cntVotePrice = document.getElementById('cnt-vote-price');
  const cntTotalVotes = document.getElementById('cnt-total-votes');
  const cntNomineeCount = document.getElementById('cnt-nominee-count');
  const cntNomineeBadge = document.getElementById('cnt-nominee-badge');
  const cntCountdownTimer = document.getElementById('cnt-countdown-timer');

  // Tabs & Views
  const tabBtnContestants = document.getElementById('tab-btn-contestants');
  const tabBtnLeaderboard = document.getElementById('tab-btn-leaderboard');
  const viewContestants = document.getElementById('view-contestants');
  const viewLeaderboard = document.getElementById('view-leaderboard');

  const searchInput = document.getElementById('search-contestant');
  const sortSelect = document.getElementById('sort-contestant');
  const contestantsGrid = document.getElementById('contestants-grid');
  const podiumBox = document.getElementById('podium-box');
  const leaderboardTableBody = document.getElementById('leaderboard-table-body');
  const btnPrintLeaderboard = document.getElementById('btn-print-leaderboard');

  // Voting Modal Elements
  const votingModal = document.getElementById('voting-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const mdlImg = document.getElementById('mdl-contestant-img');
  const mdlCode = document.getElementById('mdl-contestant-code');
  const mdlName = document.getElementById('mdl-contestant-name');
  const mdlVotes = document.getElementById('mdl-contestant-votes');

  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyInput = document.getElementById('qty-input');
  const presetBtns = document.querySelectorAll('.preset-vote-btn');

  const sumQty = document.getElementById('sum-vote-qty');
  const sumUnit = document.getElementById('sum-vote-unit');
  const sumSubtotal = document.getElementById('sum-subtotal');
  const sumServiceCharge = document.getElementById('sum-service-charge');
  const sumTotal = document.getElementById('sum-total');

  const voterForm = document.getElementById('voter-form');
  const voterName = document.getElementById('voter-name');
  const voterEmail = document.getElementById('voter-email');
  const voterPhone = document.getElementById('voter-phone');

  const bankNameElem = document.getElementById('bank-name');
  const bankAccNameElem = document.getElementById('bank-account-name');
  const bankAccNumElem = document.getElementById('bank-account-number');
  const btnCopyAccount = document.getElementById('btn-copy-account');
  const bankDetailsBox = document.getElementById('bank-details-box');

  // Success Modal Elements
  const voteSuccessModal = document.getElementById('vote-success-modal');
  const successMsg = document.getElementById('success-msg');
  const successCloseBtn = document.getElementById('success-close-btn');
  const rcptRef = document.getElementById('rcpt-ref');
  const rcptContestantName = document.getElementById('rcpt-contestant-name');
  const rcptContestantCode = document.getElementById('rcpt-contestant-code');
  const rcptVotes = document.getElementById('rcpt-votes');
  const rcptTotal = document.getElementById('rcpt-total');
  const rcptVoter = document.getElementById('rcpt-voter');
  const rcptDate = document.getElementById('rcpt-date');
  const btnShareVoteStatus = document.getElementById('btn-share-vote-status');
  const btnPrintReceipt = document.getElementById('btn-print-receipt');

  // Nominate Modal Elements
  const btnOpenNominateTop = document.getElementById('btn-open-nominate-top');
  const btnOpenNominate = document.getElementById('btn-open-nominate');
  const nominateModal = document.getElementById('nominate-modal');
  const nominateCloseBtn = document.getElementById('nominate-close-btn');
  const nominationForm = document.getElementById('nomination-form');

  // Share Modal Elements
  const shareModal = document.getElementById('share-modal');
  const shareCloseBtn = document.getElementById('share-close-btn');
  const shareCstImg = document.getElementById('share-cst-img');
  const shareCstCode = document.getElementById('share-cst-code');
  const shareCstName = document.getElementById('share-cst-name');
  const shareUrlInput = document.getElementById('share-url-input');
  const btnCopyShareUrl = document.getElementById('btn-copy-share-url');
  const btnShareWhatsApp = document.getElementById('btn-share-whatsapp');
  const btnShareTwitter = document.getElementById('btn-share-twitter');

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const menu = document.querySelector('.nav-menu');
      if (menu) menu.classList.toggle('active');
    });
  }

  // Populate Organizer Bank Details
  function loadBankDetails() {
    const org = store.getOrganizerInfo();
    if (org) {
      if (bankNameElem) bankNameElem.textContent = org.bankName || 'Moniepoint';
      if (bankAccNameElem) bankAccNameElem.textContent = org.accountName || 'KAIWE DIGITAL';
      if (bankAccNumElem) bankAccNumElem.textContent = org.accountNumber || '8021174926';
    }
  }

  // Live Countdown Ticker
  let countdownInterval = null;
  function startCountdownTimer() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (!cntCountdownTimer || !currentContest) return;

    function update() {
      if (!currentContest.endDate) {
        cntCountdownTimer.textContent = 'Active Contest';
        return;
      }

      const end = new Date(currentContest.endDate + 'T23:59:59').getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        cntCountdownTimer.innerHTML = '<span style="color: #ef4444;"><i class="fa-solid fa-flag-checkered"></i> Voting Concluded</span>';
        if (cntStatus) {
          cntStatus.textContent = 'Concluded';
          cntStatus.style.background = 'rgba(239, 68, 68, 0.25)';
          cntStatus.style.color = '#fca5a5';
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      cntCountdownTimer.textContent = `${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  // Render Contest Header Info
  function renderHeader() {
    if (!currentContest) return;

    if (cntBgImg) cntBgImg.src = currentContest.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
    if (cntBanner) cntBanner.src = currentContest.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
    if (cntCategory) cntCategory.textContent = currentContest.category || 'Contest';
    if (cntStatus) cntStatus.textContent = currentContest.status || 'Active';
    if (cntTitle) cntTitle.textContent = currentContest.title || 'Contest Title';
    if (cntDesc) cntDesc.textContent = currentContest.description || '';

    const votePrice = currentContest.votePrice || 100;
    if (cntVotePrice) cntVotePrice.textContent = store.formatCurrency(votePrice);

    const contestants = currentContest.contestants || [];
    const totalVotes = contestants.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);

    if (cntTotalVotes) cntTotalVotes.textContent = totalVotes.toLocaleString();
    if (cntNomineeCount) cntNomineeCount.textContent = contestants.length;
    if (cntNomineeBadge) cntNomineeBadge.textContent = contestants.length;

    startCountdownTimer();
  }

  // Render Contestants Grid
  function renderContestants() {
    if (!contestantsGrid || !currentContest) return;

    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const sortMode = sortSelect ? sortSelect.value : 'votes';
    let contestants = [...(currentContest.contestants || [])];

    // Filter
    if (searchTerm) {
      contestants = contestants.filter(c => 
        (c.name && c.name.toLowerCase().includes(searchTerm)) ||
        (c.code && String(c.code).toLowerCase().includes(searchTerm)) ||
        (c.bio && c.bio.toLowerCase().includes(searchTerm))
      );
    }

    // Sort
    if (sortMode === 'code') {
      contestants.sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')));
    } else if (sortMode === 'name') {
      contestants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      // Default: Most Votes
      contestants.sort((a, b) => (parseInt(b.votes) || 0) - (parseInt(a.votes) || 0));
    }

    // Calculate ranking against entire roster
    const allSorted = [...(currentContest.contestants || [])].sort((a, b) => (parseInt(b.votes) || 0) - (parseInt(a.votes) || 0));
    const totalContestVotes = allSorted.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);

    if (contestants.length === 0) {
      contestantsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--gray-300);">
          <i class="fa-solid fa-users-slash" style="font-size: 2.5rem; color: var(--gray-400); margin-bottom: 0.75rem;"></i>
          <h4 style="font-weight: 800; color: var(--dark); margin-bottom: 0.35rem;">No Contestants Found</h4>
          <p style="color: var(--gray-500); font-size: 0.85rem; margin-bottom: 1.25rem;">Try adjusting your search criteria or register a new nominee.</p>
          <button onclick="document.getElementById('btn-open-nominate').click()" class="btn btn-outline btn-sm" style="color: var(--primary); border-color: var(--primary);">
            <i class="fa-solid fa-user-plus"></i> Register Nominee
          </button>
        </div>
      `;
      return;
    }

    const votePriceStr = store.formatCurrency(currentContest.votePrice || 100);

    contestantsGrid.innerHTML = contestants.map(c => {
      const rankIndex = allSorted.findIndex(item => item.id === c.id);
      const voteCount = parseInt(c.votes) || 0;
      const voteSharePct = totalContestVotes > 0 ? ((voteCount / totalContestVotes) * 100).toFixed(1) : '0.0';

      let rankBadgeHtml = '';
      if (rankIndex === 0) rankBadgeHtml = `<span class="contestant-rank-badge rank-1"><i class="fa-solid fa-crown"></i> 1st Place</span>`;
      else if (rankIndex === 1) rankBadgeHtml = `<span class="contestant-rank-badge rank-2"><i class="fa-solid fa-award"></i> 2nd Place</span>`;
      else if (rankIndex === 2) rankBadgeHtml = `<span class="contestant-rank-badge rank-3"><i class="fa-solid fa-medal"></i> 3rd Place</span>`;
      else if (rankIndex >= 0) rankBadgeHtml = `<span class="contestant-rank-badge rank-other">#${rankIndex + 1}</span>`;

      return `
        <div class="contestant-card" id="card-${c.id}" data-id="${c.id}" data-code="${c.code || ''}">
          <div class="contestant-photo-wrap">
            <img src="${c.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}" alt="${c.name}" class="contestant-photo" loading="lazy" />
            <span class="contestant-code-badge"><i class="fa-solid fa-hashtag"></i> ${c.code || '000'}</span>
            ${rankBadgeHtml}
          </div>

          <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--dark); margin: 0; line-height: 1.3;">
                ${c.name}
              </h3>
              <button class="btn-share-cst-trigger" data-contestant-id="${c.id}" style="background: none; border: none; color: var(--gray-400); cursor: pointer; padding: 0.2rem;" title="Share voting link for ${c.name}">
                <i class="fa-solid fa-share-nodes"></i>
              </button>
            </div>

            <p style="font-size: 0.825rem; color: var(--gray-600); line-height: 1.45; margin-bottom: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${c.bio || 'Official contestant in ' + currentContest.title}
            </p>

            <!-- Progress Bar -->
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; font-size: 0.8rem;">
                <span style="color: var(--gray-600); font-weight: 600;">Current Votes:</span>
                <strong style="color: var(--primary); font-weight: 800;">${voteCount.toLocaleString()} <span style="font-size: 0.725rem; color: var(--gray-500);">(${voteSharePct}%)</span></strong>
              </div>
              <div style="width: 100%; height: 6px; background: var(--gray-200); border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.min(100, Math.max(3, parseFloat(voteSharePct)))}%; height: 100%; background: linear-gradient(90deg, var(--primary), #ec4899); border-radius: 9999px; transition: width 0.4s ease;"></div>
              </div>
            </div>

            <div style="margin-top: auto; display: flex; gap: 0.4rem;">
              <button class="btn btn-primary w-full btn-vote-trigger" data-contestant-id="${c.id}" style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 700; padding: 0.65rem;">
                <i class="fa-solid fa-check-to-slot"></i> Vote (${votePriceStr})
              </button>
              <button class="btn btn-outline btn-share-cst-trigger" data-contestant-id="${c.id}" style="padding: 0.65rem 0.75rem;" title="Share link">
                <i class="fa-solid fa-share-nodes"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach vote listeners
    document.querySelectorAll('.btn-vote-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cstId = e.currentTarget.getAttribute('data-contestant-id');
        openVotingModal(cstId);
      });
    });

    // Attach share listeners
    document.querySelectorAll('.btn-share-cst-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cstId = e.currentTarget.getAttribute('data-contestant-id');
        openShareModal(cstId);
      });
    });
  }

  // Render Leaderboard View
  function renderLeaderboard() {
    if (!currentContest) return;

    const sorted = [...(currentContest.contestants || [])].sort((a, b) => (parseInt(b.votes) || 0) - (parseInt(a.votes) || 0));
    const totalVotes = sorted.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);

    // Podium (Top 3)
    if (podiumBox) {
      if (sorted.length < 1) {
        podiumBox.style.display = 'none';
      } else {
        podiumBox.style.display = 'flex';
        const p1 = sorted[0];
        const p2 = sorted[1];
        const p3 = sorted[2];

        podiumBox.innerHTML = `
          ${p2 ? `
            <div style="text-align: center; width: 140px;">
              <div style="position: relative; width: 80px; height: 80px; margin: 0 auto 0.5rem auto;">
                <img src="${p2.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid #94a3b8;" />
                <span style="position: absolute; bottom: -6px; right: -6px; background: #94a3b8; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">2</span>
              </div>
              <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--dark); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p2.name}</h4>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">${(p2.votes || 0).toLocaleString()} votes</div>
              <div style="background: #94a3b8; color: #fff; padding: 0.75rem 0.5rem 0.5rem 0.5rem; border-radius: 8px 8px 0 0; margin-top: 0.5rem; font-size: 0.8rem; font-weight: 800;">2ND PLACE</div>
            </div>
          ` : ''}

          ${p1 ? `
            <div style="text-align: center; width: 160px; margin-bottom: 0.5rem;">
              <div style="position: relative; width: 100px; height: 100px; margin: 0 auto 0.5rem auto;">
                <img src="${p1.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);" />
                <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); color: #f59e0b; font-size: 1.4rem;"><i class="fa-solid fa-crown"></i></span>
                <span style="position: absolute; bottom: -6px; right: -6px; background: #f59e0b; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800;">1</span>
              </div>
              <h4 style="font-size: 1rem; font-weight: 800; color: var(--dark); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p1.name}</h4>
              <div style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">${(p1.votes || 0).toLocaleString()} votes</div>
              <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 1.25rem 0.5rem 0.5rem 0.5rem; border-radius: 8px 8px 0 0; margin-top: 0.5rem; font-size: 0.85rem; font-weight: 800;">1ST PLACE</div>
            </div>
          ` : ''}

          ${p3 ? `
            <div style="text-align: center; width: 140px;">
              <div style="position: relative; width: 80px; height: 80px; margin: 0 auto 0.5rem auto;">
                <img src="${p3.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid #b45309;" />
                <span style="position: absolute; bottom: -6px; right: -6px; background: #b45309; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">3</span>
              </div>
              <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--dark); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p3.name}</h4>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">${(p3.votes || 0).toLocaleString()} votes</div>
              <div style="background: #b45309; color: #fff; padding: 0.5rem 0.5rem 0.5rem 0.5rem; border-radius: 8px 8px 0 0; margin-top: 0.5rem; font-size: 0.8rem; font-weight: 800;">3RD PLACE</div>
            </div>
          ` : ''}
        `;
      }
    }

    // Ranked Table
    if (leaderboardTableBody) {
      if (sorted.length === 0) {
        leaderboardTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem;">No contestants available.</td></tr>`;
        return;
      }

      leaderboardTableBody.innerHTML = sorted.map((c, idx) => {
        const pct = totalVotes > 0 ? ((c.votes || 0) / totalVotes * 100).toFixed(1) : '0.0';
        return `
          <tr style="border-bottom: 1px solid var(--gray-200); font-size: 0.9rem;">
            <td style="padding: 1rem; font-weight: 800; color: ${idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--dark)'}; font-size: 1rem;">
              #${idx + 1}
            </td>
            <td style="padding: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${c.photo}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;" />
                <div>
                  <div style="font-weight: 800; color: var(--dark);">${c.name}</div>
                  <div style="font-size: 0.75rem; color: var(--gray-500);">${c.bio ? c.bio.slice(0, 45) + '...' : 'Contestant'}</div>
                </div>
              </div>
            </td>
            <td style="padding: 1rem; font-weight: 700; color: var(--gray-600); font-family: monospace;">${c.code || '000'}</td>
            <td style="padding: 1rem; text-align: right; font-weight: 800; color: var(--primary); font-size: 1.05rem;">
              ${(c.votes || 0).toLocaleString()}
            </td>
            <td style="padding: 1rem; text-align: right; font-weight: 700; color: var(--gray-600);">
              ${pct}%
            </td>
            <td style="padding: 1rem; text-align: center;">
              <div style="display: flex; gap: 0.35rem; justify-content: center;">
                <button class="btn btn-primary btn-sm btn-vote-trigger" data-contestant-id="${c.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                  <i class="fa-solid fa-vote-yea"></i> Vote
                </button>
                <button class="btn btn-outline btn-sm btn-share-cst-trigger" data-contestant-id="${c.id}" style="padding: 0.35rem 0.5rem;" title="Share link">
                  <i class="fa-solid fa-share-nodes"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Re-attach listeners in table
      leaderboardTableBody.querySelectorAll('.btn-vote-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cstId = e.currentTarget.getAttribute('data-contestant-id');
          openVotingModal(cstId);
        });
      });

      leaderboardTableBody.querySelectorAll('.btn-share-cst-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cstId = e.currentTarget.getAttribute('data-contestant-id');
          openShareModal(cstId);
        });
      });
    }
  }

  // Open Voting Modal
  function openVotingModal(contestantId) {
    if (!currentContest) return;
    const contestants = currentContest.contestants || [];
    selectedContestant = contestants.find(c => c.id === contestantId);
    if (!selectedContestant) return;

    if (mdlImg) mdlImg.src = selectedContestant.photo;
    if (mdlCode) mdlCode.textContent = `CODE: ${selectedContestant.code || '000'}`;
    if (mdlName) mdlName.textContent = selectedContestant.name;
    if (mdlVotes) mdlVotes.textContent = `Current Votes: ${(selectedContestant.votes || 0).toLocaleString()}`;

    voteQuantity = 10;
    if (qtyInput) qtyInput.value = voteQuantity;

    // Reset presets
    presetBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-qty') === '10');
    });

    updateOrderSummary();

    if (votingModal) votingModal.classList.add('active');
  }

  function closeVotingModal() {
    if (votingModal) votingModal.classList.remove('active');
  }

  // Open Share Modal
  function openShareModal(contestantId) {
    if (!currentContest) return;
    const contestants = currentContest.contestants || [];
    activeShareContestant = contestants.find(c => c.id === contestantId);
    if (!activeShareContestant) return;

    if (shareCstImg) shareCstImg.src = activeShareContestant.photo;
    if (shareCstCode) shareCstCode.textContent = `CODE: ${activeShareContestant.code || '000'}`;
    if (shareCstName) shareCstName.textContent = activeShareContestant.name;

    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${currentContest.id}&contestant=${activeShareContestant.id}`;
    if (shareUrlInput) shareUrlInput.value = shareUrl;

    if (shareModal) shareModal.classList.add('active');
  }

  function closeShareModal() {
    if (shareModal) shareModal.classList.remove('active');
  }

  // Update Order Calculation
  function updateOrderSummary() {
    if (!currentContest) return;
    const unitPrice = currentContest.votePrice || 100;
    const qty = parseInt(qtyInput ? qtyInput.value : 10) || 1;
    voteQuantity = qty;

    const subtotal = unitPrice * qty;
    const serviceCharge = +(subtotal * 0.05).toFixed(2);
    const total = subtotal + serviceCharge;

    if (sumQty) sumQty.textContent = qty.toLocaleString();
    if (sumUnit) sumUnit.textContent = store.formatCurrency(unitPrice);
    if (sumSubtotal) sumSubtotal.textContent = store.formatCurrency(subtotal);
    if (sumServiceCharge) sumServiceCharge.textContent = store.formatCurrency(serviceCharge);
    if (sumTotal) sumTotal.textContent = store.formatCurrency(total);
  }

  // Preset Buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const q = parseInt(btn.getAttribute('data-qty') || 10);
      if (qtyInput) qtyInput.value = q;
      updateOrderSummary();
    });
  });

  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        updateOrderSummary();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
      updateOrderSummary();
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < 1) qtyInput.value = 1;
      updateOrderSummary();
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVotingModal);
  if (shareCloseBtn) shareCloseBtn.addEventListener('click', closeShareModal);

  // Payment Method Selection
  document.querySelectorAll('input[name="vote-pay-method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPaymentMethod = e.target.value;
      if (bankDetailsBox) {
        bankDetailsBox.style.display = selectedPaymentMethod === 'Bank Transfer' ? 'block' : 'none';
      }
    });
  });

  // Copy Account Number
  if (btnCopyAccount) {
    btnCopyAccount.addEventListener('click', () => {
      const acc = bankAccNumElem ? bankAccNumElem.textContent : '8021174926';
      navigator.clipboard.writeText(acc.replace(/\s+/g, '')).then(() => {
        const orig = btnCopyAccount.innerHTML;
        btnCopyAccount.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { btnCopyAccount.innerHTML = orig; }, 2000);
      });
    });
  }

  // Copy Share Link
  if (btnCopyShareUrl) {
    btnCopyShareUrl.addEventListener('click', () => {
      const url = shareUrlInput ? shareUrlInput.value : '';
      navigator.clipboard.writeText(url).then(() => {
        const orig = btnCopyShareUrl.innerHTML;
        btnCopyShareUrl.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { btnCopyShareUrl.innerHTML = orig; }, 2000);
      });
    });
  }

  // Share to WhatsApp
  if (btnShareWhatsApp) {
    btnShareWhatsApp.addEventListener('click', () => {
      if (!activeShareContestant || !currentContest) return;
      const url = shareUrlInput ? shareUrlInput.value : '';
      const text = encodeURIComponent(
        `🏆 Support and Vote for *${activeShareContestant.name}* (Code: *${activeShareContestant.code}*) in "${currentContest.title}" on BOOKAM!\n\n` +
        `👉 Click here to cast your official votes: ${url}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  // Share to Twitter/X
  if (btnShareTwitter) {
    btnShareTwitter.addEventListener('click', () => {
      if (!activeShareContestant || !currentContest) return;
      const url = shareUrlInput ? shareUrlInput.value : '';
      const text = encodeURIComponent(`Vote for ${activeShareContestant.name} (Code: ${activeShareContestant.code}) in ${currentContest.title} on @BOOKAM! ${url}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    });
  }

  // Submit Vote Form
  if (voterForm) {
    voterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedContestant || !currentContest) return;

      const nameVal = voterName.value.trim();
      const emailVal = voterEmail.value.trim();
      const phoneVal = voterPhone.value.trim();

      if (!nameVal || !emailVal || !phoneVal) {
        alert('Please fill in your name, email, and phone number.');
        return;
      }

      try {
        const result = store.castVotes({
          contestId: currentContest.id,
          contestantId: selectedContestant.id,
          voteCount: voteQuantity,
          voterName: nameVal,
          voterEmail: emailVal,
          voterPhone: phoneVal,
          paymentMethod: selectedPaymentMethod
        });

        lastVoteResult = result;
        closeVotingModal();

        // Refresh state
        currentContest = store.getContestById(currentContest.id);
        renderHeader();
        renderContestants();
        renderLeaderboard();

        // Populate Digital Receipt Card
        if (rcptRef) rcptRef.textContent = result.paymentRecord.id;
        if (rcptContestantName) rcptContestantName.textContent = selectedContestant.name;
        if (rcptContestantCode) rcptContestantCode.textContent = `CODE: ${selectedContestant.code || '000'}`;
        if (rcptVotes) rcptVotes.textContent = `${voteQuantity.toLocaleString()} Verified Votes`;
        if (rcptTotal) rcptTotal.textContent = store.formatCurrency(result.paymentRecord.total);
        if (rcptVoter) rcptVoter.textContent = nameVal;
        if (rcptDate) rcptDate.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Show Success Modal
        if (successMsg) {
          successMsg.textContent = `You have successfully cast ${voteQuantity.toLocaleString()} verified vote(s) for ${selectedContestant.name}! The live leaderboard has been updated.`;
        }
        if (voteSuccessModal) voteSuccessModal.classList.add('active');

      } catch (err) {
        alert('Voting error: ' + err.message);
      }
    });
  }

  // Share Vote Status on WhatsApp
  if (btnShareVoteStatus) {
    btnShareVoteStatus.addEventListener('click', () => {
      if (!lastVoteResult || !selectedContestant || !currentContest) return;
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${currentContest.id}&contestant=${selectedContestant.id}`;
      const text = encodeURIComponent(
        `🎉 I just cast *${lastVoteResult.paymentRecord.voteCount} verified votes* for *${selectedContestant.name}* (Code: *${selectedContestant.code}*) in "${currentContest.title}" on BOOKAM!\n\n` +
        `👉 Support ${selectedContestant.name} too: ${shareUrl}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  // Print Receipt
  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnPrintLeaderboard) {
    btnPrintLeaderboard.addEventListener('click', () => {
      window.print();
    });
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      if (voteSuccessModal) voteSuccessModal.classList.remove('active');
    });
  }

  // Nominate Modal Trigger & Handling
  const openNominateHandler = () => {
    if (nominateModal) nominateModal.classList.add('active');
  };
  if (btnOpenNominateTop) btnOpenNominateTop.addEventListener('click', openNominateHandler);
  if (btnOpenNominate) btnOpenNominate.addEventListener('click', openNominateHandler);

  if (nominateCloseBtn) {
    nominateCloseBtn.addEventListener('click', () => {
      if (nominateModal) nominateModal.classList.remove('active');
    });
  }

  if (nominationForm) {
    nominationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentContest) return;

      const name = document.getElementById('nom-name').value.trim();
      const email = document.getElementById('nom-email').value.trim();
      const phone = document.getElementById('nom-phone').value.trim();
      const photo = document.getElementById('nom-photo').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
      const bio = document.getElementById('nom-bio').value.trim();
      const prefCode = document.getElementById('nom-pref-code').value.trim();

      store.saveNomination({
        contestId: currentContest.id,
        contestTitle: currentContest.title,
        name,
        email,
        phone,
        photo,
        bio,
        preferredCode: prefCode,
        status: 'Pending Review'
      });

      nominationForm.reset();
      if (nominateModal) nominateModal.classList.remove('active');
      alert(`Nomination for "${name}" submitted successfully!\n\nThe contest organizer will review and approve your registration shortly.`);
    });
  }

  // Tabs Switching
  if (tabBtnContestants) {
    tabBtnContestants.addEventListener('click', () => {
      tabBtnContestants.classList.add('btn-primary');
      tabBtnContestants.classList.remove('btn-outline');
      tabBtnContestants.style.color = '';

      tabBtnLeaderboard.classList.remove('btn-primary');
      tabBtnLeaderboard.classList.add('btn-outline');
      tabBtnLeaderboard.style.color = 'var(--gray-600)';

      if (viewContestants) viewContestants.style.display = 'block';
      if (viewLeaderboard) viewLeaderboard.style.display = 'none';
    });
  }

  if (tabBtnLeaderboard) {
    tabBtnLeaderboard.addEventListener('click', () => {
      tabBtnLeaderboard.classList.add('btn-primary');
      tabBtnLeaderboard.classList.remove('btn-outline');
      tabBtnLeaderboard.style.color = '';

      tabBtnContestants.classList.remove('btn-primary');
      tabBtnContestants.classList.add('btn-outline');
      tabBtnContestants.style.color = 'var(--gray-600)';

      if (viewContestants) viewContestants.style.display = 'none';
      if (viewLeaderboard) viewLeaderboard.style.display = 'block';

      renderLeaderboard();
    });
  }

  if (searchInput) searchInput.addEventListener('input', renderContestants);
  if (sortSelect) sortSelect.addEventListener('change', renderContestants);

  // Initial Load
  loadBankDetails();
  renderHeader();
  renderContestants();
  renderLeaderboard();

  // Auto-open voting modal if contestant was specified in URL
  if (autoContestantParam) {
    const targetCst = store.getContestantByIdOrCode(currentContest.id, autoContestantParam);
    if (targetCst) {
      setTimeout(() => {
        openVotingModal(targetCst.id);
        const cardElem = document.getElementById(`card-${targetCst.id}`);
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }

  // Listen for real-time updates from store
  window.addEventListener('bookam_store_updated', (e) => {
    if (!e.detail || e.detail.type === 'contests' || e.detail.type === 'nominations') {
      currentContest = store.getContestById(contestId);
      renderHeader();
      renderContestants();
      renderLeaderboard();
    }
  });
});
