/**
 * Core AR Engine Module
 * Phase 4: Performance Optimization
 * Single render loop, centralized animations, resource reuse
 * Author: Hussein Mohamed masta ghimau
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
import { logger } from './logger.js';

class AREngine {
    constructor() {
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.anchors = [];  // Array of anchors for multiple targets
        this.currentTargetIndex = -1;  // Currently detected target
        this.isRunning = false;
        this.onTargetFound = null;  // Callback with target index
        this.onTargetLost = null;   // Callback with target index

        // Animation system
        this.animatedObjects = [];
        this.lastTime = 0;

        // Resource pools for reuse
        this.materialPool = new Map();
        this.geometryPool = new Map();
        this.texturePool = new Map();

        // Audio
        this.audioContext = null;
        this.sounds = {};

        // Preloaded models cache
        this.preloadedModels = new Map();

        logger.info('AREngine initialized (Performance Optimized)');
    }

    async preloadModel(modelPath) {
        if (this.preloadedModels.has(modelPath)) {
            return this.preloadedModels.get(modelPath);
        }

        logger.info('Preloading model', { path: modelPath });

        try {
            const model = await this.loadGLBModel(modelPath);
            this.preloadedModels.set(modelPath, model.clone());
            return model;
        } catch (error) {
            logger.warn('Failed to preload model', { path: modelPath, error: error.message });
            return null;
        }
    }

    async init(targetImagePath, maxTargets = 5) {
        const timer = logger.timer('AR_INIT');

        try {
            logger.ar('Initializing', { targetImage: targetImagePath, maxTargets });

            this.mindarThree = new MindARThree({
                container: document.querySelector('#ar-container'),
                imageTargetSrc: targetImagePath,
                maxTrack: maxTargets,  // Support multiple targets
                uiScanning: '#scan-instructions',
                uiLoading: '#loading-screen'
            });

            const { renderer, scene, camera } = this.mindarThree;
            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;

            // Create anchors for all targets
            this.setupMultipleAnchors(maxTargets);
            this.setupLighting();
            this.initAudio();

            logger.ar('Initialization complete', { anchors: this.anchors.length });
            timer.stop({ success: true });

            return true;
        } catch (error) {
            timer.stop({ success: false, error: error.message });
            logger.error('AR initialization failed', { error: error.message });
            return false;
        }
    }

    setupMultipleAnchors(maxTargets) {
        this.anchors = [];

        for (let i = 0; i < maxTargets; i++) {
            const anchor = this.mindarThree.addAnchor(i);

            // Store target index in anchor
            anchor.targetIndex = i;

            // Setup event handlers for this anchor
            anchor.onTargetFound = () => {
                this.currentTargetIndex = i;
                logger.ar('Target found', { index: i });
                this.hideScanInstructions();
                this.playSound('ghostAppear');
                if (this.onTargetFound) this.onTargetFound(i);
            };

            anchor.onTargetLost = () => {
                if (this.currentTargetIndex === i) {
                    logger.ar('Target lost', { index: i });
                    this.showScanInstructions();
                    if (this.onTargetLost) this.onTargetLost(i);
                    // Don't clear content - let it stay visible
                    // this.currentTargetIndex = -1; // Keep the current target index
                }
            };

            this.anchors.push(anchor);
        }

        logger.info('Created multiple anchors', { count: this.anchors.length });
    }

    getCurrentAnchor() {
        if (this.currentTargetIndex >= 0 && this.currentTargetIndex < this.anchors.length) {
            return this.anchors[this.currentTargetIndex];
        }
        return null;
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            logger.info('Audio context initialized');
        } catch (error) {
            logger.warn('Audio not supported', { error: error.message });
        }
    }

    playSound(type, challengeId = null) {
        if (!this.audioContext) return;

        // AGGRESSIVE Ghost/Mystic themed sounds with different variations per challenge
        const challengeSounds = {
            // Ransomware - Dark/Evil ghost (AGGRESSIVE)
            chal_1: { baseFreq: 80, harmonics: [0.5, 1, 2, 4], wave: 'sawtooth', reverb: 0.9, distortion: 0.8 },
            // Phishing - Sneaky/Slippery ghost (AGGRESSIVE)
            chal_2: { baseFreq: 120, harmonics: [1, 2, 3, 5], wave: 'square', reverb: 0.8, distortion: 0.6 },
            // APT - Ancient/Powerful ghost (AGGRESSIVE)
            chal_3: { baseFreq: 60, harmonics: [1, 2, 4, 8], wave: 'sawtooth', reverb: 0.95, distortion: 0.9 },
            // DDoS - Chaotic/Angry ghost (AGGRESSIVE)
            chal_4: { baseFreq: 50, harmonics: [1, 3, 5, 7], wave: 'square', reverb: 0.85, distortion: 0.9 },
            // Supply Chain - Deceptive/Charming ghost (AGGRESSIVE)
            chal_5: { baseFreq: 150, harmonics: [1, 2, 3, 4], wave: 'sawtooth', reverb: 0.7, distortion: 0.7 },
            // Info Stealer - Quick/Silent ghost (AGGRESSIVE)
            chal_6: { baseFreq: 180, harmonics: [1, 2, 4, 6], wave: 'square', reverb: 0.6, distortion: 0.5 }
        };

        const challenge = challengeId ? challengeSounds[challengeId] : null;

        const sounds = {
            // Ghostly appearance - ethereal whoosh with reverb
            ghostAppear: { 
                freq: challenge ? challenge.baseFreq : 180, 
                type: challenge ? challenge.wave : 'sine', 
                duration: 1.2, 
                slide: challenge ? challenge.baseFreq * 2 : 360,
                reverb: challenge ? challenge.reverb : 0.7,
                harmonics: challenge ? challenge.harmonics : [1, 2, 3]
            },
            // Countdown - mystical ticking
            countdown: { 
                freq: 600, 
                type: 'sine', 
                duration: 0.15,
                reverb: 0.3,
                echo: true
            },
            // Quiz start - magical chime
            quizStart: { 
                freq: 440, 
                type: 'triangle', 
                duration: 0.8,
                slide: 880,
                reverb: 0.6,
                harmonics: [1, 2, 4]
            },
            // Correct answer - heavenly bell
            correct: { 
                freq: 880, 
                type: 'sine', 
                duration: 0.6,
                slide: 1320,
                reverb: 0.5,
                harmonics: [1, 1.5, 2]
            },
            // Wrong answer - dark dissonance
            wrong: { 
                freq: 150, 
                type: 'sawtooth', 
                duration: 0.5,
                slide: 100,
                reverb: 0.8,
                dissonance: true
            },
            // Results - triumphant ghostly chorus
            results: {
                freq: 523, // C5
                type: 'triangle',
                duration: 1.5,
                slide: 1046, // C6
                reverb: 0.9,
                harmonics: [1, 2, 3, 4],
                chorus: true
            }
        };

        const sound = sounds[type];
        if (!sound) return;

        // Create master gain for volume control - LOUDER AND MORE AGGRESSIVE
        const masterGain = this.audioContext.createGain();
        masterGain.gain.value = 0.8; // Increased from 0.4 to 0.8 (2x louder)
        masterGain.connect(this.audioContext.destination);

        // Add reverb effect
        if (sound.reverb && sound.reverb > 0) {
            const convolver = this.audioContext.createConvolver();
            const reverbGain = this.audioContext.createGain();
            reverbGain.gain.value = sound.reverb * 0.5;
            
            // Create impulse response for reverb
            const rate = this.audioContext.sampleRate;
            const length = rate * 2; // 2 seconds
            const impulse = this.audioContext.createBuffer(2, length, rate);
            const left = impulse.getChannelData(0);
            const right = impulse.getChannelData(1);
            
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                left[i] = (Math.random() * 2 - 1) * decay;
                right[i] = (Math.random() * 2 - 1) * decay;
            }
            
            convolver.buffer = impulse;
            convolver.connect(reverbGain);
            reverbGain.connect(masterGain);
            this.reverbNode = convolver;
        }

        // Play main tone with harmonics for richer sound
        const playTone = (freq, type, duration, delay = 0, gain = 0.3) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(masterGain);
            
            if (this.reverbNode) {
                gainNode.connect(this.reverbNode);
            }
            
            osc.frequency.value = freq;
            osc.type = type;
            
            const now = this.audioContext.currentTime + delay;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(gain, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            if (sound.slide) {
                osc.frequency.exponentialRampToValueAtTime(sound.slide, now + duration);
            }
            
            osc.start(now);
            osc.stop(now + duration);
        };

        // Play fundamental frequency
        playTone(sound.freq, sound.type, sound.duration, 0, 0.3);

        // Add harmonics for richer ghostly texture
        if (sound.harmonics) {
            sound.harmonics.forEach((harmonic, i) => {
                const harmonicFreq = sound.freq * harmonic;
                const harmonicGain = 0.15 / (i + 1);
                playTone(harmonicFreq, 'sine', sound.duration * 0.8, i * 0.02, harmonicGain);
            });
        }

        // Add dissonance for wrong answer
        if (sound.dissonance) {
            playTone(sound.freq * 1.5, 'sawtooth', sound.duration, 0.05, 0.2);
            playTone(sound.freq * 0.8, 'square', sound.duration, 0.1, 0.15);
        }

        // Add echo effect for countdown
        if (sound.echo) {
            setTimeout(() => {
                playTone(sound.freq * 0.5, 'sine', sound.duration * 0.5, 0, 0.15);
            }, 80);
        }

        // Add chorus effect for results
        if (sound.chorus) {
            setTimeout(() => {
                playTone(sound.freq * 1.25, 'triangle', sound.duration * 0.7, 0, 0.2); // Major third
            }, 100);
            setTimeout(() => {
                playTone(sound.freq * 1.5, 'sine', sound.duration * 0.6, 0, 0.15); // Perfect fifth
            }, 200);
        }
    }

    setupEventListeners() {
        this._onTargetFound = () => {
            logger.ar('Target found');
            this.hideScanInstructions();
            this.playSound('ghostAppear');
            if (this.onTargetFound) this.onTargetFound();
        };

        this._onTargetLost = () => {
            logger.ar('Target lost');
            this.showScanInstructions();
            if (this.onTargetLost) this.onTargetLost();
        };

        this.anchor.onTargetFound = this._onTargetFound;
        this.anchor.onTargetLost = this._onTargetLost;
    }

    setupLighting() {
        if (!this.lights) {
            this.lights = {
                ambient: new THREE.AmbientLight(0xffffff, 0.6),
                directional: new THREE.DirectionalLight(0xffffff, 0.8),
                point: new THREE.PointLight(0x88ccff, 0.5, 10)
            };
        }

        this.lights.directional.position.set(1, 2, 1);
        this.lights.point.position.set(0, 1, 0);

        this.scene.add(this.lights.ambient);
        this.scene.add(this.lights.directional);
        this.scene.add(this.lights.point);
    }

    async createARContent(type, modelPath = null) {
        const group = new THREE.Group();

        if (modelPath) {
            // Try to load GLB model
            try {
                console.log('Attempting to load GLB model:', modelPath);
                const model = await this.loadGLBModel(modelPath);
                if (model) {
                    console.log('GLB model loaded successfully, processing...');
                    // Center the model and scale appropriately for phone screen
                    this.centerAndScaleModel(model);

                    // Position at center of screen (slightly elevated)
                    model.position.set(0, 0, 0);

                    // Add animations to the model
                    this.registerAnimation(model, 'float', { speed: 0.0015, amplitude: 0.1 });
                    this.registerAnimation(model, 'rotate', { speed: 0.002, axis: 'y' });

                    group.add(model);

                    // Add glow effect centered with model
                    const glow = this.createGlowEffect();
                    glow.position.set(0, 0, -0.2);
                    group.add(glow);

                    console.log('AR content group created with model');
                    return group;
                } else {
                    console.warn('Model loaded but is null/undefined');
                }
            } catch (error) {
                console.error('Failed to load GLB model:', error);
                logger.warn('Failed to load GLB model, falling back to sprite', { error: error.message });
            }
        }

        console.log('Using fallback ghost sprite');
        // Fallback to sprite ghost
        const ghost = this.createRealisticGhost();
        group.add(ghost);

        // Add particle effects around ghost
        const particles = this.createGhostParticles();
        group.add(particles);

        return group;
    }

    centerAndScaleModel(model) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model - position at exact center of screen
        model.position.x = -center.x;
        model.position.y = -center.y + 0.2; // Slight offset up for better visibility
        model.position.z = -center.z;

        // Calculate scale to fit nicely on phone screen - LARGER for better visibility
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2.0; // Increased from 1.5 for better visibility
        const scale = targetSize / maxDim;

        // Apply scale (clamped to reasonable range)
        const finalScale = Math.min(scale, 2.5); // Max scale 2.5x
        model.scale.setScalar(finalScale);

        // Ensure model faces camera
        model.rotation.set(0, 0, 0);

        logger.info('Model centered and scaled', { scale: finalScale, size: maxDim, position: model.position });
    }

    loadGLBModel(url) {
        return new Promise((resolve, reject) => {
            console.log('Loading GLB model from:', url);
            const loader = new GLTFLoader();
            loader.load(
                url,
                (gltf) => {
                    console.log('GLB model loaded successfully:', url);
                    logger.info('GLB model loaded successfully', { url });
                    resolve(gltf.scene);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`Loading GLB: ${percent}%`);
                    logger.info(`Loading GLB: ${percent}%`);
                },
                (error) => {
                    console.error('Failed to load GLB model:', error);
                    logger.error('Failed to load GLB model', { error: error.message });
                    reject(error);
                }
            );
        });
    }

    createGlowEffect() {
        const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0.3, -0.1);

        // Animate glow
        this.registerAnimation(glow, 'pulse', { speed: 0.002 });

        return glow;
    }

    createRealisticGhost() {
        const group = new THREE.Group();

        // Create high-quality ghost texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, 512, 512);

        // Ghost body gradient
        const bodyGradient = ctx.createRadialGradient(256, 200, 50, 256, 250, 180);
        bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bodyGradient.addColorStop(0.5, 'rgba(240, 248, 255, 0.9)');
        bodyGradient.addColorStop(1, 'rgba(200, 220, 255, 0.6)');

        // Draw ghost body (blob shape)
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.moveTo(256, 80);
        ctx.bezierCurveTo(350, 80, 400, 150, 400, 250);
        ctx.bezierCurveTo(400, 350, 380, 420, 340, 450);
        ctx.bezierCurveTo(320, 470, 300, 450, 280, 430);
        ctx.bezierCurveTo(260, 450, 240, 470, 220, 450);
        ctx.bezierCurveTo(200, 470, 180, 450, 160, 430);
        ctx.bezierCurveTo(140, 450, 120, 470, 100, 450);
        ctx.bezierCurveTo(60, 420, 40, 350, 40, 250);
        ctx.bezierCurveTo(40, 150, 100, 80, 256, 80);
        ctx.closePath();
        ctx.fill();

        // Ghost glow
        ctx.shadowColor = 'rgba(136, 204, 255, 0.8)';
        ctx.shadowBlur = 30;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Eyes - large and cute
        // Left eye white
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(210, 200, 35, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right eye white
        ctx.beginPath();
        ctx.ellipse(302, 200, 35, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left eye black pupil (looking slightly up)
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(215, 195, 18, 0, Math.PI * 2);
        ctx.fill();

        // Right eye black pupil
        ctx.beginPath();
        ctx.arc(297, 195, 18, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(220, 188, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(302, 188, 6, 0, Math.PI * 2);
        ctx.fill();

        // Cute blush
        const blushGradient = ctx.createRadialGradient(180, 260, 0, 180, 260, 25);
        blushGradient.addColorStop(0, 'rgba(255, 182, 193, 0.8)');
        blushGradient.addColorStop(1, 'rgba(255, 182, 193, 0)');
        ctx.fillStyle = blushGradient;
        ctx.beginPath();
        ctx.arc(180, 260, 25, 0, Math.PI * 2);
        ctx.fill();

        const blushGradient2 = ctx.createRadialGradient(332, 260, 0, 332, 260, 25);
        blushGradient2.addColorStop(0, 'rgba(255, 182, 193, 0.8)');
        blushGradient2.addColorStop(1, 'rgba(255, 182, 193, 0)');
        ctx.fillStyle = blushGradient2;
        ctx.beginPath();
        ctx.arc(332, 260, 25, 0, Math.PI * 2);
        ctx.fill();

        // Cute smile
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(256, 280, 20, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Small tongue
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.ellipse(256, 298, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite material
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.95
        });

        // Create sprite
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.5, 1.5, 1);
        sprite.position.set(0, 0.5, 0);

        // Add glow behind ghost
        const glowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0.5, -0.1);
        group.add(glow);

        group.add(sprite);

        // Register animations
        this.registerAnimation(sprite, 'float', { speed: 0.0015, amplitude: 0.08 });
        this.registerAnimation(sprite, 'rotate', { speed: 0.003, axis: 'y' });
        this.registerAnimation(glow, 'pulse', { speed: 0.002 });

        return group;
    }

    createGhostParticles() {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = Math.random() * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

            // Light blue/cyan colors
            colors[i * 3] = 0.5 + Math.random() * 0.5;
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 2] = 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);

        // Animate particles
        this.registerAnimation(particles, 'float', { speed: 0.001 });

        return particles;
    }

    registerAnimation(object, type, options = {}) {
        this.animatedObjects.push({
            object,
            type,
            speed: options.speed || 0.01,
            axis: options.axis || 'y',
            amplitude: options.amplitude || 0.05,
            ...options
        });
    }

    update(deltaTime) {
        const now = Date.now();

        this.animatedObjects.forEach(item => {
            if (!item.object) return;

            switch (item.type) {
                case 'rotate':
                    item.object.rotation[item.axis] += item.speed * deltaTime * 60;
                    break;
                case 'pulse':
                    const pulseScale = 1 + Math.sin(now * item.speed) * 0.1;
                    item.object.scale.setScalar(pulseScale);
                    break;
                case 'float':
                    const floatOffset = Math.sin(now * item.speed) * item.amplitude;
                    item.object.position.y = 0.5 + floatOffset;
                    break;
            }
        });
    }

    startRenderLoop() {
        this.lastTime = performance.now();

        this.renderer.setAnimationLoop(() => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            this.update(deltaTime);
            this.renderer.render(this.scene, this.camera);
        });
    }

    async start() {
        if (!this.mindarThree) {
            logger.error('Cannot start AR: MindAR not initialized');
            return;
        }

        try {
            logger.ar('Starting AR session');
            this.isRunning = true;
            await this.mindarThree.start();
            this.startRenderLoop();
            
            // Add resize handler with protection
            this.setupResizeHandler();
            
            logger.ar('AR session started');
        } catch (error) {
            logger.error('Failed to start AR session', { error: error.message });
            this.isRunning = false;
        }
    }

    setupResizeHandler() {
        // Override MindAR's resize to add safety checks
        const originalResize = this.mindarThree.resize;
        this.mindarThree.resize = () => {
            try {
                // Check if controller is ready before resizing
                if (this.mindarThree.controller && this.mindarThree.renderer) {
                    originalResize.call(this.mindarThree);
                } else {
                    logger.warn('Resize called before AR controller ready, skipping');
                }
            } catch (error) {
                logger.warn('Resize error (non-critical):', error.message);
            }
        };
    }

    stop() {
        if (!this.mindarThree) return;

        logger.ar('Stopping AR session');
        this.isRunning = false;
        this.renderer.setAnimationLoop(null);
        this.mindarThree.stop();
        this.animatedObjects.length = 0;
        logger.ar('AR session stopped');
    }

    showScanInstructions() {
        const el = document.getElementById('scan-instructions');
        if (el) el.style.display = 'block';
    }

    hideScanInstructions() {
        const el = document.getElementById('scan-instructions');
        if (el) el.style.display = 'none';
    }

    dispose() {
        logger.ar('Disposing AREngine resources');
        this.stop();

        if (this.lights) {
            Object.values(this.lights).forEach(light => {
                if (this.scene) this.scene.remove(light);
            });
            this.lights = null;
        }

        if (this.renderer) {
            if (this.renderer.forceContextLoss) {
                this.renderer.forceContextLoss();
            }
            this.renderer.dispose();
        }

        this.geometryPool.forEach(geo => geo.dispose());
        this.geometryPool.clear();
        this.materialPool.forEach(mat => mat.dispose());
        this.materialPool.clear();
        this.texturePool.forEach(tex => tex.dispose());
        this.texturePool.clear();

        this.anchor = null;
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animatedObjects = [];

        logger.ar('AREngine disposed');
    }
}

export { AREngine };
export default AREngine;
