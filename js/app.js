/**
 * Yuva Chaitanya Charitable Trust - Interactive Application Script
 * Regd. No.: 278/2017 | Visakhapatnam, AP, India
 */

// Global State
const YCCApp = {
  currentUser: null,
  donations: [],
  currentDonation: {
    amount: 1000,
    cause: 'General Trust Fund',
    frequency: 'One-Time',
    paymentMethod: 'UPI'
  }
};

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  checkLoggedInUser();
  initEventListeners();
  calculateTaxSavings();
  updateHistoryTable();
});

// Storage Initialization
function initStorage() {
  if (!localStorage.getItem('ycc_users')) {
    localStorage.setItem('ycc_users', JSON.stringify([]));
  }
  if (!localStorage.getItem('ycc_donations')) {
    // Seed initial demo donation history for realistic feel
    const seedDonations = [
      {
        id: 'YCC-2026-80G-1092',
        donorName: 'Venkata Ramana',
        email: 'ramana@example.com',
        pan: 'ABCDE1234F',
        amount: 5000,
        taxDeduction: 2500,
        cause: 'Child Education Program',
        date: '2026-08-01',
        paymentMethod: 'UPI (PhonePe)'
      }
    ];
    localStorage.setItem('ycc_donations', JSON.stringify(seedDonations));
  }
  YCCApp.donations = JSON.parse(localStorage.getItem('ycc_donations'));
}

// Check Session User
function checkLoggedInUser() {
  const sessionUser = JSON.parse(localStorage.getItem('ycc_current_user'));
  if (sessionUser) {
    YCCApp.currentUser = sessionUser;
    updateUIForLoggedInUser();
  }
}

function updateUIForLoggedInUser() {
  const authNavBtn = document.getElementById('authNavBtn');
  const userGreeting = document.getElementById('userGreeting');
  
  if (YCCApp.currentUser) {
    authNavBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${YCCApp.currentUser.name.split(' ')[0]} (Dashboard)`;
    authNavBtn.onclick = openDashboardModal;
    authNavBtn.classList.remove('btn-outline');
    authNavBtn.classList.add('btn-primary');
    
    if (userGreeting) {
      userGreeting.textContent = `Welcome back, ${YCCApp.currentUser.name}!`;
    }
  } else {
    authNavBtn.innerHTML = `<i class="fas fa-user"></i> Login / Register`;
    authNavBtn.onclick = openLoginModal;
    authNavBtn.classList.remove('btn-primary');
    authNavBtn.classList.add('btn-outline');
  }
}

// Event Listeners Setup
function initEventListeners() {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Quick Preset Buttons Selection (Hero & Modal)
  setupPresetButtons('.hero-preset-btn', '#heroCustomAmount');
  setupPresetButtons('.modal-preset-btn', '#modalCustomAmount');

  // Input Validation Listeners
  const heroInput = document.getElementById('heroCustomAmount');
  if (heroInput) {
    heroInput.addEventListener('input', (e) => validateAmount(e.target, '#heroAmountError'));
  }
  
  const modalInput = document.getElementById('modalCustomAmount');
  if (modalInput) {
    modalInput.addEventListener('input', (e) => validateAmount(e.target, '#modalAmountError'));
  }

  // Tax Calculator Inputs
  const calcAmountInput = document.getElementById('calcAmount');
  const calcSlabSelect = document.getElementById('calcSlab');
  if (calcAmountInput && calcSlabSelect) {
    calcAmountInput.addEventListener('input', calculateTaxSavings);
    calcSlabSelect.addEventListener('change', calculateTaxSavings);
  }
}

// Preset Buttons Setup Helper
function setupPresetButtons(btnSelector, inputSelector) {
  const buttons = document.querySelectorAll(btnSelector);
  const inputEl = document.querySelector(inputSelector);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const amt = parseInt(btn.dataset.amount);
      if (inputEl) {
        inputEl.value = amt;
        validateAmount(inputEl, inputSelector.includes('hero') ? '#heroAmountError' : '#modalAmountError');
      }
    });
  });
}

// Amount Validation Routine (Min ₹10, Max ₹1,00,000)
function validateAmount(inputEl, errorSelector) {
  const errorEl = document.querySelector(errorSelector);
  const val = parseInt(inputEl.value) || 0;

  if (val < 10) {
    if (errorEl) {
      errorEl.textContent = 'Minimum donation amount is ₹10.';
      errorEl.classList.add('error');
    }
    return false;
  } else if (val > 100000) {
    if (errorEl) {
      errorEl.textContent = 'Maximum donation limit per transaction is ₹1,00,000 (1 Lakh).';
      errorEl.classList.add('error');
    }
    return false;
  } else {
    if (errorEl) {
      errorEl.textContent = 'Eligible for 50% Tax Exemption under Sec 80G.';
      errorEl.classList.remove('error');
    }
    return true;
  }
}

// 80G Tax Savings Interactive Calculator
function calculateTaxSavings() {
  const amtInput = document.getElementById('calcAmount');
  const slabSelect = document.getElementById('calcSlab');
  
  if (!amtInput || !slabSelect) return;

  let amount = parseInt(amtInput.value) || 0;
  
  // Cap for calculator visualization
  if (amount < 10) amount = 10;
  if (amount > 100000) amount = 100000;

  const slabRate = parseFloat(slabSelect.value); // 0.10, 0.20, 0.30
  
  const eligibleDeduction = amount * 0.50; // 50% deduction under Section 80G
  const taxSavings = eligibleDeduction * (slabRate * 1.04); // Including 4% health & education cess
  const effectiveCost = amount - taxSavings;

  document.getElementById('resDonationAmt').textContent = `₹${amount.toLocaleString('en-IN')}`;
  document.getElementById('res80gDeduction').textContent = `₹${eligibleDeduction.toLocaleString('en-IN')}`;
  document.getElementById('resTaxSaved').textContent = `₹${Math.round(taxSavings).toLocaleString('en-IN')}`;
  document.getElementById('resEffectiveCost').textContent = `₹${Math.round(effectiveCost).toLocaleString('en-IN')}`;
}

// Modal Handlers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Open Quick Donate Modal with custom parameters
function triggerDonateModal(defaultAmount = 1000, causeName = 'General Trust Fund') {
  YCCApp.currentDonation.cause = causeName;
  const causeSelect = document.getElementById('modalCauseSelect');
  if (causeSelect) {
    causeSelect.value = causeName;
  }

  const amtInput = document.getElementById('modalCustomAmount');
  if (amtInput) {
    amtInput.value = defaultAmount;
  }

  // Pre-fill user data if logged in
  if (YCCApp.currentUser) {
    document.getElementById('donorName').value = YCCApp.currentUser.name || '';
    document.getElementById('donorEmail').value = YCCApp.currentUser.email || '';
    document.getElementById('donorPhone').value = YCCApp.currentUser.phone || '';
    document.getElementById('donorPAN').value = YCCApp.currentUser.pan || '';
  }

  openModal('donateModal');
}

// Handle Payment Method Tab Switch in Modal
function selectPaymentTab(element, method) {
  document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
  element.classList.add('active');
  YCCApp.currentDonation.paymentMethod = method;

  document.getElementById('payMethodUPI').style.display = method === 'UPI' ? 'block' : 'none';
  document.getElementById('payMethodCard').style.display = method === 'Card' ? 'block' : 'none';
  document.getElementById('payMethodNet').style.display = method === 'NetBanking' ? 'block' : 'none';
}

// Execute Simulated Payment & Generate 80G Receipt
function processDonation(event) {
  event.preventDefault();

  const amountInput = document.getElementById('modalCustomAmount');
  const amount = parseInt(amountInput.value);

  if (!validateAmount(amountInput, '#modalAmountError')) {
    showToast('Please enter a valid amount between ₹10 and ₹1,00,000.', 'error');
    return;
  }

  const name = document.getElementById('donorName').value.trim();
  const email = document.getElementById('donorEmail').value.trim();
  const phone = document.getElementById('donorPhone').value.trim();
  const pan = document.getElementById('donorPAN').value.trim().toUpperCase();
  const cause = document.getElementById('modalCauseSelect').value;

  if (!name || !email || !phone || !pan) {
    showToast('Please fill all required fields, including PAN for 80G tax receipt.', 'error');
    return;
  }

  // Simulate payment processing loader
  const submitBtn = document.getElementById('donateSubmitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Secure Payment...`;

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    // Create Donation Record
    const receiptNo = `YCC-80G-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toISOString().split('T')[0];
    const donationRecord = {
      id: receiptNo,
      donorName: name,
      email: email,
      phone: phone,
      pan: pan,
      amount: amount,
      taxDeduction: amount * 0.5,
      cause: cause,
      date: dateStr,
      paymentMethod: YCCApp.currentDonation.paymentMethod
    };

    // Save to local storage history
    YCCApp.donations.unshift(donationRecord);
    localStorage.setItem('ycc_donations', JSON.stringify(YCCApp.donations));

    closeModal('donateModal');
    showToast('Donation successful! Generating 80G Tax Exemption Receipt...', 'success');

    // Launch 80G Receipt Preview Modal
    display80GReceipt(donationRecord);
    updateHistoryTable();
  }, 1500);
}

// Display 80G Tax Exemption Receipt Modal
function display80GReceipt(donation) {
  document.getElementById('rcpNo').textContent = donation.id;
  document.getElementById('rcpDate').textContent = donation.date;
  document.getElementById('rcpName').textContent = donation.donorName;
  document.getElementById('rcpPAN').textContent = donation.pan;
  document.getElementById('rcpCause').textContent = donation.cause;
  document.getElementById('rcpPayMethod').textContent = donation.paymentMethod;
  document.getElementById('rcpAmount').textContent = `₹${donation.amount.toLocaleString('en-IN')}`;
  document.getElementById('rcpWords').textContent = numberToWordsRupees(donation.amount);
  document.getElementById('rcpTaxDeduction').textContent = `₹${(donation.amount * 0.5).toLocaleString('en-IN')}`;

  openModal('receiptModal');
}

// Print / Save Receipt PDF
function print80GReceipt() {
  window.print();
}

// User Registration Flow
function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone = document.getElementById('regPhone').value.trim();
  const pan = document.getElementById('regPAN').value.trim().toUpperCase();
  const password = document.getElementById('regPassword').value;

  const users = JSON.parse(localStorage.getItem('ycc_users')) || [];

  if (users.find(u => u.email === email)) {
    showToast('An account with this email already exists. Please login.', 'error');
    return;
  }

  const newUser = { id: Date.now(), name, email, phone, pan, password };
  users.push(newUser);
  localStorage.setItem('ycc_users', JSON.stringify(users));

  // Log in automatically
  YCCApp.currentUser = newUser;
  localStorage.setItem('ycc_current_user', JSON.stringify(newUser));

  closeModal('registerModal');
  updateUIForLoggedInUser();
  showToast(`Account created successfully! Welcome, ${name}.`, 'success');
}

// User Login Flow
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const users = JSON.parse(localStorage.getItem('ycc_users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    YCCApp.currentUser = user;
    localStorage.setItem('ycc_current_user', JSON.stringify(user));
    closeModal('loginModal');
    updateUIForLoggedInUser();
    showToast(`Welcome back, ${user.name}!`, 'success');
  } else {
    showToast('Invalid email or password. Please try again.', 'error');
  }
}

// Logout
function logoutUser() {
  YCCApp.currentUser = null;
  localStorage.removeItem('ycc_current_user');
  closeModal('dashboardModal');
  updateUIForLoggedInUser();
  showToast('Logged out successfully.', 'success');
}

// Modal Switches
function openLoginModal() {
  closeModal('registerModal');
  openModal('loginModal');
}

function openRegisterModal() {
  closeModal('loginModal');
  openModal('registerModal');
}

function openDashboardModal() {
  if (!YCCApp.currentUser) {
    openLoginModal();
    return;
  }

  document.getElementById('dashUserName').textContent = YCCApp.currentUser.name;
  document.getElementById('dashUserEmail').textContent = YCCApp.currentUser.email;
  document.getElementById('dashUserPhone').textContent = YCCApp.currentUser.phone;
  document.getElementById('dashUserPAN').textContent = YCCApp.currentUser.pan || 'Not Provided';

  // Calculate user total contributions
  const userDonations = YCCApp.donations.filter(d => 
    d.email && YCCApp.currentUser.email && d.email.toLowerCase() === YCCApp.currentUser.email.toLowerCase()
  );

  const totalDonated = userDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalTaxSaved = totalDonated * 0.5 * 0.30; // Approx 30% tax slab savings

  document.getElementById('dashTotalDonated').textContent = `₹${totalDonated.toLocaleString('en-IN')}`;
  document.getElementById('dashTaxSavingsEst').textContent = `₹${Math.round(totalTaxSaved).toLocaleString('en-IN')}`;

  // Populate User History Table inside Modal
  const tbody = document.getElementById('dashHistoryBody');
  if (tbody) {
    if (userDonations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No donations recorded yet. Make your first contribution today!</td></tr>`;
    } else {
      tbody.innerHTML = userDonations.map(d => `
        <tr>
          <td><strong>${d.id}</strong></td>
          <td>${d.date}</td>
          <td>₹${d.amount.toLocaleString('en-IN')}</td>
          <td><span class="badge-80g-pill">₹${d.taxDeduction.toLocaleString('en-IN')}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="fetchAndShowReceipt('${d.id}')">
              <i class="fas fa-file-download"></i> Receipt
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  openModal('dashboardModal');
}

function fetchAndShowReceipt(receiptId) {
  const donation = YCCApp.donations.find(d => d.id === receiptId);
  if (donation) {
    closeModal('dashboardModal');
    display80GReceipt(donation);
  }
}

// Update Recent Public Donations Table on Page
function updateHistoryTable() {
  const tbody = document.getElementById('recentDonationsBody');
  if (!tbody) return;

  const recent = YCCApp.donations.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No recent donations yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(d => `
    <tr>
      <td>${maskName(d.donorName)}</td>
      <td>₹${d.amount.toLocaleString('en-IN')}</td>
      <td>${d.cause}</td>
      <td><span class="badge-80g-pill"><i class="fas fa-check-circle"></i> 80G Certified</span></td>
    </tr>
  `).join('');
}

// Mask Name for Privacy (e.g., V***** R****)
function maskName(name) {
  if (!name) return 'Anonymous';
  const parts = name.split(' ');
  return parts.map(p => p[0] + '*'.repeat(Math.max(1, p.length - 1))).join(' ');
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Helper: Convert Number to Words for Official Receipt
function numberToWordsRupees(amount) {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero Rupees Only';

  function convertGroup(n) {
    let str = '';
    if (n >= 100) {
      str += words[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += words[n] + ' ';
    }
    return str;
  }

  let result = '';
  let lakh = Math.floor(amount / 100000);
  let thousand = Math.floor((amount % 100000) / 1000);
  let remaining = amount % 1000;

  if (lakh > 0) {
    result += convertGroup(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    result += convertGroup(thousand) + 'Thousand ';
  }
  if (remaining > 0) {
    result += convertGroup(remaining);
  }

  return result.trim() + ' Rupees Only';
}
