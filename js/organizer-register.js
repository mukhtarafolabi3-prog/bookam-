/**
 * BOOKAM - Professional Organizer Registration & Sign In Script (organizer-register.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.bookamStore;
  if (!store) return;

  // Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('active'));
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('active'));
  }

  // Password Visibility Toggle
  const passwordToggles = document.querySelectorAll('.password-toggle-btn');
  passwordToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.className = 'fa-solid fa-eye-slash';
        }
      } else {
        input.type = 'password';
        if (icon) {
          icon.className = 'fa-solid fa-eye';
        }
      }
    });
  });

  // Password Strength Meter
  const regPasswordInput = document.getElementById('reg-password');
  const passStrengthFill = document.getElementById('pass-strength-fill');
  const passStrengthText = document.getElementById('pass-strength-text');

  if (regPasswordInput && passStrengthFill && passStrengthText) {
    regPasswordInput.addEventListener('input', () => {
      const val = regPasswordInput.value;
      if (!val) {
        passStrengthFill.style.width = '0%';
        passStrengthFill.style.backgroundColor = 'transparent';
        passStrengthText.textContent = 'Enter a password';
        passStrengthText.style.color = 'var(--gray-500)';
        return;
      }

      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 2) {
        passStrengthFill.style.width = '33%';
        passStrengthFill.style.backgroundColor = 'var(--red-500)';
        passStrengthText.textContent = 'Weak password';
        passStrengthText.style.color = 'var(--red-500)';
      } else if (score <= 4) {
        passStrengthFill.style.width = '66%';
        passStrengthFill.style.backgroundColor = 'var(--amber-500)';
        passStrengthText.textContent = 'Good password';
        passStrengthText.style.color = 'var(--amber-500)';
      } else {
        passStrengthFill.style.width = '100%';
        passStrengthFill.style.backgroundColor = 'var(--green-500)';
        passStrengthText.textContent = 'Strong password';
        passStrengthText.style.color = 'var(--green-500)';
      }
    });
  }

  // Tab Switching (Register vs Login)
  const tabBtnRegister = document.getElementById('tab-btn-register');
  const tabBtnLogin = document.getElementById('tab-btn-login');
  const formRegister = document.getElementById('form-register');
  const formLogin = document.getElementById('form-login');
  const headingTitle = document.getElementById('form-heading-title');
  const headingSub = document.getElementById('form-heading-sub');
  const linkSwitchLogin = document.getElementById('link-switch-login');
  const linkSwitchRegister = document.getElementById('link-switch-register');
  const alertBox = document.getElementById('auth-alert');

  function setAuthMode(mode) {
    hideAlert();
    if (mode === 'login') {
      if (tabBtnLogin) tabBtnLogin.classList.add('active');
      if (tabBtnRegister) tabBtnRegister.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
      if (headingTitle) headingTitle.textContent = 'Organizer Sign In';
      if (headingSub) headingSub.textContent = 'Enter your organizer credentials to access your live dashboard.';
    } else {
      if (tabBtnRegister) tabBtnRegister.classList.add('active');
      if (tabBtnLogin) tabBtnLogin.classList.remove('active');
      if (formRegister) formRegister.style.display = 'block';
      if (formLogin) formLogin.style.display = 'none';
      if (headingTitle) headingTitle.textContent = 'Create Host Account';
      if (headingSub) headingSub.textContent = 'Join Nigeria\'s premier event platform. Accept the exclusive ticketing agreement to publish events and sell passes.';
    }
  }

  if (tabBtnRegister) tabBtnRegister.addEventListener('click', () => setAuthMode('register'));
  if (tabBtnLogin) tabBtnLogin.addEventListener('click', () => setAuthMode('login'));
  if (linkSwitchLogin) linkSwitchLogin.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('login'); });
  if (linkSwitchRegister) linkSwitchRegister.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('register'); });

  // Check URL hash or query param (?mode=login or #login)
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();
  if (urlParams.get('mode') === 'login' || hash === '#login') {
    setAuthMode('login');
  } else {
    setAuthMode('register');
  }

  // Full Terms Modal Handlers
  const fullTermsModal = document.getElementById('full-terms-modal');
  const btnViewTermsModalReg = document.getElementById('btn-view-terms-modal-reg');
  const closeFullTermsModal = document.getElementById('close-full-terms-modal');
  const btnAcceptTermsModalClose = document.getElementById('btn-accept-terms-modal-close');

  if (btnViewTermsModalReg && fullTermsModal) {
    btnViewTermsModalReg.addEventListener('click', () => {
      fullTermsModal.style.display = 'flex';
    });
  }

  if (closeFullTermsModal && fullTermsModal) {
    closeFullTermsModal.addEventListener('click', () => {
      fullTermsModal.style.display = 'none';
    });
  }

  if (btnAcceptTermsModalClose && fullTermsModal) {
    btnAcceptTermsModalClose.addEventListener('click', () => {
      fullTermsModal.style.display = 'none';
      const chk1 = document.getElementById('reg-chk-exclusive');
      const chk2 = document.getElementById('reg-chk-nomulti');
      const chk3 = document.getElementById('reg-chk-settlement');
      const chk4 = document.getElementById('reg-chk-terms');
      if (chk1) chk1.checked = true;
      if (chk2) chk2.checked = true;
      if (chk3) chk3.checked = true;
      if (chk4) chk4.checked = true;
      showAlert('Exclusive Ticketing Terms accepted!', true);
    });
  }

  // Auto-sync Bank Account Name with Organization Title if left empty
  const regNameInput = document.getElementById('reg-name');
  const regOrgInput = document.getElementById('reg-org-name');
  const regAccountNameInput = document.getElementById('reg-account-name');

  if (regNameInput && regAccountNameInput) {
    regNameInput.addEventListener('input', () => {
      if (!regAccountNameInput.dataset.userEdited && regNameInput.value) {
        regAccountNameInput.value = regNameInput.value.toUpperCase();
      }
    });
    regAccountNameInput.addEventListener('input', () => {
      regAccountNameInput.dataset.userEdited = 'true';
    });
  }

  // Check if already logged in
  if (store.isOrganizerLoggedIn()) {
    const current = store.getCurrentOrganizer();
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) {
      alertBox.className = 'auth-alert auth-alert-success';
      alertBox.style.display = 'block';
      alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> Logged in as <strong>${current.organizationName || current.name}</strong> (${current.email}). Redirecting to dashboard...`;
    }
    setTimeout(() => {
      window.location.href = 'organizer-dashboard.html';
    }, 1000);
    return;
  }

  function showAlert(msg, isSuccess = false) {
    if (!alertBox) return;
    alertBox.className = isSuccess ? 'auth-alert auth-alert-success' : 'auth-alert auth-alert-error';
    alertBox.style.display = 'block';
    alertBox.innerHTML = `${isSuccess ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>'} ${msg}`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  // Registration Form Submit Handler
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const name = document.getElementById('reg-name')?.value.trim();
      const orgName = document.getElementById('reg-org-name')?.value.trim();
      const email = document.getElementById('reg-email')?.value.trim();
      const phone = document.getElementById('reg-phone')?.value.trim();
      const instagram = document.getElementById('reg-instagram')?.value.trim();
      const orgType = document.getElementById('reg-org-type')?.value;
      const password = document.getElementById('reg-password')?.value;
      const confirmPassword = document.getElementById('reg-password-confirm')?.value;
      const bankName = document.getElementById('reg-bank-name')?.value;
      const accountNumber = document.getElementById('reg-account-number')?.value.trim();
      const accountName = document.getElementById('reg-account-name')?.value.trim();

      const chkExclusive = document.getElementById('reg-chk-exclusive')?.checked;
      const chkNoMulti = document.getElementById('reg-chk-nomulti')?.checked;
      const chkSettlement = document.getElementById('reg-chk-settlement')?.checked;
      const chkTerms = document.getElementById('reg-chk-terms')?.checked;

      // Validation
      if (!name || !orgName || !email || !phone || !password || !accountNumber || !accountName) {
        showAlert('Please fill in all required fields marked with *.');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match. Please re-enter your password.');
        return;
      }

      if (!chkExclusive || !chkNoMulti || !chkSettlement || !chkTerms) {
        showAlert('You must accept all Exclusive Ticketing & Event Submission terms to register as a Host on BOOKAM.');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-register');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Organizer Account...';
      }

      setTimeout(() => {
        const regData = {
          name,
          organizationName: orgName,
          email,
          phone,
          instagram,
          organizationType: orgType,
          password,
          bankName,
          accountNumber,
          accountName,
          agreedExclusiveTerms: true,
          agreedTermsAt: new Date().toISOString()
        };

        const result = store.registerOrganizer(regData);

        if (result.success) {
          showAlert(`🎉 Registration successful! Welcome to BOOKAM, <strong>${orgName}</strong>. Setting up your host portal...`, true);
          setTimeout(() => {
            window.location.href = 'organizer-dashboard.html';
          }, 1000);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Accept Terms & Create Host Account';
          }
          showAlert(result.message || 'Registration could not be completed. Please try again.');
        }
      }, 600);
    });
  }

  // Sign In Form Submit Handler
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const submitBtn = document.getElementById('btn-submit-login');
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
      }

      setTimeout(() => {
        const res = store.loginOrganizer(email, password);

        if (res.success) {
          showAlert(`Authentication successful! Welcome, <strong>${res.organizer.organizationName || res.organizer.name}</strong>. Opening your dashboard...`, true);
          setTimeout(() => {
            window.location.href = 'organizer-dashboard.html';
          }, 800);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Organizer Dashboard';
          }
          showAlert(res.message || 'Invalid organizer credentials. Access denied.');
        }
      }, 500);
    });
  }
});
