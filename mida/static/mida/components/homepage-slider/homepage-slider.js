(function (window, document) {
    'use strict';

    // SVG Paths
    const svgPaths = {
        calendar: "M11.6198 1.22916H11.0827V0.625C11.0827 0.279813 10.831 0 10.5204 0C10.2099 0 9.9582 0.279813 9.9582 0.625V1.22916H4.44177V0.625C4.44177 0.279813 4.19005 0 3.87952 0C3.56899 0 3.31727 0.279813 3.31727 0.625V1.22916H2.78018C1.24718 1.22916 0 2.61553 0 4.31959V12.9095C0 14.6136 1.24718 16 2.78018 16H11.6198C13.1528 16 14.4 14.6136 14.4 12.9095V4.31959C14.4 2.61553 13.1528 1.22916 11.6198 1.22916ZM2.78018 2.47916H3.31727V3.69791C3.31727 4.04309 3.56899 4.32291 3.87952 4.32291C4.19005 4.32291 4.44177 4.04309 4.44177 3.69791V2.47916H9.95823V3.69791C9.95823 4.04309 10.2099 4.32291 10.5205 4.32291C10.831 4.32291 11.0827 4.04309 11.0827 3.69791V2.47916H11.6198C12.5328 2.47916 13.2755 3.30478 13.2755 4.31959V4.91666H1.1245V4.31959C1.1245 3.30478 1.86723 2.47916 2.78018 2.47916ZM11.6198 14.75H2.78018C1.86723 14.75 1.1245 13.9244 1.1245 12.9095V6.16666H13.2755V12.9095C13.2755 13.9244 12.5328 14.75 11.6198 14.75ZM4.99466 8.625C4.99466 8.97019 4.74294 9.25 4.43241 9.25H3.32666C3.01613 9.25 2.76441 8.97019 2.76441 8.625C2.76441 8.27981 3.01613 8 3.32666 8H4.43241C4.74291 8 4.99466 8.27981 4.99466 8.625ZM11.6356 8.625C11.6356 8.97019 11.3839 9.25 11.0734 9.25H9.96762C9.65709 9.25 9.40537 8.97019 9.40537 8.625C9.40537 8.27981 9.65709 8 9.96762 8H11.0734C11.3839 8 11.6356 8.27981 11.6356 8.625ZM8.31193 8.625C8.31193 8.97019 8.06021 9.25 7.74968 9.25H6.64393C6.3334 9.25 6.08168 8.97019 6.08168 8.625C6.08168 8.27981 6.3334 8 6.64393 8H7.74968C8.06018 8 8.31193 8.27981 8.31193 8.625ZM4.99466 12.3125C4.99466 12.6577 4.74294 12.9375 4.43241 12.9375H3.32666C3.01613 12.9375 2.76441 12.6577 2.76441 12.3125C2.76441 11.9673 3.01613 11.6875 3.32666 11.6875H4.43241C4.74291 11.6875 4.99466 11.9673 4.99466 12.3125ZM11.6356 12.3125C11.6356 12.6577 11.3839 12.9375 11.0734 12.9375H9.96762C9.65709 12.9375 9.40537 12.6577 9.40537 12.3125C9.40537 11.9673 9.65709 11.6875 9.96762 11.6875H11.0734C11.3839 11.6875 11.6356 11.9673 11.6356 12.3125ZM8.31193 12.3125C8.31193 12.6577 8.06021 12.9375 7.74968 12.9375H6.64393C6.3334 12.9375 6.08168 12.6577 6.08168 12.3125C6.08168 11.9673 6.3334 11.6875 6.64393 11.6875H7.74968C8.06018 11.6875 8.31193 11.9673 8.31193 12.3125Z"
    };

    // News Data (using Figma asset URLs)
    const newsItems = [
        {
            id: 1,
            title: "BOEM Seeks Input through Feb. 12 on Proposed Central Atlantic Lease Sale Areas",
            description: "Two areas in the Central Atlantic proposed by the Bureau of Ocean Energy Management (BOEM) for offshore wind energy lease sales in 2024 can now be viewed in Marine Planner.",
            date: "December 12, 2023",
            image: "https://s3-alpha-sig.figma.com/img/bda2/e818/9cccd30881df211d6efb501b1c90ab29?Expires=1738540800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qSt0SzEIcLHMN8EcA9Zz0KSgp3VeZTBY9DXX2FCL5TQrYUqFX0dK9BI-FdTKWLjVq6ggwCa7UVOoI4n5m4lM~Aaec0G1mPEVpLiPbXQJ~i8fMb24n1S5h77TlOyZ3JzXVYN3YgXvpZmXOcG1P-LOpDCnZ6yRx8Bq4VGYXf09b6i~pFkHq62A0eZqzYWfSU9U5~MhExxOobpPXmQ83OWsR3x5apmYs4~aDx3MYYKPkI~pZq-J64bZ0H3FDwJFZD1Kz00Y2Ck43C8oD8PoKU1dHrxZU2kH6S0W77j0rQYUw28dWv40WtGCTPHmMXdxs5xX~o-cLM~DLYhTB4GyB0qMlg__",
            imageOverlay: false
        },
        {
            id: 2,
            title: "News from Our Partners",
            description: "The following are news releases issued by MARCO partner organizations related to ocean planning topics in the Mid-Atlantic region.",
            date: "December 11, 2023",
            image: "https://s3-alpha-sig.figma.com/img/d993/82cf/55407632536f773cf5ad692f95e2bbec?Expires=1738540800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=f8Jl7Xz8lQSYJ9s6nJf2iHrPUbAWUTH5J8F5~BdYT8YThdfC8s6F4Qvnp5RzPHScKH3YVU1tM8tD1VHWXA23ZyYvJrZi2E8xd4Ixc~FhOyVaZ5UYvQHl7q9Y9PnpwKZAc5ynYnJ~vp8EEr6rCNrqZL~2Y4uqqt1LdMQKh7dDXXxPwmJvWzBvBptKy5T1qP8WnZAqV~9CgBUQcLB8Xk4gQ0mxqrBiIZZNVT2~OJ6zzNSzwSaTOxNJFLSrJjqVd8GqmPPwGEqXd~RYqxP~6RTPQfqTiF~gQ~Gk5C7Tgz8MQaVm9K9Wp~oUnH2KWgYLqh1wk0Kg5nLHdLQF5iXBdTEqog__",
            imageOverlay: true,
            overlayLogo: "https://s3-alpha-sig.figma.com/img/164b/527a/389363a6eb898ec9c26506d84ec43c1a?Expires=1738540800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=gqO4jBr3wnmkLqKY~Df8Yxh0I8Gy7Zz1hc6qhYR8gZvwE8qNS0Ac0zMxe8~v7WwcPhqKLWdP9IpcVl8Ly0P-8nHJXwb-3pjXvITDYfCO7xNs5E6MdA6jE9NG9lLJC1KU0IEfB~2bqxJLqJ9Bb1RaXy8eG8i6XZ4P8F3rUbR8FnZI6~FDJXdx9sVJZxYY0Bm8GZ6hpK0L~f9Cc1WLPXBq8iMN9nL3vEYGt8V7E6UqXj3vQ~1qMpkj3GbYhT1ZXJl~YrfJh3~tJt7Yn1UDjWxKBqR1Y7nMlVBqfBH6YYqP0xQ__"
        },
        {
            id: 3,
            title: "Note: Update to Leatherback Sea Turtle Maps",
            description: "In September of 2023, through a collaboration with the Marine-life Data & Analysis Team (MDAT), the Mid-Atlantic and Northeast ocean data portals expanded their marine life data collections to include",
            date: "December 8, 2023",
            image: "https://s3-alpha-sig.figma.com/img/fe13/6baa/087bc6a1663b9944c712bdeca99bff93?Expires=1738540800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=pSH1Uz4cZ8p7EY-~6Vkl3gTuF9dW9K5cVkdDY0J~cg6p8Dq8qN~8QvS1K3mNV8SgYdG8T9d6pLF8MgF8iXKH5B~xJ8zT8wY1nFJR8FdT8Z4L8p6F8nK8YF8F8d8F8nK8Y8F8F8dY8zK8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8dQ__",
            imageOverlay: false
        },
        {
            id: 4,
            title: "Where Is Coastal and Ocean Acidification Being Monitored in Your Area?",
            description: "View the places at sea, in coastal waterways and estuaries where the waters are being monitored for signs of increasing acidity with a collection of maps in Marine Planner.",
            date: "November 29, 2023",
            image: "https://s3-alpha-sig.figma.com/img/f431/d28c/545cb79e292b678922fd58624cadcb7a?Expires=1738540800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=dXj3T4K0n8cqF8L9p7Y8nK8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8d8F8nK8Y8F8F8dQ__",
            imageOverlay: false
        }
    ];

    function createNewsPost(item) {
        const overlayHTML = item.imageOverlay ? `
        <div class="image-overlay">
            <div class="overlay-logo">
                <img src="${item.overlayLogo}" alt="MARCO Portal Logo">
            </div>
            <p class="overlay-text-stay">STAY</p>
            <div class="overlay-text-update">
                <p>UP-TO-DATE</p>
            </div>
        </div>
    ` : '';

        return `
        <div class="news-post">
            <div class="news-image-section">
                <img src="${item.image}" alt="${item.title}" class="news-image">
                ${overlayHTML}
                <div class="date-badge">
                    <div class="date-icon">
                        <svg fill="none" preserveAspectRatio="none" viewBox="0 0 14.4 16">
                            <path d="${svgPaths.calendar}" fill="white" />
                        </svg>
                    </div>
                    <p class="date-text">${item.date}</p>
                </div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${item.title}</h3>
                <p class="news-description">${item.description}</p>
                <button class="read-more-button">
                    <span class="read-more-text">READ MORE</span>
                </button>
            </div>
        </div>
    `;
    }

    function initHomepageSlider() {
        const slider = document.getElementById('slider');
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtnMobile = document.getElementById('prevBtnMobile');
        const nextBtnMobile = document.getElementById('nextBtnMobile');

        if (!slider || !pagination) return;

        if (slider.dataset.homepageSliderInitialized === 'true') return;
        slider.dataset.homepageSliderInitialized = 'true';

        // State
        let currentSlide = 0;
        let slidesToShow = 3.5;
        let touchStart = 0;
        let touchEnd = 0;
        let isDragging = false;

        function updateSlider() {
            const translateX = -(currentSlide * (100 / slidesToShow));
            slider.style.transform = `translateX(${translateX}%)`;

            const slides = slider.querySelectorAll('.slide');
            slides.forEach((slide, index) => {
                slide.style.width = `${100 / slidesToShow}%`;

                const isPartiallyVisible = index === Math.floor(currentSlide + slidesToShow);
                if (isPartiallyVisible) {
                    slide.classList.add('partial');
                } else {
                    slide.classList.remove('partial');
                }
            });

            const maxSlide = newsItems.length - slidesToShow;
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

            const maxSlide = Math.floor(newsItems.length - slidesToShow);
            if (currentSlide > maxSlide) {
                currentSlide = Math.max(0, maxSlide);
            }

            updateSlider();
        }

        function goToPrevious() {
            currentSlide = Math.max(0, currentSlide - 1);
            updateSlider();
        }

        function goToNext() {
            const maxSlide = Math.floor(newsItems.length - slidesToShow);
            currentSlide = Math.min(maxSlide, currentSlide + 1);
            updateSlider();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlider();
        }

        function handleTouchStart(e) {
            touchStart = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
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

        function initSlider() {
            // Create slides
            newsItems.forEach(item => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.innerHTML = createNewsPost(item);
                slider.appendChild(slide);
            });

            // Create pagination dots
            newsItems.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => goToSlide(index));
                pagination.appendChild(dot);
            });

            updateSlider();
            updateSlidesToShow();
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

        initSlider();
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
