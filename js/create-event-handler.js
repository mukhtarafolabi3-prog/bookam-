/**
 * BOOKAM - Universal Create Event Form Controller (create-event-handler.js)
 * Powers the unified 8-section Event Host Registration & Creation Form across all pages:
 * Organizer Dashboard, Homepage, Events Directory, Dedicated Create Event Page, and Admin Panel.
 */

(function () {
  const NIGERIAN_BANKS = [
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

  function initCreateEventHandler(options = {}) {
    const store = window.bookamStore;
    const formId = options.formId || 'create-event-form';
    const form = document.getElementById(formId);
    if (!form) return;

    const modalId = options.modalId;
    const modal = modalId ? document.getElementById(modalId) : null;
    const onSuccess = options.onSuccess;
    const redirectUrl = options.redirectUrl;

    // 1. Populate Bank Dropdown
    const bankSelect = form.querySelector('#evt-reg-settle-bank') || document.getElementById('evt-reg-settle-bank');
    if (bankSelect && bankSelect.options.length <= 1) {
      bankSelect.innerHTML = '<option value="" disabled selected>Select Bank...</option>' + NIGERIAN_BANKS.map(b =>
        `<option value="${b.name}">${b.name}</option>`
      ).join('');
    }

    // 2. Banner Dropzone & Upload
    const dropzone = form.querySelector('#org-banner-dropzone') || document.getElementById('org-banner-dropzone');
    const fileInput = form.querySelector('#org-banner-file') || document.getElementById('org-banner-file');
    const previewBox = form.querySelector('#org-banner-preview-box') || document.getElementById('org-banner-preview-box');
    const previewImg = form.querySelector('#org-banner-preview-img') || document.getElementById('org-banner-preview-img');
    const placeholder = form.querySelector('#org-banner-placeholder') || document.getElementById('org-banner-placeholder');
    const removeBtn = form.querySelector('#btn-org-remove-banner') || document.getElementById('btn-org-remove-banner');
    const urlInput = form.querySelector('#input-banner') || document.getElementById('input-banner');

    const isLikelyImageFile = (file) => {
      if (!file) return false;
      const name = String(file.name || '').toLowerCase();
      const type = String(file.type || '').toLowerCase();
      return type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name) || (type === 'application/octet-stream' && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name));
    };

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target.closest('#btn-org-remove-banner')) return;
        if (fileInput) fileInput.click();
      });

      const handleBannerFile = async (file) => {
        if (!isLikelyImageFile(file)) {
          alert('Please upload a valid image file (JPG, PNG, WebP).');
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          alert('Image size exceeds 25MB limit.');
          return;
        }

        // Show inline optimizing state
        if (placeholder) {
          placeholder.innerHTML = `
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

          if (urlInput) urlInput.value = dataUrl;
          if (previewImg) previewImg.src = dataUrl;
          if (previewBox) previewBox.style.display = 'block';
          if (placeholder) {
            placeholder.style.display = 'none';
            placeholder.innerHTML = `
              <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary);"></i>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark);">
                Click to upload or drag &amp; drop event flyer / ticket image
              </div>
              <div style="font-size: 0.75rem; color: var(--gray-500);">This image will be used for tickets, passes, and public booking cards</div>
            `;
          }
          updateAmbassadorFlyerAndLink();
        } catch (err) {
          console.error('Image compression error:', err);
          alert('Failed to process image. Please try another image file.');
          if (placeholder) {
            placeholder.innerHTML = `
              <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary);"></i>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark);">
                Click to upload or drag &amp; drop event flyer / ticket image
              </div>
              <div style="font-size: 0.75rem; color: var(--gray-500);">This image will be used for tickets, passes, and public booking cards</div>
            `;
          }
        }
      };

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleBannerFile(file);
      });

      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = 'var(--primary)';
          dropzone.style.background = '#F5F3FF';
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = '#CBD5E1';
          dropzone.style.background = '#fff';
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file) handleBannerFile(file);
      });

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (urlInput) urlInput.value = '';
          if (fileInput) fileInput.value = '';
          if (previewBox) previewBox.style.display = 'none';
          if (placeholder) placeholder.style.display = 'flex';
          updateAmbassadorFlyerAndLink();
        });
      }

      if (urlInput) {
        urlInput.addEventListener('input', () => {
          const val = urlInput.value.trim();
          if (val && (val.startsWith('http') || val.startsWith('data:'))) {
            if (previewImg) previewImg.src = val;
            if (previewBox) previewBox.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
          } else if (!val) {
            if (previewBox) previewBox.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
          }
          updateAmbassadorFlyerAndLink();
        });
      }
    }

    // 3. Ticket Section Visibility & Early Bird Expiry
    const chkEnableAllTickets = form.querySelector('#chk-enable-all-tickets') || document.getElementById('chk-enable-all-tickets');
    const ticketsWrapper = form.querySelector('#org-tickets-wrapper') || document.getElementById('org-tickets-wrapper');
    if (chkEnableAllTickets && ticketsWrapper) {
      chkEnableAllTickets.addEventListener('change', () => {
        ticketsWrapper.style.display = chkEnableAllTickets.checked ? 'block' : 'none';
        updateAmbassadorFlyerAndLink();
      });
    }

    const inputEventDate = form.querySelector('#input-date') || document.getElementById('input-date');
    const inputEarlyBirdEnd = form.querySelector('#input-early-bird-end') || document.getElementById('input-early-bird-end');
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

    // 4. Dynamic Custom Ticket Tiers Builder
    const customTiersContainer = form.querySelector('#custom-ticket-tiers-container') || document.getElementById('custom-ticket-tiers-container');
    const btnAddCustomTier = form.querySelector('#btn-add-custom-tier') || document.getElementById('btn-add-custom-tier');
    let customTierCounter = 1;

    if (btnAddCustomTier && customTiersContainer) {
      btnAddCustomTier.addEventListener('click', () => {
        customTierCounter++;
        const tierDiv = document.createElement('div');
        tierDiv.className = 'custom-tier-row';
        tierDiv.style.cssText = 'background: #fff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 0.5rem; align-items: center;';
        tierDiv.innerHTML = `
          <input type="text" class="form-control tier-custom-name" placeholder="Tier Name (e.g. VIP Backstage ${customTierCounter})" required style="font-size: 0.8rem;" />
          <input type="number" class="form-control tier-custom-price" placeholder="Price (₦)" min="0" required style="font-size: 0.8rem;" />
          <input type="number" class="form-control tier-custom-qty" placeholder="Quantity (e.g. 50)" min="1" value="100" style="font-size: 0.8rem;" />
          <button type="button" class="btn btn-outline btn-sm btn-remove-tier" style="color: var(--red-500); border-color: #FCA5A5; padding: 0.4rem 0.6rem;">&times;</button>
        `;
        customTiersContainer.appendChild(tierDiv);

        tierDiv.querySelector('.tier-custom-price')?.addEventListener('input', updateAmbassadorFlyerAndLink);
        tierDiv.querySelector('.btn-remove-tier').addEventListener('click', () => {
          tierDiv.remove();
          updateAmbassadorFlyerAndLink();
        });
      });
    }

    // 5. Ambassador Flyer Preview & Ticket Link Sync
    const chkModalEnableAmbassadors = form.querySelector('#chk-modal-enable-ambassadors') || document.getElementById('chk-modal-enable-ambassadors');
    const modalAmbassadorSuite = form.querySelector('#modal-ambassador-suite') || document.getElementById('modal-ambassador-suite');
    const modalAmbHandleInput = form.querySelector('#modal-amb-handle-input') || document.getElementById('modal-amb-handle-input');
    const modalPersonalTicketUrl = form.querySelector('#modal-personal-ticket-url') || document.getElementById('modal-personal-ticket-url');
    const btnModalCopyPersonalUrl = form.querySelector('#btn-modal-copy-personal-url') || document.getElementById('btn-modal-copy-personal-url');
    const btnModalTestTicketLink = form.querySelector('#btn-modal-test-ticket-link') || document.getElementById('btn-modal-test-ticket-link');
    const btnModalShareWa = form.querySelector('#btn-modal-share-wa') || document.getElementById('btn-modal-share-wa');
    const modalFlyerTopScene = form.querySelector('#modal-flyer-top-scene') || document.getElementById('modal-flyer-top-scene');
    const modalFlyerEventBadge = form.querySelector('#modal-flyer-event-badge') || document.getElementById('modal-flyer-event-badge');
    const modalFlyerRepName = form.querySelector('#modal-flyer-rep-name') || document.getElementById('modal-flyer-rep-name');
    const modalFlyerPriceTag = form.querySelector('#modal-flyer-price-tag') || document.getElementById('modal-flyer-price-tag');
    const modalFlyerQrImg = form.querySelector('#modal-flyer-qr-img') || document.getElementById('modal-flyer-qr-img');
    const modalFlyerQrCaption = form.querySelector('#modal-flyer-qr-caption') || document.getElementById('modal-flyer-qr-caption');
    const btnModalDownloadFlyerQr = form.querySelector('#btn-modal-download-flyer-qr') || document.getElementById('btn-modal-download-flyer-qr');
    const btnModalPrintFlyer = form.querySelector('#btn-modal-print-flyer') || document.getElementById('btn-modal-print-flyer');

    function updateAmbassadorFlyerAndLink() {
      const rawHandle = modalAmbHandleInput?.value.trim().replace(/^@/, '') || 'ambassador';
      const cleanHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'ambassador';
      const eventTitle = (form.querySelector('#input-title') || document.getElementById('input-title'))?.value.trim() || 'Your Event Name';
      const bannerVal = (form.querySelector('#input-banner') || document.getElementById('input-banner'))?.value.trim();

      const ticketsEnabled = chkEnableAllTickets ? chkEnableAllTickets.checked : true;
      let minPrice = Infinity;

      if (ticketsEnabled) {
        const earlyBirdChk = form.querySelector('#chk-tier-early') || document.getElementById('chk-tier-early');
        const firstWaveChk = form.querySelector('#chk-tier-first') || document.getElementById('chk-tier-first');
        const group4Chk = form.querySelector('#chk-tier-group') || document.getElementById('chk-tier-group');
        const secondWaveChk = form.querySelector('#chk-tier-second') || document.getElementById('chk-tier-second');
        const entranceChk = form.querySelector('#chk-tier-entrance') || document.getElementById('chk-tier-entrance');

        if (earlyBirdChk?.checked) {
          const p = parseFloat((form.querySelector('#input-early-bird') || document.getElementById('input-early-bird'))?.value);
          if (!isNaN(p) && p < minPrice) minPrice = p;
        }
        if (firstWaveChk?.checked) {
          const p = parseFloat((form.querySelector('#input-first-wave') || document.getElementById('input-first-wave'))?.value);
          if (!isNaN(p) && p < minPrice) minPrice = p;
        }
        if (group4Chk?.checked) {
          const p = parseFloat((form.querySelector('#input-group-4') || document.getElementById('input-group-4'))?.value);
          if (!isNaN(p) && p < minPrice) minPrice = p;
        }
        if (secondWaveChk?.checked) {
          const p = parseFloat((form.querySelector('#input-second-wave') || document.getElementById('input-second-wave'))?.value);
          if (!isNaN(p) && p < minPrice) minPrice = p;
        }
        if (entranceChk?.checked) {
          const p = parseFloat((form.querySelector('#input-entrance') || document.getElementById('input-entrance'))?.value);
          if (!isNaN(p) && p < minPrice) minPrice = p;
        }
        form.querySelectorAll('.custom-tier-row').forEach(row => {
          const p = parseFloat(row.querySelector('.tier-custom-price')?.value);
          if (!isNaN(p) && p < minPrice) minPrice = p;
        });
      }

      const isZeroPrice = !ticketsEnabled || minPrice === Infinity || minPrice <= 0;

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

    if (chkModalEnableAmbassadors && modalAmbassadorSuite) {
      chkModalEnableAmbassadors.addEventListener('change', () => {
        modalAmbassadorSuite.style.display = chkModalEnableAmbassadors.checked ? 'grid' : 'none';
      });
    }

    if (modalAmbHandleInput) {
      modalAmbHandleInput.addEventListener('input', updateAmbassadorFlyerAndLink);
    }

    const titleField = form.querySelector('#input-title') || document.getElementById('input-title');
    if (titleField) {
      titleField.addEventListener('input', updateAmbassadorFlyerAndLink);
    }

    form.querySelectorAll('#org-tickets-wrapper input').forEach(inp => {
      inp.addEventListener('input', updateAmbassadorFlyerAndLink);
      inp.addEventListener('change', updateAmbassadorFlyerAndLink);
    });

    if (btnModalCopyPersonalUrl && modalPersonalTicketUrl) {
      btnModalCopyPersonalUrl.addEventListener('click', () => {
        modalPersonalTicketUrl.select();
        navigator.clipboard.writeText(modalPersonalTicketUrl.value).then(() => {
          const origHtml = btnModalCopyPersonalUrl.innerHTML;
          btnModalCopyPersonalUrl.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          btnModalCopyPersonalUrl.style.background = '#10B981';
          setTimeout(() => {
            btnModalCopyPersonalUrl.innerHTML = origHtml;
            btnModalCopyPersonalUrl.style.background = '';
          }, 2000);
        });
      });
    }

    if (btnModalPrintFlyer) {
      btnModalPrintFlyer.addEventListener('click', () => {
        window.print();
      });
    }

    // 6. Dynamic Influencer Generator
    const eventInfluencersList = form.querySelector('#event-influencers-list') || document.getElementById('event-influencers-list');
    const btnAddEventInfluencer = form.querySelector('#btn-add-event-influencer') || document.getElementById('btn-add-event-influencer');
    let infCounter = 1;

    function bindAutoPromoCode(row) {
      const nameInp = row.querySelector('.inf-name-field');
      const codeInp = row.querySelector('.inf-code-field');
      const discSel = row.querySelector('.inf-discount-type');
      if (!nameInp || !codeInp || !discSel) return;

      let isCustom = false;
      const computeCode = () => {
        if (isCustom) return;
        const name = nameInp.value.trim();
        const discType = discSel.value;
        const discVal = discType === 'percent15' ? 15 : (discType === 'fixed' ? 1000 : 10);
        if (store && store.generatePromoCode) {
          codeInp.value = store.generatePromoCode(name || 'PROMO', discVal, discType);
        } else {
          codeInp.value = (name.substring(0, 5) || 'PROMO').toUpperCase() + (discVal || '10');
        }
      };

      nameInp.addEventListener('input', () => {
        isCustom = false;
        computeCode();
      });
      discSel.addEventListener('change', computeCode);
      codeInp.addEventListener('input', () => {
        isCustom = true;
      });
      computeCode();
    }

    if (eventInfluencersList) {
      eventInfluencersList.querySelectorAll('.inf-tier-row').forEach(row => bindAutoPromoCode(row));
    }

    if (btnAddEventInfluencer && eventInfluencersList) {
      btnAddEventInfluencer.addEventListener('click', () => {
        const rows = eventInfluencersList.querySelectorAll('.inf-tier-row');
        if (rows.length >= 5) {
          alert('Maximum 5 influencers allowed per event registration.');
          return;
        }
        infCounter++;
        const initialCode = `INF${infCounter}10`;
        const rowDiv = document.createElement('div');
        rowDiv.className = 'inf-tier-row';
        rowDiv.style.cssText = 'background: #fff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: center;';
        rowDiv.innerHTML = `
          <div>
            <label style="font-size: 0.7rem; font-weight: 700; color: var(--gray-500); display: block; margin-bottom: 0.2rem;">Influencer Name</label>
            <input type="text" class="form-control inf-name-field" placeholder="Influencer ${infCounter} Name" style="font-size: 0.8rem;" required />
          </div>
          <div>
            <label style="font-size: 0.7rem; font-weight: 700; color: var(--primary); display: block; margin-bottom: 0.2rem;">Promo Code (Auto)</label>
            <input type="text" class="form-control inf-code-field" placeholder="PROMO CODE" value="${initialCode}" style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; font-family: monospace; background: #FAF5FF; border-color: #D8B4FE; color: var(--primary);" required />
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
        bindAutoPromoCode(rowDiv);
        rowDiv.querySelector('.btn-remove-inf').addEventListener('click', () => rowDiv.remove());
      });
    }

    // Modal Close buttons
    const closeBtns = [
      form.querySelector('#close-create-modal'),
      document.getElementById('close-create-modal'),
      form.querySelector('#cancel-create-modal'),
      document.getElementById('cancel-create-modal')
    ];
    closeBtns.forEach(b => {
      if (b) {
        b.addEventListener('click', () => {
          if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
          }
        });
      }
    });

    // 7. Form Submission Interceptor
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate Section 8 check confirmations
      for (let i = 1; i <= 7; i++) {
        const chk = form.querySelector(`#chk-host-agree-${i}`) || document.getElementById(`chk-host-agree-${i}`);
        if (chk && !chk.checked) {
          alert(`Please agree to confirmation clause #${i} before submitting.`);
          return;
        }
      }

      const orgName = (form.querySelector('#evt-reg-org-name') || document.getElementById('evt-reg-org-name'))?.value.trim() || '';
      const brandName = (form.querySelector('#evt-reg-brand-name') || document.getElementById('evt-reg-brand-name'))?.value.trim() || '';
      const phone = (form.querySelector('#evt-reg-phone') || document.getElementById('evt-reg-phone'))?.value.trim() || '';
      const email = (form.querySelector('#evt-reg-email') || document.getElementById('evt-reg-email'))?.value.trim() || '';
      const whatsapp = (form.querySelector('#evt-reg-whatsapp') || document.getElementById('evt-reg-whatsapp'))?.value.trim() || '';
      const instagram = (form.querySelector('#evt-reg-instagram') || document.getElementById('evt-reg-instagram'))?.value.trim() || '';
      const orgType = (form.querySelector('#evt-reg-org-type') || document.getElementById('evt-reg-org-type'))?.value || '';

      const title = (form.querySelector('#input-title') || document.getElementById('input-title')).value.trim();
      const category = (form.querySelector('#input-category') || document.getElementById('input-category')).value;
      const description = (form.querySelector('#input-description') || document.getElementById('input-description')).value.trim();
      const date = (form.querySelector('#input-date') || document.getElementById('input-date')).value;
      const time = (form.querySelector('#input-time') || document.getElementById('input-time')).value.trim();
      const endTime = (form.querySelector('#evt-reg-end-time') || document.getElementById('evt-reg-end-time'))?.value.trim() || '';
      const venueName = (form.querySelector('#evt-reg-venue-name') || document.getElementById('evt-reg-venue-name'))?.value.trim() || '';
      const venueAddress = (form.querySelector('#evt-reg-venue-address') || document.getElementById('evt-reg-venue-address'))?.value.trim() || '';
      const city = (form.querySelector('#input-venue') || document.getElementById('input-venue')).value.trim();
      const fullVenue = venueName ? `${venueName}, ${city}` : city;

      const banner = (form.querySelector('#input-banner') || document.getElementById('input-banner'))?.value.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
      const extraImages = (form.querySelector('#evt-reg-extra-images') || document.getElementById('evt-reg-extra-images'))?.value.trim();
      const promoVideo = (form.querySelector('#evt-reg-video') || document.getElementById('evt-reg-video'))?.value.trim();

      // Ticket tiers
      const enableTickets = chkEnableAllTickets ? chkEnableAllTickets.checked : true;
      const tierPrices = {};

      if (enableTickets) {
        const earlyBirdChk = form.querySelector('#chk-tier-early') || document.getElementById('chk-tier-early');
        const firstWaveChk = form.querySelector('#chk-tier-first') || document.getElementById('chk-tier-first');
        const group4Chk = form.querySelector('#chk-tier-group') || document.getElementById('chk-tier-group');
        const secondWaveChk = form.querySelector('#chk-tier-second') || document.getElementById('chk-tier-second');
        const entranceChk = form.querySelector('#chk-tier-entrance') || document.getElementById('chk-tier-entrance');

        if (earlyBirdChk?.checked) {
          const val = parseFloat((form.querySelector('#input-early-bird') || document.getElementById('input-early-bird'))?.value);
          if (!isNaN(val) && val >= 0) tierPrices['Early bird'] = val;
        }
        if (firstWaveChk?.checked) {
          const val = parseFloat((form.querySelector('#input-first-wave') || document.getElementById('input-first-wave'))?.value);
          if (!isNaN(val) && val >= 0) tierPrices['First Wave'] = val;
        }
        if (group4Chk?.checked) {
          const val = parseFloat((form.querySelector('#input-group-4') || document.getElementById('input-group-4'))?.value);
          if (!isNaN(val) && val >= 0) tierPrices['Group of 4'] = val;
        }
        if (secondWaveChk?.checked) {
          const val = parseFloat((form.querySelector('#input-second-wave') || document.getElementById('input-second-wave'))?.value);
          if (!isNaN(val) && val >= 0) tierPrices['Second Wave'] = val;
        }
        if (entranceChk?.checked) {
          const val = parseFloat((form.querySelector('#input-entrance') || document.getElementById('input-entrance'))?.value);
          if (!isNaN(val) && val >= 0) tierPrices['At the Entrance'] = val;
        }

        form.querySelectorAll('.custom-tier-row').forEach(row => {
          const cName = row.querySelector('.tier-custom-name')?.value.trim();
          const cPrice = parseFloat(row.querySelector('.tier-custom-price')?.value);
          if (cName && !isNaN(cPrice)) tierPrices[cName] = cPrice;
        });
      }

      const earlyBirdEndDate = (form.querySelector('#input-early-bird-end') || document.getElementById('input-early-bird-end'))?.value || null;
      const hasPaidTiers = enableTickets && Object.keys(tierPrices).length > 0 && Object.values(tierPrices).some(p => p > 0);
      const ticketsOptional = !hasPaidTiers;

      let tickets = [];
      if (hasPaidTiers && store && store.createDefaultTicketTiers) {
        tickets = store.createDefaultTicketTiers(tierPrices, earlyBirdEndDate);
      } else if (hasPaidTiers) {
        tickets = Object.entries(tierPrices).map(([name, price]) => ({
          type: name,
          name: name,
          price: price,
          benefits: ['Standard Venue Access', 'Fast-track Entry', 'Digital Pass Delivery']
        }));
      } else {
        tickets = [
          {
            type: 'Free Admission',
            name: 'Open Admission / RSVP',
            price: 0,
            benefits: ['Free Community Entry', 'Complimentary Admission', 'Instant Digital Pass Delivery']
          }
        ];
      }

      const startingPrice = hasPaidTiers ? (Math.min(...Object.values(tierPrices).filter(p => p > 0)) || 0) : 0;

      // Support & Settlement
      const attendance = (form.querySelector('#evt-reg-attendance') || document.getElementById('evt-reg-attendance'))?.value || '200 - 500';
      const techSupport = (form.querySelector('#evt-reg-tech-support') || document.getElementById('evt-reg-tech-support'))?.value || 'Yes';
      const wristbands = (form.querySelector('#evt-reg-wristbands') || document.getElementById('evt-reg-wristbands'))?.value || 'No';
      const specialReqs = (form.querySelector('#evt-reg-special-reqs') || document.getElementById('evt-reg-special-reqs'))?.value.trim() || '';

      const settleName = (form.querySelector('#evt-reg-settle-name') || document.getElementById('evt-reg-settle-name'))?.value.trim() || '';
      const settleBank = (form.querySelector('#evt-reg-settle-bank') || document.getElementById('evt-reg-settle-bank'))?.value.trim() || '';
      const settleAccount = (form.querySelector('#evt-reg-settle-account') || document.getElementById('evt-reg-settle-account'))?.value.trim() || '';
      const settlePref = (form.querySelector('#evt-reg-settle-pref') || document.getElementById('evt-reg-settle-pref'))?.value || '';

      // Influencers
      const pendingInfluencers = [];
      const useInf = (form.querySelector('#rad-inf-yes') || document.getElementById('rad-inf-yes'))?.checked;
      if (useInf) {
        const infRows = form.querySelectorAll('.inf-tier-row');
        infRows.forEach(row => {
          const infName = row.querySelector('.inf-name-field')?.value.trim();
          let infCode = row.querySelector('.inf-code-field')?.value.trim().toUpperCase();
          const infDiscType = row.querySelector('.inf-discount-type')?.value;
          const infComm = parseFloat(row.querySelector('.inf-comm-field')?.value) || 10;
          const discValue = infDiscType === 'fixed' ? 1000 : (infDiscType === 'percent15' ? 15 : 10);
          const discType = infDiscType === 'fixed' ? 'fixed' : 'percentage';

          if (infName) {
            if (!infCode && store && store.generatePromoCode) {
              infCode = store.generatePromoCode(infName, discValue, discType);
            }
            pendingInfluencers.push({
              name: infName,
              code: infCode || `${infName.substring(0, 5).toUpperCase()}10`,
              discountType: discType,
              discountValue: discValue,
              commissionType: 'percentage',
              commissionValue: infComm
            });
          }
        });
      }

      const newEventData = {
        title,
        category,
        date,
        time,
        endTime,
        venue: fullVenue,
        venueAddress,
        city,
        organizer: brandName || orgName,
        organizerContact: {
          name: orgName,
          brand: brandName,
          phone,
          email,
          whatsapp,
          instagram,
          type: orgType
        },
        organizerId: 'org-pub-001',
        banner,
        extraImages: extraImages ? extraImages.split(',').map(s => s.trim()) : [],
        promoVideo,
        startingPrice,
        ticketsOptional,
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
        callForAmbassadors: (form.querySelector('#chk-modal-enable-ambassadors') || document.getElementById('chk-modal-enable-ambassadors'))?.checked ?? true,
        agreedExclusiveTicketing: true,
        exclusiveTicketingTermsAccepted: true,
        status: 'TICKET SALES LIVE',
        onboardingStatus: 'APPROVED',
        approvedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };

      let savedEvt = null;
      if (store && store.saveEvent) {
        savedEvt = store.saveEvent(newEventData);
      } else {
        savedEvt = newEventData;
      }

      // Provision Influencers
      if (pendingInfluencers.length > 0 && savedEvt && savedEvt.id && store && store.saveInfluencer) {
        pendingInfluencers.forEach(inf => {
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

      // Clear form inputs so entered information disappears from form upon publish
      form.reset();
      if (previewBox) previewBox.style.display = 'none';
      if (placeholder) {
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `
          <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary);"></i>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--dark);">
            Click to upload or drag &amp; drop event flyer / ticket image
          </div>
          <div style="font-size: 0.75rem; color: var(--gray-500);">This image will be used for tickets, passes, and public booking cards</div>
        `;
      }
      if (urlInput) urlInput.value = '';
      if (fileInput) fileInput.value = '';
      form.querySelectorAll('.custom-tier-row').forEach(r => r.remove());
      form.querySelectorAll('.inf-tier-row').forEach(r => r.remove());

      // Close modal if applicable
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
      }

      // Trigger store updated event
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events', eventId: savedEvt.id } }));

      // Celebration Toast / Alert
      const priceText = ticketsOptional ? 'Free Admission / Open RSVP' : `Tickets starting at ₦${startingPrice.toLocaleString()}`;
      const msg = `🎉 Event "${title}" is LIVE and published!\n\n${priceText}\n\nAttendees can now buy tickets, RSVP, and promoters have their tracking links active!`;

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(savedEvt);
      }

      if (redirectUrl) {
        alert(msg);
        window.location.href = redirectUrl;
      } else if (!onSuccess) {
        alert(msg);
        window.location.href = `event-details.html?id=${savedEvt.id || ''}`;
      }
    });

    // Initial update
    updateAmbassadorFlyerAndLink();
  }

  // Export globally
  window.initBookamCreateEventForm = initCreateEventHandler;
})();
