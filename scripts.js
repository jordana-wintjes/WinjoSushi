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

        // Load the JSON data
        fetch('menuItems.json')
            .then(response => response.json())
            .then(data => {
                // Add click event listeners to the cards
                document.querySelectorAll('.card').forEach(function (card, index) {
                    card.addEventListener('click', function () {
                        var item = data[index];
                        showModal(item);
                    });
                });
            });

        // Function to show the modal with item details
        function showModal(item) {
            var modalContent = `
                <div class="modal fade" id="itemModal" tabindex="-1" role="dialog" aria-labelledby="itemModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="itemModalLabel">${item.name}</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p><strong>Description:</strong> ${item.description}</p>
                                <p><strong>Ingredients:</strong> ${item.ingredients.join(', ')}</p>
                                <p><strong>Price:</strong> ${item.price}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalContent);
            $('#itemModal').modal('show');

            // Adjust padding-right when modal is shown
            document.body.style.paddingRight = '0px';

            $('#itemModal').on('hidden.bs.modal', function () {
                document.getElementById('itemModal').remove();
                // Reset padding-right when modal is hidden
                document.body.style.paddingRight = '';
            });
        }
    }
});