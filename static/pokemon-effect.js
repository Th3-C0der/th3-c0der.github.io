// Pokemon click effect
let pokemonCache = [];
let usedPokemon = new Set(); // Track recently used Pokemon
const MAX_POKEMON = 1025; // Updated to include all Pokemon up to Gen 9
const SPRITE_SIZE = 56;
const MAX_RECENT_POKEMON = 20; // Maximum number of recently used Pokemon to track
const MAX_CONCURRENT_SPRITES = 15; // Maximum number of sprites on screen at once
let activeSprites = 0; // Track number of active sprites
let clickStreak = 0;
let lastClickTime = 0;
const CLICK_COOLDOWN = 30;
const STREAK_THRESHOLD = 2;

// Sprite pool for recycling
const spritePool = [];
const MAX_POOL_SIZE = 30;

// Create a sprite element and add it to the pool
function createSpriteElement() {
    const sprite = document.createElement('img');
    sprite.className = 'pokemon-sprite';
    sprite.style.cssText = `
        position: fixed;
        width: ${SPRITE_SIZE}px;
        height: ${SPRITE_SIZE}px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        will-change: transform, opacity;
    `;
    return sprite;
}

// Initialize sprite pool
function initSpritePool() {
    for (let i = 0; i < MAX_POOL_SIZE; i++) {
        spritePool.push(createSpriteElement());
    }
}

// Get a sprite from the pool or create a new one
function getSpriteFromPool() {
    let sprite = spritePool.pop();
    if (!sprite) {
        sprite = createSpriteElement();
    }
    document.body.appendChild(sprite);
    return sprite;
}

// Return a sprite to the pool
function returnSpriteToPool(sprite) {
    if (spritePool.length < MAX_POOL_SIZE) {
        sprite.remove();
        spritePool.push(sprite);
    } else {
        sprite.remove();
    }
}

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
                    const spriteUrl = data.sprites.other['official-artwork'].front_default || 
                                    data.sprites.front_default;
                    if (spriteUrl) {
                        pokemonCache.push({
                            url: spriteUrl,
                            id: randomId,
                            name: data.name
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
        const randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
        return {
            url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomId}.png`,
            id: randomId
        };
    }

    const availablePokemon = pokemonCache.filter(pokemon => !usedPokemon.has(pokemon.id));
    
    if (availablePokemon.length === 0) {
        usedPokemon.clear();
        return pokemonCache[Math.floor(Math.random() * pokemonCache.length)];
    }

    const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
    usedPokemon.add(randomPokemon.id);
    
    if (usedPokemon.size > MAX_RECENT_POKEMON) {
        const firstItem = usedPokemon.values().next().value;
        usedPokemon.delete(firstItem);
    }

    return randomPokemon;
}

// Get random position with more spread
function getRandomPosition() {
    const padding = SPRITE_SIZE;
    const spread = 300;
    return {
        x: padding + Math.random() * (window.innerWidth - padding * 2),
        y: padding + Math.random() * (window.innerHeight - padding * 2),
        spreadX: (Math.random() - 0.5) * spread,
        spreadY: (Math.random() - 0.5) * spread
    };
}

// Create Pokemon sprite with optimized animations
function createPokemonSprite(x, y, isRandom = false) {
    if (activeSprites >= MAX_CONCURRENT_SPRITES) return;

    const position = isRandom ? getRandomPosition() : { x, y, spreadX: 0, spreadY: 0 };
    const sprite = getSpriteFromPool();
    activeSprites++;

    const pokemon = getRandomPokemon();
    sprite.src = pokemon.url;
    
    // Update sprite position
    sprite.style.left = `${position.x - SPRITE_SIZE/2}px`;
    sprite.style.top = `${position.y - SPRITE_SIZE/2}px`;
    sprite.style.transform = `scale(0.5) rotate(${Math.random() * 360}deg)`;
    sprite.style.filter = 'drop-shadow(0 0 8px rgba(0, 255, 157, 0.4))';

    const randomScale = 0.8 + Math.random() * 0.4;
    const randomRotation = Math.random() * 360;
    const randomDuration = 0.4 + Math.random() * 0.2;
    const randomDelay = Math.random() * 0.2;

    // Optimized animation sequence
    gsap.to(sprite, {
        opacity: 0.9,
        scale: randomScale,
        rotation: randomRotation,
        duration: randomDuration,
        ease: "elastic.out(1, 0.5)",
        delay: randomDelay,
        onComplete: () => {
            gsap.to(sprite, {
                y: position.spreadY - 50,
                x: position.spreadX,
                rotation: randomRotation + 180,
                duration: 1.5,
                ease: "power1.inOut",
                onComplete: () => {
                    gsap.to(sprite, {
                        opacity: 0,
                        scale: 0.5,
                        duration: 0.8,
                        ease: "power2.in",
                        onComplete: () => {
                            activeSprites--;
                            returnSpriteToPool(sprite);
                        }
                    });
                }
            });
        }
    });
}

// Enhanced click handler with optimized spawning
function handlePokemonSpawn(e) {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < CLICK_COOLDOWN || activeSprites >= MAX_CONCURRENT_SPRITES) return;
    
    lastClickTime = currentTime;
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (x && y) {
        clickStreak++;
        createPokemonSprite(x, y);
        
        if (clickStreak >= STREAK_THRESHOLD) {
            const extraSprites = Math.min(3, clickStreak - STREAK_THRESHOLD + 1);
            for (let i = 0; i < extraSprites; i++) {
                if (activeSprites < MAX_CONCURRENT_SPRITES) {
                    setTimeout(() => createPokemonSprite(null, null, true), i * 100);
                }
            }
        }
        
        setTimeout(() => {
            clickStreak = Math.max(0, clickStreak - 1);
        }, 800);
    }
}

// Optimized continuous spawn effect
let spawnInterval;
function startContinuousSpawn(x, y) {
    if (spawnInterval) return;
    
    spawnInterval = setInterval(() => {
        if (activeSprites < MAX_CONCURRENT_SPRITES) {
            const isRandom = Math.random() > 0.3;
            createPokemonSprite(x, y, isRandom);
        }
    }, 200); // Increased interval to reduce spawn rate
}

// Initialize Pokemon effect
export function initPokemonEffect() {
    initSpritePool();
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