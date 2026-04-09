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
    fillLight.color = new THREE.Color('#06b6d4');
    scene.add(fillLight);
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    
    // HEART KNOT GEOMETRY
    const x = (t) => 16 * Math.pow(Math.sin(t), 3);
    const y = (t) => 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    const points = [];
    for(let i=0; i<1200; i++) {
        const t = Math.PI * 2 * (i/1200);
        points.push(new THREE.Vector3(x(t)*0.55 + (Math.random()-0.5)*2, y(t)*0.55 + (Math.random()-0.5)*2, (Math.random()-0.5)*5));
    }
    for(let i=0; i<600; i++) {
        const t = Math.PI * 2 * (i/600);
        points.push(new THREE.Vector3(x(t)*0.35 + (Math.random()-0.5)*1.5, y(t)*0.35 + (Math.random()-0.5)*1.5, (Math.random()-0.5)*3));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.PointsMaterial({ size: 0.45, color: '#ffffff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    const heartMesh = new THREE.Points(geo, mat);
    mainGroup.add(heartMesh);
    
    const coreMat = new THREE.MeshStandardMaterial({color: '#06b6d4', emissive: '#164e63', transparent: true, opacity: 0.8});
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(4.5, 3), coreMat);
    mainGroup.add(coreMesh);
    mainGroup.position.x = 12;
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const beat = (time * 1.5) % Math.PI;
        let pulse = 1.0;
        if(beat < 0.5) pulse = 1.0 + Math.sin(beat*Math.PI*2)*0.18;
        else if(beat > 0.6 && beat < 1.1) pulse = 1.0 + Math.sin((beat-0.6)*Math.PI*2)*0.12;
        
        mainGroup.scale.set(pulse, pulse, pulse);
        mainGroup.rotation.y = Math.sin(time*0.5) * 0.2;
        heartMesh.rotation.y = time * 0.1;
        renderer.render(scene, camera);
    }
    animate();
}
