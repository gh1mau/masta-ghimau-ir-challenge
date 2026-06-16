/**
 * Masta Ghimau IR Challenge - AR Engine Module
 * Phase 2: ES Module Standardization
 * Uses ES Modules for THREE and MindAR - no window globals
 * Author: Hussein Mohamed masta ghimau
 */

import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

class AREngine {
    constructor() {
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.anchor = null;
        this.isRunning = false;
        this.objects = new Map();
        this.onTargetFound = null;
        this.onTargetLost = null;
        this.onObjectSelected = null;

        // Centralized animation tracking
        this.animatedObjects = [];

        // THREE references (now from ES module import)
        this.THREE = THREE;

        // Initialize utilities
        this.initUtilities();
    }

    /**
     * Initialize utility references
     */
    initUtilities() {
        // Use global instances if available
        this.logger = window.logger || {
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            ar: () => {}
        };

        this.errorHandler = window.errorHandler || {
            handle: (err, ctx) => console.error(err, ctx)
        };

        this.config = window.CONFIG || {
            ar: {
                colors: { primary: 0x00ff41, warning: 0xffff00 },
                emissive: { default: 0x002200, selected: 0x444400 },
                selectionRingSize: 0.35,
                labelOffset: 0.5
            }
        };

        this.logger.info('AREngine initialized (ES Modules)');
    }

    async init(targetImagePath) {
        const timer = this.logger.timer('AR_INIT');

        try {
            this.logger.ar('Initializing', { targetImage: targetImagePath });

            // Initialize MindAR using ES module import
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

            // Create anchor
            this.anchor = this.mindarThree.addAnchor(0);

            // Set up event listeners with proper binding for cleanup
            this.setupEventListeners();

            // Set up lighting
            this.setupLighting();

            this.logger.ar('Initialization complete');
            timer.stop({ success: true });

            return true;
        } catch (error) {
            timer.stop({ success: false, error: error.message });
            this.logger.error('AR initialization failed', { error: error.message, stack: error.stack });
            this.errorHandler.handle(error, 'AR_INIT');
            return false;
        }
    }

    /**
     * Set up event listeners with proper tracking for cleanup
     */
    setupEventListeners() {
        // Store bound functions for cleanup
        this._onTargetFound = () => {
            this.logger.ar('Target found');
            this.hideScanInstructions();
            if (this.onTargetFound) this.onTargetFound();
        };

        this._onTargetLost = () => {
            this.logger.ar('Target lost');
            this.showScanInstructions();
            if (this.onTargetLost) this.onTargetLost();
        };

        this.anchor.onTargetFound = this._onTargetFound;
        this.anchor.onTargetLost = this._onTargetLost;
    }

    setupLighting() {
        this.logger.debug('Setting up lighting');

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 2, 1);
        this.scene.add(directionalLight);

        // Point light for cyber effect
        const pointLight = new THREE.PointLight(0x00ff41, 0.5, 10);
        pointLight.position.set(0, 1, 0);
        this.scene.add(pointLight);

        // Store references for cleanup
        this.lights = [ambientLight, directionalLight, pointLight];
    }

    createCyberObject(type, position, data = {}) {
        try {
            // Validate object type
            if (!this.config.isValidObjectType || !this.config.isValidObjectType(type)) {
                this.logger.warn(`Unknown object type: ${type}, using default`);
            }

            const group = new THREE.Group();
            group.position.set(position.x, position.y, position.z);

            // Get colors from config
            const primaryColor = this.config.get?.('ar.colors.primary', 0x00ff41) || 0x00ff41;
            const defaultEmissive = this.config.get?.('ar.emissive.default', 0x002200) || 0x002200;

            const material = new THREE.MeshPhongMaterial({
                color: data.color || primaryColor,
                emissive: data.emissive || defaultEmissive,
                transparent: true,
                opacity: 0.9
            });

            // Create mesh based on type
            let mesh = this.createMeshByType(type, material);
            group.add(mesh);

            // Add selection ring
            const ringSize = this.config.get?.('ar.selectionRingSize', 0.35) || 0.35;
            const ringGeometry = new THREE.RingGeometry(ringSize - 0.05, ringSize, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: this.config.get?.('ar.colors.warning', 0xffff00) || 0xffff00,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = -0.2;
            ring.name = 'selectionRing';
            group.add(ring);

            // Add label
            if (data.label) {
                const label = this.createTextLabel(data.label);
                const labelOffset = this.config.get?.('ar.labelOffset', 0.5) || 0.5;
                label.position.y = labelOffset;
                group.add(label);
            }

            // Store reference with metadata
            group.userData = {
                id: data.id,
                type,
                selected: false,
                originalColor: material.color.getHex(),
                createdAt: Date.now()
            };

            this.anchor.group.add(group);
            this.objects.set(data.id, group);

            this.logger.ar('Object created', { id: data.id, type, position });

            return group;
        } catch (error) {
            this.logger.error('Failed to create cyber object', { error: error.message, type, data });
            this.errorHandler.handle(error, 'AR_OBJECT_CREATE');
            return null;
        }
    }

    /**
     * Create mesh based on object type
     */
    createMeshByType(type, material) {
        const creators = {
            file: () => this.createFileIcon(material),
            process: () => this.createProcessIcon(material),
            network: () => this.createNetworkIcon(material),
            server: () => this.createServerIcon(material),
            email: () => this.createEmailIcon(material),
            link: () => this.createLinkIcon(material),
            firewall: () => this.createFirewallIcon(material),
            code: () => this.createCodeIcon(material),
            registry: () => this.createRegistryIcon(material),
            device: () => this.createDeviceIcon(material),
            cloud: () => this.createCloudIcon(material),
            identity: () => this.createIdentityIcon(material),
            badge: () => this.createBadgeIcon(material),
            clock: () => this.createClockIcon(material)
        };

        const creator = creators[type] || creators.file;
        return creator();
    }

    createFileIcon(material) {
        const geometry = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        const mesh = new THREE.Mesh(geometry, material);

        // Add folded corner
        const cornerGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0.15, 0.2, 0.025,
            0.05, 0.2, 0.025,
            0.15, 0.1, 0.025
        ]);
        cornerGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const cornerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const corner = new THREE.Mesh(cornerGeo, cornerMat);
        mesh.add(corner);

        return mesh;
    }

    createProcessIcon(material) {
        const group = new THREE.Group();

        // Main cube
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Rotating ring
        const ringGeo = new THREE.TorusGeometry(0.25, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: this.config.get?.('ar.colors.primary', 0x00ff41) || 0x00ff41
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;

        // Register for centralized animation (no individual RAF loop)
        this.animatedObjects.push({
            type: 'rotation',
            object: ring,
            speed: 0.02
        });

        group.add(ring);
        return group;
    }

    createNetworkIcon(material) {
        const group = new THREE.Group();

        // Central node
        const centerGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const center = new THREE.Mesh(centerGeo, material);
        group.add(center);

        // Satellite nodes
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const x = Math.cos(angle) * 0.3;
            const z = Math.sin(angle) * 0.3;

            const nodeGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const node = new THREE.Mesh(nodeGeo, material);
            node.position.set(x, 0, z);
            group.add(node);

            // Connection line
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(x, 0, z)
            ]);
            const lineMat = new THREE.LineBasicMaterial({
                color: this.config.get?.('ar.colors.primary', 0x00ff41) || 0x00ff41
            });
            const line = new THREE.Line(lineGeo, lineMat);
            group.add(line);
        }

        return group;
    }

    createServerIcon(material) {
        const group = new THREE.Group();

        // Server rack
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.BoxGeometry(0.3, 0.08, 0.3);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = (i - 1) * 0.12;

            // LED lights
            const ledGeo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
            const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            for (let j = 0; j < 3; j++) {
                const led = new THREE.Mesh(ledGeo, ledMat);
                led.position.set(-0.1 + j * 0.1, 0, 0.16);
                mesh.add(led);
            }

            group.add(mesh);
        }

        return group;
    }

    createEmailIcon(material) {
        const group = new THREE.Group();

        // Envelope body
        const geometry = new THREE.BoxGeometry(0.4, 0.25, 0.02);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Envelope flap
        const flapGeo = new THREE.ConeGeometry(0.2, 0.15, 3);
        const flap = new THREE.Mesh(flapGeo, material);
        flap.rotation.z = Math.PI;
        flap.rotation.x = Math.PI / 2;
        flap.position.y = 0.05;
        flap.position.z = 0.02;
        group.add(flap);

        return group;
    }

    createLinkIcon(material) {
        const group = new THREE.Group();

        // Chain links
        const torusGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 16);

        const link1 = new THREE.Mesh(torusGeo, material);
        link1.rotation.y = Math.PI / 2;
        group.add(link1);

        const link2 = new THREE.Mesh(torusGeo, material);
        link2.position.x = 0.15;
        group.add(link2);

        return group;
    }

    createFirewallIcon(material) {
        const group = new THREE.Group();

        // Shield shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.3);
        shape.lineTo(0.25, 0.2);
        shape.lineTo(0.25, -0.1);
        shape.lineTo(0, -0.3);
        shape.lineTo(-0.25, -0.1);
        shape.lineTo(-0.25, 0.2);
        shape.lineTo(0, 0.3);

        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Lock icon
        const lockGeo = new THREE.BoxGeometry(0.1, 0.08, 0.05);
        const lock = new THREE.Mesh(lockGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        lock.position.y = 0.05;
        group.add(lock);

        return group;
    }

    createCodeIcon(material) {
        const group = new THREE.Group();

        // Code block
        const geometry = new THREE.BoxGeometry(0.35, 0.4, 0.05);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Code lines
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 4; i++) {
            const lineGeo = new THREE.BoxGeometry(0.2 - i * 0.03, 0.02, 0.01);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.position.set(-0.05, 0.12 - i * 0.08, 0.03);
            group.add(line);
        }

        return group;
    }

    createRegistryIcon(material) {
        const group = new THREE.Group();

        // Tree structure
        const trunkGeo = new THREE.BoxGeometry(0.05, 0.3, 0.05);
        const trunk = new THREE.Mesh(trunkGeo, material);
        group.add(trunk);

        // Branches
        for (let i = 0; i < 3; i++) {
            const branchGeo = new THREE.BoxGeometry(0.15, 0.03, 0.03);
            const branch = new THREE.Mesh(branchGeo, material);
            branch.position.set(0.1, 0.1 - i * 0.1, 0);
            group.add(branch);

            // Leaf
            const leafGeo = new THREE.SphereGeometry(0.04, 8, 8);
            const leaf = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            leaf.position.set(0.2, 0.1 - i * 0.1, 0);
            group.add(leaf);
        }

        return group;
    }

    createDeviceIcon(material) {
        const group = new THREE.Group();

        // USB body
        const bodyGeo = new THREE.BoxGeometry(0.15, 0.08, 0.3);
        const body = new THREE.Mesh(bodyGeo, material);
        group.add(body);

        // USB connector
        const connGeo = new THREE.BoxGeometry(0.1, 0.05, 0.1);
        const conn = new THREE.Mesh(connGeo, new THREE.MeshBasicMaterial({ color: 0xcccccc }));
        conn.position.z = -0.2;
        group.add(conn);

        return group;
    }

    createCloudIcon(material) {
        const group = new THREE.Group();

        // Cloud spheres
        const positions = [
            [0, 0, 0],
            [-0.15, 0.05, 0],
            [0.15, 0.05, 0],
            [0, 0.1, 0],
            [-0.08, -0.05, 0.05],
            [0.08, -0.05, 0.05]
        ];

        positions.forEach(pos => {
            const geo = new THREE.SphereGeometry(0.1, 16, 16);
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(...pos);
            group.add(mesh);
        });

        return group;
    }

    createIdentityIcon(material) {
        const group = new THREE.Group();

        // ID card
        const cardGeo = new THREE.BoxGeometry(0.3, 0.4, 0.02);
        const card = new THREE.Mesh(cardGeo, material);
        group.add(card);

        // Photo placeholder
        const photoGeo = new THREE.BoxGeometry(0.1, 0.12, 0.01);
        const photo = new THREE.Mesh(photoGeo, new THREE.MeshBasicMaterial({ color: 0xcccccc }));
        photo.position.set(-0.05, 0.08, 0.02);
        group.add(photo);

        // Text lines
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 3; i++) {
            const lineGeo = new THREE.BoxGeometry(0.12, 0.02, 0.01);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.position.set(0.05, -0.05 - i * 0.06, 0.02);
            group.add(line);
        }

        return group;
    }

    createBadgeIcon(material) {
        const group = new THREE.Group();

        // Star shape
        const shape = new THREE.Shape();
        const points = 5;
        const outerRadius = 0.2;
        const innerRadius = 0.1;

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }
        shape.closePath();

        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        return group;
    }

    createClockIcon(material) {
        const group = new THREE.Group();

        // Clock face
        const faceGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32);
        const face = new THREE.Mesh(faceGeo, material);
        face.rotation.x = Math.PI / 2;
        group.add(face);

        // Clock hands
        const handMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.01), handMat);
        hourHand.position.z = 0.02;
        hourHand.rotation.z = Math.PI / 6;
        group.add(hourHand);

        const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.15, 0.01), handMat);
        minuteHand.position.z = 0.02;
        minuteHand.rotation.z = -Math.PI / 3;
        group.add(minuteHand);

        return group;
    }

    createTextLabel(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = '#00ff41';
        context.lineWidth = 2;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        context.font = 'bold 20px monospace';
        context.fillStyle = '#00ff41';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.PlaneGeometry(0.8, 0.2);
        const mesh = new THREE.Mesh(geometry, material);

        // Store texture reference for cleanup
        mesh.userData.texture = texture;

        return mesh;
    }

    selectObject(id) {
        const object = this.objects.get(id);
        if (!object) {
            this.logger.warn('Object not found for selection', { id });
            return false;
        }

        const isSelected = !object.userData.selected;
        object.userData.selected = isSelected;

        this.logger.ar('Object selection changed', { id, selected: isSelected });

        // Update visual state
        const ring = object.getObjectByName('selectionRing');
        if (ring) {
            ring.material.opacity = isSelected ? 1 : 0;
        }

        // Update color
        const selectedEmissive = this.config.get?.('ar.emissive.selected', 0x444400) || 0x444400;
        const defaultEmissive = this.config.get?.('ar.emissive.default', 0x002200) || 0x002200;

        object.traverse((child) => {
            if (child.isMesh && child.material && child.name !== 'selectionRing') {
                if (isSelected) {
                    child.material.emissive.setHex(selectedEmissive);
                } else {
                    child.material.emissive.setHex(defaultEmissive);
                }
            }
        });

        if (this.onObjectSelected) {
            this.onObjectSelected(id, isSelected);
        }

        return isSelected;
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
     * Update all registered animations
     * Centralized animation loop - single source of truth
     */
    updateAnimations() {
        this.animatedObjects.forEach(item => {
            if (!item.object) return;

            switch (item.type) {
                case 'rotation':
                    item.object.rotation.z += item.speed;
                    break;
                // Additional animation types can be added here
            }
        });
    }

    async start() {
        if (!this.mindarThree) {
            this.logger.error('Cannot start AR: MindAR not initialized');
            return;
        }

        try {
            this.logger.ar('Starting AR session');
            this.isRunning = true;
            await this.mindarThree.start();
            this.renderer.setAnimationLoop(() => {
                this.updateAnimations();
                this.renderer.render(this.scene, this.camera);
            });
            this.logger.ar('AR session started');
        } catch (error) {
            this.logger.error('Failed to start AR session', { error: error.message });
            this.errorHandler.handle(error, 'AR_START');
            this.isRunning = false;
        }
    }

    stop() {
        if (!this.mindarThree) return;

        this.logger.ar('Stopping AR session');
        this.isRunning = false;

        // Stop animation loop
        this.renderer.setAnimationLoop(null);

        // Stop MindAR
        this.mindarThree.stop();

        this.logger.ar('AR session stopped');
    }

    /**
     * Dispose of a Three.js object and its resources
     * Memory leak fix: Properly dispose geometries, materials, and textures
     */
    disposeObject(object) {
        if (!object) return;

        object.traverse((child) => {
            if (child.isMesh) {
                // Dispose geometry
                if (child.geometry) {
                    child.geometry.dispose();
                    this.logger.debug('Disposed geometry', { uuid: child.uuid });
                }

                // Dispose material(s)
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => this.disposeMaterial(mat));
                    } else {
                        this.disposeMaterial(child.material);
                    }
                }
            }
        });
    }

    /**
     * Dispose of material and its textures
     */
    disposeMaterial(material) {
        if (!material) return;

        // Dispose textures
        const textureProperties = ['map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap', 'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'envMap'];

        textureProperties.forEach(prop => {
            if (material[prop]) {
                material[prop].dispose();
                this.logger.debug(`Disposed texture: ${prop}`);
            }
        });

        // Dispose material
        material.dispose();
        this.logger.debug('Disposed material');
    }

    /**
     * Clear all objects with proper disposal
     * Memory leak fix: Dispose resources before removing from scene
     */
    clearObjects() {
        this.logger.ar('Clearing all objects', { count: this.objects.size });

        this.objects.forEach((obj, id) => {
            // Dispose resources
            this.disposeObject(obj);

            // Remove from anchor group
            if (this.anchor && this.anchor.group) {
                this.anchor.group.remove(obj);
            }
        });

        this.objects.clear();
        this.logger.ar('All objects cleared');
    }

    /**
     * Clean up all resources
     * Memory leak fix: Comprehensive cleanup method
     */
    dispose() {
        this.logger.ar('Disposing AREngine resources');

        // Stop AR session
        this.stop();

        // Clear all objects
        this.clearObjects();

        // Clear animated objects array
        this.animatedObjects.length = 0;

        // Dispose lights
        if (this.lights) {
            this.lights.forEach(light => {
                if (this.scene) {
                    this.scene.remove(light);
                }
            });
            this.lights = null;
        }

        // Dispose renderer with force context loss for mobile GPU memory
        if (this.renderer) {
            if (this.renderer.forceContextLoss) {
                this.renderer.forceContextLoss();
            }
            this.renderer.dispose();
            this.logger.debug('Renderer disposed');
        }

        // Clear event listeners
        this.anchor = null;
        this._onTargetFound = null;
        this._onTargetLost = null;

        // Clear references
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.logger.ar('AREngine disposed');
    }
}

// ES Module export
export { AREngine };
export default AREngine;
