import ParticleBackground from './background.js';
import { initPokemonEffect } from './pokemon-effect.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js background
    new ParticleBackground();
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');
    const themeToggle = document.querySelector('.theme-toggle');
    const header = document.querySelector('header');

    // Header scroll animation
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }
        lastScroll = currentScroll;
    });

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        navOverlay.classList.toggle('active');
        
        // Animate menu items
        if (navLinks.classList.contains('active')) {
            gsap.from('.nav-links a', {
                opacity: 0,
                x: 50,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out"
            });
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });

    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        
        gsap.to(icon, {
            rotation: 360,
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
        
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    }

    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'dark') {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    loadSavedTheme();
    themeToggle.addEventListener('click', toggleTheme);

    gsap.registerPlugin(ScrollTrigger);

    // Enhanced hero section animations with parallax effect
    const heroTimeline = gsap.timeline();
    
    heroTimeline
        .from('.hero h1', { 
            opacity: 0, 
            y: 100, 
            duration: 1.5,
            ease: "power4.out"
        })
        .from('.hero p', { 
            opacity: 0, 
            y: 50, 
            duration: 1.5,
            ease: "power4.out"
        }, "-=1.2")
        .from('.hero-background .circle', {
            scale: 0,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "elastic.out(1, 0.5)"
        }, "-=1.5");

    // Parallax effect for hero section
    gsap.to('.hero-content', {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Enhanced project card animations with 3D effect
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        // Initial animation
        gsap.from(card, {
            opacity: 0,
            y: 100,
            duration: 1,
            delay: index * 0.2,
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                toggleActions: "play none none reverse"
            }
        });

        // Enhanced hover animations with 3D effect
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.05,
                rotationY: 5,
                duration: 0.4,
                ease: "power2.out",
                boxShadow: "0 20px 40px rgba(0, 255, 157, 0.2)"
            });
            
            gsap.to(card.querySelector('.project-image'), {
                scale: 1.1,
                duration: 0.4,
                ease: "power2.out"
            });

            // Animate project info
            gsap.to(card.querySelector('.project-info'), {
                y: -10,
                duration: 0.4,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                rotationY: 0,
                duration: 0.4,
                ease: "power2.out",
                boxShadow: "0 10px 20px rgba(0, 255, 157, 0.1)"
            });
            
            gsap.to(card.querySelector('.project-image'), {
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });

            gsap.to(card.querySelector('.project-info'), {
                y: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });

    // Enhanced circle animations with more dynamic movement
    const circles = [
        { element: '.circle-1', props: { x: '150px', y: '150px', rotation: 360, duration: 20, ease: "sine.inOut" } },
        { element: '.circle-2', props: { x: '-100px', y: '-100px', rotation: -360, duration: 15, ease: "sine.inOut" } },
        { element: '.circle-3', props: { scale: 1.5, rotation: 180, duration: 10, ease: "sine.inOut" } }
    ];

    circles.forEach(({ element, props }) => {
        gsap.to(element, {
            ...props,
            repeat: -1,
            yoyo: true,
            ease: props.ease
        });
    });

    // Smooth scroll with enhanced animation and parallax
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1.2,
                    scrollTo: {
                        y: target,
                        offsetY: 70
                    },
                    ease: "power3.inOut"
                });
            }
        });
    });

    // Enhanced modal animations with 3D effect
    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const modalClose = contactModal.querySelector('.modal-close');
    const contactForm = document.getElementById('contact-form');

    function toggleModal() {
        contactModal.classList.toggle('active');
        document.body.style.overflow = contactModal.classList.contains('active') ? 'hidden' : '';
        
        if (contactModal.classList.contains('active')) {
            gsap.from('.modal-content', {
                y: 100,
                rotationX: 15,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                transformOrigin: "center center"
            });
        }
    }

    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal();
    });

    modalClose.addEventListener('click', toggleModal);

    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            toggleModal();
        }
    });

    // Initialize EmailJS
    emailjs.init("qm4Ipv_8cl8leemjc");

    // Enhanced form submission animation with particle effect
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        
        // Button press animation
        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.2,
            ease: "power2.inOut"
        });
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(contactForm);
            const templateParams = {
                from_name: formData.get('name'),
                from_email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            await emailjs.send(
                'Th3',
                'template_kf11l6s',
                templateParams
            );

            // Success animation with particles
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Message sent successfully!
            `;
            
            contactForm.insertBefore(successMessage, contactForm.firstChild);
            
            gsap.from(successMessage, {
                y: -30,
                opacity: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)"
            });
            
            // Animate form reset
            gsap.to(contactForm, {
                y: -20,
                duration: 0.3,
                ease: "power2.inOut",
                yoyo: true,
                repeat: 1
            });
            
            contactForm.reset();
            
            setTimeout(() => {
                gsap.to(successMessage, {
                    opacity: 0,
                    y: -30,
                    duration: 0.5,
                    ease: "power3.in",
                    onComplete: () => successMessage.remove()
                });
            }, 3000);
            
        } catch (error) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                Failed to send message. Please try again.
            `;
            
            contactForm.insertBefore(errorMessage, contactForm.firstChild);
            
            gsap.from(errorMessage, {
                y: -30,
                opacity: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)"
            });
            
            setTimeout(() => {
                gsap.to(errorMessage, {
                    opacity: 0,
                    y: -30,
                    duration: 0.5,
                    ease: "power3.in",
                    onComplete: () => errorMessage.remove()
                });
            }, 3000);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            gsap.to(submitBtn, {
                scale: 1,
                duration: 0.2,
                ease: "power2.inOut"
            });
        }
    });

    // Add scroll-triggered animations for sections
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top bottom-=100",
                toggleActions: "play none none reverse"
            }
        });
    });
});

