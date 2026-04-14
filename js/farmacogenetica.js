import * as THREE from 'three';

const container = document.getElementById('canvas-container');
if (container) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010308, 0.025);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 45);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(20, 30, 20);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-20, -20, -20);
    fillLight.color = new THREE.Color('#10b981');
    scene.add(fillLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const moleculeGroup = new THREE.Group();
    const nodeGeo = new THREE.IcosahedronGeometry(0.8, 2);
    const matNode = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: '#10b981', emissiveIntensity: 0.8, roughness: 0.2 });

    for (let j = 0; j < 3; j++) {
        const hex = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const mesh = new THREE.Mesh(nodeGeo, matNode);
            mesh.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6);
            hex.add(mesh);
        }
        hex.position.y = (j - 1) * 6;
        hex.rotation.y = j * 0.5;
        moleculeGroup.add(hex);
    }
    mainGroup.add(moleculeGroup);
    mainGroup.position.x = 12;

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        moleculeGroup.rotation.x = Math.sin(time * 0.2) * 0.3;
        moleculeGroup.rotation.y = time * 0.3;
        moleculeGroup.children.forEach((hex, i) => {
            hex.rotation.y = time * 0.4 * (i % 2 == 0 ? 1 : -1);
            hex.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.08);
        });
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');
    if (window.innerWidth > 900 && cursor && cursorBlur) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            setTimeout(() => { cursorBlur.style.left = e.clientX + 'px'; cursorBlur.style.top = e.clientY + 'px'; }, 50);
        });
        document.querySelectorAll('.magnetic, a, button').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering-link'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-link'));
        });
    }

    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); obs.unobserve(entry.target); }
        });
    }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));
    setTimeout(() => reveals.forEach(r => { if (r.getBoundingClientRect().top < window.innerHeight) r.classList.add('active'); }), 100);

    const navbar = document.querySelector('.glass-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }
});
