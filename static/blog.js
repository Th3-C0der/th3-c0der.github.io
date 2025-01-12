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

    // Theme functionality
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
            themeToggle.querySelector('i').classList.remove('fa-sun');
            themeToggle.querySelector('i').classList.add('fa-moon');
        } else {
            document.body.classList.add('light-mode');
            themeToggle.querySelector('i').classList.remove('fa-moon');
            themeToggle.querySelector('i').classList.add('fa-sun');
        }
    }

    loadSavedTheme();
    themeToggle.addEventListener('click', toggleTheme);

    // Blog-specific animations
    gsap.registerPlugin(ScrollTrigger);

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

    gsap.from('.blog-post', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.blog',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        }
    });

    // Contact form functionality
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

    // Initialize EmailJS
    emailjs.init("qm4Ipv_8cl8leemjc");

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                'Th3',
                'template_kf11l6s',
                templateParams
            );

            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Message sent successfully!
            `;
            contactForm.insertBefore(successMessage, submitBtn);

            contactForm.reset();

            setTimeout(() => {
                successMessage.remove();
                toggleModal();
            }, 3000);

        } catch (error) {
            console.error('Error sending message:', error);
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                Error sending message. Please try again.
            `;
            contactForm.insertBefore(errorMessage, submitBtn);

            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Add keyboard support for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactModal.classList.contains('active')) {
            toggleModal();
        }
    });
}); 