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

    // Initialize Pokemon effect
    initPokemonEffect();

    // Pokemon click effect
    let pokemonCache = [];
    let usedPokemon = new Set(); // Track recently used Pokemon
    const MAX_POKEMON = 151;
    const SPRITE_SIZE = 56;
    const MAX_RECENT_POKEMON = 20; // Maximum number of recently used Pokemon to track
    let clickStreak = 0;
    let lastClickTime = 0;
    const CLICK_COOLDOWN = 30;
    const STREAK_THRESHOLD = 2;

    // Preload more Pokemon sprites with better variety
    async function preloadPokemonSprites() {
        const preloadCount = 100;
        const promises = [];
        const usedIds = new Set();
        
        for (let i = 0; i < preloadCount; i++) {
            let randomId;
            do {
                randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
            } while (usedIds.has(randomId));
            
            usedIds.add(randomId);
            promises.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.sprites.front_default) {
                            pokemonCache.push({
                                url: data.sprites.front_default,
                                id: randomId
                            });
                        }
                    })
                    .catch(error => console.error('Error preloading Pokemon:', error))
            );
        }
        
        await Promise.all(promises);
    }

    preloadPokemonSprites();

    // Get a random Pokemon that hasn't been used recently
    function getRandomPokemon() {
        if (pokemonCache.length === 0) {
            // Fallback to direct API call if cache is empty
            const randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
            return {
                url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${randomId}.png`,
                id: randomId
            };
        }

        // Filter out recently used Pokemon
        const availablePokemon = pokemonCache.filter(pokemon => !usedPokemon.has(pokemon.id));
        
        // If all Pokemon have been used recently, clear the used set
        if (availablePokemon.length === 0) {
            usedPokemon.clear();
            return pokemonCache[Math.floor(Math.random() * pokemonCache.length)];
        }

        // Get a random Pokemon from available ones
        const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
        
        // Add to recently used set
        usedPokemon.add(randomPokemon.id);
        
        // Maintain the size of recently used set
        if (usedPokemon.size > MAX_RECENT_POKEMON) {
            const firstItem = usedPokemon.values().next().value;
            usedPokemon.delete(firstItem);
        }

        return randomPokemon;
    }

    // Get random position with more spread
    function getRandomPosition() {
        const padding = SPRITE_SIZE;
        const spread = 300; // Increased spread for more random positions
        return {
            x: padding + Math.random() * (window.innerWidth - padding * 2),
            y: padding + Math.random() * (window.innerHeight - padding * 2),
            spreadX: (Math.random() - 0.5) * spread,
            spreadY: (Math.random() - 0.5) * spread
        };
    }

    // Create Pokemon sprite with fun animations
    function createPokemonSprite(x, y, isRandom = false) {
        const position = isRandom ? getRandomPosition() : { x, y, spreadX: 0, spreadY: 0 };
        const sprite = document.createElement('img');
        sprite.className = 'pokemon-sprite';
        
        // Enhanced styling
        sprite.style.cssText = `
            position: fixed;
            width: ${SPRITE_SIZE}px;
            height: ${SPRITE_SIZE}px;
            pointer-events: none;
            z-index: 9999;
            left: ${position.x - SPRITE_SIZE/2}px;
            top: ${position.y - SPRITE_SIZE/2}px;
            opacity: 0;
            transform: scale(0.5) rotate(${Math.random() * 360}deg);
            filter: drop-shadow(0 0 8px rgba(0, 255, 157, 0.4));
            will-change: transform, opacity;
        `;

        const pokemon = getRandomPokemon();
        sprite.src = pokemon.url;
        document.body.appendChild(sprite);

        // Fun animation sequence
        const randomScale = 0.8 + Math.random() * 0.4;
        const randomRotation = Math.random() * 360;
        const randomDuration = 0.4 + Math.random() * 0.2;
        const randomDelay = Math.random() * 0.2;

        // Initial pop-in animation
        gsap.to(sprite, {
            opacity: 0.9,
            scale: randomScale,
            rotation: randomRotation,
            duration: randomDuration,
            ease: "elastic.out(1, 0.5)",
            delay: randomDelay,
            onComplete: () => {
                // Bounce and float animation
                gsap.to(sprite, {
                    y: position.spreadY - 50,
                    x: position.spreadX,
                    rotation: randomRotation + 180,
                    duration: 1.5,
                    ease: "power1.inOut",
                    onComplete: () => {
                        // Fade out animation
                        gsap.to(sprite, {
                            opacity: 0,
                            scale: 0.5,
                            duration: 0.8,
                            ease: "power2.in",
                            onComplete: () => {
                                sprite.remove();
                            }
                        });
                    }
                });
            }
        });
    }

    // Enhanced click handler with more fun
    function handlePokemonSpawn(e) {
        const currentTime = Date.now();
        if (currentTime - lastClickTime < CLICK_COOLDOWN) return;
        
        lastClickTime = currentTime;
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (x && y) {
            clickStreak++;
            
            // Create main sprite at click position
            createPokemonSprite(x, y);
            
            // Create extra sprites in random positions
            if (clickStreak >= STREAK_THRESHOLD) {
                const extraSprites = Math.min(6, clickStreak - STREAK_THRESHOLD + 1);
                for (let i = 0; i < extraSprites; i++) {
                    setTimeout(() => createPokemonSprite(null, null, true), i * 100);
                }
            }
            
            // Reset streak after delay
            setTimeout(() => {
                clickStreak = Math.max(0, clickStreak - 1);
            }, 800);
        }
    }

    // Fun continuous spawn effect
    let spawnInterval;
    function startContinuousSpawn(x, y) {
        if (spawnInterval) return;
        
        spawnInterval = setInterval(() => {
            // Alternate between click position and random positions
            const isRandom = Math.random() > 0.3; // 70% chance of random position
            createPokemonSprite(x, y, isRandom);
        }, 150);
    }

    // Event listeners
    document.addEventListener('click', handlePokemonSpawn);
    document.addEventListener('touchstart', handlePokemonSpawn);
    document.addEventListener('mousedown', (e) => startContinuousSpawn(e.clientX, e.clientY));
    document.addEventListener('touchstart', (e) => startContinuousSpawn(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener('mouseup', () => {
        if (spawnInterval) {
            clearInterval(spawnInterval);
            spawnInterval = null;
        }
    });
    document.addEventListener('touchend', () => {
        if (spawnInterval) {
            clearInterval(spawnInterval);
            spawnInterval = null;
        }
    });
    document.addEventListener('mouseleave', () => {
        if (spawnInterval) {
            clearInterval(spawnInterval);
            spawnInterval = null;
        }
    });
});
