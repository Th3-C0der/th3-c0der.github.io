const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
}

menuToggle.addEventListener('click', toggleMenu);
navOverlay.addEventListener('click', toggleMenu);

document.querySelectorAll('.nav-links a').forEach(link = > {
    link.addEventListener('click', (event) = > {
        if (window.innerWidth <= 768) {
            toggleMenu();
        }
    });
});

const themeToggle = document.querySelector('.theme-toggle');

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');

    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function loadSavedTheme() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }
}

loadSavedTheme();

themeToggle.addEventListener('click', (event) = > {
    toggleDarkMode();
    event.stopPropagation();
});

gsap.registerPlugin(ScrollTrigger);
gsap.from('.hero h1', {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
        trigger: '.hero',
        start: 'top 80%'
    }
});
gsap.from('.hero p', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.5,
    scrollTrigger: {
        trigger: '.hero',
        start: 'top 80%'
    }
});
gsap.to('.circle-1', {
    x: '100px',
    y: '100px',
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});
gsap.to('.circle-2', {
    x: '-50px',
    y: '-50px',
    duration: 15,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});
gsap.to('.circle-3', {
    scale: 1.5,
    duration: 10,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});
gsap.from('.project-card', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
        trigger: '.projects',
        start: 'top 80%'
    }
});
document.querySelectorAll('a[href^="#"]').forEach(anchor = > {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});
