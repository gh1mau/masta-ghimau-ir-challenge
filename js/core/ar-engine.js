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
        const configs = {
            ransomware: {
                geometry: () => new THREE.BoxGeometry(0.4, 0.5, 0.2),
                material: () => new THREE.MeshPhongMaterial({
                    color: 0xff0040,
                    emissive: 0x440000
                }),
                position: { x: 0, y: 0.25, z: 0 }
            },
            phishing: {
                geometry: () => new THREE.BoxGeometry(0.5, 0.35, 0.1),
                material: () => new THREE.MeshPhongMaterial({ color: 0x00aaff }),
                position: { x: 0, y: 0.2, z: 0 }
            },
            apt: {
                geometry: () => new THREE.SphereGeometry(0.25, 32, 32),
                material: () => new THREE.MeshPhongMaterial({ color: 0xffaa00 }),
                position: { x: 0, y: 0.25, z: 0 }
            },
            'insider-threat': {
                geometry: () => new THREE.CapsuleGeometry(0.15, 0.4, 4, 8),
                material: () => new THREE.MeshPhongMaterial({ color: 0xff6600 }),
                position: { x: 0, y: 0.3, z: 0 }
            },
            'malware-analysis': {
                geometry: () => new THREE.IcosahedronGeometry(0.25, 0),
                material: () => new THREE.MeshPhongMaterial({ color: 0x9900ff }),
                position: { x: 0, y: 0.25, z: 0 }
            },
            ddos: {
                geometry: () => new THREE.TorusKnotGeometry(0.2, 0.05, 64, 8),
                material: () => new THREE.MeshPhongMaterial({ color: 0xff0000 }),
                position: { x: 0, y: 0.25, z: 0 }
            },
            supplychain: {
                geometry: () => new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16),
                material: () => new THREE.MeshPhongMaterial({ color: 0x00ff88 }),
                position: { x: 0, y: 0.3, z: 0 }
            },
            infostealer: {
                geometry: () => new THREE.OctahedronGeometry(0.25),
                material: () => new THREE.MeshPhongMaterial({ color: 0xff00ff }),
                position: { x: 0, y: 0.25, z: 0 }
            }
        };

        const config = configs[type] || configs['ransomware'];
        const geometry = this.getGeometry(`geo_${type}`, config.geometry);
        const material = this.getMaterial(`mat_${type}`, config.material);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(config.position.x, config.position.y, config.position.z);

        return mesh;
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
        // Update all registered animations
        this.animatedObjects.forEach(item => {
            if (!item.object) return;

            switch (item.type) {
                case 'rotate':
                    item.object.rotation[item.axis] += item.speed * deltaTime * 60;
                    break;
                case 'pulse':
                    const scale = 1 + Math.sin(Date.now() * item.speed) * 0.1;
                    item.object.scale.setScalar(scale);
                    break;
                case 'float':
                    item.object.position.y += Math.sin(Date.now() * item.speed) * 0.001;
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
