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
    }
    
    createParticles() {
        // Create multiple particle systems for depth effect
        this.particleSystems = [];
        
        // Foreground particles (smaller, more numerous)
        this.createParticleSystem(3000, 0.15, 30, 0.32, 0.85, 0.7);
        
        // Middle layer particles (medium size)
        this.createParticleSystem(2000, 0.2, 40, 0.28, 0.8, 0.5);
        
        // Background particles (larger, fewer)
        this.createParticleSystem(1000, 0.25, 50, 0.25, 0.75, 0.3);
    }
    
    createParticleSystem(count, size, radius, hueStart, saturation, brightness) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        
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
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.targetRotation.x = this.mouse.y * 0.3;
            this.targetRotation.y = this.mouse.x * 0.3;
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.0001;
        
        this.particleSystems.forEach((system, index) => {
            // Different rotation speeds for each layer
            const speed = 0.2 - (index * 0.05);
            
            // Smooth rotation following mouse
            system.rotation.x += (this.targetRotation.x - system.rotation.x) * 0.02;
            system.rotation.y += (this.targetRotation.y - system.rotation.y) * 0.02;
            
            // Additional subtle rotations
            system.rotation.z += 0.0003 * speed;
            
            // Wave effect
            const positions = system.geometry.attributes.position.array;
            const scales = system.geometry.attributes.scale.array;
            
            for(let i = 0; i < positions.length; i += 3) {
                // Subtle position animation
                positions[i + 1] += Math.sin(time + positions[i] * 0.05) * 0.02;
                
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