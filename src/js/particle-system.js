import { Utils } from './utils.js';

export class ParticleSystem {
  constructor() {
    this.container = document.getElementById('particle-container');
    this.particles = [];
    this.particleTypes = new Map();
    this.currentSection = 'hero';
    this.isActive = true;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    console.log('✨ Initializing Particle System...');
    
    if (!this.container) {
      console.warn('Particle container not found');
      return;
    }

    this.setupContainer();

    this.initParticleTypes();
    
    // Animation loop
    this.startAnimation();
    
    console.log('✅ Particle System initialized');
  }
  
  setupContainer() {
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '5',
      overflow: 'hidden'
    });
  }
  
  initParticleTypes() {
    // Stars - general space ambiance
    this.particleTypes.set('stars', {
      count: 100,
      size: { min: 1, max: 3 },
      color: ['#ffffff', '#ffeeaa', '#aaeeff'],
      opacity: { min: 0.3, max: 1 },
      speed: { min: 0.1, max: 0.5 },
      twinkle: true,
      lifetime: Infinity
    });
    
    // Rocket exhaust particles
    this.particleTypes.set('rocket-exhaust', {
      count: 50,
      size: { min: 2, max: 8 },
      color: ['#ff6600', '#ffaa00', '#ff0000'],
      opacity: { min: 0.7, max: 1 },
      speed: { min: 2, max: 5 },
      gravity: -0.1,
      lifetime: 2000
    });
    
    // Satellite trail particles
    this.particleTypes.set('satellite-trail', {
      count: 30,
      size: { min: 1, max: 3 },
      color: ['#00ff00', '#66ff66', '#ffffff'],
      opacity: { min: 0.5, max: 0.9 },
      speed: { min: 1, max: 3 },
      trail: true,
      lifetime: 3000
    });
    
    // Space debris
    this.particleTypes.set('space-debris', {
      count: 20,
      size: { min: 1, max: 4 },
      color: ['#888888', '#bbbbbb', '#666666'],
      opacity: { min: 0.4, max: 0.8 },
      speed: { min: 0.5, max: 2 },
      rotation: true,
      lifetime: 8000
    });
    
    // Lunar dust
    this.particleTypes.set('lunar-dust', {
      count: 40,
      size: { min: 1, max: 2 },
      color: ['#cccccc', '#dddddd', '#aaaaaa'],
      opacity: { min: 0.3, max: 0.7 },
      speed: { min: 0.2, max: 1 },
      gravity: 0.05,
      lifetime: 5000
    });
    
    // Atmospheric particles
    this.particleTypes.set('atmosphere', {
      count: 60,
      size: { min: 2, max: 6 },
      color: ['#87ceeb', '#add8e6', '#b0e0e6'],
      opacity: { min: 0.2, max: 0.5 },
      speed: { min: 0.3, max: 1.5 },
      flow: true,
      lifetime: 6000
    });
    
    // Energy particles
    this.particleTypes.set('energy', {
      count: 25,
      size: { min: 3, max: 8 },
      color: ['#ffd700', '#ffff00', '#ffffff'],
      opacity: { min: 0.6, max: 1 },
      speed: { min: 1, max: 4 },
      glow: true,
      lifetime: 1500
    });
  }
  
  createParticle(type, x, y, options = {}) {
    const typeConfig = this.particleTypes.get(type);
    if (!typeConfig) return null;
    
    const particle = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      element: this.createParticleElement(typeConfig, options),
      x: x || Utils.random(0, window.innerWidth),
      y: y || Utils.random(0, window.innerHeight),
      vx: Utils.random(-typeConfig.speed.max, typeConfig.speed.max),
      vy: Utils.random(-typeConfig.speed.max, typeConfig.speed.max),
      size: Utils.random(typeConfig.size.min, typeConfig.size.max),
      opacity: Utils.random(typeConfig.opacity.min, typeConfig.opacity.max),
      rotation: 0,
      rotationSpeed: typeConfig.rotation ? Utils.random(-2, 2) : 0,
      lifetime: typeConfig.lifetime === Infinity ? Infinity : typeConfig.lifetime + Date.now(),
      age: 0,
      color: typeConfig.color[Math.floor(Math.random() * typeConfig.color.length)],
      config: typeConfig,
      ...options
    };
    
    this.updateParticleStyle(particle);
    this.container.appendChild(particle.element);
    
    return particle;
  }
  
  createParticleElement(config, options) {
    const element = document.createElement('div');
    element.className = 'particle';
    
    Object.assign(element.style, {
      position: 'absolute',
      pointerEvents: 'none',
      borderRadius: '50%',
      transformOrigin: 'center',
      transition: config.twinkle ? 'opacity 0.5s ease-in-out' : 'none'
    });
    
    if (config.glow) {
      element.style.filter = 'blur(1px)';
      element.style.boxShadow = '0 0 6px currentColor';
    }
    
    if (config.trail) {
      element.style.borderRadius = '50% 0';
    }
    
    return element;
  }
  
  updateParticleStyle(particle) {
    const { element, x, y, size, opacity, rotation, color } = particle;
    
    Object.assign(element.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      opacity: opacity,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`
    });
  }
  
  updateParticle(particle, deltaTime) {
    const { config } = particle;

    particle.age += deltaTime;

    if (particle.lifetime !== Infinity && Date.now() > particle.lifetime) {
      this.removeParticle(particle);
      return false;
    }

    particle.x += particle.vx * deltaTime * 0.016; // 60fps normalization
    particle.y += particle.vy * deltaTime * 0.016;

    if (config.gravity) {
      particle.vy += config.gravity * deltaTime * 0.016;
    }

    if (config.rotation) {
      particle.rotation += particle.rotationSpeed * deltaTime * 0.016;
    }

    if (config.twinkle) {
      const twinklePhase = (Date.now() + particle.id.charCodeAt(0) * 100) * 0.003;
      particle.opacity = config.opacity.min + 
        (config.opacity.max - config.opacity.min) * 
        (0.5 + 0.5 * Math.sin(twinklePhase));
    }
    
    if (config.flow) {
      const flowPhase = Date.now() * 0.001 + particle.id.charCodeAt(0);
      particle.vx += Math.sin(flowPhase) * 0.1;
      particle.vy += Math.cos(flowPhase * 1.3) * 0.1;
    }

    const margin = 50;
    if (particle.x < -margin) particle.x = window.innerWidth + margin;
    if (particle.x > window.innerWidth + margin) particle.x = -margin;
    if (particle.y < -margin) particle.y = window.innerHeight + margin;
    if (particle.y > window.innerHeight + margin) particle.y = -margin;

    this.updateParticleStyle(particle);
    
    return true;
  }
  
  removeParticle(particle) {
    const index = this.particles.findIndex(p => p.id === particle.id);
    if (index !== -1) {
      this.particles.splice(index, 1);
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    }
  }
  
  spawnParticlesForSection(sectionId) {
    this.clearParticles();
    
    switch(sectionId) {
      case 'hero':
        this.spawnStars(50);
        this.spawnRocketExhaust();
        break;
        
      case 'sputnik':
        this.spawnStars(40);
        this.spawnSatelliteTrail();
        break;
        
      case 'gagarin':
        this.spawnStars(60);
        this.spawnAtmosphere();
        break;
        
      case 'jfk':
        this.spawnStars(70);
        this.spawnEnergyParticles();
        break;
        
      case 'spacewalk':
        this.spawnStars(30);
        this.spawnSpaceDebris();
        this.spawnAtmosphere();
        break;
        
      case 'apollo':
        this.spawnStars(40);
        this.spawnRocketExhaust();
        this.spawnEnergyParticles();
        break;
        
      case 'moon-landing':
        this.spawnStars(80);
        this.spawnLunarDust();
        break;
    }
  }
  
  spawnStars(count) {
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle('stars', 
        Utils.random(0, window.innerWidth),
        Utils.random(0, window.innerHeight)
      );
      if (particle) {
        this.particles.push(particle);
      }
    }
  }
  
  spawnRocketExhaust() {
    const spawnCount = 3;
    const spawnInterval = setInterval(() => {
      for (let i = 0; i < spawnCount; i++) {
        const particle = this.createParticle('rocket-exhaust',
          window.innerWidth * 0.2 + Utils.random(-20, 20),
          window.innerHeight * 0.8 + Utils.random(-10, 10),
          {
            vy: Utils.random(-3, -1),
            vx: Utils.random(-0.5, 0.5)
          }
        );
        if (particle) {
          this.particles.push(particle);
        }
      }
    }, 100);

    setTimeout(() => clearInterval(spawnInterval), 5000);
  }
  
  spawnSatelliteTrail() {
    const orbitRadius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;
    
    let angle = 0;
    const trailInterval = setInterval(() => {
      angle += 0.1;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius * 0.6;
      
      const particle = this.createParticle('satellite-trail', x, y, {
        vx: -Math.sin(angle) * 2,
        vy: Math.cos(angle) * 2 * 0.6
      });
      if (particle) {
        this.particles.push(particle);
      }
    }, 200);
    
    setTimeout(() => clearInterval(trailInterval), 10000);
  }
  
  spawnSpaceDebris() {
    for (let i = 0; i < 15; i++) {
      const particle = this.createParticle('space-debris',
        Utils.random(0, window.innerWidth),
        Utils.random(0, window.innerHeight),
        {
          vx: Utils.random(-1, 1),
          vy: Utils.random(-1, 1)
        }
      );
      if (particle) {
        this.particles.push(particle);
      }
    }
  }
  
  spawnLunarDust() {
    const dustInterval = setInterval(() => {
      for (let i = 0; i < 2; i++) {
        const particle = this.createParticle('lunar-dust',
          window.innerWidth * 0.3 + Utils.random(-50, 50),
          window.innerHeight * 0.9,
          {
            vx: Utils.random(-1, 1),
            vy: Utils.random(-2, -0.5)
          }
        );
        if (particle) {
          this.particles.push(particle);
        }
      }
    }, 300);
    
    setTimeout(() => clearInterval(dustInterval), 8000);
  }
  
  spawnAtmosphere() {
    for (let i = 0; i < 20; i++) {
      const particle = this.createParticle('atmosphere',
        Utils.random(0, window.innerWidth),
        Utils.random(0, window.innerHeight),
        {
          vx: Utils.random(-0.5, 0.5),
          vy: Utils.random(-0.5, 0.5)
        }
      );
      if (particle) {
        this.particles.push(particle);
      }
    }
  }
  
  spawnEnergyParticles() {
    const burstCount = 5;
    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;
    
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        for (let j = 0; j < 8; j++) {
          const angle = (j / 8) * Math.PI * 2;
          const speed = Utils.random(2, 4);
          
          const particle = this.createParticle('energy',
            centerX + Utils.random(-30, 30),
            centerY + Utils.random(-30, 30),
            {
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed
            }
          );
          if (particle) {
            this.particles.push(particle);
          }
        }
      }, i * 500);
    }
  }
  
  startAnimation() {
    let lastTime = Date.now();
    
    const animate = () => {
      if (!this.isActive) return;
      
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i];
        if (!this.updateParticle(particle, deltaTime)) {
          continue;
        }
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateForSection(sectionId) {
    if (this.currentSection === sectionId) return;
    
    console.log(`✨ Updating particles for section: ${sectionId}`);
    this.currentSection = sectionId;

    this.fadeOutParticles().then(() => {
      this.spawnParticlesForSection(sectionId);
    });
  }
  
  updateOnScroll(velocity, direction) {
    this.particles.forEach(particle => {
      if (particle.config.flow) {
        const scrollEffect = velocity * 0.01;
        particle.vx += scrollEffect * (direction === 'down' ? 1 : -1);
      }
    });
  }
  
  fadeOutParticles() {
    return new Promise(resolve => {
      this.particles.forEach(particle => {
        gsap.to(particle.element.style, {
          opacity: 0,
          duration: 1,
          ease: 'power2.out'
        });
      });
      
      setTimeout(() => {
        this.clearParticles();
        resolve();
      }, 1000);
    });
  }
  
  clearParticles() {
    this.particles.forEach(particle => {
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    this.particles = [];
  }
  
  handleResize() {
    this.particles.forEach(particle => {
      if (particle.x > window.innerWidth) {
        particle.x = window.innerWidth - 50;
      }
      if (particle.y > window.innerHeight) {
        particle.y = window.innerHeight - 50;
      }
    });
  }

  pause() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
  
  resume() {
    this.isActive = true;
    this.startAnimation();
  }
  
  setIntensity(intensity) {
    const targetCount = Math.floor(intensity * 100);
    
    if (this.particles.length > targetCount) {
      const excess = this.particles.length - targetCount;
      for (let i = 0; i < excess; i++) {
        const particle = this.particles.pop();
        if (particle && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      }
    }
  }
  
  createCustomEffect(config) {
    const customType = `custom_${Date.now()}`;
    this.particleTypes.set(customType, config);
    
    for (let i = 0; i < config.count; i++) {
      const particle = this.createParticle(customType);
      if (particle) {
        this.particles.push(particle);
      }
    }
    
    return customType;
  }
  
  dispose() {
    console.log('✨ Disposing Particle System...');
    
    this.pause();
    this.clearParticles();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.particleTypes.clear();
    
    console.log('✅ Particle System disposed');
  }
}