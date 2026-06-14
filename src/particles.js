import * as THREE from 'three';

export function initParticles() {
  const canvas = document.getElementById('webgl-background');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#060608', 0.0015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Instanced Particle Mesh ──────────────────────────────────────────
  const PARTICLE_COUNT = 1400;
  const material = new THREE.MeshBasicMaterial({
    color: '#c8956c',
    transparent: true,
    opacity: 0.55
  });

  const geometry = new THREE.CircleGeometry(0.5, 6);
  const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);

  const dummy = new THREE.Object3D();
  const particleData = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 280;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    dummy.position.set(x, y, z);
    dummy.scale.setScalar(Math.random() * 1.5 + 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    particleData.push({
      originalPos: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08
      ),
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5,
    });
  }

  scene.add(mesh);

  // ── Animated Gradient Orbs (3 large soft lights) ─────────────────────
  const orbCount = 3;
  const orbs = [];
  const orbColors = [
    new THREE.Color('#c8956c'),  // warm copper
    new THREE.Color('#a07850'),  // deep amber
    new THREE.Color('#7fb069'),  // muted sage
  ];

  for (let i = 0; i < orbCount; i++) {
    const orbGeo = new THREE.SphereGeometry(18 + i * 6, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({
      color: orbColors[i],
      transparent: true,
      opacity: 0.06,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 150,
      -60 - i * 20
    );
    scene.add(orb);
    orbs.push({
      mesh: orb,
      basePos: orb.position.clone(),
      speed: 0.3 + Math.random() * 0.4,
      radius: 30 + Math.random() * 40,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // ── Wave Mesh ────────────────────────────────────────────────────────
  const waveGeo = new THREE.PlaneGeometry(400, 400, 48, 48);
  const waveMat = new THREE.MeshBasicMaterial({
    color: '#0a0a0f',
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  const waveMesh = new THREE.Mesh(waveGeo, waveMat);
  waveMesh.position.z = -50;
  waveMesh.rotation.x = -Math.PI / 3;
  scene.add(waveMesh);

  // ── Second wave layer (offset, slower) ───────────────────────────────
  const wave2Geo = new THREE.PlaneGeometry(350, 350, 32, 32);
  const wave2Mat = new THREE.MeshBasicMaterial({
    color: '#c8956c',
    wireframe: true,
    transparent: true,
    opacity: 0.03
  });
  const wave2Mesh = new THREE.Mesh(wave2Geo, wave2Mat);
  wave2Mesh.position.z = -80;
  wave2Mesh.rotation.x = -Math.PI / 4;
  wave2Mesh.rotation.z = Math.PI / 6;
  scene.add(wave2Mesh);

  // ── Resize ───────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Mouse interaction ────────────────────────────────────────────────
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // ── Wave 1 animation ─────────────────────────────────────────────
    const positions = waveMesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i,
        Math.sin(x * 0.05 + time * 0.8) * 5 +
        Math.cos(y * 0.05 + time * 0.6) * 4 +
        Math.sin((x + y) * 0.03 + time * 0.4) * 3
      );
    }
    waveMesh.geometry.attributes.position.needsUpdate = true;
    waveMesh.rotation.z = time * 0.015;

    // ── Wave 2 animation (slower, offset) ────────────────────────────
    const pos2 = wave2Mesh.geometry.attributes.position;
    for (let i = 0; i < pos2.count; i++) {
      const x = pos2.getX(i);
      const y = pos2.getY(i);
      pos2.setZ(i,
        Math.sin(x * 0.04 + time * 0.5) * 4 +
        Math.cos(y * 0.04 + time * 0.4) * 5
      );
    }
    wave2Mesh.geometry.attributes.position.needsUpdate = true;
    wave2Mesh.rotation.z = -time * 0.01;

    // ── Dynamic theme color sync ─────────────────────────────────────
    const rootStyle = getComputedStyle(document.documentElement);
    const signalColor = rootStyle.getPropertyValue('--signal-start').trim() || '#c8956c';
    const bgColor = rootStyle.getPropertyValue('--bg-void').trim() || '#060608';

    material.color.set(signalColor);
    scene.fog.color.set(bgColor);

    // ── Orb floating animation ───────────────────────────────────────
    orbs.forEach((orb, i) => {
      const t = time * orb.speed;
      orb.mesh.position.x = orb.basePos.x + Math.sin(t + orb.phase) * orb.radius;
      orb.mesh.position.y = orb.basePos.y + Math.cos(t * 0.7 + orb.phase) * orb.radius * 0.6;
      orb.mesh.position.z = orb.basePos.z + Math.sin(t * 0.5) * 15;
      orb.mesh.material.color.set(signalColor);
      orb.mesh.material.opacity = 0.04 + Math.sin(t * 0.8) * 0.02;
    });

    // ── Particle Swarm ───────────────────────────────────────────────
    raycaster.setFromCamera(mouse, camera);
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(intersectPlane, intersectPoint);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const data = particleData[i];

      mesh.getMatrixAt(i, dummy.matrix);
      dummy.position.setFromMatrixPosition(dummy.matrix);

      const distanceToMouse = dummy.position.distanceTo(intersectPoint);

      // Pulse effect
      const pulse = 1 + Math.sin(time * data.pulseSpeed + data.phase) * 0.15;

      if (distanceToMouse < 50) {
        // Stronger attraction with smooth lerp
        dummy.position.lerp(intersectPoint, 0.025);
        dummy.scale.setScalar((Math.random() * 1.5 + 1) * pulse * 1.3);
      } else {
        dummy.position.add(data.velocity);
        dummy.scale.setScalar((Math.random() * 1.5 + 1) * pulse);

        if (dummy.position.length() > 300) {
          dummy.position.copy(data.originalPos);
        }
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}
