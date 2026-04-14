import * as THREE from 'three';

export function initParticles() {
  const canvas = document.getElementById('webgl-background');
  if (!canvas) return;

  const scene = new THREE.Scene();
  // Using a slight fog matching the Void phase
  scene.fog = new THREE.FogExp2('#060608', 0.002);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Instanced Mesh for Particles
  const PARTICLE_COUNT = 1200;
  
  // Custom simple shader for particles (faster than MeshBasicMaterial with opacity)
  const material = new THREE.MeshBasicMaterial({ 
    color: '#667eea', 
    transparent: true, 
    opacity: 0.6 
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
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      phase: Math.random() * Math.PI * 2
    });
  }
  
  scene.add(mesh);

  // Mesh background simple wave
  const waveGeo = new THREE.PlaneGeometry(400, 400, 32, 32);
  const waveMat = new THREE.MeshBasicMaterial({ 
    color: '#0a0a0f', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.1 
  });
  const waveMesh = new THREE.Mesh(waveGeo, waveMat);
  waveMesh.position.z = -50;
  waveMesh.rotation.x = -Math.PI / 3;
  scene.add(waveMesh);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Mouse interaction
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
    
    // Wave animation
    const positions = waveMesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        positions.setZ(i, Math.sin(x * 0.05 + time) * 5 + Math.cos(y * 0.05 + time) * 5);
    }
    waveMesh.geometry.attributes.position.needsUpdate = true;
    waveMesh.rotation.z = time * 0.02;

    // Apply color from theming system to mesh and particles dynamically
    const rootStyle = getComputedStyle(document.documentElement);
    const signalColor = rootStyle.getPropertyValue('--signal-start').trim() || '#667eea';
    const bgColor = rootStyle.getPropertyValue('--bg-void').trim() || '#060608';
    
    material.color.set(signalColor);
    scene.fog.color.set(bgColor);

    // Particle Swarm Logic
    raycaster.setFromCamera(mouse, camera);
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(intersectPlane, intersectPoint);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const data = particleData[i];
      
      mesh.getMatrixAt(i, dummy.matrix);
      dummy.position.setFromMatrixPosition(dummy.matrix);

      // Disturbance from mouse
      const distanceToMouse = dummy.position.distanceTo(intersectPoint);
      if (distanceToMouse < 40) {
        dummy.position.lerp(intersectPoint, 0.02); // Attraction
      } else {
        // Return to drift
        dummy.position.add(data.velocity);
        
        // Boundaries reset approximation
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
