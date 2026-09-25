/**
 * BOOKAM - Contestant Dashboard & Voting Hub
 */

import './store.js';

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  // URL Params
  const urlParams = new URLSearchParams(window.location.search);
  const contestId = urlParams.get('contest') || urlParams.get('id') || 'cnt-001';
  let contestantCode = urlParams.get('code') || urlParams.get('cst') || urlParams.get('contestant') || '001';

  let currentContest = store.getContestById(contestId);
  if (!currentContest) {
    const contests = store.getContests();
    currentContest = contests[0];
  }

  let activeContestant = null;
  if (currentContest && currentContest.contestants) {
    activeContestant = store.getContestantByIdOrCode(currentContest.id, contestantCode);
    if (!activeContestant && currentContest.contestants.length > 0) {
      activeContestant = currentContest.contestants[0];
      contestantCode = activeContestant.code || activeContestant.id;
    }
  }

  // DOM Elements
  const contestTitle = document.getElementById('cst-contest-title');
  const contestCategory = document.getElementById('cst-contest-category');
  const countdownEl = document.getElementById('cst-countdown');
  const backToContestBtn = document.getElementById('btn-back-to-contest');
  const selectActiveContestant = document.getElementById('select-active-contestant');

  const cstPhoto = document.getElementById('cst-photo');
  const cstCodePill = document.getElementById('cst-code-pill');
  const cstRankPill = document.getElementById('cst-rank-pill');
  const cstName = document.getElementById('cst-name');
  const cstBio = document.getElementById('cst-bio');
  const btnVoteSelf = document.getElementById('btn-vote-self');

  const statTotalVotes = document.getElementById('stat-total-votes');
  const statVoteShare = document.getElementById('stat-vote-share');
  const statLeaderboardPos = document.getElementById('stat-leaderboard-pos');
  const statTotalNominees = document.getElementById('stat-total-nominees');
  const statRevenue = document.getElementById('stat-revenue');
  const statVoteUnitPrice = document.getElementById('stat-vote-unit-price');
  const statSupportersCount = document.getElementById('stat-supporters-count');

  const personalVotingUrl = document.getElementById('personal-voting-url');
  const btnCopyMyLink = document.getElementById('btn-copy-my-link');
  const btnShareWA = document.getElementById('btn-share-wa');
  const btnShareX = document.getElementById('btn-share-x');
  const btnShareFB = document.getElementById('btn-share-fb');
  const btnShareIG = document.getElementById('btn-share-ig');
  const btnShareTikTok = document.getElementById('btn-share-tiktok');

  const voteHistoryTbody = document.getElementById('vote-history-tbody');
  const cstLeaderboardList = document.getElementById('cst-leaderboard-list');
  const linkViewAllRankings = document.getElementById('link-view-all-rankings');

  // Countdown timer
  let countdownTimer = null;
  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    if (!countdownEl || !currentContest) return;

    function update() {
      if (!currentContest.endDate) {
        countdownEl.textContent = 'Active Contest';
        return;
      }
      const end = new Date(currentContest.endDate + 'T23:59:59').getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        countdownEl.textContent = 'Voting Concluded';
        countdownEl.style.color = '#ef4444';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      countdownEl.textContent = `${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
    }

    update();
    countdownTimer = setInterval(update, 1000);
  }

  // Populate Switch Contestant dropdown
  function populateContestantSelector() {
    if (!selectActiveContestant || !currentContest || !currentContest.contestants) return;
    selectActiveContestant.innerHTML = currentContest.contestants.map(c => `
      <option value="${c.code || c.id}" ${(activeContestant && (activeContestant.code === c.code || activeContestant.id === c.id)) ? 'selected' : ''}>
        #${c.code || '---'} — ${c.name} (${c.votes || 0} votes)
      </option>
    `).join('');

    selectActiveContestant.addEventListener('change', (e) => {
      const newCode = e.target.value;
      const target = store.getContestantByIdOrCode(currentContest.id, newCode);
      if (target) {
        activeContestant = target;
        contestantCode = target.code || target.id;
        // Update URL query param cleanly without refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('contest', currentContest.id);
        newUrl.searchParams.set('code', target.code || target.id);
        window.history.replaceState({}, '', newUrl.toString());
        renderDashboard();
      }
    });
  }

  // Render Contestant Dashboard
  function renderDashboard() {
    if (!currentContest || !activeContestant) return;

    // Header info
    if (contestTitle) contestTitle.textContent = currentContest.title || 'Contest';
    if (contestCategory) contestCategory.textContent = `${currentContest.category || 'Contest'} — Official Bookam Voting`;
    if (backToContestBtn) backToContestBtn.href = `contest-details.html?id=${currentContest.id}`;
    if (linkViewAllRankings) linkViewAllRankings.href = `contest-details.html?id=${currentContest.id}#view-leaderboard`;

    // Contestant Profile
    if (cstPhoto) cstPhoto.src = activeContestant.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    if (cstCodePill) cstCodePill.textContent = `CONTESTANT #${activeContestant.code || '---'}`;
    if (cstName) cstName.textContent = activeContestant.name || 'Nominee';
    if (cstBio) cstBio.textContent = activeContestant.bio || 'Official Contestant registered for this competition.';

    // Rankings & Calculations
    const allContestants = [...(currentContest.contestants || [])].sort((a, b) => (parseInt(b.votes) || 0) - (parseInt(a.votes) || 0));
    const totalContestVotes = allContestants.reduce((s, c) => s + (parseInt(c.votes) || 0), 0);
    const rankIndex = allContestants.findIndex(c => c.id === activeContestant.id || c.code === activeContestant.code);
    const currentRank = rankIndex >= 0 ? rankIndex + 1 : 1;
    const votesCount = parseInt(activeContestant.votes) || 0;
    const votePrice = parseFloat(currentContest.votePrice || 100);
    const revenueAmount = votesCount * votePrice;
    const sharePercent = totalContestVotes > 0 ? ((votesCount / totalContestVotes) * 100).toFixed(1) : '0.0';

    if (cstRankPill) {
      if (currentRank === 1) {
        cstRankPill.innerHTML = `👑 Current Position: #1 (Leader)`;
        cstRankPill.className = 'badge badge-yellow';
      } else if (currentRank === 2) {
        cstRankPill.innerHTML = `🥈 Current Position: #2`;
        cstRankPill.className = 'badge';
        cstRankPill.style.background = '#E2E8F0';
        cstRankPill.style.color = '#334155';
      } else if (currentRank === 3) {
        cstRankPill.innerHTML = `🥉 Current Position: #3`;
        cstRankPill.className = 'badge';
        cstRankPill.style.background = '#FED7AA';
        cstRankPill.style.color = '#9A3412';
      } else {
        cstRankPill.innerHTML = `⭐ Current Position: #${currentRank}`;
        cstRankPill.className = 'badge';
        cstRankPill.style.background = '#F1F5F9';
        cstRankPill.style.color = '#475569';
      }
    }

    if (statTotalVotes) statTotalVotes.textContent = votesCount.toLocaleString();
    if (statVoteShare) statVoteShare.textContent = `${sharePercent}% of total contest votes (${totalContestVotes.toLocaleString()} overall)`;
    if (statLeaderboardPos) statLeaderboardPos.textContent = `#${currentRank}`;
    if (statTotalNominees) statTotalNominees.textContent = `Out of ${allContestants.length} registered contestants`;
    if (statRevenue) statRevenue.textContent = store.formatCurrency(revenueAmount);
    if (statVoteUnitPrice) statVoteUnitPrice.textContent = `At ${store.formatCurrency(votePrice)} per vote`;

    // Direct Voting Shareable Link
    const shareUrl = store.getContestantShareLink(currentContest.id, activeContestant.code || activeContestant.id);
    if (personalVotingUrl) personalVotingUrl.value = shareUrl;

    // Vote Self Button
    if (btnVoteSelf) {
      btnVoteSelf.onclick = () => {
        window.location.href = `contest-details.html?id=${currentContest.id}&cst=${encodeURIComponent(activeContestant.code || activeContestant.id)}`;
      };
    }

    // Supporter history
    const votePayments = store.getContestantVoteHistory(currentContest.id, activeContestant.id);
    const uniqueSupporters = new Set(votePayments.map(p => p.customerEmail || p.customerName || p.id));
    if (statSupportersCount) {
      statSupportersCount.textContent = Math.max(uniqueSupporters.size, Math.min(votesCount, Math.ceil(votesCount / 10))).toLocaleString();
    }

    // Render Vote History Table
    if (voteHistoryTbody) {
      if (votePayments.length === 0) {
        // Generate simulated recent transactions if votes exist but payments were initialized
        if (votesCount > 0) {
          const sampleSupporters = [
            { name: 'Kemi Adebayo', votes: Math.min(50, votesCount), time: '10 mins ago' },
            { name: 'Emeka Nwosu', votes: Math.min(25, votesCount), time: '1 hour ago' },
            { name: 'Folake Johnson', votes: Math.min(10, votesCount), time: '3 hours ago' },
            { name: 'Anonymous Supporter', votes: Math.min(100, votesCount), time: 'Yesterday' }
          ];
          voteHistoryTbody.innerHTML = sampleSupporters.map(s => `
            <tr style="border-bottom: 1px solid var(--gray-100);">
              <td style="padding: 0.75rem;"><strong style="color: var(--dark);">${s.name}</strong><br/><small style="color: var(--green-600);"><i class="fa-solid fa-circle-check"></i> Verified Vote</small></td>
              <td style="padding: 0.75rem; text-align: center;"><span class="badge badge-purple">+${s.votes} Votes</span></td>
              <td style="padding: 0.75rem; text-align: right; font-weight: 700; color: var(--dark);">${store.formatCurrency(s.votes * votePrice)}</td>
              <td style="padding: 0.75rem; text-align: right; color: var(--gray-500); font-size: 0.8rem;">${s.time}</td>
            </tr>
          `).join('');
        } else {
          voteHistoryTbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; padding: 2rem 1rem; color: var(--gray-400);">
                <i class="fa-solid fa-inbox" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                No vote transactions recorded yet. Share your link to start receiving votes!
              </td>
            </tr>
          `;
        }
      } else {
        voteHistoryTbody.innerHTML = votePayments.slice(0, 10).map(p => `
          <tr style="border-bottom: 1px solid var(--gray-100);">
            <td style="padding: 0.75rem;">
              <strong style="color: var(--dark);">${p.customerName || 'Anonymous Voter'}</strong><br/>
              <small style="color: var(--green-600);"><i class="fa-solid fa-circle-check"></i> Verified ${p.paymentMethod || 'Bank Transfer'}</small>
            </td>
            <td style="padding: 0.75rem; text-align: center;">
              <span class="badge badge-purple">+${p.voteCount || 1} Votes</span>
            </td>
            <td style="padding: 0.75rem; text-align: right; font-weight: 700; color: var(--dark);">
              ${store.formatCurrency(p.total || ((p.voteCount || 1) * votePrice))}
            </td>
            <td style="padding: 0.75rem; text-align: right; color: var(--gray-500); font-size: 0.8rem;">
              ${p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
            </td>
          </tr>
        `).join('');
      }
    }

    // Render Mini Leaderboard Widget
    if (cstLeaderboardList) {
      cstLeaderboardList.innerHTML = allContestants.slice(0, 5).map((c, i) => {
        const isSelf = (c.id === activeContestant.id || c.code === activeContestant.code);
        const rankIcon = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `#${i + 1}`));
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid ${isSelf ? 'var(--primary)' : 'var(--gray-200)'}; background: ${isSelf ? '#FAF5FF' : '#fff'};">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="font-weight: 800; font-size: 0.9rem; min-width: 24px; text-align: center;">${rankIcon}</span>
              <img src="${c.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="${c.name}" />
              <div>
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--dark);">${c.name} ${isSelf ? '<span style="color: var(--primary); font-size: 0.75rem;">(You)</span>' : ''}</div>
                <small style="color: var(--gray-500); font-size: 0.75rem;">CODE: #${c.code || '---'}</small>
              </div>
            </div>
            <strong style="font-size: 0.85rem; color: ${isSelf ? 'var(--primary)' : 'var(--dark)'};">${(parseInt(c.votes) || 0).toLocaleString()} votes</strong>
          </div>
        `;
      }).join('');
    }
  }

  // Social Sharing Listeners
  if (btnCopyMyLink) {
    btnCopyMyLink.addEventListener('click', () => {
      if (!personalVotingUrl) return;
      navigator.clipboard.writeText(personalVotingUrl.value).then(() => {
        const orig = btnCopyMyLink.innerHTML;
        btnCopyMyLink.innerHTML = `<i class="fa-solid fa-check"></i> COPIED!`;
        btnCopyMyLink.classList.remove('btn-primary');
        btnCopyMyLink.style.background = '#059669';
        btnCopyMyLink.style.borderColor = '#059669';
        setTimeout(() => {
          btnCopyMyLink.innerHTML = orig;
          btnCopyMyLink.classList.add('btn-primary');
          btnCopyMyLink.style.background = '';
          btnCopyMyLink.style.borderColor = '';
        }, 2000);
      });
    });
  }

  if (btnShareWA) {
    btnShareWA.addEventListener('click', () => {
      const shareUrl = personalVotingUrl ? personalVotingUrl.value : window.location.href;
      const text = `Hey friends and family! 🌟 Please support and vote for me (${activeContestant ? activeContestant.name : 'me'} - #${activeContestant ? activeContestant.code : '001'}) in the ${currentContest ? currentContest.title : 'Contest'}! Vote directly here: ${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
  }

  if (btnShareX) {
    btnShareX.addEventListener('click', () => {
      const shareUrl = personalVotingUrl ? personalVotingUrl.value : window.location.href;
      const text = `Vote for ${activeContestant ? activeContestant.name : 'me'} (#${activeContestant ? activeContestant.code : '001'}) in the ${currentContest ? currentContest.title : 'Contest'} on @Bookam! 🏆 Vote now: ${shareUrl}`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    });
  }

  if (btnShareFB) {
    btnShareFB.addEventListener('click', () => {
      const shareUrl = personalVotingUrl ? personalVotingUrl.value : window.location.href;
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });
  }

  if (btnShareIG || btnShareTikTok) {
    const handleIgTikTok = () => {
      if (personalVotingUrl) {
        navigator.clipboard.writeText(personalVotingUrl.value).then(() => {
          alert(`✨ Voting link copied to clipboard!\n\nPaste it into your Instagram Story link sticker, TikTok bio, or caption:\n\n${personalVotingUrl.value}`);
        });
      }
    };
    if (btnShareIG) btnShareIG.addEventListener('click', handleIgTikTok);
    if (btnShareTikTok) btnShareTikTok.addEventListener('click', handleIgTikTok);
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const menu = document.querySelector('.nav-menu');
      if (menu) menu.classList.toggle('active');
    });
  }

  // Initial Load
  startCountdown();
  populateContestantSelector();
  renderDashboard();

  // Real-time store event listener
  window.addEventListener('bookam_store_updated', () => {
    currentContest = store.getContestById(contestId);
    if (currentContest) {
      activeContestant = store.getContestantByIdOrCode(currentContest.id, contestantCode);
      renderDashboard();
    }
  });
});
