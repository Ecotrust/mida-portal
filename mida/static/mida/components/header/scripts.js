document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu functionality
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    function openMobileMenu() {
        mobileMenu.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Handle escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Close mobile menu
            if (mobileMenu && mobileMenu.classList.contains('show')) {
                closeMobileMenu();
            }

            // Close search dropdowns
            searchDropdowns.forEach((dropdown) => {
                dropdown.classList.remove('show');
            });

            // Close navigation dropdowns
            dropdownMenus.forEach((menu) => {
                menu.classList.remove('show');
                menu.closest('.nav-item')?.classList.remove('open');
            });
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        // Close mobile menu if window becomes large
        if (window.innerWidth >= 1024 && mobileMenu && mobileMenu.classList.contains('show')) {
            closeMobileMenu();
        }
    });

});