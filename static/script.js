document.addEventListener('DOMContentLoaded', () => {
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

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');

        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    function loadSavedTheme() {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    loadSavedTheme();

    themeToggle.addEventListener('click', toggleDarkMode);

    gsap.registerPlugin(ScrollTrigger);

    const animations = [
        { element: '.hero h1', props: { opacity: 0, y: 50, duration: 1 } },
        { element: '.hero p', props: { opacity: 0, y: 50, duration: 1, delay: 0.5 } },
        { element: '.project-card', props: { opacity: 0, y: 50, duration: 0.8, stagger: 0.2 } }
    ];

    animations.forEach(({ element, props }) => {
        gsap.from(element, {
            ...props,
            scrollTrigger: {
                trigger: element,
                start: 'top 80%'
            }
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
});
