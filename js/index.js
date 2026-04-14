import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// 1. Lógica do Tema Claro/Escuro
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        window.dispatchEvent(new Event('themeChanged'));
    });
}

// 2. Animações de Scroll e Navbar
const navbar = document.querySelector('.glass-nav');
const reveals = document.querySelectorAll('.reveal');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        if (revealTop < windowHeight - 100) reveal.classList.add('active');
    });
});

// 3. Efeitos de Cursor Magnético e Tilt 3D
if (window.innerWidth > 900) {
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');

    document.addEventListener('mousemove', (e) => {
        if (cursor.style.opacity !== '1') cursor.style.opacity = '1';
        if (!document.body.classList.contains('hovering-link')) cursorBlur.style.opacity = '0.5';

        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        setTimeout(() => {
            cursorBlur.style.left = e.clientX + 'px';
            cursorBlur.style.top = e.clientY + 'px';
        }, 50);
    });

    document.querySelectorAll('.magnetic, a, button, input, select').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering-link'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-link'));
    });

    // Tilt 3D para Cartões
    document.querySelectorAll('.magnetic-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const centerX = rect.width / 2; const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// 4. Configuração Three.js (DNA Dupla Hélice)
const container = document.getElementById('canvas-container');
if (container) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.015);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-8, 0, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(20, 30, 20);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.5);
    fillLight.position.set(-20, -20, -20);
    scene.add(fillLight);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Grupo DNA
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    const numBasePairs = 250; const radius = 10; const heightObj = 650; const angleStep = Math.PI / 12;

    // Materiais Base
    const backboneMat1 = new THREE.MeshStandardMaterial({ color: 0x1f4ca8, roughness: 0.5, metalness: 0.2 });
    const backboneMat2 = new THREE.MeshStandardMaterial({ color: 0x5a3092, roughness: 0.5, metalness: 0.2 });
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x555555, transparent: true, opacity: 0.5 });

    const baseColors = [0xb83333, 0xc17215, 0x07814b, 0x0f6fa6, 0x5b369c, 0x1d91a1];
    const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const cylinderGeo = new THREE.CylinderGeometry(0.25, 0.25, radius * 2, 16);
    const smallSphereGeo = new THREE.SphereGeometry(1.1, 32, 32);

    for (let i = 0; i < numBasePairs; i++) {
        const y = (i / numBasePairs) * heightObj - heightObj / 2;
        const angle = i * angleStep;
        const x1 = Math.cos(angle) * radius; const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius; const z2 = Math.sin(angle + Math.PI) * radius;

        const backbone1 = new THREE.Mesh(sphereGeo, backboneMat1); backbone1.position.set(x1, y, z1);
        const backbone2 = new THREE.Mesh(sphereGeo, backboneMat2); backbone2.position.set(x2, y, z2);

        const bond = new THREE.Mesh(cylinderGeo, bondMat);
        bond.position.set(0, y, 0); bond.rotation.y = -angle; bond.rotation.z = Math.PI / 2;

        dnaGroup.add(backbone1); dnaGroup.add(backbone2); dnaGroup.add(bond);

        const colorIdx1 = (i * 3 + 1) % baseColors.length;
        const colorIdx2 = (i * 5 + 4) % baseColors.length;

        const baseA = new THREE.Mesh(smallSphereGeo, new THREE.MeshStandardMaterial({ color: baseColors[colorIdx1], roughness: 0.4 }));
        baseA.position.set(x1 * 0.45, y, z1 * 0.45);
        const baseB = new THREE.Mesh(smallSphereGeo, new THREE.MeshStandardMaterial({ color: baseColors[colorIdx2], roughness: 0.4 }));
        baseB.position.set(x2 * 0.45, y, z2 * 0.45);

        dnaGroup.add(baseA); dnaGroup.add(baseB);
    }

    // Partículas
    const posArray = new Float32Array(3000 * 3);
    for (let i = 0; i < 9000; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 150;
        posArray[i + 1] = (Math.random() - 0.5) * heightObj * 1.5;
        posArray[i + 2] = (Math.random() - 0.5) * 150;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.15, color: 0x00f0ff, transparent: true, opacity: 0.3 });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Alternância de Tema
    window.addEventListener('themeChanged', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        scene.fog.color.setHex(isLight ? 0xf1f5f9 : 0x02040a);
        ambientLight.intensity = isLight ? 1.5 : 0.8;
        particlesMat.color.setHex(isLight ? 0x0284c7 : 0x00f0ff);
    });

    // Lógica de Scroll e Animação
    const scrollContainer = document.querySelector('.scroll-container');
    let maxScroll = scrollContainer ? (scrollContainer.offsetHeight - window.innerHeight) : 2000;
    let targetScrollY = window.scrollY; let scrollY = window.scrollY;
    let mouseX = 0; let mouseY = 0;

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
        document.querySelectorAll('.section-content').forEach(section => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.8) section.classList.add('visible');
        });
    });

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    const startY = heightObj / 5; const endY = -heightObj / 5;

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        scrollY += (targetScrollY - scrollY) * 0.08;

        let scrollProgress = scrollY / Math.max(1, maxScroll);
        scrollProgress = Math.min(1, Math.max(0, scrollProgress));

        container.style.opacity = scrollProgress > 0.85 ? Math.max(0, 1 - (scrollProgress - 0.85) * (1 / 0.15)) : 1;

        dnaGroup.rotation.y = elapsedTime * 0.15;
        const currentY = startY - (scrollProgress * (startY - endY));

        camera.position.x += (mouseX * 5 + 20 - camera.position.x) * 0.1;
        camera.position.z += (mouseY * 5 + 20 - camera.position.z) * 0.1;
        camera.position.y = currentY;
        camera.lookAt(0, currentY - 20, 0);

        particlesMesh.rotation.y = elapsedTime * 0.02;
        particlesMesh.position.y = (elapsedTime * 6) % 150;

        composer.render();
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        if (scrollContainer) maxScroll = scrollContainer.offsetHeight - window.innerHeight;
    });
}
