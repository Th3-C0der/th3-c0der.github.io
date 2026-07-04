/**
 * ============================================
 * POKEMON CLICK EFFECT - REDESIGNED
 * Using Anime.js for smooth animations
 * Optimized with sprite pooling & caching
 * ============================================
 */

class PokemonEffect {
    constructor() {
        // Configuration
        this.config = {
            maxPokemon: 1025,
            spriteSize: 64,
            maxPoolSize: 25,
            maxActiveSprites: 25, // Increased limit
            maxRecentPokemon: 30,
            clickCooldown: 30, // Reduced cooldown
            preloadCount: 80
        };

        // State
        this.pokemonCache = [];
        this.usedPokemon = new Set();
        this.spritePool = [];
        this.activeSpriteQueue = []; // New queue for FIFO
        this.activeSprites = 0;
        this.lastClickTime = 0;
        this.clickStreak = 0;
        this.isHolding = false;
        this.holdInterval = null;
        this.mousePos = { x: 0, y: 0 };

        // Initialize
        this.init();
    }

    init() {
        this.createStyles();
        this.initSpritePool();
        this.preloadPokemonSprites();
        this.bindEvents();
    }

    // Inject styles for Pokemon sprites
    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pokemon-sprite {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                filter: drop-shadow(0 4px 12px rgba(0, 255, 157, 0.4))
                        drop-shadow(0 0 20px rgba(0, 255, 157, 0.2));
                will-change: transform, opacity;
            }
            
            .pokemon-sprite.shiny {
                filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.6))
                        drop-shadow(0 0 25px rgba(255, 215, 0, 0.4));
            }
            
            .pokemon-sparkle {
                position: fixed;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
                will-change: transform, opacity;
            }
            
            .pokemon-ring {
                position: fixed;
                border: 2px solid rgba(0, 255, 157, 0.6);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                will-change: transform, opacity;
            }
        `;
        document.head.appendChild(style);
    }

    // Create sprite element
    createSpriteElement() {
        const sprite = document.createElement('img');
        sprite.className = 'pokemon-sprite';
        sprite.style.width = `${this.config.spriteSize}px`;
        sprite.style.height = `${this.config.spriteSize}px`;
        sprite.style.opacity = '0';
        return sprite;
    }

    // Initialize sprite pool
    initSpritePool() {
        for (let i = 0; i < this.config.maxPoolSize; i++) {
            this.spritePool.push(this.createSpriteElement());
        }
    }

    // Get sprite from pool
    getSpriteFromPool() {
        let sprite = this.spritePool.pop();
        if (!sprite) {
            sprite = this.createSpriteElement();
        }
        document.body.appendChild(sprite);
        return sprite;
    }

    // Return sprite to pool
    returnSpriteToPool(sprite) {
        sprite.style.opacity = '0';
        sprite.classList.remove('shiny');
        if (sprite.parentNode) {
            sprite.remove();
        }
        if (this.spritePool.length < this.config.maxPoolSize) {
            this.spritePool.push(sprite);
        }
    }

    // Preload Pokemon sprites
    async preloadPokemonSprites() {
        const usedIds = new Set();
        const promises = [];

        for (let i = 0; i < this.config.preloadCount; i++) {
            let randomId;
            do {
                randomId = Math.floor(Math.random() * this.config.maxPokemon) + 1;
            } while (usedIds.has(randomId));

            usedIds.add(randomId);

            // Use GitHub raw sprites for faster loading
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomId}.png`;

            // Preload image
            const promise = new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.pokemonCache.push({
                        url: spriteUrl,
                        id: randomId,
                        loaded: true
                    });
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = spriteUrl;
            });

            promises.push(promise);
        }

        await Promise.all(promises);
        console.log(`🎮 Pokemon Effect: Loaded ${this.pokemonCache.length} sprites`);
    }

    // Get random Pokemon
    getRandomPokemon() {
        if (this.pokemonCache.length === 0) {
            const randomId = Math.floor(Math.random() * this.config.maxPokemon) + 1;
            return {
                url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomId}.png`,
                id: randomId
            };
        }

        const availablePokemon = this.pokemonCache.filter(p => !this.usedPokemon.has(p.id));

        if (availablePokemon.length === 0) {
            this.usedPokemon.clear();
            return this.pokemonCache[Math.floor(Math.random() * this.pokemonCache.length)];
        }

        const pokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
        this.usedPokemon.add(pokemon.id);

        if (this.usedPokemon.size > this.config.maxRecentPokemon) {
            const firstItem = this.usedPokemon.values().next().value;
            this.usedPokemon.delete(firstItem);
        }

        return pokemon;
    }

    // Create click ring effect
    createRingEffect(x, y) {
        const ring = document.createElement('div');
        ring.className = 'pokemon-ring';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.style.width = '20px';
        ring.style.height = '20px';
        ring.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(ring);

        anime({
            targets: ring,
            width: ['20px', '100px'],
            height: ['20px', '100px'],
            opacity: [0.8, 0],
            borderWidth: ['2px', '0px'],
            duration: 600,
            easing: 'easeOutExpo',
            complete: () => ring.remove()
        });
    }

    // Create sparkle particles
    createSparkles(x, y, count = 6) {
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'pokemon-sparkle';
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            document.body.appendChild(sparkle);

            const angle = (i / count) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;

            anime({
                targets: sparkle,
                translateX: [0, moveX],
                translateY: [0, moveY - 30],
                scale: [1, 0],
                opacity: [1, 0],
                duration: 600 + Math.random() * 200,
                delay: i * 30,
                easing: 'easeOutCubic',
                complete: () => sparkle.remove()
            });
        }
    }

    // Create Pokemon sprite with animation
    createPokemonSprite(x, y, options = {}) {
        // FIFO Logic: If at capacity, remove oldest
        if (this.activeSpriteQueue.length >= this.config.maxActiveSprites) {
            const oldestSprite = this.activeSpriteQueue.shift();
            anime.remove(oldestSprite); // Stop animation
            this.returnSpriteToPool(oldestSprite);
        }

        const sprite = this.getSpriteFromPool();
        const pokemon = this.getRandomPokemon();
        const isShiny = Math.random() < 0.05; // 5% chance for shiny effect

        // Track active sprite
        this.activeSpriteQueue.push(sprite);

        // Set sprite properties
        // Set sprite properties
        if (isShiny) {
            sprite.classList.add('shiny');
            // Use 'home' sprites for shiny version (high quality)
            sprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemon.id}.png`;
        } else {
            sprite.src = pokemon.url;
        }

        // Random variations
        const size = this.config.spriteSize * (0.8 + Math.random() * 0.5);
        const startRotation = (Math.random() - 0.5) * 30;
        const endRotation = (Math.random() - 0.5) * 20;

        // Position offset
        // Always add some random spread to prevent perfect stacking
        const baseSpread = options.spread ? 200 : 120;

        const offsetX = (Math.random() - 0.5) * baseSpread;
        const offsetY = (Math.random() - 0.5) * baseSpread;

        sprite.style.width = `${size}px`;
        sprite.style.height = `${size}px`;
        sprite.style.left = `${x + offsetX - size / 2}px`;
        sprite.style.top = `${y + offsetY - size / 2}px`;

        // Entry animation
        anime({
            targets: sprite,
            opacity: [0, 1],
            scale: [0.3, 1.1, 1],
            rotate: [startRotation - 10, startRotation],
            duration: 500,
            easing: 'easeOutBack',
            complete: () => {
                // Float animation
                anime({
                    targets: sprite,
                    translateY: [0, -60, -30],
                    translateX: [0, (Math.random() - 0.5) * 60],
                    rotate: [startRotation, endRotation],
                    duration: 2000,
                    easing: 'easeInOutSine',
                    complete: () => {
                        // Exit animation
                        anime({
                            targets: sprite,
                            opacity: [1, 0],
                            scale: [1, 0.5],
                            translateY: '-=50',
                            duration: 500,
                            easing: 'easeInCubic',
                            complete: () => {
                                // Remove from queue if finished naturally
                                const index = this.activeSpriteQueue.indexOf(sprite);
                                if (index > -1) {
                                    this.activeSpriteQueue.splice(index, 1);
                                    this.returnSpriteToPool(sprite);
                                }
                            }
                        });
                    }
                });
            }
        });

        // Create sparkles for shiny Pokemon
        if (isShiny) {
            this.createSparkles(x + offsetX, y + offsetY, 10);
        }
    }

    // Handle click/touch
    handleClick(e) {
        const currentTime = Date.now();
        // Reduced cooldown for more fun
        if (currentTime - this.lastClickTime < 30) return;
        // Limit check removed for FIFO

        this.lastClickTime = currentTime;

        const x = e.clientX || (e.touches && e.touches[0]?.clientX);
        const y = e.clientY || (e.touches && e.touches[0]?.clientY);

        if (!x || !y) return;

        // Create effects
        this.createRingEffect(x, y);
        // Add minimal spread to single clicks too
        this.createPokemonSprite(x, y, { spread: false }); // Using spread:false but it has base spread now
        this.createSparkles(x, y, 4);

        // Click streak for bonus Pokemon
        this.clickStreak++;

        // Easier to trigger streak
        if (this.clickStreak >= 2) {
            const extraCount = Math.min(3, Math.floor(this.clickStreak / 2));
            for (let i = 0; i < extraCount; i++) {
                setTimeout(() => {
                    this.createPokemonSprite(x, y, { spread: true });
                }, (i + 1) * 60);
            }
        }

        // Reset streak after delay
        setTimeout(() => {
            this.clickStreak = Math.max(0, this.clickStreak - 1);
        }, 500);
    }

    // Handle hold start
    handleHoldStart(e) {
        // Don't spawn if clicking on interactive elements or text
        if (e.target.closest('a, button, input, textarea, select, details, summary')) return;

        // Also check if clicking on text content that might be selected
        if (e.target.closest('p, h1, h2, h3, h4, h5, h6, span, code, pre')) {
            // But allow if it's just the body or a container
            // We want to allow text selection, so we don't start holding immediately
            // The user wants text selection to work normally.
            return;
        }

        this.isHolding = true;
        this.mousePos.x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
        this.mousePos.y = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

        // Start spawning Pokemon while holding
        // Clear any existing interval just in case
        if (this.holdInterval) clearInterval(this.holdInterval);

        this.holdInterval = setInterval(() => {
            // Check if user is selecting text
            const selection = window.getSelection();
            if (selection && selection.type === 'Range' && !selection.isCollapsed) {
                this.isHolding = false;
                clearInterval(this.holdInterval);
                return;
            }

            if (this.isHolding) {
                // Large spread for holding
                const spreadRange = 250;

                const offsetX = (Math.random() - 0.5) * spreadRange;
                const offsetY = (Math.random() - 0.5) * spreadRange;

                // Use the calculated offset directly since we want full control
                // But createPokemonSprite adds its own spread too, so we'll pass the base center
                // Actually, let's pass the randomized position and let 'spread: false' handle standard jitter
                this.createPokemonSprite(
                    this.mousePos.x + offsetX,
                    this.mousePos.y + offsetY,
                    { spread: false }
                );
            }
        }, 100); // Faster spawn rate for holding
    }

    // Handle hold end
    handleHoldEnd() {
        this.isHolding = false;
        if (this.holdInterval) {
            clearInterval(this.holdInterval);
            this.holdInterval = null;
        }
    }

    // Handle mouse move during hold
    handleMouseMove(e) {
        // If selecting text, stop holding
        const selection = window.getSelection();
        if (selection && selection.type === 'Range' && !selection.isCollapsed) {
            if (this.isHolding) {
                this.isHolding = false;
                if (this.holdInterval) clearInterval(this.holdInterval);
            }
            return;
        }

        if (this.isHolding) {
            this.mousePos.x = e.clientX || (e.touches && e.touches[0]?.clientX) || this.mousePos.x;
            this.mousePos.y = e.clientY || (e.touches && e.touches[0]?.clientY) || this.mousePos.y;
        }
    }

    // Bind event listeners
    bindEvents() {
        // Click events
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('touchstart', (e) => this.handleClick(e), { passive: true });

        // Hold events
        document.addEventListener('mousedown', (e) => this.handleHoldStart(e));
        document.addEventListener('touchstart', (e) => this.handleHoldStart(e), { passive: true });

        document.addEventListener('mouseup', () => this.handleHoldEnd());
        document.addEventListener('touchend', () => this.handleHoldEnd());
        document.addEventListener('mouseleave', () => this.handleHoldEnd());

        // Move during hold
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('touchmove', (e) => this.handleMouseMove(e), { passive: true });
    }
}

// Initialize Pokemon Effect
function initPokemonEffect() {
    return; // Pokemon animations disabled
}

// Export for ES modules
export { initPokemonEffect, PokemonEffect };

// Auto-initialize disabled
/*
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPokemonEffect);
} else {
    initPokemonEffect();
}
*/