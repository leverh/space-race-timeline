import { Utils } from './utils.js';

export class ScrollHandler {
  constructor(mainApp) {
    this.app = mainApp;
    this.scrollTriggers = [];
    this.isScrolling = false;
    this.scrollDirection = 'down';
    this.lastScrollY = 0;
    this.scrollVelocity = 0;
    this.sections = [];
    
    this.init();
  }
  
  init() {
    console.log('📜 Initializing Scroll Handler...');

    this.sections = Array.from(document.querySelectorAll('.timeline-section'));

    this.setupSmoothScrolling();

    this.initializeScrollTriggers();

    this.setupScrollListeners();
    
    console.log('✅ Scroll Handler initialized');
  }
  
  setupSmoothScrolling() {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });
  }
  
  initializeScrollTriggers() {
    this.sections.forEach((section, index) => {
      this.createSectionScrollTrigger(section, index);
    });

    this.createProgressTrigger();

    this.createParallaxTriggers();

    this.createNavigationTriggers();
  }
  
  createSectionScrollTrigger(section, index) {
    const sectionId = section.id;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        console.log(`📍 Entering section: ${sectionId}`);
        this.onSectionEnter(sectionId, section, index);
      },
      onLeave: () => {
        console.log(`📍 Leaving section: ${sectionId}`);
        this.onSectionLeave(sectionId, section, index);
      },
      onEnterBack: () => {
        console.log(`📍 Re-entering section: ${sectionId}`);
        this.onSectionEnter(sectionId, section, index);
      },
      onLeaveBack: () => {
        console.log(`📍 Leaving section back: ${sectionId}`);
        this.onSectionLeave(sectionId, section, index);
      }
    });
    
    this.scrollTriggers.push(trigger);

    const contentTrigger = ScrollTrigger.create({
      trigger: section.querySelector('.section-content'),
      start: 'top 80%',
      onEnter: () => {
        this.revealSectionContent(section);
      }
    });
    
    this.scrollTriggers.push(contentTrigger);
  }
  
  createProgressTrigger() {
    const progressTrigger = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.updateTimelineProgress(self.progress);
      }
    });
    
    this.scrollTriggers.push(progressTrigger);
  }
  
  createParallaxTriggers() {
    this.sections.forEach(section => {
      const background = section.querySelector('.section-background');
      if (background) {
        const parallaxTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            const yPos = -(self.progress * 100);
            gsap.set(background, { y: yPos });
          }
        });
        
        this.scrollTriggers.push(parallaxTrigger);
      }
    });
    
    // Stars parallax
    const starsLayers = document.querySelectorAll('.stars-layer');
    starsLayers.forEach((stars, index) => {
      const speed = 0.5 + (index * 0.2);
      const starsTrigger = ScrollTrigger.create({
        trigger: stars.closest('.timeline-section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const yPos = -(self.progress * 200 * speed);
          gsap.set(stars, { y: yPos });
        }
      });
      
      this.scrollTriggers.push(starsTrigger);
    });
  }
  
  createNavigationTriggers() {
    this.sections.forEach((section, index) => {
      const navTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          this.updateActiveNavigation(section.id);
        },
        onEnterBack: () => {
          this.updateActiveNavigation(section.id);
        }
      });
      
      this.scrollTriggers.push(navTrigger);
    });
  }
  
  setupScrollListeners() {
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
    }, 16)); // ~60fps

    window.addEventListener('wheel', (e) => {
      this.scrollDirection = e.deltaY > 0 ? 'down' : 'up';
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      this.scrollDirection = touchY < touchStartY ? 'down' : 'up';
    }, { passive: true });
  }
  
  handleScroll() {
    const currentScrollY = window.pageYOffset;

    this.scrollVelocity = Math.abs(currentScrollY - this.lastScrollY);

    if (currentScrollY > this.lastScrollY) {
      this.scrollDirection = 'down';
    } else if (currentScrollY < this.lastScrollY) {
      this.scrollDirection = 'up';
    }

    this.lastScrollY = currentScrollY;

    this.isScrolling = true;

    clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false;
      this.scrollVelocity = 0;
    }, 150);

    this.updateScrollDependentElements();
  }
  
  updateScrollDependentElements() {
    this.updateNavigationStyle();

    if (this.app.particleSystem) {
      this.app.particleSystem.updateOnScroll(this.scrollVelocity, this.scrollDirection);
    }

    this.updateThreeJSOnScroll();
  }
  
  updateNavigationStyle() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    if (this.lastScrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    if (this.isScrolling) {
      nav.classList.add('scrolling');
    } else {
      nav.classList.remove('scrolling');
    }
  }
  
  updateThreeJSOnScroll() {
    if (this.app.threeSetup) {
      this.app.threeSetup.updateOnScroll?.(this.scrollVelocity, this.scrollDirection);
    }
  }
  
  onSectionEnter(sectionId, section, index) {
    section.classList.add('active');

    if (this.app.currentSection !== sectionId) {
      this.app.currentSection = sectionId;
      this.app.onSectionChange(sectionId);
    }

    if (this.app.animationController) {
      this.app.animationController.triggerSectionAnimation(sectionId);
    }

    if (this.app.threeSetup) {
      this.app.threeSetup.updateForSection(sectionId);
    }

    if (this.app.particleSystem) {
      this.app.particleSystem.updateForSection(sectionId);
    }

    if (this.app.audioManager && !this.app.audioManager.isMuted) {
      this.app.audioManager.updateAmbientAudio(sectionId);
    }
  }
  
  onSectionLeave(sectionId, section, index) {
    section.classList.remove('active');

    if (this.app.animationController) {
      this.app.animationController.cleanupSectionAnimation(sectionId);
    }
  }
  
  revealSectionContent(section) {
    const content = section.querySelector('.section-content');
    if (!content) return;
    content.classList.add('revealed');

    const title = content.querySelector('.section-title');
    const description = content.querySelector('.section-description');
    const extras = content.querySelectorAll('.stat, .detail, .crew-member');
    
    const tl = gsap.timeline();
    
    if (title) {
      tl.from(title, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
    
    if (description) {
      tl.from(description, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4');
    }
    
    if (extras.length > 0) {
      tl.from(extras, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.2');
    }
  }
  
  updateActiveNavigation(activeSection) {
    const navLinks = document.querySelectorAll('.nav-timeline a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeSection}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  updateTimelineProgress(progress) {
    let progressBar = document.querySelector('.nav-progress');
    if (!progressBar) {
      const nav = document.getElementById('main-nav');
      if (nav) {
        progressBar = document.createElement('div');
        progressBar.className = 'nav-progress';
        nav.appendChild(progressBar);
      }
    }
    
    if (progressBar) {
      gsap.set(progressBar, { width: `${progress * 100}%` });
    }

    const markers = document.querySelectorAll('.timeline-marker');
    markers.forEach((marker, index) => {
      const markerProgress = index / (markers.length - 1);
      if (progress >= markerProgress) {
        marker.classList.add('passed');
      } else {
        marker.classList.remove('passed');
      }
    });
  }

  
  scrollToSection(sectionId, duration = 1.5) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    gsap.to(window, {
      duration: duration,
      scrollTo: {
        y: section,
        offsetY: 80 // Account for fixed navigation
      },
      ease: 'power2.inOut',
      onComplete: () => {
        console.log(`📍 Scrolled to section: ${sectionId}`);
      }
    });
  }
  
  scrollToNext() {
    const currentIndex = this.sections.findIndex(section => 
      section.id === this.app.currentSection
    );
    
    if (currentIndex < this.sections.length - 1) {
      const nextSection = this.sections[currentIndex + 1];
      this.scrollToSection(nextSection.id);
    }
  }
  
  scrollToPrevious() {
    const currentIndex = this.sections.findIndex(section => 
      section.id === this.app.currentSection
    );
    
    if (currentIndex > 0) {
      const prevSection = this.sections[currentIndex - 1];
      this.scrollToSection(prevSection.id);
    }
  }
  
  scrollToTop() {
    gsap.to(window, {
      duration: 2,
      scrollTo: { y: 0 },
      ease: 'power2.inOut'
    });
  }
  
  scrollToBottom() {
    gsap.to(window, {
      duration: 2,
      scrollTo: { y: 'max' },
      ease: 'power2.inOut'
    });
  }
  
  // Utility methods
  
  getCurrentSection() {
    const scrollY = window.pageYOffset + window.innerHeight / 2;
    
    for (let section of this.sections) {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.pageYOffset;
      const sectionBottom = sectionTop + rect.height;
      
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        return section.id;
      }
    }
    
    return this.sections[0]?.id || 'hero';
  }
  
  getSectionProgress(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return 0;
    
    return Utils.getScrollProgress(section);
  }
  
  getScrollInfo() {
    return {
      scrollY: this.lastScrollY,
      direction: this.scrollDirection,
      velocity: this.scrollVelocity,
      isScrolling: this.isScrolling,
      currentSection: this.getCurrentSection()
    };
  }
  
  refreshScrollTriggers() {
    ScrollTrigger.refresh();
  }
  
  enableScrollTriggers() {
    ScrollTrigger.enable();
  }
  
  disableScrollTriggers() {
    ScrollTrigger.disable();
  }
  
  // Cleanup
  
  dispose() {
    console.log('📜 Disposing Scroll Handler...');
    
    // Kill all scroll triggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.scrollTriggers = [];
    
    // Clear timers
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }
    
    console.log('✅ Scroll Handler disposed');
  }
}