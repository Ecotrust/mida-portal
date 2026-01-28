(function (window, document) {
    'use strict';

    // Slide content is rendered server-side via Django/Wagtail.
    // This script only handles slider behavior (translate + pagination).

    function initHomepageSlider() {
        const slider = document.getElementById('slider');
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('news-prevBtn');
        const nextBtn = document.getElementById('news-nextBtn');
        const prevBtnMobile = document.getElementById('news-prevBtnMobile');
        const nextBtnMobile = document.getElementById('news-nextBtnMobile');

        if (!slider || !pagination) return;

        if (slider.dataset.homepageSliderInitialized === 'true') return;
        slider.dataset.homepageSliderInitialized = 'true';

        // State
        let currentSlide = 0;
        let slidesToShow = 3.5;
        let touchStart = 0;
        let touchEnd = 0;
        let isDragging = false;

        function getSlides() {
            return slider.querySelectorAll('.slide');
        }

        function getMaxSlide() {
            const slideCount = getSlides().length;
            return Math.max(0, Math.floor(slideCount - slidesToShow));
        }

        function goToSlide(index) {
            const maxSlide = getMaxSlide();
            currentSlide = Math.max(0, Math.min(maxSlide, index));
            updateSlider();
        }

        function syncPagination() {
            const maxSlide = getMaxSlide();
            pagination.innerHTML = '';

            for (let index = 0; index <= maxSlide; index += 1) {
                const dot = document.createElement('button');
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => goToSlide(index));
                pagination.appendChild(dot);
            }
        }

        function updateSlider() {
            const slides = getSlides();
            const maxSlide = getMaxSlide();

            const translateX = -(currentSlide * (100 / slidesToShow));
            slider.style.transform = `translateX(${translateX}%)`;

            slides.forEach((slide, index) => {
                slide.style.width = `${100 / slidesToShow}%`;

                const isPartiallyVisible = index === Math.floor(currentSlide + slidesToShow);
                if (isPartiallyVisible) {
                    slide.classList.add('partial');
                } else {
                    slide.classList.remove('partial');
                }
            });

            if (prevBtn) prevBtn.disabled = currentSlide === 0;
            if (nextBtn) nextBtn.disabled = currentSlide >= maxSlide;
            if (prevBtnMobile) prevBtnMobile.disabled = currentSlide === 0;
            if (nextBtnMobile) nextBtnMobile.disabled = currentSlide >= maxSlide;

            const dots = pagination.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function updateSlidesToShow() {
            if (window.innerWidth >= 1200) {
                slidesToShow = 3.5;
            } else if (window.innerWidth >= 768) {
                slidesToShow = 1.5;
            } else {
                slidesToShow = 1;
            }

            const maxSlide = getMaxSlide();
            if (currentSlide > maxSlide) {
                currentSlide = maxSlide;
            }

            syncPagination();
            updateSlider();
        }

        function goToPrevious() {
            currentSlide = Math.max(0, currentSlide - 1);
            updateSlider();
        }

        function goToNext() {
            const maxSlide = getMaxSlide();
            currentSlide = Math.min(maxSlide, currentSlide + 1);
            updateSlider();
        }

        function handleTouchStart(e) {
            touchStart = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            touchEnd = touchStart;
            isDragging = true;
            if (e.type === 'mousedown') {
                slider.classList.add('dragging');
            }
        }

        function handleTouchMove(e) {
            if (!isDragging) return;
            touchEnd = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        }

        function handleTouchEnd() {
            if (!isDragging) return;
            isDragging = false;
            slider.classList.remove('dragging');

            const threshold = 50;
            if (touchStart - touchEnd > threshold) {
                goToNext();
            } else if (touchEnd - touchStart > threshold) {
                goToPrevious();
            }

            touchStart = 0;
            touchEnd = 0;
        }

        function handleKeyDown(e) {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        }

        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', goToPrevious);
        if (nextBtn) nextBtn.addEventListener('click', goToNext);
        if (prevBtnMobile) prevBtnMobile.addEventListener('click', goToPrevious);
        if (nextBtnMobile) nextBtnMobile.addEventListener('click', goToNext);

        slider.addEventListener('touchstart', handleTouchStart);
        slider.addEventListener('touchmove', handleTouchMove);
        slider.addEventListener('touchend', handleTouchEnd);
        slider.addEventListener('mousedown', handleTouchStart);
        slider.addEventListener('mousemove', handleTouchMove);
        slider.addEventListener('mouseup', handleTouchEnd);
        slider.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                slider.classList.remove('dragging');
            }
        });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', updateSlidesToShow);

        updateSlidesToShow();
    }

    // Optional global hook (guarded) for manual invocation
    window.mida = window.mida || {};
    window.mida.homepageSlider = window.mida.homepageSlider || {};
    if (!window.mida.homepageSlider.init) {
        window.mida.homepageSlider.init = initHomepageSlider;
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomepageSlider);
    } else {
        initHomepageSlider();
    }
})(window, document);
