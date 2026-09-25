/**
 * BOOKAM - Live Contests Directory Controller
 */

import './store.js';

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  const contestsGrid = document.getElementById('contests-grid');
  const noContestsMsg = document.getElementById('no-contests-msg');
  const searchInput = document.getElementById('contest-search');
  const categoryFilter = document.getElementById('contest-category-filter');
  const statusFilter = document.getElementById('contest-status-filter');
  const resetBtn = document.getElementById('btn-reset-filters');

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-nav-close');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('open'));
  }
  if (mobileClose && mobileNav) {
    mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  }

  function renderContests() {
    if (!contestsGrid) return;

    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';

    let contests = store.getContests();

    // Filter: only show approved/active contests on public directory
    contests = contests.filter(c => {
      if (!c) return false;
      const rawStatus = (c.status || 'Active').toLowerCase();
      if (rawStatus.includes('pending') || rawStatus.includes('reject')) {
        return false;
      }

      const matchSearch = !searchTerm || 
        (c.title && String(c.title).toLowerCase().includes(searchTerm)) || 
        (c.category && String(c.category).toLowerCase().includes(searchTerm)) ||
        (c.description && String(c.description).toLowerCase().includes(searchTerm)) ||
        ((c.contestants || []).some(n => n && n.name && String(n.name).toLowerCase().includes(searchTerm)));

      const matchCategory = !selectedCategory || c.category === selectedCategory;

      const isConcluded = c.status === 'Concluded' || (c.endDate && new Date(c.endDate + 'T23:59:59') < new Date());
      const effectiveStatus = isConcluded ? 'Concluded' : (c.status || 'Active');
      const matchStatus = !selectedStatus || effectiveStatus === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });

    if (contests.length === 0) {
      contestsGrid.style.display = 'none';
      if (noContestsMsg) noContestsMsg.style.display = 'block';
      return;
    }

    contestsGrid.style.display = 'grid';
    if (noContestsMsg) noContestsMsg.style.display = 'none';

    contestsGrid.innerHTML = contests.map(c => {
      const contestants = c.contestants || [];
      const totalVotes = contestants.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);
      const votePriceStr = store.formatCurrency(c.votePrice || 100);

      const isConcluded = c.status === 'Concluded' || (c.endDate && new Date(c.endDate + 'T23:59:59') < new Date());
      const statusBadge = isConcluded 
        ? `<span class="badge" style="background: rgba(239, 68, 68, 0.85); color: #fff; font-size: 0.75rem;"><i class="fa-solid fa-flag-checkered"></i> Concluded</span>`
        : `<span class="badge" style="background: rgba(16, 185, 129, 0.85); color: #fff; font-size: 0.75rem;"><i class="fa-solid fa-bolt"></i> Live Voting</span>`;

      // Sort contestants for mini-leaderboard
      const sortedContestants = [...contestants].sort((a, b) => (parseInt(b.votes) || 0) - (parseInt(a.votes) || 0));
      const top3 = sortedContestants.slice(0, 3);

      return `
        <div class="event-card" style="display: flex; flex-direction: column; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); overflow: hidden; box-shadow: var(--shadow-sm); position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="position: relative; height: 190px; overflow: hidden; background: #0f172a;">
            <img src="${c.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${c.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" loading="lazy" />
            <div style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.4rem;">
              ${statusBadge}
            </div>
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 4px;">
              <i class="fa-solid fa-tag"></i> ${c.category || 'General Contest'}
            </span>
          </div>

          <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--dark); line-height: 1.35; margin-bottom: 0.5rem;">
              <a href="contest-details.html?id=${c.id}" style="color: inherit; text-decoration: none;">${c.title}</a>
            </h3>

            <p style="font-size: 0.85rem; color: var(--gray-600); line-height: 1.5; margin-bottom: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${c.description || ''}
            </p>

            <div class="contest-meta-pills">
              <div class="meta-pill">
                <i class="fa-solid fa-users" style="color: var(--primary);"></i>
                <strong>${contestants.length}</strong> Nominees
              </div>
              <div class="meta-pill">
                <i class="fa-solid fa-check-to-slot" style="color: #10b981;"></i>
                <strong>${totalVotes.toLocaleString()}</strong> Total Votes
              </div>
              <div class="meta-pill" style="background: #eef2ff; color: #4f46e5;">
                <i class="fa-solid fa-coins"></i>
                <strong>${votePriceStr}</strong> / vote
              </div>
            </div>

            ${top3.length > 0 ? `
              <div class="leaderboard-preview-mini">
                <div style="font-size: 0.725rem; font-weight: 700; text-transform: uppercase; color: var(--gray-500); margin-bottom: 0.35rem; display: flex; justify-content: space-between;">
                  <span><i class="fa-solid fa-trophy" style="color: #f59e0b;"></i> Top Standings</span>
                  <span>Votes</span>
                </div>
                ${top3.map((st, idx) => `
                  <div class="leaderboard-mini-row">
                    <span style="display: flex; align-items: center; gap: 0.4rem; font-weight: 600; color: var(--dark);">
                      <strong style="color: ${idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#b45309'}; font-size: 0.8rem;">#${idx + 1}</strong>
                      ${st.name}
                    </span>
                    <span style="font-weight: 700; color: var(--primary);">${(parseInt(st.votes) || 0).toLocaleString()}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div style="margin-top: auto; padding-top: 1.25rem; display: grid; grid-template-columns: 1fr auto; gap: 0.5rem;">
              <a href="contest-details.html?id=${c.id}" class="btn btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; font-weight: 700;">
                <i class="fa-solid fa-vote-yea"></i> ${isConcluded ? 'View Results' : 'Vote Now'}
              </a>
              <a href="contest-details.html?id=${c.id}&tab=leaderboard" class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; padding: 0.6rem 0.75rem;" title="View Live Leaderboard">
                <i class="fa-solid fa-trophy"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initial render
  renderContests();

  // Listeners
  if (searchInput) searchInput.addEventListener('input', renderContests);
  if (categoryFilter) categoryFilter.addEventListener('change', renderContests);
  if (statusFilter) statusFilter.addEventListener('change', renderContests);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      renderContests();
    });
  }

  // Listen for real-time updates from store
  window.addEventListener('bookam_store_updated', (e) => {
    if (!e.detail || !e.detail.type || e.detail.type === 'contests' || (e.detail.key && e.detail.key.includes('contest'))) {
      renderContests();
    }
  });
});
