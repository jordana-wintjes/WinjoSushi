document.addEventListener('DOMContentLoaded', function () {
    var lightGreyBackground = document.getElementById('lightGreyBackground');

    if (lightGreyBackground) {
        // Function to reset scroll position
        function resetScrollPosition() {
            lightGreyBackground.scrollTop = 0;
        }

        // Create a MutationObserver to listen for class changes
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'class') {
                    var target = mutation.target;
                    if (target.classList.contains('show') && target.classList.contains('active')) {
                        resetScrollPosition();
                    }
                }
            });
        });

        // Observe each tab-pane for class changes
        document.querySelectorAll('.tab-pane').forEach(function (pane) {
            observer.observe(pane, { attributes: true });
        });
    }
});