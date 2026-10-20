/* ============================================================
   ОБЗР Presentation — navigation, reveal & ambient 3D
   ============================================================ */

(function () {
    'use strict';

    // ── Статический режим (?static): без анимаций и 3D ──────
    // Удобно для скриншотов, печати и сохранения в PDF.
    const staticMode = new URLSearchParams(window.location.search).has('static');

    if (staticMode) {
        const style = document.createElement('style');
        style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}';
        document.head.appendChild(style);
        document.documentElement.classList.add('booted');
    }

    // ── Данные слайдов ──────────────────────────────────────
    const sectionLabels = [
        '',
        'Введение',
        'Природные угрозы',
        'Техногенные угрозы',
        'Пожарная безопасность',
        'Эвакуация',
        'Защита органов дыхания',
        'Землетрясение',
        'Социальные угрозы',
        'Вода и быт',
        'Первая помощь',
        'Радиация',
        'Психологическая помощь',
        'Оренбургская область',
        'Итоги'
    ];

    const slides = Array.from(document.querySelectorAll('.slide'));
    const totalSlides = slides.length;
    let currentSlideIndex = 0;

    const currentSlideEl = document.getElementById('currentSlide');
    const totalSlidesEl = document.getElementById('totalSlides');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nav = document.querySelector('.nav');
    const counter = document.querySelector('.slide-counter');

    if (totalSlidesEl) totalSlidesEl.textContent = totalSlides;

    // ── Номера и подписи разделов ───────────────────────────
    slides.forEach((slide, i) => {
        slide.dataset.num = String(i + 1).padStart(2, '0');

        if (i > 0) {
            const content = slide.querySelector('.slide-content');
            if (content && sectionLabels[i]) {
                const kicker = document.createElement('div');
                kicker.className = 'slide-kicker';
                kicker.textContent = sectionLabels[i];
                content.insertBefore(kicker, content.firstChild);
            }
        }
    });

    // ── Точки навигации ─────────────────────────────────────
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'nav-dots';

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'nav-dot';
        dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
        dot.addEventListener('click', () => goToSlide(i));
        dotsWrap.appendChild(dot);
    });

    if (nav && counter) {
        nav.insertBefore(dotsWrap, counter);
    }

    const dots = Array.from(dotsWrap.children);

    // ── Переключение слайдов ────────────────────────────────
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;

        const currentSlide = slides[currentSlideIndex];
        const nextSlide = slides[index];

        currentSlide.classList.remove('active');
        currentSlide.classList.add('prev-active');

        nextSlide.classList.remove('prev-active');
        nextSlide.classList.add('active');

        currentSlideIndex = index;

        if (currentSlideEl) currentSlideEl.textContent = index + 1;
        if (progressFill) progressFill.style.width = ((index + 1) / totalSlides * 100) + '%';
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === totalSlides - 1;

        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

        if (history.replaceState) {
            history.replaceState(null, '', '#slide-' + (index + 1));
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));

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
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        }
    });

    // ── Swipe ───────────────────────────────────────────────
    let touchStartX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 60) {
            goToSlide(currentSlideIndex + (diff > 0 ? 1 : -1));
        }
    }, { passive: true });

    // ── Инициализация ───────────────────────────────────────
    if (progressFill) progressFill.style.width = (1 / totalSlides * 100) + '%';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = totalSlides === 1;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === 0));

    // Прямая ссылка на слайд: #slide-7
    const hashMatch = window.location.hash.match(/slide-(\d+)/);
    if (hashMatch) {
        const target = Math.min(totalSlides, Math.max(1, parseInt(hashMatch[1], 10)));
        if (target > 1) goToSlide(target - 1);
    }

    window.addEventListener('hashchange', () => {
        const match = window.location.hash.match(/slide-(\d+)/);
        if (!match) return;
        const target = Math.min(totalSlides, Math.max(1, parseInt(match[1], 10))) - 1;
        if (target !== currentSlideIndex) goToSlide(target);
    });

    // Запуск появления элементов после первой отрисовки
    if (!staticMode) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.add('booted');
            });
        });
    }

    // ── Ambient 3D: мягкое поле частиц ──────────────────────
    const container = document.getElementById('canvas-container');

    if (window.THREE && container && !staticMode) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.z = 7;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const count = 190;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const palette = [
            [0.98, 0.75, 0.14],
            [0.37, 0.64, 0.98],
            [0.97, 0.44, 0.44],
            [0.85, 0.88, 0.95]
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 18;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 9 - 2;

            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.045,
            vertexColors: true,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let pointerX = 0;
        let pointerY = 0;

        window.addEventListener('mousemove', (e) => {
            pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
            pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        function animate() {
            requestAnimationFrame(animate);

            particles.rotation.y += 0.00045;
            particles.rotation.x += 0.00012;

            camera.position.x += (pointerX * 0.45 - camera.position.x) * 0.02;
            camera.position.y += (-pointerY * 0.3 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

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
