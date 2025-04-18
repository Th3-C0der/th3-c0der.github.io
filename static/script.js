import ParticleBackground from './background.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js background
    new ParticleBackground();
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');
    const themeToggle = document.querySelector('.theme-toggle');

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        navOverlay.classList.toggle('active');
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

    // Enhanced animations
    gsap.from('.hero h1', { 
        opacity: 0, 
        y: 50, 
        duration: 1.5,
        ease: "power4.out"
    });
    
    gsap.from('.hero p', { 
        opacity: 0, 
        y: 30, 
        duration: 1.5,
        delay: 0.5,
        ease: "power4.out"
    });
    
    gsap.from('.project-card', {
        opacity: 0,
        y: 100,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        scrollTrigger: {
            trigger: '.projects',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        }
    });
    
    // Add hover effect for project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    const circles = [
        { element: '.circle-1', props: { x: '100px', y: '100px', duration: 20 } },
        { element: '.circle-2', props: { x: '-50px', y: '-50px', duration: 15 } },
        { element: '.circle-3', props: { scale: 1.5, duration: 10 } }
    ];

    circles.forEach(({ element, props }) => {
        gsap.to(element, {
            ...props,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const modalClose = contactModal.querySelector('.modal-close');
    const contactForm = document.getElementById('contact-form');

    function toggleModal() {
        contactModal.classList.toggle('active');
        document.body.style.overflow = contactModal.classList.contains('active') ? 'hidden' : '';
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

    // Initialize EmailJS with your public key
    emailjs.init("qm4Ipv_8cl8leemjc"); // Replace with your actual EmailJS public key

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
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
                'Th3', // Replace with your EmailJS service ID
                'template_kf11l6s', // Replace with your EmailJS template ID
                templateParams
            );

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Message sent successfully!
            `;
            contactForm.insertBefore(successMessage, submitBtn);

            // Clear form
            contactForm.reset();

            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
                toggleModal();
            }, 3000);

        } catch (error) {
            console.error('Error sending message:', error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                Error sending message. Please try again.
            `;
            contactForm.insertBefore(errorMessage, submitBtn);

            // Remove error message after 3 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
