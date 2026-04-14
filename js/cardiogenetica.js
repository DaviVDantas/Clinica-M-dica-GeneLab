import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==========================================
// 1. THREE.JS BACKGROUND: CORAÇÃO ANATÓMICO ORGÂNICO
// ==========================================
const container = document.getElementById('canvas-container');
if (container) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010308, 0.015);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Efeito de Brilho (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0.2);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 15, 15);
    scene.add(mainLight);

    const cyanRim = new THREE.PointLight(0x00f0ff, 60, 100);
    cyanRim.position.set(-10, 5, -5);
    scene.add(cyanRim);

    const cardioRim = new THREE.PointLight(0xff0055, 80, 100);
    cardioRim.position.set(10, -10, 5);
    scene.add(cardioRim);

    // Textura Orgânica (Fibras/Músculo)
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 2000; i++) {
        ctx.beginPath();
        let alpha = Math.random() * 0.15;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = Math.random() * 3 + 1;
        let x = Math.random() * 512;
        let y = Math.random() * 512;
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 50, y - 50, x + (Math.random() - 0.5) * 20, y - 100);
        ctx.stroke();
    }

    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;

    // Materiais
    const fleshyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x880011,
        emissive: 0x110000,
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transmission: 0.2,
        thickness: 2.0,
        bumpMap: bumpTexture,
        bumpScale: 0.08
    });

    const vesselMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaa1122, roughness: 0.15, clearcoat: 1.0, bumpMap: bumpTexture, bumpScale: 0.02, transmission: 0.1, thickness: 1.0
    });

    const blueVesselMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x223388, roughness: 0.15, clearcoat: 1.0, transmission: 0.1, thickness: 1.0
    });

    // Grupo coração
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    // Ventrículos
    const ventGeo = new THREE.SphereGeometry(2.5, 128, 128);
    const pos = ventGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        if (y < 0) {
            let taper = 1.0 + y * 0.18;
            x *= taper;
            z *= taper;
            x -= Math.pow(Math.abs(y), 1.5) * 0.15;
        } else {
            x *= (1.0 + y * 0.05);
            z *= (1.0 + y * 0.1);
        }

        if (z > 0) {
            let dist = Math.abs(x - (y * 0.5 + 0.5));
            if (dist < 1.0) {
                let depth = (1.0 - dist) * 0.3 * (1.0 - Math.abs(y / 2.5));
                if (depth > 0) z -= depth;
            }
        }

        let noise = Math.sin(x * 10) * Math.sin(y * 10) * Math.sin(z * 10) * 0.02;
        x += noise; y += noise; z += noise;

        pos.setXYZ(i, x, y, z);
    }
    ventGeo.computeVertexNormals();
    const ventricles = new THREE.Mesh(ventGeo, fleshyMaterial);
    heartGroup.add(ventricles);

    // Artérias Coronárias
    class CoronaryCurve extends THREE.Curve {
        constructor(offsetX, startY, endY) {
            super();
            this.offsetX = offsetX;
            this.startY = startY;
            this.endY = endY;
        }
        getPoint(t, opt = new THREE.Vector3()) {
            let y = this.startY - t * (this.startY - this.endY);
            let x = this.offsetX + y * 0.5 + Math.sin(t * Math.PI * 2) * 0.1;
            let radiusAtY = Math.sqrt(Math.max(0, 2.5 * 2.5 - y * y - x * x));
            let z = radiusAtY * 0.95;

            if (y < 0) {
                let taper = 1.0 + y * 0.18;
                x *= taper; z *= taper;
                x -= Math.pow(Math.abs(y), 1.5) * 0.15;
            } else {
                x *= (1.0 + y * 0.05); z *= (1.0 + y * 0.1);
            }
            return opt.set(x, y, z + 0.12);
        }
    }

    const cor1 = new THREE.Mesh(new THREE.TubeGeometry(new CoronaryCurve(0.3, 1.5, -2.0), 32, 0.08, 8, false), vesselMaterial);
    const cor2 = new THREE.Mesh(new THREE.TubeGeometry(new CoronaryCurve(0.4, 1.5, -1.8), 32, 0.06, 8, false), blueVesselMaterial);
    const cor3 = new THREE.Mesh(new THREE.TubeGeometry(new CoronaryCurve(-0.5, 1.2, -1.5), 32, 0.07, 8, false), vesselMaterial);
    ventricles.add(cor1); ventricles.add(cor2); ventricles.add(cor3);

    // Átrios
    const atriaGroup = new THREE.Group();

    const raGeo = new THREE.SphereGeometry(1.2, 32, 32);
    raGeo.scale(1.2, 0.8, 1.0);
    const rightAtrium = new THREE.Mesh(raGeo, fleshyMaterial);
    rightAtrium.position.set(-1.6, 1.8, 0.8);
    rightAtrium.rotation.z = Math.PI / 4;
    atriaGroup.add(rightAtrium);

    const laGeo = new THREE.SphereGeometry(1.0, 32, 32);
    laGeo.scale(1.0, 0.8, 1.2);
    const leftAtrium = new THREE.Mesh(laGeo, fleshyMaterial);
    leftAtrium.position.set(1.4, 1.6, -0.8);
    leftAtrium.rotation.z = -Math.PI / 6;
    atriaGroup.add(leftAtrium);

    heartGroup.add(atriaGroup);

    // Aorta
    class AortaCurve extends THREE.Curve {
        getPoint(t, opt = new THREE.Vector3()) {
            const x = Math.sin(t * Math.PI) * 1.5 - 0.2;
            const y = 2.0 + Math.sin(t * Math.PI) * 2.0 - t * 1.5;
            const z = Math.cos(t * Math.PI) * 1.5 - 1.0;
            return opt.set(x, y, z);
        }
    }
    const aorta = new THREE.Mesh(new THREE.TubeGeometry(new AortaCurve(), 64, 0.7, 16, false), vesselMaterial);
    heartGroup.add(aorta);

    // Artéria Pulmonar
    class PulmCurve extends THREE.Curve {
        getPoint(t, opt = new THREE.Vector3()) {
            const x = 0.5 + t * 2.0;
            const y = 2.0 + t * 1.5;
            const z = 0.8 - t * 1.5;
            return opt.set(x, y, z);
        }
    }
    const pulm = new THREE.Mesh(new THREE.TubeGeometry(new PulmCurve(), 64, 0.6, 16, false), blueVesselMaterial);
    heartGroup.add(pulm);

    const cava = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.5, 16), blueVesselMaterial);
    cava.position.set(-1.2, 2.5, -0.8); cava.rotation.z = -0.2;
    heartGroup.add(cava);

    heartGroup.position.set(4, 0, -2);
    heartGroup.rotation.y = -Math.PI / 6;

    // Partículas (Glóbulos)
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    const rbcGeo = new THREE.SphereGeometry(0.2, 16, 16);
    rbcGeo.scale(1, 1, 0.4);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0xaa0011, roughness: 0.2 });

    for (let i = 0; i < 200; i++) {
        const rbc = new THREE.Mesh(rbcGeo, rbcMat);
        rbc.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40);
        rbc.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        rbc.userData = { offset: Math.random() * Math.PI * 2, speed: 0.5 + Math.random(), rotSpeed: (Math.random() - 0.5) * 0.1 };
        particlesGroup.add(rbc);
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        heartGroup.rotation.y = -Math.PI / 6 + Math.sin(time * 0.5) * 0.15;
        heartGroup.rotation.x = Math.sin(time * 0.8) * 0.05;

        // Ciclo de Batimento Cardíaco
        let t = (time % 1.2);

        if (t < 0.15) {
            let p = t / 0.15;
            let squeeze = Math.sin(p * Math.PI);
            atriaGroup.scale.set(1.0 - squeeze * 0.15, 1.0 - squeeze * 0.15, 1.0 - squeeze * 0.15);
        } else {
            atriaGroup.scale.set(1, 1, 1);
        }

        if (t > 0.15 && t < 0.45) {
            let p = (t - 0.15) / 0.3;
            let squeeze = Math.sin(p * Math.PI);
            ventricles.scale.set(1.0 - squeeze * 0.06, 1.0 + squeeze * 0.08, 1.0 - squeeze * 0.06);
            ventricles.rotation.y = squeeze * 0.08;
            cardioRim.intensity = 80 + squeeze * 50;
        } else {
            ventricles.scale.set(1, 1, 1);
            ventricles.rotation.y = 0;
            cardioRim.intensity = 80;
        }

        particlesGroup.children.forEach(cell => {
            cell.position.y += Math.sin(time * cell.userData.speed + cell.userData.offset) * 0.03;
            cell.position.x += Math.cos(time * cell.userData.speed * 0.5 + cell.userData.offset) * 0.02;
            cell.rotation.x += cell.userData.rotSpeed;
            cell.rotation.y += cell.userData.rotSpeed;
        });

        camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        composer.render();
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ==========================================
// 2. ECG SVG ANIMATION
// ==========================================
const ecgPath = document.getElementById('ecgLine');
if (ecgPath) {
    const length = ecgPath.getTotalLength();
    ecgPath.style.strokeDasharray = length;
    ecgPath.style.strokeDashoffset = length;

    let progress = length;
    function animateECG() {
        progress -= 4;
        if (progress < -length) progress = length;
        ecgPath.style.strokeDashoffset = Math.max(0, progress);
        requestAnimationFrame(animateECG);
    }
    animateECG();
}

// ==========================================
// 3. UI INTERACTIONS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');

    if (window.innerWidth > 768 && cursor && cursorBlur) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            setTimeout(() => {
                cursorBlur.style.left = e.clientX + 'px';
                cursorBlur.style.top = e.clientY + 'px';
            }, 60);
        });

        document.querySelectorAll('.magnetic, a, button').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering-link');
                if (el.classList.contains('cardio-hover')) document.body.classList.add('hovering-cardio');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering-link');
                document.body.classList.remove('hovering-cardio');
            });
        });
    }

    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = { rootMargin: "0px 0px -100px 0px", threshold: 0.1 };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => revealOnScroll.observe(reveal));
    setTimeout(() => {
        reveals.forEach(reveal => {
            if (reveal.getBoundingClientRect().top < window.innerHeight) reveal.classList.add('active');
        });
    }, 100);

    const navbar = document.querySelector('.glass-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }
});
