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

// Initialize Pokemon effect
export function initPokemonEffect() {
    preloadPokemonSprites();
    
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
} 