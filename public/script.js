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

        currentSlide.classList.remove('active');
        currentSlide.classList.add('prev-active');

        nextSlide.classList.remove('prev-active');
        nextSlide.classList.add('active');

        // Trigger animations for elements inside
        const animatedElements = nextSlide.querySelectorAll('.info-card, .tech-card, .scenario-item, .fire-rule, .terror-rule, .safety-card, .orenburg-fact, .conclusion-item, .author-block, .highlight-box, .stats-panel, .water-stat, .firstaid-block, .warning-panel, .map-placeholder, .emergency-numbers, .fire-stat, .aid-step, .aid-skill, .number-item, .stat-item, .title-visual, .magnitude-item');
        animatedElements.forEach((el) => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = '';
        });

        currentSlideIndex = index;

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

        // Floating particles
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

        // Wireframe shield
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

        const glowGeometry = new THREE.IcosahedronGeometry(0.8, 1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.06,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        shield.add(glow);

        // Alert ring
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

        // Floating tetrahedrons
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

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

})();
