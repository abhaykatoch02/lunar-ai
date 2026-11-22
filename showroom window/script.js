/**
 * CHAUDHARY MOTORS - JAVASCRIPT LOGIC (HD & DEALER ADMIN SYSTEM)
 * Full Features:
 * 1. Dealer-protected car management (Add/Edit/Delete cars with persistent localStorage)
 * 2. Customer-facing clean showroom (customers CANNOT see add/remove buttons)
 * 3. Customer Car Selling portal with all brand options & instant dynamic price calculation
 * 4. Dealer inquiries dashboard
 * 5. Full HD Hero slider, lightbox gallery, smooth scrolling & forms
 */

// Showroom Master Passcode (Confidential Dealer Access)
const DEALER_PIN = "1994";

// Default Initial Showroom Vehicles (Populates on first visit)
const DEFAULT_INVENTORY = [
    {
        id: 1,
        name: "Mahindra Thar LX Hardtop 4x4",
        brand: "Mahindra",
        year: 2023,
        price: "₹ 15.75 Lakh",
        kms: "18,000 km",
        fuel: "Diesel",
        trans: "Manual 4WD",
        category: "suv 4x4",
        badge: "Ready for Delivery",
        img: "images/car_thar.jpg"
    },
    {
        id: 2,
        name: "Mahindra Scorpio-N Z8L",
        brand: "Mahindra",
        year: 2023,
        price: "₹ 22.50 Lakh",
        kms: "14,500 km",
        fuel: "Diesel",
        trans: "Automatic",
        category: "suv",
        badge: "Single Owner",
        img: "images/car_scorpio.jpg"
    },
    {
        id: 3,
        name: "Toyota Fortuner Legender 4x2",
        brand: "Toyota",
        year: 2022,
        price: "₹ 39.80 Lakh",
        kms: "28,000 km",
        fuel: "Diesel",
        trans: "Automatic",
        category: "suv luxury",
        badge: "Certified Elite",
        img: "images/car_fortuner.jpg"
    },
    {
        id: 4,
        name: "Mahindra Scorpio Classic S11",
        brand: "Mahindra",
        year: 2023,
        price: "₹ 16.90 Lakh",
        kms: "16,200 km",
        fuel: "Diesel",
        trans: "Manual",
        category: "suv",
        badge: "Dealer Serviced",
        img: "images/hero_cars.jpg"
    }
];

// App State
let inventory = [];
let sellLeads = [];
let isDealerLoggedIn = false;
let activeFilter = "all";

document.addEventListener('DOMContentLoaded', () => {
    initInventoryStore();
    checkDealerSession();
    initNavbarScroll();
    initHeroSlider();
    initMobileNav();
    initSmoothScroll();
    initModalKeyListeners();
    initInventoryFilterTabs();
    calculateLiveEstimate();
    renderShowroomCars();
    updateHeaderCounters();
});

/* -------------------------------------------------------------
   1. INVENTORY & LOCAL STORAGE STORE
   ------------------------------------------------------------- */
function initInventoryStore() {
    const saved = localStorage.getItem('chaudhary_inventory');
    if (saved) {
        try {
            inventory = JSON.parse(saved);
        } catch (e) {
            inventory = [...DEFAULT_INVENTORY];
        }
    } else {
        inventory = [...DEFAULT_INVENTORY];
        saveInventory();
    }

    const savedLeads = localStorage.getItem('chaudhary_sell_leads');
    if (savedLeads) {
        try {
            sellLeads = JSON.parse(savedLeads);
        } catch (e) {
            sellLeads = [];
        }
    } else {
        sellLeads = [];
    }
}

function saveInventory() {
    localStorage.setItem('chaudhary_inventory', JSON.stringify(inventory));
    updateHeaderCounters();
}

function saveSellLeads() {
    localStorage.setItem('chaudhary_sell_leads', JSON.stringify(sellLeads));
    updateHeaderCounters();
}

function updateHeaderCounters() {
    const totalCount = document.getElementById('totalCarsCount');
    const adminInvCount = document.getElementById('adminInvCount');
    const dashInvCount = document.getElementById('dashInvCount');
    const adminLeadsCount = document.getElementById('adminLeadsCount');
    const dashLeadsCount = document.getElementById('dashLeadsCount');

    if (totalCount) totalCount.textContent = inventory.length;
    if (adminInvCount) adminInvCount.textContent = inventory.length;
    if (dashInvCount) dashInvCount.textContent = inventory.length;
    if (adminLeadsCount) adminLeadsCount.textContent = sellLeads.length;
    if (dashLeadsCount) dashLeadsCount.textContent = sellLeads.length;
}

/* -------------------------------------------------------------
   2. DEALER AUTHENTICATION & ACCESS CONTROL
   ------------------------------------------------------------- */
function checkDealerSession() {
    isDealerLoggedIn = sessionStorage.getItem('chaudhary_dealer_auth') === 'true';
    applyDealerUIVisibility();
}

function handleDealerLogin(e) {
    e.preventDefault();
    const pinInput = document.getElementById('dealerPin');
    const enteredPin = pinInput.value.trim();

    if (enteredPin === DEALER_PIN) {
        isDealerLoggedIn = true;
        sessionStorage.setItem('chaudhary_dealer_auth', 'true');
        closeModal('dealerLoginModal');
        applyDealerUIVisibility();
        showToast("Dealer Admin Unlocked! You can now Add, Edit, or Remove cars.");
        pinInput.value = '';
    } else {
        showToast("Incorrect Security PIN. Please contact Chaudhary Motors management.");
        pinInput.select();
    }
}

function logoutDealer() {
    isDealerLoggedIn = false;
    sessionStorage.removeItem('chaudhary_dealer_auth');
    applyDealerUIVisibility();
    showToast("Logged out of Dealer Admin. Normal customer mode restored.");
}

function applyDealerUIVisibility() {
    const adminBar = document.getElementById('dealerAdminBar');
    const inlineAddBtn = document.getElementById('dealerAddBtnInline');

    if (isDealerLoggedIn) {
        if (adminBar) adminBar.style.display = 'block';
        if (inlineAddBtn) inlineAddBtn.style.display = 'inline-flex';
    } else {
        if (adminBar) adminBar.style.display = 'none';
        if (inlineAddBtn) inlineAddBtn.style.display = 'none';
    }

    renderShowroomCars();
}

function openDealerLoginModal() {
    if (isDealerLoggedIn) {
        openAdminDashboard('inventory');
    } else {
        openModal('dealerLoginModal');
    }
}

// Keyboard shortcut: Ctrl + Shift + A directly triggers Dealer Login
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openDealerLoginModal();
    }
});

/* -------------------------------------------------------------
   3. RENDER SHOWROOM CARS (PROTECTED ACTIONS)
   ------------------------------------------------------------- */
function renderShowroomCars() {
    const grid = document.getElementById('showroomCarGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = inventory.filter(car => {
        if (activeFilter === 'all') return true;
        return (car.category || '').toLowerCase().includes(activeFilter);
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #94a3b8;">
                <p style="font-size: 1.1rem; margin-bottom: 10px;">No vehicles found in this category.</p>
                ${isDealerLoggedIn ? '<button class="btn-pill-gold" onclick="openAddCarModal()">+ Add Car in this Category</button>' : ''}
            </div>
        `;
        return;
    }

    filtered.forEach(car => {
        const card = document.createElement('div');
        card.className = 'showroom-vehicle-card';
        card.setAttribute('data-id', car.id);

        // Dealer-Only Edit & Delete buttons (hidden for customers)
        const dealerControls = isDealerLoggedIn ? `
            <div class="dealer-card-actions">
                <button class="btn-dealer-edit" onclick="openEditCarModal(${car.id})" title="Edit Vehicle Details">✏️ Edit</button>
                <button class="btn-dealer-delete" onclick="confirmDeleteCar(${car.id})" title="Remove Vehicle from Showroom">🗑️ Remove</button>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="veh-media-box">
                <img src="${car.img || 'images/car_thar.jpg'}" alt="${car.name}" class="veh-img" loading="lazy">
                ${car.badge ? `<span class="veh-badge-overlay">${car.badge}</span>` : ''}
                ${dealerControls}
            </div>
            <div class="veh-details-box">
                <div>
                    <div class="veh-top-meta">
                        <h4 class="veh-title">${car.name}</h4>
                        <span class="veh-year-chip">${car.year}</span>
                    </div>
                    <div class="veh-specs-line">
                        <span>${car.kms}</span>
                        <span>&bull;</span>
                        <span>${car.fuel}</span>
                        <span>&bull;</span>
                        <span>${car.trans}</span>
                    </div>
                </div>
                <div class="veh-bottom-row">
                    <div class="veh-price-text">${car.price}</div>
                    <button class="btn-veh-book" onclick="selectVehicleForLead('${car.name}')">Book Test Drive</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function initInventoryFilterTabs() {
    const tabs = document.querySelectorAll('.inv-filter-pill');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.getAttribute('data-filter') || 'all';
            renderShowroomCars();
        });
    });
}

/* -------------------------------------------------------------
   4. SHOWROOM ADMIN: ADD / EDIT / DELETE CARS
   ------------------------------------------------------------- */
function openAddCarModal() {
    if (!isDealerLoggedIn) {
        openModal('dealerLoginModal');
        return;
    }
    const form = document.getElementById('carInventoryForm');
    form.reset();
    document.getElementById('editCarId').value = '';
    document.getElementById('carFormTitle').textContent = 'Add New Car to Showroom';
    document.getElementById('saveCarBtn').textContent = 'Save to Showroom Inventory →';
    document.getElementById('carPresetPhoto').value = 'images/car_thar.jpg';
    document.getElementById('customPhotoWrap').style.display = 'none';
    document.getElementById('carPreviewImg').src = 'images/car_thar.jpg';

    openModal('carFormModal');
}

function openEditCarModal(carId) {
    if (!isDealerLoggedIn) return;

    const car = inventory.find(c => c.id === carId);
    if (!car) return;

    document.getElementById('editCarId').value = car.id;
    document.getElementById('carName').value = car.name;
    document.getElementById('carBrand').value = car.brand || '';
    document.getElementById('carYear').value = car.year;
    document.getElementById('carPrice').value = car.price;
    document.getElementById('carKms').value = car.kms;
    document.getElementById('carFuel').value = car.fuel;
    document.getElementById('carTrans').value = car.trans;
    document.getElementById('carCategory').value = car.category;
    document.getElementById('carBadge').value = car.badge || '';

    // Photo
    const previewImg = document.getElementById('carPreviewImg');
    previewImg.src = car.img;

    document.getElementById('carFormTitle').textContent = `Edit: ${car.name}`;
    document.getElementById('saveCarBtn').textContent = 'Update Vehicle Details →';

    openModal('carFormModal');
}

function handleSaveCar(e) {
    e.preventDefault();
    if (!isDealerLoggedIn) return;

    const editId = document.getElementById('editCarId').value;
    const name = document.getElementById('carName').value.trim();
    const brand = document.getElementById('carBrand').value.trim();
    const year = parseInt(document.getElementById('carYear').value, 10);
    const price = document.getElementById('carPrice').value.trim();
    const kms = document.getElementById('carKms').value.trim();
    const fuel = document.getElementById('carFuel').value;
    const trans = document.getElementById('carTrans').value;
    const category = document.getElementById('carCategory').value;
    const badge = document.getElementById('carBadge').value.trim();
    const img = document.getElementById('carPreviewImg').src;

    if (editId) {
        // Update existing car
        const index = inventory.findIndex(c => c.id === parseInt(editId, 10));
        if (index !== -1) {
            inventory[index] = {
                ...inventory[index],
                name, brand, year, price, kms, fuel, trans, category, badge, img
            };
            showToast(`Updated "${name}" successfully!`);
        }
    } else {
        // Create new car
        const newCar = {
            id: Date.now(),
            name, brand, year, price, kms, fuel, trans, category, badge, img
        };
        inventory.unshift(newCar);
        showToast(`Added "${name}" to the showroom inventory!`);
    }

    saveInventory();
    renderShowroomCars();
    renderAdminInventoryTable();
    closeModal('carFormModal');
}

function confirmDeleteCar(carId) {
    if (!isDealerLoggedIn) return;

    const car = inventory.find(c => c.id === carId);
    if (!car) return;

    if (confirm(`Are you sure you want to remove "${car.name}" from Chaudhary Motors showroom?`)) {
        inventory = inventory.filter(c => c.id !== carId);
        saveInventory();
        renderShowroomCars();
        renderAdminInventoryTable();
        showToast(`Removed "${car.name}" from showroom.`);
    }
}

function previewPresetPhoto() {
    const select = document.getElementById('carPresetPhoto');
    const customWrap = document.getElementById('customPhotoWrap');
    const preview = document.getElementById('carPreviewImg');

    if (select.value === 'custom') {
        customWrap.style.display = 'block';
    } else {
        customWrap.style.display = 'none';
        preview.src = select.value;
    }
}

function handleCarPhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.getElementById('carPreviewImg').src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Also support pasting external image URL
document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'carCustomUrl') {
        const val = e.target.value.trim();
        if (val.startsWith('http://') || val.startsWith('https://')) {
            document.getElementById('carPreviewImg').src = val;
        }
    }
});

/* -------------------------------------------------------------
   5. DEALER DASHBOARD: INVENTORY TABLE & SELL CAR LEADS
   ------------------------------------------------------------- */
function openAdminDashboard(activeTab = 'inventory') {
    if (!isDealerLoggedIn) {
        openModal('dealerLoginModal');
        return;
    }
    renderAdminInventoryTable();
    renderAdminLeadsTable();
    switchDashTab(activeTab);
    openModal('adminDashboardModal');
}

function switchDashTab(tabName) {
    const tabInvBtn = document.getElementById('tabInvBtn');
    const tabLeadsBtn = document.getElementById('tabLeadsBtn');
    const tabInv = document.getElementById('dashTabInventory');
    const tabLeads = document.getElementById('dashTabLeads');

    if (tabName === 'inventory') {
        tabInvBtn.classList.add('active');
        tabLeadsBtn.classList.remove('active');
        tabInv.style.display = 'block';
        tabLeads.style.display = 'none';
    } else {
        tabInvBtn.classList.remove('active');
        tabLeadsBtn.classList.add('active');
        tabInv.style.display = 'none';
        tabLeads.style.display = 'block';
    }
}

function renderAdminInventoryTable() {
    const tbody = document.getElementById('adminInventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    inventory.forEach(car => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${car.img}" style="width:48px; height:32px; object-fit:cover; border-radius:4px;">
                    <div>
                        <div class="tbl-car-name">${car.name}</div>
                        <span style="font-size:0.7rem; color:#888;">${car.brand || ''}</span>
                    </div>
                </div>
            </td>
            <td>${car.year}</td>
            <td><strong>${car.price}</strong></td>
            <td>${car.fuel} / ${car.trans}</td>
            <td><span style="text-transform:uppercase; font-size:0.7rem;">${car.category}</span></td>
            <td>
                <button class="btn-dealer-edit" onclick="closeModal('adminDashboardModal'); openEditCarModal(${car.id});">Edit</button>
                <button class="btn-dealer-delete" onclick="confirmDeleteCar(${car.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAdminLeadsTable() {
    const tbody = document.getElementById('adminLeadsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (sellLeads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#888;">No car sell inquiries received yet.</td></tr>`;
        return;
    }

    sellLeads.forEach((lead, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${lead.name}</strong><br>
                <a href="tel:${lead.phone}" style="color:#e8a735; font-size:0.78rem;">📞 ${lead.phone}</a>
            </td>
            <td>
                <strong>${lead.brand} ${lead.model}</strong> (${lead.year})<br>
                <span style="font-size:0.72rem; color:#999;">${lead.fuel} &bull; ${lead.kms}</span>
            </td>
            <td>
                <span style="color:#10b981; font-weight:700;">${lead.estimate}</span>
            </td>
            <td style="font-size:0.75rem;">${lead.date}</td>
            <td>
                <button class="btn-dealer-delete" onclick="deleteLead(${i})">Dismiss</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteLead(index) {
    sellLeads.splice(index, 1);
    saveSellLeads();
    renderAdminLeadsTable();
}

function clearAllLeads() {
    if (confirm("Clear all customer sell applications?")) {
        sellLeads = [];
        saveSellLeads();
        renderAdminLeadsTable();
    }
}

/* -------------------------------------------------------------
   6. CUSTOMER "SELL YOUR CAR" VALUATION CALCULATOR
   ------------------------------------------------------------- */
function updateModelOptions() {
    calculateLiveEstimate();
}

function calculateLiveEstimate() {
    const brand = document.getElementById('sellBrand') ? document.getElementById('sellBrand').value : 'Mahindra';
    const yearVal = document.getElementById('sellYear') ? parseInt(document.getElementById('sellYear').value, 10) : 2023;
    const fuel = document.getElementById('sellFuel') ? document.getElementById('sellFuel').value : 'Petrol';
    const kms = document.getElementById('sellKms') ? document.getElementById('sellKms').value : '20,000 - 40,000 km';
    const display = document.getElementById('estimateDisplay');

    if (!display) return;

    // Smart realistic price baseline based on brand tier & year
    let baseMin = 8.5;
    let baseMax = 10.8;

    if (['BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Jeep'].includes(brand)) {
        baseMin = 28.0;
        baseMax = 36.5;
    } else if (['Toyota', 'Mahindra'].includes(brand)) {
        baseMin = 14.5;
        baseMax = 18.2;
    } else if (['Tata', 'Hyundai', 'Kia'].includes(brand)) {
        baseMin = 10.5;
        baseMax = 13.8;
    } else if (['Maruti Suzuki', 'Honda', 'Volkswagen', 'Skoda'].includes(brand)) {
        baseMin = 7.5;
        baseMax = 10.2;
    }

    // Depreciation or appreciation by model year
    const age = 2026 - yearVal;
    const factor = Math.max(0.45, 1 - (age * 0.085));
    baseMin *= factor;
    baseMax *= factor;

    // Fuel multiplier
    if (fuel === 'Diesel') {
        baseMin *= 1.08;
        baseMax *= 1.08;
    } else if (fuel === 'Electric') {
        baseMin *= 1.12;
        baseMax *= 1.15;
    }

    // Kms multiplier
    if (kms.includes('Under 20,000')) {
        baseMin *= 1.06;
        baseMax *= 1.08;
    } else if (kms.includes('Above 1,00,000')) {
        baseMin *= 0.82;
        baseMax *= 0.85;
    }

    const minFormatted = baseMin.toFixed(2);
    const maxFormatted = baseMax.toFixed(2);

    display.textContent = `₹ ${minFormatted} L – ₹ ${maxFormatted} L`;
}

function handleCustomerSellSubmit(e) {
    e.preventDefault();
    const brand = document.getElementById('sellBrand').value;
    const model = document.getElementById('sellModel').value;
    const year = document.getElementById('sellYear').value;
    const fuel = document.getElementById('sellFuel').value;
    const kms = document.getElementById('sellKms').value;
    const name = document.getElementById('sellerName').value;
    const phone = document.getElementById('sellerPhone').value;
    const estimate = document.getElementById('estimateDisplay').textContent;

    const newLead = {
        name,
        phone,
        brand,
        model,
        year,
        fuel,
        kms,
        estimate,
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    sellLeads.unshift(newLead);
    saveSellLeads();

    e.target.reset();
    calculateLiveEstimate();

    showToast(`Application Received! Valuation: ${estimate}. Our team will call ${phone} for doorstep inspection.`);
}

function openSellCarModal() {
    const sellSection = document.getElementById('sell-car');
    if (sellSection) {
        sellSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/* -------------------------------------------------------------
   7. NAVBAR SCROLL EFFECT & ACTIVE SPY
   ------------------------------------------------------------- */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* -------------------------------------------------------------
   8. HERO SLIDER & PAGINATION DOTS
   ------------------------------------------------------------- */
let currentSlideIndex = 0;
let slideInterval = null;

function initHeroSlider() {
    const dots = document.querySelectorAll('#heroDots .dot-btn');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'), 10);
            goToSlide(index);
            restartSlideTimer();
        });
    });
    startSlideTimer();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#heroDots .dot-btn');

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    currentSlideIndex = index;
}

function startSlideTimer() {
    slideInterval = setInterval(() => {
        goToSlide(currentSlideIndex + 1);
    }, 6000);
}

function restartSlideTimer() {
    if (slideInterval) clearInterval(slideInterval);
    startSlideTimer();
}

/* -------------------------------------------------------------
   9. MOBILE NAVIGATION & SMOOTH SCROLL
   ------------------------------------------------------------- */
function initMobileNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('mobile-active');
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* -------------------------------------------------------------
   10. MODALS & COMMON LISTENERS
   ------------------------------------------------------------- */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

function openStoryModal() { openModal('storyModal'); }
function openVisitModal() { openModal('visitModal'); }
function openInventoryModal() {
    const el = document.getElementById('showroom');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function openContactModal(context = '') {
    openModal('contactModal');
    if (context) {
        const select = document.getElementById('targetCar');
        if (select) {
            let matched = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === context) {
                    select.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                const notes = document.getElementById('clientNotes');
                if (notes && !notes.value) {
                    notes.value = `Inquiry regards: ${context}`;
                }
            }
        }
    }
}

function selectVehicleForLead(carName) {
    openContactModal(carName);
    showToast(`Selected "${carName}" for Test Drive!`);
}

function initModalKeyListeners() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach(modal => {
                modal.classList.remove('open');
            });
            closeLightbox();
            document.body.style.overflow = '';
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });
}

/* -------------------------------------------------------------
   11. SHOWROOM LIGHTBOX GALLERY
   ------------------------------------------------------------- */
const lightboxData = [
    {
        src: 'images/showroom_1.jpg',
        title: 'Chaudhary Motors - Exterior Display & Main Boulevard Front',
        desc: 'Wide outdoor driveway featuring certified Mahindra Scorpio-N, Toyota Fortuner, and luxury SUVs.'
    },
    {
        src: 'images/showroom_2.jpg',
        title: 'Chaudhary Motors - Indoor Executive Display & VIP Lounge',
        desc: 'Climate-controlled multi-car arena equipped with private delivery bay and diagnostic inspection stations.'
    },
    {
        src: 'images/showroom_3.jpg',
        title: 'Chaudhary Motors - 4x4 Off-Road & Adventure Fleet',
        desc: 'Specialized lineup featuring top-spec Mahindra Thar 4x4 Hardtop and high-ground clearance expedition vehicles.'
    }
];

let activeLightboxIndex = 0;

function openLightbox(index) {
    activeLightboxIndex = index;
    updateLightboxUI();
    const lb = document.getElementById('lightboxModal');
    if (lb) lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightboxModal');
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
}

function prevLightboxSlide() {
    activeLightboxIndex = (activeLightboxIndex - 1 + lightboxData.length) % lightboxData.length;
    updateLightboxUI();
}

function nextLightboxSlide() {
    activeLightboxIndex = (activeLightboxIndex + 1) % lightboxData.length;
    updateLightboxUI();
}

function updateLightboxUI() {
    const img = document.getElementById('lightboxCurrentImg');
    const caption = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lightboxCounter');

    if (img && lightboxData[activeLightboxIndex]) {
        img.src = lightboxData[activeLightboxIndex].src;
        caption.innerHTML = `<strong>${lightboxData[activeLightboxIndex].title}</strong><br><span style="font-size:0.8rem;color:#94a3b8">${lightboxData[activeLightboxIndex].desc}</span>`;
        counter.textContent = `${activeLightboxIndex + 1} / ${lightboxData.length}`;
    }
}

/* -------------------------------------------------------------
   12. LEAD SUBMISSION & TOAST
   ------------------------------------------------------------- */
function submitLeadForm(e) {
    e.preventDefault();
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const car = document.getElementById('targetCar').value;

    closeModal('contactModal');
    showToast(`Thank you, ${name}! Your request for ${car} is received. Our showroom executive will call ${phone} shortly.`);
    e.target.reset();
}

function showToast(message) {
    const container = document.getElementById('toastHolder');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `
        <span style="font-size: 1.2rem; color: #10b981;">✓</span>
        <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}
