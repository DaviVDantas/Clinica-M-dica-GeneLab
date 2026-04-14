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
    fillLight.color = new THREE.Color('#f59e0b');
    scene.add(fillLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 28;
        posArray[i + 1] = (Math.random() - 0.5) * 28;
        posArray[i + 2] = (Math.random() - 0.5) * 28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const mat = new THREE.PointsMaterial({ size: 0.5, color: '#ffffff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    const pointsMesh = new THREE.Points(geo, mat);
    mainGroup.add(pointsMesh);

    const coreMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#78350f', emissiveIntensity: 0.5, transparent: true, opacity: 0.7 });
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 3), coreMat);
    mainGroup.add(coreMesh);
    mainGroup.position.x = 12;

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        pointsMesh.rotation.y = time * 0.08;
        pointsMesh.rotation.x = Math.sin(time * 0.1) * 0.15;
        coreMesh.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
        const positions = pointsMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time * 2 + positions[i]) * 0.015;
        }
        pointsMesh.geometry.attributes.position.needsUpdate = true;
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
