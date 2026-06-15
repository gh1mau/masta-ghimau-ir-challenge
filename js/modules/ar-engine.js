/**
 * Masta Ghimau IR Challenge - AR Engine Module
 * Author: Hussein Mohamed masta ghimau
 * YouTube: https://www.youtube.com/@mastaghimau
 * GitHub: https://github.com/gh1mau
 */

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
    }

    async init(targetImagePath) {
        try {
            // Initialize MindAR
            this.mindarThree = new window.MINDAR.IMAGE.MindARThree({
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

            // Set up event listeners
            this.anchor.onTargetFound = () => {
                console.log('Target found');
                this.hideScanInstructions();
                if (this.onTargetFound) this.onTargetFound();
            };

            this.anchor.onTargetLost = () => {
                console.log('Target lost');
                this.showScanInstructions();
                if (this.onTargetLost) this.onTargetLost();
            };

            // Set up lighting
            this.setupLighting();

            return true;
        } catch (error) {
            console.error('Failed to initialize AR:', error);
            return false;
        }
    }

    setupLighting() {
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
    }

    createCyberObject(type, position, data = {}) {
        const group = new THREE.Group();
        group.position.set(position.x, position.y, position.z);

        let mesh;
        const material = new THREE.MeshPhongMaterial({
            color: data.color || 0x00ff41,
            emissive: data.emissive || 0x002200,
            transparent: true,
            opacity: 0.9
        });

        switch (type) {
            case 'file':
                mesh = this.createFileIcon(material);
                break;
            case 'process':
                mesh = this.createProcessIcon(material);
                break;
            case 'network':
                mesh = this.createNetworkIcon(material);
                break;
            case 'server':
                mesh = this.createServerIcon(material);
                break;
            case 'email':
                mesh = this.createEmailIcon(material);
                break;
            case 'link':
                mesh = this.createLinkIcon(material);
                break;
            case 'firewall':
                mesh = this.createFirewallIcon(material);
                break;
            case 'code':
                mesh = this.createCodeIcon(material);
                break;
            case 'registry':
                mesh = this.createRegistryIcon(material);
                break;
            case 'device':
                mesh = this.createDeviceIcon(material);
                break;
            case 'cloud':
                mesh = this.createCloudIcon(material);
                break;
            case 'identity':
                mesh = this.createIdentityIcon(material);
                break;
            case 'badge':
                mesh = this.createBadgeIcon(material);
                break;
            case 'clock':
                mesh = this.createClockIcon(material);
                break;
            default:
                mesh = this.createDefaultIcon(material);
        }

        group.add(mesh);

        // Add selection ring
        const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
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
            label.position.y = 0.5;
            group.add(label);
        }

        // Store reference
        group.userData = { 
            id: data.id, 
            type, 
            selected: false,
            originalColor: material.color.getHex()
        };

        this.anchor.group.add(group);
        this.objects.set(data.id, group);

        return group;
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
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff41 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        
        // Animate ring
        const animate = () => {
            ring.rotation.z += 0.02;
            requestAnimationFrame(animate);
        };
        animate();
        
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
            const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff41 });
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

    createDefaultIcon(material) {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        return new THREE.Mesh(geometry, material);
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
        
        return mesh;
    }

    selectObject(id) {
        const object = this.objects.get(id);
        if (!object) return false;

        const isSelected = !object.userData.selected;
        object.userData.selected = isSelected;

        // Update visual state
        const ring = object.getObjectByName('selectionRing');
        if (ring) {
            ring.material.opacity = isSelected ? 1 : 0;
        }

        // Update color
        object.traverse((child) => {
            if (child.isMesh && child.material && child.name !== 'selectionRing') {
                if (isSelected) {
                    child.material.emissive.setHex(0x444400);
                } else {
                    child.material.emissive.setHex(0x002200);
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

    async start() {
        if (!this.mindarThree) return;
        
        this.isRunning = true;
        await this.mindarThree.start();
        this.renderer.setAnimationLoop(() => {
            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        if (!this.mindarThree) return;
        
        this.isRunning = false;
        this.renderer.setAnimationLoop(null);
        this.mindarThree.stop();
    }

    clearObjects() {
        this.objects.forEach((obj) => {
            this.anchor.group.remove(obj);
        });
        this.objects.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AREngine };
}
