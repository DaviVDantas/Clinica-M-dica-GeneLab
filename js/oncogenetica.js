import * as THREE from 'three';

// ==========================================
// 1. THREE.JS BACKGROUND: CÉLULA ONCOLÓGICA E SCANNER DE PRECISÃO
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(20, 30, 20);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xa45cff, 0.8);
    fillLight.position.set(-20, -20, -20);
    scene.add(fillLight);

    // Grupo célula oncológica
    const oncologyGroup = new THREE.Group();
    scene.add(oncologyGroup);

    const coreGeo = new THREE.IcosahedronGeometry(6, 8);

    const posAttr = coreGeo.attributes.position;
    const origPositions = [];
    for (let i = 0; i < posAttr.count; i++) {
        origPositions.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
    }

    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x2a004d,
        emissive: 0xa45cff,
        emissiveIntensity: 0.3,
        roughness: 0.7,
        metalness: 0.2
    });

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    oncologyGroup.add(coreMesh);

    const nodeGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
    const nodes = [];

    for (let i = 0; i < 15; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 6.2;

        node.position.x = r * Math.sin(phi) * Math.cos(theta);
        node.position.y = r * Math.sin(phi) * Math.sin(theta);
        node.position.z = r * Math.cos(phi);

        nodes.push({ mesh: node, origPos: node.position.clone() });
        oncologyGroup.add(node);
    }

    // Anéis de Scanner
    const scanGroup = new THREE.Group();
    oncologyGroup.add(scanGroup);

    const ringGeo = new THREE.TorusGeometry(10, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scanGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 2;
    scanGroup.add(ring2);

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

    // Theme Toggle Listener
    window.addEventListener('themeChanged', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        scene.fog.color.setHex(isLight ? 0xf8fafc : 0x010308);
        scene.fog.density = isLight ? 0.015 : 0.025;
        ambientLight.intensity = isLight ? 1.5 : 0.6;
        mainLight.intensity = isLight ? 1.5 : 1.2;
        coreMat.emissive.setHex(isLight ? 0xddd6fe : 0xa45cff);
        coreMat.color.setHex(isLight ? 0x7c3aed : 0x2a004d);
        particlesMat.color.setHex(isLight ? 0x7c3aed : 0xa45cff);
        particlesMat.opacity = isLight ? 0.6 : 0.4;
    });

    let targetScrollY = window.scrollY;
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => { targetScrollY = window.scrollY; });

    let mouseX = 0; let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        scrollY += (targetScrollY - scrollY) * 0.08;

        // Deformação Orgânica
        for (let i = 0; i < posAttr.count; i++) {
            const orig = origPositions[i];
            const noise = Math.sin(orig.x * 1.5 + time * 2) * Math.cos(orig.y * 1.5 + time * 2) * 0.4;
            const scale = 1 + noise / 6;
            posAttr.setXYZ(i, orig.x * scale, orig.y * scale, orig.z * scale);
        }
        posAttr.needsUpdate = true;
        coreGeo.computeVertexNormals();

        nodes.forEach((node, index) => {
            const pulse = 1 + Math.sin(time * 3 + index) * 0.2;
            node.mesh.scale.set(pulse, pulse, pulse);
            const surfaceScale = 1 + (Math.sin(node.origPos.x * 1.5 + time * 2) * Math.cos(node.origPos.y * 1.5 + time * 2) * 0.4) / 6;
            node.mesh.position.copy(node.origPos).multiplyScalar(surfaceScale);
        });

        scanGroup.rotation.x = time * 0.5;
        scanGroup.rotation.y = time * 0.3;

        const scanScale = 1 + Math.sin(time * 2) * 0.1;
        scanGroup.scale.set(scanScale, scanScale, scanScale);

        oncologyGroup.rotation.y = time * 0.08;
        oncologyGroup.rotation.z = Math.sin(time * 0.2) * 0.05;
        oncologyGroup.position.y = -scrollY * 0.03;

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
// 2. UI: THEME TOGGLE, TILT 3D, CURSOR, CONTADORES E REVEALS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // A) Theme Toggle
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

    // B) Cursor Magnético
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

    // C) Scroll Reveals
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });

    reveals.forEach(reveal => revealObserver.observe(reveal));
    setTimeout(() => {
        reveals.forEach(reveal => {
            if (reveal.getBoundingClientRect().top < window.innerHeight) reveal.classList.add('active');
        });
    }, 100);

    // Navbar Scroll
    const navbar = document.querySelector('.glass-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    // D) Tilt 3D para Cards
    if (window.innerWidth > 1024) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // E) Contadores Animados
    const counters = document.querySelectorAll('.value-count');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseFloat(target.getAttribute('data-target'));
                const duration = 2000;
                const startTime = performance.now();
                const isFloat = target.getAttribute('data-target').includes('.');

                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 4);
                    const currentVal = endVal * ease;

                    target.innerText = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.innerText = endVal;
                    }
                };
                requestAnimationFrame(updateCounter);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
});
