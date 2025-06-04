import { ThreeSetup } from './three-setup.js';
import { AnimationController } from './animations.js';
import { ScrollHandler } from './scroll-handler.js';
import { AudioManager } from './audio-manager.js';
import { ParticleSystem } from './particle-system.js';
import { Utils } from './utils.js';

class SpaceRaceTimeline {
  constructor() {
    this.isInitialized = false;
    this.isLoading = true;
    this.currentSection = 'hero';
    this.loadingProgress = 0;
    
    // Initialize components
    this.threeSetup = null;
    this.animationController = null;
    this.scrollHandler = null;
    this.audioManager = null;
    this.particleSystem = null;
    
    // DOM elements
    this.loadingScreen = document.getElementById('loading-screen');
    this.progressBar = document.querySelector('.progress-bar');
    this.mainNav = document.getElementById('main-nav');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navTimeline = document.querySelector('.nav-timeline');
    this.audioToggle = document.getElementById('audio-toggle');
    
    this.init();
  }
  
  async init() {
    try {
      console.log('🚀 Initializing Space Race Timeline...');

      this.showLoadingScreen();

      gsap.registerPlugin(ScrollTrigger);

      await this.initializeComponents();

      this.setupEventListeners();

      await this.loadAssets();

      this.initializeAnimations();

      await this.hideLoadingScreen();

      this.isInitialized = true;
      this.isLoading = false;
      
      console.log('✅ Space Race Timeline initialized successfully!');
      
    } catch (error) {
      console.error('❌ Error initializing Space Race Timeline:', error);
      this.handleInitializationError(error);
    }
  }
  
  showLoadingScreen() {
    this.loadingScreen.style.display = 'flex';
    this.updateLoadingProgress(0, 'Initializing systems...');
  }
  
  async hideLoadingScreen() {
    this.updateLoadingProgress(100, 'Launch sequence complete!');

    await Utils.delay(1000);

    gsap.to(this.loadingScreen, {
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => {
        this.loadingScreen.style.display = 'none';
      }
    });
  }
  
  updateLoadingProgress(percent, message = '') {
    this.loadingProgress = percent;
    
    if (this.progressBar) {
      gsap.to(this.progressBar, {
        width: `${percent}%`,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
    
    if (message) {
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = message;
      }
    }
  }
  
  async initializeComponents() {
    // Initialize Three.js setup
    this.updateLoadingProgress(20, 'Setting up 3D environment...');
    this.threeSetup = new ThreeSetup();
    await Utils.delay(500);
    
    // Initialize particle system
    this.updateLoadingProgress(40, 'Creating particle effects...');
    this.particleSystem = new ParticleSystem();
    await Utils.delay(300);
    
    // Initialize audio manager
    this.updateLoadingProgress(60, 'Loading audio systems...');
    this.audioManager = new AudioManager();
    await Utils.delay(300);
    
    // Initialize scroll handler
    this.updateLoadingProgress(80, 'Configuring scroll animations...');
    this.scrollHandler = new ScrollHandler(this);
    await Utils.delay(300);
    
    // Initialize animation controller
    this.updateLoadingProgress(90, 'Preparing animations...');
    this.animationController = new AnimationController(this);
    await Utils.delay(300);
  }
  
  async loadAssets() {
    const assets = [
      // Additional assets that need preloading
      // Textures, sounds, etc.
    ];

    this.updateLoadingProgress(95, 'Loading space assets...');
    await Utils.delay(500);
  }
  
  initializeAnimations() {
    if (this.animationController) {
      this.animationController.initializeAllAnimations();
    }
    
    if (this.scrollHandler) {
      this.scrollHandler.initializeScrollTriggers();
    }
  }
  
  setupEventListeners() {
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        this.toggleMobileNav();
      });
    }
    
    const navLinks = this.navTimeline?.querySelectorAll('a');
    if (navLinks) {
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateToSection(link.getAttribute('href').substring(1));
        });
      });
    }
    
    if (this.audioToggle) {
      this.audioToggle.addEventListener('click', () => {
        this.toggleAudio();
      });
    }
    
    window.addEventListener('resize', Utils.debounce(() => {
      this.handleResize();
    }, 250));
    
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
    }, 16)); // ~60fps
    
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
    
    // Visibility change (for pausing animations when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
  }
  
  toggleMobileNav() {
    this.navToggle.classList.toggle('active');
    this.navTimeline.classList.toggle('active');
  }
  
  navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      this.navToggle.classList.remove('active');
      this.navTimeline.classList.remove('active');
      
      gsap.to(window, {
        duration: 1.5,
        scrollTo: {
          y: section,
          offsetY: 80
        },
        ease: 'power2.inOut'
      });
      
      this.currentSection = sectionId;
      this.updateActiveNavigation(sectionId);
      
      if (this.animationController) {
        this.animationController.triggerSectionAnimation(sectionId);
      }
      
      if (this.audioManager && !this.audioManager.isMuted) {
        this.audioManager.playSegmentAudio(sectionId);
      }
    }
  }
  
  updateActiveNavigation(activeSection) {
    const navLinks = this.navTimeline?.querySelectorAll('a');
    if (navLinks) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href').substring(1);
        if (href === activeSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
  
  toggleAudio() {
    if (this.audioManager) {
      if (this.audioManager.isMuted) {
        this.audioManager.unmute();
        this.audioToggle.classList.remove('muted');
      } else {
        this.audioManager.mute();
        this.audioToggle.classList.add('muted');
      }
    }
  }
  
  handleResize() {
    if (this.threeSetup) {
      this.threeSetup.handleResize();
    }
    
    if (this.particleSystem) {
      this.particleSystem.handleResize();
    }
    
    ScrollTrigger.refresh();
  }
  
  handleScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollY > 50) {
      this.mainNav.classList.add('scrolled');
    } else {
      this.mainNav.classList.remove('scrolled');
    }
    
    const progress = (scrollY / (documentHeight - windowHeight)) * 100;
    this.updateNavigationProgress(progress);
    
    this.updateCurrentSection();
  }
  
  updateNavigationProgress(progress) {
    let progressBar = this.mainNav.querySelector('.nav-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'nav-progress';
      this.mainNav.appendChild(progressBar);
    }
    
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
  
  updateCurrentSection() {
    const sections = document.querySelectorAll('.timeline-section');
    const scrollY = window.scrollY + window.innerHeight / 2;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        const sectionId = section.id;
        if (sectionId !== this.currentSection) {
          this.currentSection = sectionId;
          this.updateActiveNavigation(sectionId);
          
          this.onSectionChange(sectionId);
        }
      }
    });
  }
  
  onSectionChange(sectionId) {
    console.log(`📍 Entered section: ${sectionId}`);
    
    if (this.particleSystem) {
      this.particleSystem.updateForSection(sectionId);
    }
    
    if (this.threeSetup) {
      this.threeSetup.updateForSection(sectionId);
    }
    
    if (this.audioManager && !this.audioManager.isMuted) {
      this.audioManager.updateAmbientAudio(sectionId);
    }
  }
  
  handleKeyboard(e) {
    if (!this.isInitialized) return;
    
    switch(e.code) {
      case 'ArrowDown':
      case 'Space':
        e.preventDefault();
        this.scrollToNextSection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.scrollToPreviousSection();
        break;
      case 'KeyM':
        this.toggleAudio();
        break;
      case 'Escape':
        this.navToggle.classList.remove('active');
        this.navTimeline.classList.remove('active');
        break;
    }
  }
  
  scrollToNextSection() {
    const sections = Array.from(document.querySelectorAll('.timeline-section'));
    const currentIndex = sections.findIndex(section => section.id === this.currentSection);
    const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
    
    if (nextIndex !== currentIndex) {
      this.navigateToSection(sections[nextIndex].id);
    }
  }
  
  scrollToPreviousSection() {
    const sections = Array.from(document.querySelectorAll('.timeline-section'));
    const currentIndex = sections.findIndex(section => section.id === this.currentSection);
    const prevIndex = Math.max(currentIndex - 1, 0);
    
    if (prevIndex !== currentIndex) {
      this.navigateToSection(sections[prevIndex].id);
    }
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  pause() {
    gsap.globalTimeline.pause();
    if (this.audioManager) {
      this.audioManager.pause();
    }
    if (this.threeSetup) {
      this.threeSetup.pause();
    }
  }
  
  resume() {
    gsap.globalTimeline.resume();
    if (this.audioManager) {
      this.audioManager.resume();
    }
    if (this.threeSetup) {
      this.threeSetup.resume();
    }
  }
  
  handleInitializationError(error) {
    console.error('Initialization failed:', error);

    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = 'Houston, we have a problem...';
      loadingText.style.color = '#ff6b35';
    }

    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 3000);
  }

  getCurrentSection() {
    return this.currentSection;
  }
  
  getComponent(name) {
    switch(name) {
      case 'three': return this.threeSetup;
      case 'animation': return this.animationController;
      case 'scroll': return this.scrollHandler;
      case 'audio': return this.audioManager;
      case 'particles': return this.particleSystem;
      default: return null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.spaceRaceTimeline = new SpaceRaceTimeline();
});

export { SpaceRaceTimeline };