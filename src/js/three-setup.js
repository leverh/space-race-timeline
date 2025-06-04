import { Utils } from './utils.js';

export class ThreeSetup {
  constructor() {
    this.scenes = new Map();
    this.renderers = new Map();
    this.cameras = new Map();
    this.isInitialized = false;
    this.isPaused = false;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    console.log('🎬 Initializing Three.js scenes...');
    
    // Initialize 3D scenes
    this.initHeroScene();
    this.initSputnikScene();
    this.initGagarinScene();
    this.initJFKScene();
    this.initSpacewalkScene();
    this.initApolloScene();
    this.initMoonLandingScene();

    this.startRenderLoop();
    
    this.isInitialized = true;
    console.log('✅ Three.js scenes initialized');
  }
  
  createBasicScene(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return null;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    this.scenes.set(canvasId, scene);
    this.cameras.set(canvasId, camera);
    this.renderers.set(canvasId, renderer);
    
    return { scene, camera, renderer };
  }
  
  initHeroScene() {
    const setup = this.createBasicScene('hero-canvas');
    if (!setup) return;
    
    const { scene, camera } = setup;

    camera.position.z = 5;
    
    // Rocket geometry
    const rocketGroup = new THREE.Group();
    
    // Rocket body
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const rocketBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    rocketGroup.add(rocketBody);
    
    // Rocket nose
    const noseGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const rocketNose = new THREE.Mesh(noseGeometry, noseMaterial);
    rocketNose.position.y = 1.25;
    rocketGroup.add(rocketNose);
    
    // Rocket fins
    for (let i = 0; i < 4; i++) {
      const finGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.02);
      const finMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      
      const angle = (i / 4) * Math.PI * 2;
      fin.position.x = Math.cos(angle) * 0.25;
      fin.position.z = Math.sin(angle) * 0.25;
      fin.position.y = -0.8;
      
      rocketGroup.add(fin);
    }
    
    // Position rocket
    rocketGroup.position.x = -2;
    rocketGroup.rotation.z = Math.PI / 6;
    scene.add(rocketGroup);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    scene.userData.rocket = rocketGroup;

    this.createRocketExhaust(scene, rocketGroup);
  }
  
  initSputnikScene() {
    const setup = this.createBasicScene('sputnik-canvas');
    if (!setup) return;
    
    const { scene, camera } = setup;
    
    camera.position.z = 10;

    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 100
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const sputnikGroup = new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const sputnikBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    sputnikGroup.add(sputnikBody);

    for (let i = 0; i < 4; i++) {
      const antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4);
      const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      
      const angle = (i / 4) * Math.PI * 2;
      antenna.position.x = Math.cos(angle) * 0.05;
      antenna.position.z = Math.sin(angle) * 0.05;
      antenna.position.y = 0.25;
      antenna.rotation.z = Math.cos(angle) * 0.3;
      antenna.rotation.x = Math.sin(angle) * 0.3;
      
      sputnikGroup.add(antenna);
    }

    sputnikGroup.position.x = 3.5;
    scene.add(sputnikGroup);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(10, 5, 5);
    scene.add(sunLight);

    scene.userData.earth = earth;
    scene.userData.sputnik = sputnikGroup;

    this.createOrbitPath(scene, 3.5);
  }
  
  initGagarinScene() {
    const setup = this.createBasicScene('gagarin-canvas');
    if (!setup) return;
    
    const { scene, camera } = setup;
    
    camera.position.z = 8;

    const earthGeometry = new THREE.SphereGeometry(2.5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 50
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = -1;
    scene.add(earth);

    const capsuleGroup = new THREE.Group();

    const capsuleGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const capsuleMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
    const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    capsuleGroup.add(capsule);

    const shieldGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.05, 16);
    const shieldMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const heatShield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    heatShield.position.y = -0.1;
    capsuleGroup.add(heatShield);

    capsuleGroup.position.x = 2;
    capsuleGroup.position.y = 1;
    scene.add(capsuleGroup);

    const glowGeometry = new THREE.SphereGeometry(2.7, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const earthGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    earthGlow.position.copy(earth.position);
    scene.add(earthGlow);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(5, 5, 10);
    scene.add(sunLight);

    scene.userData.earth = earth;
    scene.userData.capsule = capsuleGroup;
    scene.userData.glow = earthGlow;
  }
  
  initJFKScene() {
    const setup = this.createBasicScene('jfk-canvas');
    if (!setup) return;
    
    const { scene, camera } = setup;
    
    camera.position.z = 15;
    
    // Moon
    const moonGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xc0c0c0,
      shininess: 5
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.x = 3;
    scene.add(moon);
    
    // Craters on moon surface
    for (let i = 0; i < 20; i++) {
      const craterGeometry = new THREE.SphereGeometry(
        Utils.random(0.05, 0.15), 
        8, 
        8
      );
      const craterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x999999 
      });
      const crater = new THREE.Mesh(craterGeometry, craterMaterial);

      const phi = Utils.random(0, Math.PI * 2);
      const theta = Utils.random(0, Math.PI);
      const radius = 1.45;
      
      crater.position.x = radius * Math.sin(theta) * Math.cos(phi) + moon.position.x;
      crater.position.y = radius * Math.cos(theta) + moon.position.y;
      crater.position.z = radius * Math.sin(theta) * Math.sin(phi) + moon.position.z;
      
      scene.add(crater);
    }

    const earthGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(-4, -2, -5);
    scene.add(earth);

    this.createStarField(scene, 200);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(-10, 5, 5);
    scene.add(sunLight);
    
    scene.userData.moon = moon;
    scene.userData.earth = earth;
  }
  
  initSpacewalkScene() {
    const setup = this.createBasicScene('spacewalk-canvas');
    if (!setup) return;
    
    const { scene, camera } = setup;
    
    camera.position.z = 5;

    const astronautGroup = new THREE.Group();

    const helmetGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const helmetMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      reflectivity: 0.9
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.3;
    astronautGroup.add(helmet);

    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.4, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    astronautGroup.add(body);

    const packGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.1);
    const packMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const backpack = new THREE.Mesh(packGeometry, packMaterial);
    backpack.position.z = -0.15;
    astronautGroup.add(backpack);

    for (let side of [-1, 1]) {
      const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
      const armMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
      const arm = new THREE.Mesh(armGeometry, armMaterial);
      arm.position.x = side * 0.2;
      arm.position.y = 0.1;
      arm.rotation.z = side * 0.3;
      astronautGroup.add(arm);
    }

    for (let side of [-1, 1]) {
      const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8);
      const legMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.x = side * 0.08;
      leg.position.y = -0.35;
      astronautGroup.add(leg);
    }

    astronautGroup.position.x = -1;
    scene.add(astronautGroup);

    const earthGeometry = new THREE.SphereGeometry(3, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(2, -1, -8);
    scene.add(earth);

    const tetherGeometry = new THREE.CylinderGeometry(0.01, 0.01, 2, 4);
    const tetherMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tether = new THREE.Mesh(tetherGeometry, tetherMaterial);
    tether.position.set(0, 0, 0);
    tether.rotation.z = 0.3;
    scene.add(tether);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const earthLight = new THREE.DirectionalLight(0x4a90e2, 0.6);
    earthLight.position.set(2, -1, -5);
    scene.add(earthLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(-5, 5, 5);
    scene.add(sunLight);
    
    scene.userData.astronaut = astronautGroup;
    scene.userData.earth = earth;
    scene.userData.tether = tether;
  }
  
  initApolloScene() {
    const setup = this.createBasicScene('apollo-canvas');
    if (!setup) return;
    
    const { scene, camera } = setup;
    
    camera.position.z = 20;
    camera.position.y = 5;

    const rocketGroup = new THREE.Group();

    const stage1Geometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 16);
    const stage1Material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const stage1 = new THREE.Mesh(stage1Geometry, stage1Material);
    stage1.position.y = -6;
    rocketGroup.add(stage1);

    const stage2Geometry = new THREE.CylinderGeometry(1.5, 1.5, 6, 16);
    const stage2Material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const stage2 = new THREE.Mesh(stage2Geometry, stage2Material);
    stage2.position.y = -1;
    rocketGroup.add(stage2);

    const stage3Geometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
    const stage3Material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const stage3 = new THREE.Mesh(stage3Geometry, stage3Material);
    stage3.position.y = 3;
    rocketGroup.add(stage3);

    const csmGeometry = new THREE.CylinderGeometry(1.2, 1.5, 2, 16);
    const csmMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const csm = new THREE.Mesh(csmGeometry, csmMaterial);
    csm.position.y = 6;
    rocketGroup.add(csm);

    const lesGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);
    const lesMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const les = new THREE.Mesh(lesGeometry, lesMaterial);
    les.position.y = 7.75;
    rocketGroup.add(les);

    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.55, 0.05, 8, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = -2 + (i * 4);
      ring.visible = false; // Will be shown during separation animation
      rocketGroup.add(ring);
    }

    rocketGroup.position.y = -5;
    scene.add(rocketGroup);

    const padGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
    const padMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const launchPad = new THREE.Mesh(padGeometry, padMaterial);
    launchPad.position.y = -14;
    scene.add(launchPad);

    this.createRocketExhaust(scene, rocketGroup, true);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    scene.userData.rocket = rocketGroup;
    scene.userData.launchPad = launchPad;
  }
  
    initMoonLandingScene() {
      const setup = this.createBasicScene('moon-canvas');
      if (!setup) return;
    
      const { scene, camera } = setup;
    
      camera.position.set(0, 2, 8);
      camera.lookAt(0, 0, 0);

      const surfaceGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
      const surfaceMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        wireframe: false 
      });

      const positions = surfaceGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const noise = (Math.sin(x * 0.5) + Math.cos(y * 0.3)) * 0.1;
        positions.setZ(i, noise + Utils.random(-0.1, 0.1));
      }
      positions.needsUpdate = true;
      surfaceGeometry.computeVertexNormals();
    
      const lunarSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
      lunarSurface.rotation.x = -Math.PI / 2;
      lunarSurface.position.y = -1;
      scene.add(lunarSurface);

      const lmGroup = new THREE.Group();

      const descentGeometry = new THREE.CylinderGeometry(1, 1.2, 1, 8);
      const descentMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
      const descentStage = new THREE.Mesh(descentGeometry, descentMaterial);
      descentStage.position.y = 0.5;
      lmGroup.add(descentStage);

      const ascentGeometry = new THREE.CylinderGeometry(0.8, 1, 1.2, 8);
      const ascentMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
      const ascentStage = new THREE.Mesh(ascentGeometry, ascentMaterial);
      ascentStage.position.y = 1.6;
      lmGroup.add(ascentStage);

      for (let i = 0; i < 4; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
      
        const angle = (i / 4) * Math.PI * 2;
        leg.position.x = Math.cos(angle) * 1.5;
        leg.position.z = Math.sin(angle) * 1.5;
        leg.position.y = -0.25;
        leg.rotation.z = Math.cos(angle) * 0.2;
        leg.rotation.x = Math.sin(angle) * 0.2;

        const padGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
        const padMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const pad = new THREE.Mesh(padGeometry, padMaterial);
        pad.position.copy(leg.position);
        pad.position.y = -0.98;
      
        lmGroup.add(leg);
        lmGroup.add(pad);
      }

      lmGroup.position.set(-2, 0, 0);
      scene.add(lmGroup);

      const astronaut1 = this.createAstronaut();
      astronaut1.position.set(1, -0.5, 0);
      scene.add(astronaut1);
    
      const astronaut2 = this.createAstronaut();
      astronaut2.position.set(2, -0.5, 1);
      astronaut2.rotation.y = Math.PI / 4;
      scene.add(astronaut2);
    
      // American flag
      const flagGroup = new THREE.Group();

      const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 4);
      const poleMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
      const flagPole = new THREE.Mesh(poleGeometry, poleMaterial);
      flagPole.position.y = 1;
      flagGroup.add(flagPole);

      const flagGeometry = new THREE.PlaneGeometry(1.5, 1);
      const flagMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        side: THREE.DoubleSide 
      });
      const flag = new THREE.Mesh(flagGeometry, flagMaterial);
      flag.position.set(0.75, 1.5, 0);
      flagGroup.add(flag);
    
      flagGroup.position.set(3, -1, -1);
      scene.add(flagGroup);

      const earthGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.position.set(-5, 8, -10);
      scene.add(earth);

      this.createStarField(scene, 300);

      const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
      scene.add(ambientLight);
    
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(10, 10, 5);
      sunLight.castShadow = true;
      scene.add(sunLight);

    scene.userData.lunarModule = lmGroup;
    scene.userData.astronauts = [astronaut1, astronaut2];
    scene.userData.flag = flagGroup;
    scene.userData.earth = earth;
    scene.userData.surface = lunarSurface;
  }
  createAstronaut() {
    const astronautGroup = new THREE.Group();

    const helmetGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const helmetMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      reflectivity: 0.8
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.4;
    astronautGroup.add(helmet);

    const bodyGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.1;
    astronautGroup.add(body);

    const packGeometry = new THREE.BoxGeometry(0.2, 0.25, 0.08);
    const packMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const backpack = new THREE.Mesh(packGeometry, packMaterial);
    backpack.position.set(0, 0.15, -0.12);
    astronautGroup.add(backpack);

    const limbMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    for (let side of [-1, 1]) {
      const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6);
      const arm = new THREE.Mesh(armGeometry, limbMaterial);
      arm.position.set(side * 0.18, 0.05, 0);
      arm.rotation.z = side * 0.2;
      astronautGroup.add(arm);
    }

    for (let side of [-1, 1]) {
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
      const leg = new THREE.Mesh(legGeometry, limbMaterial);
      leg.position.set(side * 0.06, -0.25, 0);
      astronautGroup.add(leg);
    }
    
    return astronautGroup;
  }
  
  createRocketExhaust(scene, rocket, isLarge = false) {
    const exhaustGroup = new THREE.Group();
    
    const particleCount = isLarge ? 200 : 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Utils.random(-0.5, 0.5);
      positions[i * 3 + 1] = Utils.random(-2, 0);
      positions[i * 3 + 2] = Utils.random(-0.5, 0.5);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xff6600,
      size: isLarge ? 0.1 : 0.05,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, material);
    exhaustGroup.add(particles);

    const rocketBounds = new THREE.Box3().setFromObject(rocket);
    exhaustGroup.position.copy(rocket.position);
    exhaustGroup.position.y = rocketBounds.min.y - 0.5;
    
    scene.add(exhaustGroup);
    scene.userData.exhaust = exhaustGroup;
    
    return exhaustGroup;
  }
  
  createOrbitPath(scene, radius) {
    const curve = new THREE.EllipseCurve(
      0, 0,
      radius, radius * 0.8,
      0, 2 * Math.PI,
      false,
      0
    );
    
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.3
    });
    
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.rotation.x = -Math.PI / 2;
    scene.add(orbitLine);
    
    return orbitLine;
  }
  
  createStarField(scene, count) {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      starPositions[i * 3] = Utils.random(-50, 50);
      starPositions[i * 3 + 1] = Utils.random(-50, 50);
      starPositions[i * 3 + 2] = Utils.random(-50, 50);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    return stars;
  }
  
  startRenderLoop() {
    const render = () => {
      if (!this.isPaused) {
        this.updateScenes();
        this.renderScenes();
      }
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }
  
  updateScenes() {
    const time = Date.now() * 0.001;

    this.scenes.forEach((scene, canvasId) => {
      switch(canvasId) {
        case 'hero-canvas':
          this.updateHeroScene(scene, time);
          break;
        case 'sputnik-canvas':
          this.updateSputnikScene(scene, time);
          break;
        case 'gagarin-canvas':
          this.updateGagarinScene(scene, time);
          break;
        case 'jfk-canvas':
          this.updateJFKScene(scene, time);
          break;
        case 'spacewalk-canvas':
          this.updateSpacewalkScene(scene, time);
          break;
        case 'apollo-canvas':
          this.updateApolloScene(scene, time);
          break;
        case 'moon-canvas':
          this.updateMoonLandingScene(scene, time);
          break;
      }
    });
  }
  
  updateHeroScene(scene, time) {
    if (scene.userData.rocket) {
      scene.userData.rocket.rotation.y = Math.sin(time * 0.5) * 0.1;
      scene.userData.rocket.position.y = Math.sin(time * 2) * 0.1;
    }
    
    if (scene.userData.exhaust) {
      const positions = scene.userData.exhaust.children[0].geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] -= 0.02;
        if (positions.array[i * 3 + 1] < -2) {
          positions.array[i * 3 + 1] = 0;
        }
      }
      positions.needsUpdate = true;
    }
  }
  
  updateSputnikScene(scene, time) {
    if (scene.userData.earth) {
      scene.userData.earth.rotation.y = time * 0.1;
    }
    
    if (scene.userData.sputnik) {
      const angle = time * 0.3;
      scene.userData.sputnik.position.x = Math.cos(angle) * 3.5;
      scene.userData.sputnik.position.z = Math.sin(angle) * 2.8;
      scene.userData.sputnik.rotation.y = angle;
    }
  }
  
  updateGagarinScene(scene, time) {
    if (scene.userData.earth) {
      scene.userData.earth.rotation.y = time * 0.05;
    }
    
    if (scene.userData.capsule) {
      const angle = time * 0.2;
      scene.userData.capsule.position.x = Math.cos(angle) * 4;
      scene.userData.capsule.position.z = Math.sin(angle) * 3;
      scene.userData.capsule.rotation.y = -angle;
    }
  }
  
  updateJFKScene(scene, time) {
    if (scene.userData.moon) {
      scene.userData.moon.rotation.y = time * 0.02;
    }
    
    if (scene.userData.earth) {
      scene.userData.earth.rotation.y = time * 0.1;
    }
  }
  
  updateSpacewalkScene(scene, time) {
    if (scene.userData.astronaut) {
      scene.userData.astronaut.rotation.y = Math.sin(time * 0.3) * 0.2;
      scene.userData.astronaut.position.y = Math.sin(time * 0.5) * 0.1;
    }
    
    if (scene.userData.earth) {
      scene.userData.earth.rotation.y = time * 0.05;
    }
  }
  
  updateApolloScene(scene, time) {
    if (scene.userData.exhaust) {
      const positions = scene.userData.exhaust.children[0].geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] -= 0.05;
        if (positions.array[i * 3 + 1] < -4) {
          positions.array[i * 3 + 1] = 0;
        }
      }
      positions.needsUpdate = true;
    }
  }
  
  updateMoonLandingScene(scene, time) {
    if (scene.userData.earth) {
      scene.userData.earth.rotation.y = time * 0.1;
    }
    
    if (scene.userData.flag) {
      const flag = scene.userData.flag.children[1]; // The flag mesh
      if (flag) {
        const positions = flag.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const wave = Math.sin(time * 2 + x * 5) * 0.05;
          positions.setZ(i, wave);
        }
        positions.needsUpdate = true;
      }
    }
  }
  
  renderScenes() {
    this.renderers.forEach((renderer, canvasId) => {
      const scene = this.scenes.get(canvasId);
      const camera = this.cameras.get(canvasId);
      
      if (scene && camera) {
        renderer.render(scene, camera);
      }
    });
  }
  
  handleResize() {
    this.renderers.forEach((renderer, canvasId) => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const camera = this.cameras.get(canvasId);

        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    });
  }
  
  updateForSection(sectionId) {
    console.log(`🎬 Updating Three.js for section: ${sectionId}`);
  }
  
  pause() {
    this.isPaused = true;
  }
  
  resume() {
    this.isPaused = false;
  }
  
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.scenes.forEach(scene => {
      scene.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    this.renderers.forEach(renderer => renderer.dispose());
    
    console.log('🎬 Three.js scenes disposed');
  }
}