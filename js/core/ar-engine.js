/**
 * Core AR Engine Module
 * Phase 4: Performance Optimization
 * Single render loop, centralized animations, resource reuse
 * Author: Hussein Mohamed masta ghimau
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
import { logger } from './logger.js';

class AREngine {
    constructor() {
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.anchor = null;
        this.isRunning = false;
        this.onTargetFound = null;
        this.onTargetLost = null;

        // Animation system
        this.animatedObjects = [];
        this.lastTime = 0;

        // Resource pools for reuse
        this.materialPool = new Map();
        this.geometryPool = new Map();
        this.texturePool = new Map();

        // Shared materials
        this.sharedMaterials = {
            primary: new THREE.MeshPhongMaterial({
                color: 0x00ff41,
                emissive: 0x002200,
                transparent: true,
                opacity: 0.9
            }),
            warning: new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0
            })
        };

        logger.info('AREngine initialized (Performance Optimized)');
    }

    async init(targetImagePath) {
        const timer = logger.timer('AR_INIT');

        try {
            logger.ar('Initializing', { targetImage: targetImagePath });

            this.mindarThree = new MindARThree({
                container: document.querySelector('#ar-container'),
                imageTargetSrc: targetImagePath,
                uiScanning: '#scan-instructions',
                uiLoading: '#loading-screen'
            });

            const { renderer, scene, camera } = this.mindarThree;
            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;

            this.anchor = this.mindarThree.addAnchor(0);
            this.setupEventListeners();
            this.setupLighting();

            logger.ar('Initialization complete');
            timer.stop({ success: true });

            return true;
        } catch (error) {
            timer.stop({ success: false, error: error.message });
            logger.error('AR initialization failed', { error: error.message });
            return false;
        }
    }

    setupEventListeners() {
        this._onTargetFound = () => {
            logger.ar('Target found');
            this.hideScanInstructions();
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
        // Reuse light objects if possible
        if (!this.lights) {
            this.lights = {
                ambient: new THREE.AmbientLight(0xffffff, 0.5),
                directional: new THREE.DirectionalLight(0xffffff, 1),
                point: new THREE.PointLight(0x00ff41, 0.5, 10)
            };
        }

        this.lights.directional.position.set(1, 2, 1);
        this.lights.point.position.set(0, 1, 0);

        this.scene.add(this.lights.ambient);
        this.scene.add(this.lights.directional);
        this.scene.add(this.lights.point);
    }

    /**
     * Get or create geometry from pool
     */
    getGeometry(key, creator) {
        if (!this.geometryPool.has(key)) {
            this.geometryPool.set(key, creator());
        }
        return this.geometryPool.get(key);
    }

    /**
     * Get or create material from pool
     */
    getMaterial(key, creator) {
        if (!this.materialPool.has(key)) {
            this.materialPool.set(key, creator());
        }
        return this.materialPool.get(key);
    }

    createARContent(type) {
        const group = new THREE.Group();

        // Author Watermark - reuse canvas texture
        const watermark = this.createWatermark();
        group.add(watermark);

        // Scenario objects with shared geometries/materials
        const scenarioMesh = this.createScenarioMesh(type);
        if (scenarioMesh) {
            group.add(scenarioMesh);

            // Register for animation if needed
            if (type === 'ransomware' || type === 'ddos') {
                this.registerAnimation(scenarioMesh, 'rotate', { speed: 0.01 });
            }
        }

        return group;
    }

    createWatermark() {
        const key = 'watermark_texture';
        let texture = this.texturePool.get(key);

        if (!texture) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 512, 128);
            ctx.font = 'Bold 28px Arial';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.fillText('Hussein Mohamed', 256, 45);
            ctx.fillText('masta ghimau', 256, 85);

            texture = new THREE.CanvasTexture(canvas);
            this.texturePool.set(key, texture);
        }

        const sprite = new THREE.Sprite(
            this.getMaterial('watermark_mat', () =>
                new THREE.SpriteMaterial({ map: texture })
            )
        );
        sprite.scale.set(1.5, 0.4, 1);
        sprite.position.set(0, 1.2, 0);

        return sprite;
    }

    createScenarioMesh(type) {
        // Create a cute ghost for all scenarios (Mistik theme)
        return this.createCuteGhost(type);
    }

    createCuteGhost(type) {
        const ghostGroup = new THREE.Group();

        // Ghost body - white semi-transparent sphere
        const bodyGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            emissive: 0x222222
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.y = 1.3; // Stretch to make it ghost-like
        ghostGroup.add(body);

        // Ghost tail - cone shape at bottom
        const tailGeometry = new THREE.ConeGeometry(0.25, 0.4, 32, 1, true);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.y = -0.35;
        ghostGroup.add(tail);

        // Left eye
        const eyeGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 0.1, 0.25);
        ghostGroup.add(leftEye);

        // Right eye
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 0.1, 0.25);
        ghostGroup.add(rightEye);

        // Cute blush on cheeks
        const blushGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const blushMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaaaa,
            transparent: true,
            opacity: 0.6
        });
        const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial);
        leftBlush.position.set(-0.15, 0.02, 0.22);
        ghostGroup.add(leftBlush);

        const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial);
        rightBlush.position.set(0.15, 0.02, 0.22);
        ghostGroup.add(rightBlush);

        // Small mouth (smile)
        const mouthGeometry = new THREE.TorusGeometry(0.03, 0.01, 8, 16, Math.PI);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.05, 0.26);
        mouth.rotation.x = Math.PI; // Flip to make smile
        ghostGroup.add(mouth);

        // Ghost glow effect
        const glowGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0;
        ghostGroup.add(glow);

        // Position the ghost
        ghostGroup.position.set(0, 0.3, 0);

        // Register animations for the ghost
        // Floating animation
        this.registerAnimation(ghostGroup, 'float', { speed: 0.002, amplitude: 0.1 });
        // Gentle rotation
        this.registerAnimation(ghostGroup, 'rotate', { speed: 0.005, axis: 'y' });
        // Glow pulse
        this.registerAnimation(glow, 'pulse', { speed: 0.003 });

        return ghostGroup;
    }

    /**
     * Register an object for centralized animation
     */
    registerAnimation(object, type, options = {}) {
        this.animatedObjects.push({
            object,
            type,
            speed: options.speed || 0.01,
            axis: options.axis || 'y',
            ...options
        });
    }

    /**
     * Centralized update loop - SINGLE SOURCE OF TRUTH
     */
    update(deltaTime) {
        const now = Date.now();

        // Update all registered animations
        this.animatedObjects.forEach(item => {
            if (!item.object) return;

            switch (item.type) {
                case 'rotate':
                    item.object.rotation[item.axis] += item.speed * deltaTime * 60;
                    break;
                case 'pulse':
                    const pulseScale = 1 + Math.sin(now * item.speed) * 0.15;
                    item.object.scale.setScalar(pulseScale);
                    break;
                case 'float':
                    // Smooth floating animation using sine wave
                    const floatOffset = Math.sin(now * item.speed) * (item.amplitude || 0.05);
                    item.object.position.y = 0.3 + floatOffset;
                    break;
            }
        });
    }

    /**
     * SINGLE render loop - no multiple RAF loops
     */
    startRenderLoop() {
        this.lastTime = performance.now();

        this.renderer.setAnimationLoop(() => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            // Centralized update
            this.update(deltaTime);

            // Single render call
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

            // Start SINGLE render loop
            this.startRenderLoop();

            logger.ar('AR session started');
        } catch (error) {
            logger.error('Failed to start AR session', { error: error.message });
            this.isRunning = false;
        }
    }

    stop() {
        if (!this.mindarThree) return;

        logger.ar('Stopping AR session');
        this.isRunning = false;

        // Stop the SINGLE render loop
        this.renderer.setAnimationLoop(null);
        this.mindarThree.stop();

        // Clear animations
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

    /**
     * Proper disposal to prevent memory leaks
     */
    dispose() {
        logger.ar('Disposing AREngine resources');
        this.stop();

        // Dispose lights
        if (this.lights) {
            Object.values(this.lights).forEach(light => {
                if (this.scene) this.scene.remove(light);
            });
            this.lights = null;
        }

        // Dispose renderer
        if (this.renderer) {
            if (this.renderer.forceContextLoss) {
                this.renderer.forceContextLoss();
            }
            this.renderer.dispose();
        }

        // Clear pools
        this.geometryPool.forEach(geo => geo.dispose());
        this.geometryPool.clear();

        this.materialPool.forEach(mat => mat.dispose());
        this.materialPool.clear();

        this.texturePool.forEach(tex => tex.dispose());
        this.texturePool.clear();

        // Clear references
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
