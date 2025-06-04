import { Utils } from './utils.js';

export class AnimationController {
  constructor(mainApp) {
    this.app = mainApp;
    this.animations = new Map();
    this.timelines = new Map();
    this.isInitialized = false;
    
    console.log('🎭 Animation Controller initialized');
  }
  
  initializeAllAnimations() {
    console.log('🎭 Setting up all animations...');

    this.initHeroAnimations();
    this.initSputnikAnimations();
    this.initGagarinAnimations();
    this.initJFKAnimations();
    this.initSpacewalkAnimations();
    this.initApolloAnimations();
    this.initMoonLandingAnimations();

    this.initGlobalAnimations();
    
    this.isInitialized = true;
    console.log('✅ All animations initialized');
  }
  
  initHeroAnimations() {
    const section = document.getElementById('hero');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('hero'),
        onLeave: () => this.cleanupSectionAnimation('hero'),
        onEnterBack: () => this.triggerSectionAnimation('hero'),
        onLeaveBack: () => this.cleanupSectionAnimation('hero')
      }
    });

    timeline
      .from(section.querySelector('.section-title'), {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      })
      .from(section.querySelector('.section-description'), {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.5')
      .from(section.querySelector('.rocket-evolution'), {
        scale: 0,
        rotation: 180,
        opacity: 0,
        duration: 1.5,
        ease: 'back.out(1.7)'
      }, '-=0.3');

    const sketchToReality = section.querySelector('.sketch-to-reality');
    if (sketchToReality) {
      gsap.set(sketchToReality.querySelector('.rocket-real'), { opacity: 0, scale: 0 });
      
      ScrollTrigger.create({
        trigger: sketchToReality,
        start: 'top 70%',
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(sketchToReality.querySelector('.rocket-sketch'), {
            opacity: 0.3,
            scale: 1.2,
            duration: 1
          })
          .to(sketchToReality.querySelector('.transformation-arrow'), {
            x: 50,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.inOut'
          }, '-=0.5')
          .to(sketchToReality.querySelector('.rocket-real'), {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'back.out(1.7)'
          }, '-=0.3');
        }
      });
    }

    gsap.to(section.querySelector('.stars-layer'), {
      y: -200,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
    
    this.timelines.set('hero', timeline);
  }
  
  initSputnikAnimations() {
    const section = document.getElementById('sputnik');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('sputnik')
      }
    });

    timeline
      .from(section.querySelector('.section-title'), {
        x: -100,
        opacity: 0,
        duration: 1
      })
      .from(section.querySelector('.section-description'), {
        x: -80,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from(section.querySelectorAll('.sputnik-stats .stat'), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
      }, '-=0.3');
    
    const stats = section.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      const finalValue = parseFloat(stat.textContent);
      gsap.set(stat, { textContent: 0 });
      
      ScrollTrigger.create({
        trigger: stat,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(stat, {
            textContent: finalValue,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: finalValue % 1 === 0 ? 1 : 0.1 },
            onUpdate: function() {
              stat.textContent = finalValue % 1 === 0 
                ? Math.round(this.targets()[0].textContent)
                : this.targets()[0].textContent.toFixed(1);
            }
          });
        }
      });
    });
    
    this.timelines.set('sputnik', timeline);
  }
  
  initGagarinAnimations() {
    const section = document.getElementById('gagarin');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('gagarin')
      }
    });
    
    timeline
      .from(section.querySelector('.section-title'), {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)'
      })
      .from(section.querySelector('.section-description'), {
        y: 60,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from(section.querySelector('.gagarin-quote'), {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.3');
    
    // Quote typing effect
    const quote = section.querySelector('.gagarin-quote');
    if (quote) {
      const originalText = quote.textContent;
      ScrollTrigger.create({
        trigger: quote,
        start: 'top 70%',
        onEnter: () => {
          gsap.set(quote, { textContent: '' });
          gsap.to(quote, {
            duration: 3,
            ease: 'none',
            onUpdate: function() {
              const progress = this.progress();
              const currentLength = Math.round(progress * originalText.length);
              quote.textContent = originalText.substring(0, currentLength);
            }
          });
        }
      });
    }
    
    this.timelines.set('gagarin', timeline);
  }
  
  initJFKAnimations() {
    const section = document.getElementById('jfk');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('jfk')
      }
    });
    
    timeline
      .from(section.querySelector('.section-title'), {
        y: -50,
        opacity: 0,
        duration: 1
      })
      .from(section.querySelector('.section-description'), {
        y: 50,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from(section.querySelector('.jfk-quote'), {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.3');
    
    // Moon growing effect
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (window.spaceRaceTimeline) {
          const threeSetup = window.spaceRaceTimeline.getComponent('three');
          if (threeSetup && threeSetup.scenes.has('jfk-canvas')) {
            const scene = threeSetup.scenes.get('jfk-canvas');
            if (scene.userData.moon) {
              const scale = 1 + progress * 0.5;
              scene.userData.moon.scale.setScalar(scale);
            }
          }
        }
      }
    });
    
    this.timelines.set('jfk', timeline);
  }
  
  initSpacewalkAnimations() {
    const section = document.getElementById('spacewalk');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('spacewalk')
      }
    });
    
    timeline
      .from(section.querySelector('.section-title'), {
        rotationX: 90,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      })
      .from(section.querySelector('.section-description'), {
        y: 80,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from(section.querySelectorAll('.spacewalk-details .detail'), {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3
      }, '-=0.3');
    
    // Floating animation for astronau
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
      onUpdate: (self) => {
        if (window.spaceRaceTimeline) {
          const threeSetup = window.spaceRaceTimeline.getComponent('three');
          if (threeSetup && threeSetup.scenes.has('spacewalk-canvas')) {
            const scene = threeSetup.scenes.get('spacewalk-canvas');
            if (scene.userData.astronaut) {
              const floatY = Math.sin(self.progress * Math.PI * 4) * 0.2;
              scene.userData.astronaut.position.y = floatY;
            }
          }
        }
      }
    });
    
    this.timelines.set('spacewalk', timeline);
  }
  
  initApolloAnimations() {
    const section = document.getElementById('apollo');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('apollo')
      }
    });
    
    timeline
      .from(section.querySelector('.section-title'), {
        y: 100,
        opacity: 0,
        duration: 1
      })
      .from(section.querySelector('.section-description'), {
        y: 80,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from(section.querySelectorAll('.rocket-stages .stage'), {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
      }, '-=0.3');
    
    // Rocket stage separation animation
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Animate rocket stages separating
        if (window.spaceRaceTimeline) {
          const threeSetup = window.spaceRaceTimeline.getComponent('three');
          if (threeSetup && threeSetup.scenes.has('apollo-canvas')) {
            const scene = threeSetup.scenes.get('apollo-canvas');
            if (scene.userData.rocket) {
              const rocket = scene.userData.rocket;
              
              // Move rocket upward as user scrolls
              rocket.position.y = -5 + (progress * 10);
              
              // Stage separation effects at specific progress points
              if (progress > 0.3 && progress < 0.35) {
                // First stage separation
                this.animateStageSperation(rocket, 0);
              } else if (progress > 0.6 && progress < 0.65) {
                // Second stage separation
                this.animateStageSperation(rocket, 1);
              } else if (progress > 0.8 && progress < 0.85) {
                // Third stage separation
                this.animateStageSperation(rocket, 2);
              }
            }
          }
        }
      }
    });
    
    this.timelines.set('apollo', timeline);
  }
  
  initMoonLandingAnimations() {
    const section = document.getElementById('moon-landing');
    if (!section) return;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => this.triggerSectionAnimation('moon-landing')
      }
    });
    
    timeline
      .from(section.querySelector('.section-title'), {
        scale: 0,
        rotation: 360,
        opacity: 0,
        duration: 1.5,
        ease: 'back.out(1.7)'
      })
      .from(section.querySelector('.section-description'), {
        y: 100,
        opacity: 0,
        duration: 1
      }, '-=0.8')
      .from(section.querySelector('.armstrong-quote'), {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.5')
      .from(section.querySelectorAll('.mission-crew .crew-member'), {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
      }, '-=0.5');
    
    // Footprint finale animation
    const footprint = section.querySelector('.lunar-footprint');
    if (footprint) {
      ScrollTrigger.create({
        trigger: footprint,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(footprint, {
            scale: 0,
            rotation: 180,
            opacity: 0
          }, {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 2,
            ease: 'elastic.out(1, 0.3)'
          });
        }
      });
    }
    
    // Final message animation
    const finaleText = section.querySelector('.finale-text');
    if (finaleText) {
      ScrollTrigger.create({
        trigger: finaleText,
        start: 'top 90%',
        onEnter: () => {
          gsap.fromTo(finaleText, {
            y: 50,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 2,
            ease: 'power2.out'
          });
        }
      });
    }
    
    this.timelines.set('moon-landing', timeline);
  }
  
  initGlobalAnimations() {
    // Timeline markers animation on scroll
    const markers = document.querySelectorAll('.timeline-marker');
    markers.forEach(marker => {
      ScrollTrigger.create({
        trigger: marker.parentElement,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          gsap.to(marker.querySelector('.marker-dot'), {
            scale: 1.2,
            duration: 0.3,
            yoyo: true,
            repeat: 1
          });
        }
      });
    });
    
    // Scroll indicator fade out
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: '100px top',
        scrub: true,
        onUpdate: (self) => {
          gsap.to(scrollIndicator, {
            opacity: 1 - self.progress,
            duration: 0.1
          });
        }
      });
    }
    
    // Section background parallax
    const sections = document.querySelectorAll('.timeline-section');
    sections.forEach(section => {
      const background = section.querySelector('.section-background');
      if (background) {
        gsap.to(background, {
          y: -100,
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });
  }
  
  animateStageSperation(rocket, stageIndex) {
    const stages = rocket.children;
    if (stages[stageIndex]) {
      gsap.to(stages[stageIndex].position, {
        y: '-=2',
        duration: 2,
        ease: 'power2.out'
      });
      
      gsap.to(stages[stageIndex].rotation, {
        x: Utils.random(-0.5, 0.5),
        z: Utils.random(-0.5, 0.5),
        duration: 2,
        ease: 'power2.out'
      });
      
      // Separation ring effect
      const rings = rocket.children.filter(child => child.geometry && child.geometry.type === 'TorusGeometry');
      if (rings[stageIndex]) {
        rings[stageIndex].visible = true;
        gsap.to(rings[stageIndex].scale, {
          x: 2,
          y: 2,
          z: 2,
          duration: 1,
          ease: 'power2.out'
        });
        gsap.to(rings[stageIndex].material, {
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          onComplete: () => {
            rings[stageIndex].visible = false;
          }
        });
      }
    }
  }
  
  triggerSectionAnimation(sectionId) {
    console.log(`🎭 Triggering animation for section: ${sectionId}`);

    this.playEntranceAnimation(sectionId);

    if (this.app.particleSystem) {
      this.app.particleSystem.updateForSection(sectionId);
    }

    if (this.app.audioManager && !this.app.audioManager.isMuted) {
      this.app.audioManager.playSegmentTransition(sectionId);
    }
  }
  
  cleanupSectionAnimation(sectionId) {
    // Clean up animations for the section
    const timeline = this.timelines.get(sectionId);
    if (timeline) {
      timeline.pause();
    }
  }
  
  playEntranceAnimation(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    section.classList.add('entered');
    
    switch(sectionId) {
      case 'hero':
        this.playHeroEntrance(section);
        break;
      case 'sputnik':
        this.playSputnikEntrance(section);
        break;
      case 'gagarin':
        this.playGagarinEntrance(section);
        break;
      case 'jfk':
        this.playJFKEntrance(section);
        break;
      case 'spacewalk':
        this.playSpacewalkEntrance(section);
        break;
      case 'apollo':
        this.playApolloEntrance(section);
        break;
      case 'moon-landing':
        this.playMoonLandingEntrance(section);
        break;
    }
  }
  
  playHeroEntrance(section) {
    const title = section.querySelector('.section-title');
    if (title) {
      gsap.fromTo(title, {
        backgroundPosition: '200% center'
      }, {
        backgroundPosition: '0% center',
        duration: 2,
        ease: 'power2.inOut'
      });
    }
  }
  
  playSputnikEntrance(section) {
    // Satellite beeping effect
    const stats = section.querySelectorAll('.stat');
    stats.forEach((stat, index) => {
      gsap.delayedCall(index * 0.5, () => {
        gsap.to(stat, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1
        });
      });
    });
  }
  
  playGagarinEntrance(section) {
    // Earth rotation effect
    const title = section.querySelector('.section-title');
    if (title) {
      gsap.from(title, {
        rotationY: 180,
        duration: 1,
        ease: 'power2.out'
      });
    }
  }
  
  playJFKEntrance(section) {
    // Presidential speech effect
    const quote = section.querySelector('.jfk-quote');
    if (quote) {
      gsap.from(quote, {
        scale: 0.8,
        duration: 1.5,
        ease: 'elastic.out(1, 0.3)'
      });
    }
  }
  
  playSpacewalkEntrance(section) {
    // Floating effect
    const details = section.querySelectorAll('.spacewalk-details .detail');
    details.forEach((detail, index) => {
      gsap.from(detail, {
        y: Utils.random(30, 60),
        rotation: Utils.random(-10, 10),
        duration: 1 + (index * 0.2),
        ease: 'power2.out',
        delay: index * 0.3
      });
    });
  }
  
  playApolloEntrance(section) {
    // Rocket launch countdown effect
    const stages = section.querySelectorAll('.rocket-stages .stage');
    stages.forEach((stage, index) => {
      gsap.delayedCall(index * 0.3, () => {
        gsap.from(stage, {
          y: 100,
          duration: 0.8,
          ease: 'bounce.out'
        });
      });
    });
  }
  
  playMoonLandingEntrance(section) {
    // Historic landing effect
    const crewMembers = section.querySelectorAll('.mission-crew .crew-member');
    crewMembers.forEach((member, index) => {
      gsap.from(member, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        delay: index * 0.2
      });
    });
  }
  
  // Public methods for external control
  pauseAll() {
    this.timelines.forEach(timeline => timeline.pause());
  }
  
  resumeAll() {
    this.timelines.forEach(timeline => timeline.resume());
  }
  
  seekToSection(sectionId, progress = 0) {
    const timeline = this.timelines.get(sectionId);
    if (timeline) {
      timeline.progress(progress);
    }
  }
  
  getTimeline(sectionId) {
    return this.timelines.get(sectionId);
  }
  
  dispose() {
    // Kill all ScrollTriggers and timelines
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    this.timelines.forEach(timeline => timeline.kill());
    this.timelines.clear();
    this.animations.clear();
    
    console.log('🎭 Animation Controller disposed');
  }
}