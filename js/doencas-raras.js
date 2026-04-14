import * as THREE from 'three';

// ==========================================
// 1. THREE.JS: ADN com Nódulo Mutado + Scanner
// ==========================================
const container = document.getElementById('canvas-container');
if (container) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010308, 0.025);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(20, 30, 20);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xa45cff, 0.8);
    fillLight.position.set(-20, -20, -20);
    scene.add(fillLight);

    const oncologyGroup = new THREE.Group();
    scene.add(oncologyGroup);

    const numBasePairs = 24;
    const radius = 5;
    const heightObj = 60;
    const angleStep = Math.PI / 6;

    const backboneMat = new THREE.MeshStandardMaterial({ color: 0x005588, roughness: 0.8, metalness: 0.2 });
    const baseMatNormal = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.5, metalness: 0.2 });
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.7 });
    const mutatedMat = new THREE.MeshStandardMaterial({
        color: 0xa45cff,
        emissive: 0x5a189a,
        emissiveIntensity: 0.8,
        roughness: 0.3
    });

    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const cylinderGeo = new THREE.CylinderGeometry(0.2, 0.2, radius * 2, 16);
    const smallSphereGeo = new THREE.SphereGeometry(0.6, 32, 32);

    let mutatedNodeRef = null;

    for (let i = 0; i < numBasePairs; i++) {
        const y = (i / numBasePairs) * heightObj - heightObj / 2;
        const angle = i * angleStep;

        const x1 = Math.cos(angle) * radius; const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius; const z2 = Math.sin(angle + Math.PI) * radius;

        const backbone1 = new THREE.Mesh(sphereGeo, backboneMat); backbone1.position.set(x1, y, z1);
        const backbone2 = new THREE.Mesh(sphereGeo, backboneMat); backbone2.position.set(x2, y, z2);

        const bond = new THREE.Mesh(cylinderGeo, bondMat);
        bond.position.set(0, y, 0); bond.rotation.y = -angle; bond.rotation.z = Math.PI / 2;

        oncologyGroup.add(backbone1); oncologyGroup.add(backbone2); oncologyGroup.add(bond);

        const isMutated = (i === Math.floor(numBasePairs / 2));
        const activeMat = isMutated ? mutatedMat : baseMatNormal;

        const baseA = new THREE.Mesh(smallSphereGeo, activeMat); baseA.position.set(x1 * 0.45, y, z1 * 0.45);
        const baseB = new THREE.Mesh(smallSphereGeo, activeMat); baseB.position.set(x2 * 0.45, y, z2 * 0.45);

        if (isMutated) {
            mutatedNodeRef = baseA;
            const targetGeo = new THREE.BoxGeometry(2, 2, 2);
            const targetWireMat = new THREE.MeshBasicMaterial({ color: 0xa45cff, wireframe: true, transparent: true, opacity: 0.6 });
            baseA.add(new THREE.Mesh(targetGeo, targetWireMat));
            baseB.add(new THREE.Mesh(targetGeo, targetWireMat));
        }

        oncologyGroup.add(baseA); oncologyGroup.add(baseB);
    }

    // Scanner Laser
    const scanGroup = new THREE.Group();
    oncologyGroup.add(scanGroup);
    const ringGeo = new THREE.TorusGeometry(8, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 2;
    scanGroup.add(scanRing);

    oncologyGroup.position.x = 12;

    // Partículas
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 150;
        posArray[i + 1] = (Math.random() - 0.5) * 150;
        posArray[i + 2] = (Math.random() - 0.5) * 150;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.15, color: 0xa45cff, transparent: true, opacity: 0.4 });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    window.addEventListener('themeChanged', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        scene.fog.color.setHex(isLight ? 0xf8fafc : 0x010308);
        scene.fog.density = isLight ? 0.015 : 0.025;
        ambientLight.intensity = isLight ? 1.5 : 0.5;
        mainLight.intensity = isLight ? 1.5 : 1.2;
        mutatedMat.emissive.setHex(isLight ? 0xddd6fe : 0x5a189a);
        mutatedMat.color.setHex(isLight ? 0x7c3aed : 0xa45cff);
        particlesMat.color.setHex(isLight ? 0x7c3aed : 0xa45cff);
        particlesMat.opacity = isLight ? 0.6 : 0.4;
    });

    let targetScrollY = window.scrollY, scrollY = window.scrollY;
    window.addEventListener('scroll', () => { targetScrollY = window.scrollY; });

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        scrollY += (targetScrollY - scrollY) * 0.08;

        oncologyGroup.rotation.y = time * 0.2;
        const scanRange = 25;
        scanGroup.position.y = Math.sin(time * 0.8) * scanRange;

        if (mutatedNodeRef) {
            const distToScanner = Math.abs(scanGroup.position.y);
            if (distToScanner < 3) {
                mutatedMat.emissiveIntensity = 2.0;
                ringMat.color.setHex(0xa45cff);
            } else {
                mutatedMat.emissiveIntensity = 0.8;
                ringMat.color.setHex(0x00f0ff);
            }
            mutatedNodeRef.children.forEach(box => {
                box.rotation.x = time;
                box.rotation.y = time;
            });
        }

        oncologyGroup.position.y = -scrollY * 0.04;
        camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 4 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        particlesMesh.rotation.y = time * 0.02;
        particlesMesh.position.y = (time * 4) % 150;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ==========================================
// 2. UI: THEME TOGGLE, CURSOR, REVEALS, NAVBAR, TILT
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            window.dispatchEvent(new Event('themeChanged'));
        });
    }

    // Cursor
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');
    if (window.innerWidth > 900 && cursor && cursorBlur) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            setTimeout(() => { cursorBlur.style.left = e.clientX + 'px'; cursorBlur.style.top = e.clientY + 'px'; }, 50);
        });
        document.querySelectorAll('.magnetic, a, button, label').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering-link');
                if (el.classList.contains('specialty-hover')) document.body.classList.add('hovering-specialty');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering-link');
                document.body.classList.remove('hovering-specialty');
            });
        });
    }

    // Reveals
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }
        });
    }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });
    reveals.forEach(reveal => revealObserver.observe(reveal));
    setTimeout(() => {
        reveals.forEach(reveal => {
            if (reveal.getBoundingClientRect().top < window.innerHeight) reveal.classList.add('active');
        });
    }, 100);

    // Navbar
    const navbar = document.querySelector('.glass-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    // Tilt 3D para Cards
    if (window.innerWidth > 1024) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6;
                const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }
});
