
const API_URL = "https://script.google.com/macros/s/AKfycbzl717Y-4DxUNX1p-sK6bmb0_yUVCtVSWH_HDMqNWlGJF7_E7YjT9WoV8ql8LxV00Q6Pg/exec";

function toggleNav() { document.getElementById('nav-links').classList.toggle('open'); }
window.addEventListener('resize', () => { if (window.innerWidth > 960) document.getElementById('nav-links').classList.remove('open'); });
document.querySelectorAll('.nav-links a').forEach(a => { a.addEventListener('click', () => document.getElementById('nav-links').classList.remove('open')); });
const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.1 });
document.querySelectorAll('.fade-up,.fade-left,.fade-right').forEach(el => obs.observe(el));
document.querySelectorAll('.steps-grid .step-card,.flavour-grid .flavour-chip,.benefits-list .benefit-item').forEach((el, i) => { el.style.transitionDelay = `${i * 0.07}s`; });

const contactForm = document.querySelector('.contact-form');
const submitBtnEl = contactForm ? contactForm.querySelector('.form-submit') : null;
const messageField = contactForm ? contactForm.querySelector('.form-textarea') : null;
if (messageField && !messageField.id) messageField.id = 'query';
if (submitBtnEl) {
    submitBtnEl.id = 'submitBtn';
    submitBtnEl.innerHTML = '<span id="btnText">Send Message</span>';
    submitBtnEl.removeAttribute('onclick');
    submitBtnEl.setAttribute('type', 'button');
    submitBtnEl.addEventListener('click', submitForm);
}
if (contactForm && !document.getElementById('formStatus')) {
    const status = document.createElement('div');
    status.id = 'formStatus';
    status.className = 'form-status';
    contactForm.appendChild(status);
}

function submitForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const type = document.getElementById('enquiry-type').value.trim();
    const query = document.getElementById('query').value.trim();
    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');

    if (!name || !email || !query) {
        showStatus('Please fill in your name, email, and message.', 'error');
        return;
    }

    btn.disabled = true;
    btn.classList.remove('is-success');
    btnText.textContent = 'Sending...';
    showStatus('', '');

    fetch(API_URL, {
        method: 'POST', body: JSON.stringify({
            action: 'add_lead',
            name,
            email,
            phone,
            query: (type ? `[${type}] ` : '') + query
        })
    })
        .then(r => r.json())
        .then(() => {
            btn.classList.add('is-success');
            btnText.textContent = "Sent! We'll be in touch soon";
            showStatus("Message sent successfully. We'll contact you soon.", 'success');
            ['name', 'email', 'phone', 'query'].forEach(id => {
                const field = document.getElementById(id);
                if (field) field.value = '';
            });
            document.getElementById('enquiry-type').value = '';
            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('is-success');
                btnText.textContent = 'Send Message';
            }, 4500);
        })
        .catch(() => {
            btn.disabled = false;
            btn.classList.remove('is-success');
            btnText.textContent = 'Send Message';
            showStatus('Something went wrong. Please call us on +44 7887 699 208.', 'error');
        });
}

function showStatus(message, type) {
    const status = document.getElementById('formStatus');
    if (!status) return;
    if (!message) {
        status.textContent = '';
        status.className = 'form-status';
        status.style.display = 'none';
        return;
    }
    status.textContent = message;
    status.className = `form-status ${type}`;
    status.style.display = 'block';
}

window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    const compact = window.innerWidth <= 960;
    if (window.scrollY > 80) {
        nav.style.padding = compact ? '0.6rem 1rem' : '0.6rem 4rem';
        nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.2)';
    }
    else {
        nav.style.padding = compact ? '0.9rem 1.5rem' : '1rem 4rem';
        nav.style.boxShadow = 'none';
    }
});

/* NEW FEATURES LOGIC */

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isOpen = faqItem.classList.contains('active');
        
        // Close all other items
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
        
        // Toggle current item
        if (!isOpen) {
            faqItem.classList.add('active');
        }
    });
});

// Reviews Carousel
const track = document.getElementById('reviews-track');
const prevBtn = document.getElementById('rev-prev');
const nextBtn = document.getElementById('rev-next');
let index = 0;
let isRevAnimating = false;

function updateCarousel(newIndex) {
    if (!track || isRevAnimating) return;
    const cards = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.dot');
    
    if (newIndex < 0) newIndex = cards.length - 1;
    if (newIndex >= cards.length) newIndex = 0;
    if (newIndex === index && cards[index].classList.contains('active')) return;

    isRevAnimating = true;

    // 1. Fade out current
    cards.forEach(c => c.classList.remove('active'));
    
    // 2. Wait for fade out then fade in next
    setTimeout(() => {
        index = newIndex;
        cards[index].classList.add('active');
        
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        
        isRevAnimating = false;
    }, 350); // Sync with CSS transition
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        updateCarousel(index + 1);
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        updateCarousel(index - 1);
    });
}

document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.addEventListener('click', () => updateCarousel(i));
});

// Auto slide
setInterval(() => {
    if (!isRevAnimating) updateCarousel(index + 1);
}, 6000);

// Pause on hover
const carouselWrap = document.querySelector('.reviews-carousel-wrap');
if (carouselWrap) {
    carouselWrap.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carouselWrap.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            if (nextBtn) nextBtn.click();
        }, 5000);
    });
}

// Update carousel on resize
window.addEventListener('resize', () => {
    updateCarousel(index);
});

// Franchise "Tap to Real" - Intersection Observer for smooth feel
const franchiseSection = document.getElementById('franchise');
const fObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        const track = document.querySelector('.franchise-track');
        if (!track) return;
        if (e.isIntersecting) {
            track.style.animationPlayState = 'running';
        } else {
            track.style.animationPlayState = 'paused';
        }
    });
}, { threshold: 0.1 });
if (franchiseSection) fObs.observe(franchiseSection);

// --- 3D JUICE SHOWCASE (Cover Flow) LOGIC ---
const showcaseCards = document.querySelectorAll('.showcase-card');
const sNext = document.getElementById('showcase-next');
const sPrev = document.getElementById('showcase-prev');
let sIndex = 0;

function updateShowcase() {
    if (!showcaseCards.length) return;
    
    showcaseCards.forEach((card, i) => {
        card.classList.remove('active', 'prev', 'next');
        
        if (i === sIndex) {
            card.classList.add('active');
        } else if (i === (sIndex - 1 + showcaseCards.length) % showcaseCards.length) {
            card.classList.add('prev');
        } else if (i === (sIndex + 1) % showcaseCards.length) {
            card.classList.add('next');
        }
    });
}

if (sNext) {
    sNext.addEventListener('click', () => {
        sIndex = (sIndex + 1) % showcaseCards.length;
        updateShowcase();
    });
}

if (sPrev) {
    sPrev.addEventListener('click', () => {
        sIndex = (sIndex - 1 + showcaseCards.length) % showcaseCards.length;
        updateShowcase();
    });
}

// Auto-slide showcase
let sAutoSlide = setInterval(() => {
    sIndex = (sIndex + 1) % showcaseCards.length;
    updateShowcase();
}, 5000);

// Pause on hover
const sContainer = document.querySelector('.juice-showcase');
if (sContainer) {
    sContainer.addEventListener('mouseenter', () => clearInterval(sAutoSlide));
    sContainer.addEventListener('mouseleave', () => {
        sAutoSlide = setInterval(() => {
            sIndex = (sIndex + 1) % showcaseCards.length;
            updateShowcase();
        }, 5000);
    });
}

// Initialize
updateShowcase();
