/**
 * ============================================
 * TH3-C0DER PORTFOLIO - ANIME.JS POWERED
 * OPTIMIZED VERSION - Better Performance
 * ============================================
 */

// Performance utilities
const throttle = (fn, delay) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initEnhancedCursor();
    initParticleBackground();
    initNavigation();
    initHeroAnimations();
    initScrollAnimations();
    initParallaxEffects();
    initCenterpieceAnimation();
    initProjectCards();
    initContactSection();
    initBackToTop();
    initMagneticButtons();
    initThemeToggle();
    initSmoothScroll();
    initScrollProgress();
});

/**
 * ============================================
 * ENHANCED CUSTOM CURSOR - OPTIMIZED
 * ============================================
 */
function initEnhancedCursor() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || prefersReducedMotion) {
        document.querySelector('.cursor-wrapper')?.remove();
        return;
    }

    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    // Simplified cursor styles
    const style = document.createElement('style');
    style.textContent = `
        #cursor-dot {
            position: fixed;
            width: 8px;
            height: 8px;
            background: #fff;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 99999;
            mix-blend-mode: difference;
            will-change: left, top;
        }
        
        #cursor-outline {
            position: fixed;
            width: 32px;
            height: 32px;
            border: 1.5px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 99998;
            transition: transform 0.15s ease-out, border-color 0.2s;
            will-change: left, top;
        }
        
        #cursor-trail {
            display: none; /* Disabled for performance */
        }
        
        body.cursor-hover #cursor-dot {
            transform: translate(-50%, -50%) scale(1.5);
            background: var(--accent-primary, #00ff9d);
        }
        
        body.cursor-hover #cursor-outline {
            transform: translate(-50%, -50%) scale(1.4);
            border-color: var(--accent-primary, #00ff9d);
        }
        
        body.cursor-click #cursor-outline {
            transform: translate(-50%, -50%) scale(0.9);
        }
    `;
    document.head.appendChild(style);

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let outlineX = 0, outlineY = 0;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    function updateCursor() {
        // Smooth follow
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;
        outlineX += (mouseX - outlineX) * 0.12;
        outlineY += (mouseY - outlineY) * 0.12;

        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        rafId = requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover detection - use event delegation
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .magnetic-btn, .project-card, .pg-card, .social-link');
        if (target) {
            document.body.classList.add('cursor-hover');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('a, button, .magnetic-btn, .project-card, .pg-card, .social-link');
        if (target) {
            document.body.classList.remove('cursor-hover');
        }
    }, { passive: true });

    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'), { passive: true });
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'), { passive: true });

    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
        } else {
            updateCursor();
        }
    });
}

/**
 * ============================================
 * PARTICLE BACKGROUND - OPTIMIZED
 * Reduced particle count for performance
 * ============================================
 */
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        particles = [];
        // Reduced count - max 40 particles
        const count = Math.min(40, Math.floor((canvas.width * canvas.height) / 30000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.4 + 0.1
            });
        }
    }

    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 157, ${p.opacity})`;
            ctx.fill();
        }

        // Draw connections - optimized (skip every other)
        for (let i = 0; i < particles.length; i += 2) {
            for (let j = i + 2; j < particles.length; j += 2) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy; // Skip sqrt for performance

                if (dist < 10000) { // 100^2
                    const opacity = (1 - dist / 10000) * 0.08;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 157, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

/**
 * ============================================
 * NAVIGATION
 * ============================================
 */
function initNavigation() {
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const mobileOverlay = document.getElementById('mobile-overlay');

    // Throttled scroll handler
    const handleScroll = throttle(() => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            mobileOverlay?.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        mobileOverlay?.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileOverlay?.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

/**
 * ============================================
 * HERO ANIMATIONS - SIMPLIFIED
 * ============================================
 */
function initHeroAnimations() {
    if (prefersReducedMotion) return;

    // Badge
    anime({
        targets: '.hero-badge',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: 200,
        easing: 'easeOutCubic'
    });

    // Title characters
    const titleLines = document.querySelectorAll('.char-wrapper');
    titleLines.forEach((wrapper, index) => {
        const text = wrapper.textContent;
        wrapper.innerHTML = text.split('').map(char =>
            `<span class="char" style="display:inline-block;opacity:0">${char === ' ' ? '\u00A0' : char}</span>`
        ).join('');

        anime({
            targets: wrapper.querySelectorAll('.char'),
            opacity: [0, 1],
            translateY: ['50%', '0%'],
            duration: 500,
            delay: anime.stagger(20, { start: 400 + index * 150 }),
            easing: 'easeOutCubic'
        });
    });

    // Words
    anime({
        targets: '.word-animate',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        delay: anime.stagger(40, { start: 900 }),
        easing: 'easeOutCubic'
    });

    // CTA
    anime({
        targets: '.hero-cta',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 500,
        delay: 1200,
        easing: 'easeOutCubic'
    });
}

/**
 * ============================================
 * SCROLL ANIMATIONS - OPTIMIZED
 * Using IntersectionObserver only
 * ============================================
 */
function initScrollAnimations() {
    if (prefersReducedMotion) return;

    const animatedElements = document.querySelectorAll(
        '.section-header, .project-card, .blog-card, .pg-card, .about-content'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [40, 0],
                    duration: 600,
                    easing: 'easeOutCubic'
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

/**
 * ============================================
 * PARALLAX EFFECTS - OPTIMIZED
 * Throttled and simplified
 * ============================================
 */
function initParallaxEffects() {
    if (prefersReducedMotion) return;

    const floatingShapes = document.querySelectorAll('.floating-shape');
    const centerpiece = document.getElementById('centerpiece');

    if (!floatingShapes.length && !centerpiece) return;

    const updateParallax = throttle(() => {
        const scrollY = window.pageYOffset;
        const vh = window.innerHeight;

        floatingShapes.forEach((shape, i) => {
            const speed = 0.05 + (i * 0.03);
            const y = scrollY * speed;
            const rotate = scrollY * 0.02 * (i % 2 === 0 ? 1 : -1);
            shape.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;
        });

        if (centerpiece && scrollY < vh) {
            const progress = scrollY / vh;
            centerpiece.style.opacity = 1 - progress;
            centerpiece.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.3}px)) scale(${1 - progress * 0.3})`;
        }
    }, 16); // ~60fps

    window.addEventListener('scroll', updateParallax, { passive: true });
}

/**
 * ============================================
 * CENTERPIECE ANIMATION - BREATHING NEURAL CLOUD
 * A gentle, organic, volumetric particle system
 * ============================================
 */
function initCenterpieceAnimation() {
    if (prefersReducedMotion) return;

    const container = document.getElementById('centerpiece');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '10';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;
    let mouseX = 0, mouseY = 0;

    // Configuration
    const config = {
        particleCount: 100, // Slightly more for volume
        radius: 160,
        baseColor: '#00ff9d',
        accentColor: '#00f0ff',
        connectionDist: 70, // Increased for better web
        rotationSpeed: 0.001, // Very slow drift
        pulseSpeed: 0.002
    };

    class Point3D {
        constructor() {
            // Volumetric distribution (random point inside sphere)
            // Use rejection sampling or spherical coords with cbrt of radius
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = Math.cbrt(Math.random()) * config.radius; // Cubic root for uniform distribution

            this.x = r * Math.sin(phi) * Math.cos(theta);
            this.y = r * Math.sin(phi) * Math.sin(theta);
            this.z = r * Math.cos(phi);

            // Original pos for "breathing" reference
            this.ox = this.x;
            this.oy = this.y;
            this.oz = this.z;

            this.baseSize = Math.random() * 2 + 0.5;
            // Individual drift
            this.driftX = (Math.random() - 0.5) * 0.2;
            this.driftY = (Math.random() - 0.5) * 0.2;
            this.driftZ = (Math.random() - 0.5) * 0.2;
        }

        rotate(angleX, angleY) {
            // Standard 3D rotation matrix
            let cos = Math.cos(angleY);
            let sin = Math.sin(angleY);
            let x = this.x * cos - this.z * sin;
            let z = this.z * cos + this.x * sin;
            this.x = x;
            this.z = z;

            cos = Math.cos(angleX);
            sin = Math.sin(angleX);
            let y = this.y * cos - this.z * sin;
            z = this.z * cos + this.y * sin;
            this.y = y;
            this.z = z;
        }

        update(time) {
            // Add drift
            this.x += this.driftX;
            this.y += this.driftY;
            this.z += this.driftZ;

            // Breathing effect: Move slightly towards/away from center based on time
            // Keep particles somewhat bound to their volume but feeling "alive"
            const dist = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

            // Soft boundary
            if (dist > config.radius + 20) {
                const force = 0.01;
                this.x -= this.x * force;
                this.y -= this.y * force;
                this.z -= this.z * force;
            }
        }
    }

    function resize() {
        width = 600;
        height = 600;
        canvas.width = width;
        canvas.height = height;

        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Point3D());
        }
    }

    // Smoother mouse tracking
    let targetMouseX = 0, targetMouseY = 0;
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left - rect.width / 2) * 0.00005; // Very subtle interaction
        targetMouseY = (e.clientY - rect.top - rect.height / 2) * 0.00005;
    }, { passive: true });

    function getThemeColors() {
        const isLight = document.body.classList.contains('light-mode');
        return isLight ?
            { base: '#00cc7e', accent: '#00a86b' } :
            { base: '#00ff9d', accent: '#00f0ff' };
    }

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += config.pulseSpeed;

        // Smooth mouse lerp
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        const colors = getThemeColors();

        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Global slow rotation + mouse tilt
        const rotX = config.rotationSpeed - mouseY;
        const rotY = config.rotationSpeed + mouseX;

        // Sort for depth
        particles.sort((a, b) => b.z - a.z);

        particles.forEach(p => {
            p.rotate(rotX, rotY);
            p.update(time);
        });

        // Draw Connections
        ctx.lineWidth = 0.5;
        ctx.lineCap = 'round';

        // Optimization: only check neighbors in sorted array to save perf? 
        // Or just brute force for 100 particles is fine (100*100/2 = 5000 checks, negligible)
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const distSq = dx * dx + dy * dy + dz * dz;
                const maxDistSq = config.connectionDist * config.connectionDist;

                if (distSq < maxDistSq) {
                    const alpha = 1 - (distSq / maxDistSq);
                    const zFactor = (p1.z + config.radius) / (2 * config.radius);

                    ctx.strokeStyle = colors.accent; // Consistently use accent for lines
                    ctx.globalAlpha = alpha * zFactor * 0.6; // Subtle lines
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;

        // Draw Particles
        particles.forEach(p => {
            const scale = (p.z + config.radius * 2) / (config.radius * 3);
            const size = Math.max(0.1, p.baseSize * scale);
            const alpha = Math.max(0.1, (p.z + config.radius) / (2 * config.radius));

            // Pulse size slightly
            const pulse = 1 + Math.sin(time * 2 + p.x) * 0.1;

            ctx.fillStyle = colors.base;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.arc(p.x, p.y, size * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Occasional "data packet" glow
            if (Math.random() < 0.005) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffffff';
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.fillStyle = colors.base;
                ctx.shadowBlur = 0;
            }
        });

        ctx.restore();
        animationId = requestAnimationFrame(animate);
    }

    resize();
    animate();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    });
    observer.observe(container);
}

/**
 * ============================================
 * PROJECT CARDS
 * ============================================
 */
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', throttle((e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        }, 50), { passive: true });
    });
}

/**
 * ============================================
 * CONTACT SECTION (NOT MODAL)
 * New inline contact section
 * ============================================
 */
function initContactSection() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    // Form field animations
    const formGroups = form.querySelectorAll('.form-group');

    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        if (!input) return;

        input.addEventListener('focus', () => {
            group.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                group.classList.remove('focused');
            }
        });

        // Check initial state
        if (input.value) {
            group.classList.add('focused');
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;

        submitBtn.classList.add('loading');
        btnText.textContent = 'Sending...';

        // Simulate sending (replace with actual EmailJS)
        await new Promise(resolve => setTimeout(resolve, 1500));

        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        btnText.textContent = 'Message Sent!';

        // Reset form
        form.reset();
        formGroups.forEach(g => g.classList.remove('focused'));

        // Reset button after delay
        setTimeout(() => {
            submitBtn.classList.remove('success');
            btnText.textContent = originalText;
        }, 3000);
    });
}

/**
 * ============================================
 * BACK TO TOP
 * ============================================
 */
function initBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    const progressCircle = button.querySelector('.progress-ring circle');
    const circumference = 100.53;

    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollTop > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }

        if (progressCircle) {
            const progress = scrollTop / docHeight;
            progressCircle.style.strokeDashoffset = circumference - (progress * circumference);
        }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * ============================================
 * MAGNETIC BUTTONS - OPTIMIZED
 * ============================================
 */
function initMagneticButtons() {
    if (prefersReducedMotion) return;

    const buttons = document.querySelectorAll('.magnetic-btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', throttle((e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        }, 50), { passive: true });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        }, { passive: true });
    });
}

/**
 * ============================================
 * THEME TOGGLE
 * ============================================
 */
function initThemeToggle() {
    const toggle = document.getElementById('theme-switch');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

/**
 * ============================================
 * SMOOTH SCROLL
 * ============================================
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/**
 * ============================================
 * SCROLL PROGRESS BAR
 * ============================================
 */
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
    document.body.appendChild(progressBar);

    const style = document.createElement('style');
    style.textContent = `
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: transparent;
            z-index: 10001;
        }
        .scroll-progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00ff9d, #00f0ff);
            transition: width 0.1s linear;
        }
    `;
    document.head.appendChild(style);

    const fill = progressBar.querySelector('.scroll-progress-fill');

    const updateProgress = throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        fill.style.width = `${(scrollTop / docHeight) * 100}%`;
    }, 50);

    window.addEventListener('scroll', updateProgress, { passive: true });
}
