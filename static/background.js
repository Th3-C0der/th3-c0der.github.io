import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

class ParticleBackground {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'particle-background';
        document.body.prepend(this.container);
        
        this.setup();
        this.createParticles();
        this.animate();
        this.addMouseInteraction();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setup() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 50;
        this.mouse = new THREE.Vector2();
        this.targetRotation = new THREE.Vector2();
        this.mouseVelocity = new THREE.Vector2();
        this.lastMousePosition = new THREE.Vector2();
    }
    
    createParticles() {
        this.particleSystems = [];
        
        // Foreground particles (smaller, more numerous)
        this.createParticleSystem(4000, 0.12, 30, 0.32, 0.85, 0.7);
        
        // Middle layer particles (medium size)
        this.createParticleSystem(2500, 0.18, 40, 0.28, 0.8, 0.5);
        
        // Background particles (larger, fewer)
        this.createParticleSystem(1500, 0.22, 50, 0.25, 0.75, 0.3);
    }
    
    createParticleSystem(count, size, radius, hueStart, saturation, brightness) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const velocities = new Float32Array(count * 3);
        
        const color = new THREE.Color();
        
        for (let i = 0; i < count; i++) {
            // Fibonacci sphere distribution for more uniform coverage
            const phi = Math.acos(1 - 2 * (i / count));
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            // Random velocities for each particle
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Varied green hues for depth
            const hue = hueStart + Math.random() * 0.08;
            color.setHSL(hue, saturation, brightness);
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Varied particle sizes
            scales[i] = Math.random() * 0.5 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            size: size,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const system = new THREE.Points(geometry, material);
        this.scene.add(system);
        this.particleSystems.push(system);
    }
    
    addMouseInteraction() {
        document.addEventListener('mousemove', (event) => {
            this.lastMousePosition.copy(this.mouse);
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Calculate mouse velocity
            this.mouseVelocity.x = this.mouse.x - this.lastMousePosition.x;
            this.mouseVelocity.y = this.mouse.y - this.lastMousePosition.y;
            
            this.targetRotation.x = this.mouse.y * 0.3;
            this.targetRotation.y = this.mouse.x * 0.3;
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.0001;
        
        this.particleSystems.forEach((system, index) => {
            const speed = 0.2 - (index * 0.05);
            const positions = system.geometry.attributes.position.array;
            const velocities = system.geometry.attributes.velocity.array;
            const scales = system.geometry.attributes.scale.array;
            
            // Smooth rotation following mouse
            system.rotation.x += (this.targetRotation.x - system.rotation.x) * 0.02;
            system.rotation.y += (this.targetRotation.y - system.rotation.y) * 0.02;
            
            // Additional subtle rotations
            system.rotation.z += 0.0003 * speed;
            
            for(let i = 0; i < positions.length; i += 3) {
                // Update positions based on velocities
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
                
                // Boundary check and reset
                const radius = 50;
                const distance = Math.sqrt(
                    positions[i] * positions[i] +
                    positions[i + 1] * positions[i + 1] +
                    positions[i + 2] * positions[i + 2]
                );
                
                if (distance > radius) {
                    const scale = radius / distance;
                    positions[i] *= scale;
                    positions[i + 1] *= scale;
                    positions[i + 2] *= scale;
                }
                
                // Wave effect
                positions[i + 1] += Math.sin(time + positions[i] * 0.05) * 0.02;
                
                // Mouse influence
                const mouseInfluence = 0.1;
                positions[i] += this.mouseVelocity.x * mouseInfluence;
                positions[i + 1] += this.mouseVelocity.y * mouseInfluence;
                
                // Pulse size animation
                const j = i / 3;
                scales[j] = Math.sin(time * 2 + j) * 0.1 + 0.9;
            }
            
            system.geometry.attributes.position.needsUpdate = true;
            system.geometry.attributes.scale.needsUpdate = true;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default ParticleBackground; 