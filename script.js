/* ============================================
   ОБЗР Presentation — Navigation & 3D
   ============================================ */

(function () {
    'use strict';

    // ── Slide Navigation ──────────────────────
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlideIndex = 0;

    const currentSlideEl = document.getElementById('currentSlide');
    const totalSlidesEl = document.getElementById('totalSlides');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    totalSlidesEl.textContent = totalSlides;

    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;

        const currentSlide = slides[currentSlideIndex];
        const nextSlide = slides[index];

        // Animate out current
        currentSlide.classList.remove('active');
        currentSlide.classList.add('prev-active');

        // Animate in next
        nextSlide.classList.remove('prev-active');
        nextSlide.classList.add('active');

        // Trigger animations for elements inside
        const animatedElements = nextSlide.querySelectorAll('.info-card, .tech-card, .scenario-item, .fire-rule, .terror-rule, .safety-card, .orenburg-fact, .conclusion-item, .author-block, .highlight-box, .stats-panel, .water-stat, .firstaid-block, .warning-panel, .map-placeholder, .emergency-numbers, .fire-stat, .aid-step, .aid-skill, .number-item, .stat-item, .tech-icon, .card-icon, .scenario-icon, .terror-icon, .conclusion-icon, .rule-number, .title-block');
        animatedElements.forEach((el, i) => {
            el.style.animation = 'none';
            el.offsetHeight; // force reflow
            el.style.animation = '';
        });

        currentSlideIndex = index;

        // Update UI
        currentSlideEl.textContent = index + 1;
        progressFill.style.width = ((index + 1) / totalSlides * 100) + '%';
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalSlides - 1;
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
            e.preventDefault();
            goToSlide(currentSlideIndex + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            goToSlide(currentSlideIndex - 1);
        } else if (e.key === 'Home') {
            goToSlide(0);
        } else if (e.key === 'End') {
            goToSlide(totalSlides - 1);
        } else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 60) {
            if (diff > 0) {
                goToSlide(currentSlideIndex + 1);
            } else {
                goToSlide(currentSlideIndex - 1);
            }
        }
    }

    // Initialize
    progressFill.style.width = (1 / totalSlides * 100) + '%';
    prevBtn.disabled = true;

    // ── Three.js 3D Background ─────────────────
    const container = document.getElementById('canvas-container');

    if (typeof THREE !== 'undefined' && container) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // ── Floating Particles ──
        const particleCount = 120;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.62; colors[i * 3 + 2] = 0.04;
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0.94; colors[i * 3 + 1] = 0.27; colors[i * 3 + 2] = 0.27;
            } else {
                colors[i * 3] = 0.23; colors[i * 3 + 1] = 0.51; colors[i * 3 + 2] = 0.96;
            }
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // ── Shield (icosahedron wireframe) ──
        const shieldGeometry = new THREE.IcosahedronGeometry(1.2, 1);
        const shieldMaterial = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.set(-3.5, 1, -2);
        scene.add(shield);

        // ── Inner shield glow ──
        const glowGeometry = new THREE.IcosahedronGeometry(0.8, 1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.06,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        shield.add(glow);

        // ── Alert ring ──
        const ringGeometry = new THREE.RingGeometry(1.5, 1.55, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(3.5, -0.5, -1.5);
        scene.add(ring);

        // ── Floating tetrahedrons ──
        const tetraGeometry = new THREE.TetrahedronGeometry(0.3, 0);
        const tetraMat1 = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
        });
        const tetraMat2 = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
        });

        const tetras = [];
        for (let i = 0; i < 6; i++) {
            const tetra = new THREE.Mesh(tetraGeometry, i % 2 === 0 ? tetraMat1 : tetraMat2);
            tetra.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4 - 1
            );
            tetra.userData = {
                rotSpeed: { x: 0.002 + Math.random() * 0.004, y: 0.002 + Math.random() * 0.004 },
                floatSpeed: 0.001 + Math.random() * 0.002,
                floatOffset: Math.random() * Math.PI * 2,
            };
            tetras.push(tetra);
            scene.add(tetra);
        }

        // ── Animation loop ──
        let time = 0;

        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;

            particles.rotation.y += 0.0004;
            particles.rotation.x += 0.0001;

            shield.rotation.x += 0.003;
            shield.rotation.y += 0.005;

            glow.rotation.x -= 0.005;
            glow.rotation.y -= 0.003;

            ring.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.3;
            ring.rotation.z += 0.002;

            tetras.forEach((tetra) => {
                tetra.rotation.x += tetra.userData.rotSpeed.x;
                tetra.rotation.y += tetra.userData.rotSpeed.y;
                tetra.position.y += Math.sin(time * 2 + tetra.userData.floatOffset) * 0.003;
            });

            renderer.render(scene, camera);
        }

        animate();

        // ── Resize handler ──
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ── Slide 1: Title 3D (rotating globe) ──
    const title3d = document.getElementById('title3d');
    if (typeof THREE !== 'undefined' && title3d) {
        const tScene = new THREE.Scene();
        const tCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        tCamera.position.z = 3;

        const tRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        tRenderer.setSize(400, 400);
        tRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        title3d.appendChild(tRenderer.domElement);

        // Globe sphere
        const globeGeo = new THREE.SphereGeometry(1, 32, 32);
        const globeMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        });
        const globe = new THREE.Mesh(globeGeo, globeMat);
        tScene.add(globe);

        // Inner sphere
        const innerGeo = new THREE.SphereGeometry(0.7, 24, 24);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
        });
        const innerSphere = new THREE.Mesh(innerGeo, innerMat);
        globe.add(innerSphere);

        function animateTitle() {
            requestAnimationFrame(animateTitle);
            globe.rotation.y += 0.005;
            globe.rotation.x += 0.002;
            innerSphere.rotation.y -= 0.008;
            tRenderer.render(tScene, tCamera);
        }
        animateTitle();
    }

    // ── Slide 5: Fire 3D ──
    const fire3d = document.getElementById('fire3d');
    if (typeof THREE !== 'undefined' && fire3d) {
        const fScene = new THREE.Scene();
        const fCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        fCamera.position.z = 4;

        const fRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        fRenderer.setSize(500, 280);
        fRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        fire3d.appendChild(fRenderer.domElement);

        // Flame particles
        const flameCount = 80;
        const flameGeo = new THREE.BufferGeometry();
        const flamePos = new Float32Array(flameCount * 3);
        const flameSizes = new Float32Array(flameCount);

        for (let i = 0; i < flameCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.8;
            flamePos[i * 3] = Math.cos(angle) * radius;
            flamePos[i * 3 + 1] = Math.random() * 2 - 1;
            flamePos[i * 3 + 2] = Math.sin(angle) * radius;
            flameSizes[i] = Math.random() * 0.15 + 0.05;
        }

        flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePos, 3));

        const flameMat = new THREE.PointsMaterial({
            color: 0xef4444,
            size: 0.12,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        const flame = new THREE.Points(flameGeo, flameMat);
        fScene.add(flame);

        // Ember particles
        const emberCount = 30;
        const emberGeo = new THREE.BufferGeometry();
        const emberPos = new Float32Array(emberCount * 3);

        for (let i = 0; i < emberCount; i++) {
            emberPos[i * 3] = (Math.random() - 0.5) * 2;
            emberPos[i * 3 + 1] = Math.random() * 3;
            emberPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }

        emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));

        const emberMat = new THREE.PointsMaterial({
            color: 0xf59e0b,
            size: 0.06,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        const embers = new THREE.Points(emberGeo, emberMat);
        fScene.add(embers);

        let fTime = 0;

        function animateFire() {
            requestAnimationFrame(animateFire);
            fTime += 0.02;

            // Animate flame particles upward
            const positions = flame.geometry.attributes.position.array;
            for (let i = 0; i < flameCount; i++) {
                positions[i * 3 + 1] += 0.02 + Math.random() * 0.02;
                if (positions[i * 3 + 1] > 1.5) {
                    positions[i * 3 + 1] = -1;
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * 0.8;
                    positions[i * 3] = Math.cos(angle) * radius;
                    positions[i * 3 + 2] = Math.sin(angle) * radius;
                }
            }
            flame.geometry.attributes.position.needsUpdate = true;

            // Animate embers
            const ePositions = embers.geometry.attributes.position.array;
            for (let i = 0; i < emberCount; i++) {
                ePositions[i * 3 + 1] += 0.015;
                ePositions[i * 3] += Math.sin(fTime + i) * 0.005;
                if (ePositions[i * 3 + 1] > 3) {
                    ePositions[i * 3 + 1] = 0;
                    ePositions[i * 3] = (Math.random() - 0.5) * 2;
                    ePositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
                }
            }
            embers.geometry.attributes.position.needsUpdate = true;

            fRenderer.render(fScene, fCamera);
        }
        animateFire();
    }

    // ── Slide 9: Map 3D ──
    const map3d = document.getElementById('map3d');
    if (typeof THREE !== 'undefined' && map3d) {
        const mScene = new THREE.Scene();
        const mCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        mCamera.position.z = 5;

        const mRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        mRenderer.setSize(500, 200);
        mRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        map3d.appendChild(mRenderer.domElement);

        // Stylized map grid
        const gridHelper = new THREE.GridHelper(8, 16, 0xf59e0b, 0x333333);
        gridHelper.rotation.x = Math.PI / 2;
        gridHelper.position.z = -1;
        mScene.add(gridHelper);

        // Location markers
        const markerGeo = new THREE.ConeGeometry(0.15, 0.4, 8);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const markers = [];

        const markerPositions = [
            [0, 0, 0],
            [1.5, 0.8, 0],
            [-1.2, -0.5, 0],
            [0.8, -1, 0],
            [-0.5, 1.2, 0],
        ];

        markerPositions.forEach((pos, i) => {
            const marker = new THREE.Mesh(markerGeo, markerMat.clone());
            marker.position.set(pos[0], pos[1], pos[2]);
            marker.rotation.x = Math.PI;
            marker.userData = { baseY: pos[1], phase: i * 0.5 };
            markers.push(marker);
            mScene.add(marker);
        });

        let mTime = 0;

        function animateMap() {
            requestAnimationFrame(animateMap);
            mTime += 0.02;

            markers.forEach((marker) => {
                marker.position.y = marker.userData.baseY + Math.sin(mTime + marker.userData.phase) * 0.15;
            });

            gridHelper.rotation.z += 0.001;

            mRenderer.render(mScene, mCamera);
        }
        animateMap();
    }

})();
