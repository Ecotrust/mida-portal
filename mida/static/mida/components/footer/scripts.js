window.document.addEventListener('DOMContentLoaded', function() {
    // Find feedback button anywhere in the DOM
    var feedbackBtn = document.querySelector('.feedback-button');
    if (!feedbackBtn) return;

    var bottomFooter = document.querySelector('.bottom-footer');
    if (!bottomFooter || !('IntersectionObserver' in window)) {
        // Fallback: keep default bottom placement
        return;
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                feedbackBtn.classList.add('is-raised');
            } else {
                feedbackBtn.classList.remove('is-raised');
            }
        });
    }, { 
        root: null, 
        threshold: 0 
    });

    observer.observe(bottomFooter);
});