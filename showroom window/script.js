/**
 * CHAUDHARY MOTORS - JAVASCRIPT LOGIC
 * Interactive slider, modals, inventory filters, smooth scroll & form handlers
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initHeroSlider();
    initMobileNav();
    initSmoothScroll();
    initModalKeyListeners();
});

/* -------------------------------------------------------------
   1. NAVBAR SCROLL EFFECT & ACTIVE LINK SPY
   ------------------------------------------------------------- */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky background blur styling
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link spy
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
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
   2. HERO SLIDER & PAGINATION DOTS
   ------------------------------------------------------------- */
let currentSlideIndex = 0;
let slideInterval = null;

function initHeroSlider() {
    const dots = document.querySelectorAll('#heroDots .dot-btn');
    const slides = document.querySelectorAll('.hero-slide');

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
   3. MOBILE DRAWER NAVIGATION
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

/* -------------------------------------------------------------
   4. SMOOTH SCROLLING
   ------------------------------------------------------------- */
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
   5. MODAL SYSTEM (STORY, VISIT, INVENTORY, CONTACT)
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

function openStoryModal() {
    openModal('storyModal');
}

function openVisitModal() {
    openModal('visitModal');
}

function openInventoryModal() {
    openModal('inventoryModal');
}

function openContactModal(carOrContext = '') {
    openModal('contactModal');
    if (carOrContext) {
        const select = document.getElementById('targetCar');
        if (select) {
            let matched = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === carOrContext) {
                    select.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched && carOrContext) {
                const notes = document.getElementById('clientNotes');
                if (notes && !notes.value) {
                    notes.value = `Inquiry regards: ${carOrContext}`;
                }
            }
        }
    }
}

function selectVehicleForLead(carName) {
    closeModal('inventoryModal');
    openContactModal(carName);
    showToast(`Selected ${carName} for Test Drive!`);
}

function initModalKeyListeners() {
    // ESC key closes any open modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach(modal => {
                modal.classList.remove('open');
            });
            closeLightbox();
            document.body.style.overflow = '';
        }
    });

    // Clicking outside modal dialog closes it
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
   6. INVENTORY FILTERING & SEARCH
   ------------------------------------------------------------- */
const filterButtons = document.querySelectorAll('.inv-tab');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterVal = btn.getAttribute('data-filter');
        applyInventoryFilter(filterVal);
    });
});

function applyInventoryFilter(category) {
    const items = document.querySelectorAll('.inv-car-item');
    items.forEach(item => {
        const types = item.getAttribute('data-type') || '';
        if (category === 'all' || types.includes(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterInventorySearch() {
    const query = document.getElementById('inventorySearch').value.toLowerCase().trim();
    const items = document.querySelectorAll('.inv-car-item');
    items.forEach(item => {
        const name = (item.getAttribute('data-name') || '').toLowerCase();
        const text = item.innerText.toLowerCase();
        if (name.includes(query) || text.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

/* -------------------------------------------------------------
   7. SHOWROOM LIGHTBOX GALLERY
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
   8. FORM SUBMISSION & TOAST NOTIFICATION
   ------------------------------------------------------------- */
function submitLeadForm(event) {
    event.preventDefault();
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const car = document.getElementById('targetCar').value;

    closeModal('contactModal');
    showToast(`Thank you, ${name}! Your request for ${car} has been logged. Our showroom manager will call you at ${phone} shortly.`);
    event.target.reset();
}

function showToast(message) {
    const container = document.getElementById('toastHolder');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `
        <span style="font-size: 1.2rem;">✓</span>
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
