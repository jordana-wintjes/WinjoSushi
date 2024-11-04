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
                        var imgSrc = card.querySelector('img').src;
                        showModal(item, imgSrc);
                    });
                });
            });

        // Function to show the main modal with item details
        function showModal(item, imgSrc) {
            var modalContent = `
                <div class="modal fade" id="itemModal" tabindex="-1" role="dialog" aria-labelledby="itemModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title item-name" id="itemModalLabel">${item.name}</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <img src="${imgSrc}" class="img-fluid mb-3" alt="${item.name}">
                                        </div>
                                        <div class="col-md-8">
                                            <p class="item-description">${item.description}</p>
                                            <p class="item-price">${item.price}</p>
                                            <div class="d-flex align-items-center">
                                                <button type="button" class="btn btn-secondary" id="decreaseQuantity">-</button>
                                                <input type="number" id="itemQuantity" class="form-control mx-2" value="1" min="1" style="width: 60px;">
                                                <button type="button" class="btn btn-secondary" id="increaseQuantity">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-warning" id="customizeItem">Customize</button>
                                <button type="button" class="btn btn-primary" id="addItem">Add to Order</button>
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
        
            // Add event listeners for the buttons
            document.getElementById('customizeItem').addEventListener('click', function () {
                showCustomizeModal(item);
            });
        
            document.getElementById('addItem').addEventListener('click', function () {
                var quantity = document.getElementById('itemQuantity').value;
                // Logic to add the item with the specified quantity
                alert('Item added: ' + JSON.stringify({
                    name: item.name,
                    price: item.price,
                    quantity: quantity
                }));
                $('#itemModal').modal('hide'); // Close the modal
            });
        
            document.getElementById('increaseQuantity').addEventListener('click', function () {
                var quantityInput = document.getElementById('itemQuantity');
                quantityInput.value = parseInt(quantityInput.value) + 1;
            });
        
            document.getElementById('decreaseQuantity').addEventListener('click', function () {
                var quantityInput = document.getElementById('itemQuantity');
                if (quantityInput.value > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            });
        }
        
        // Function to show the customize modal with ingredients
        function showCustomizeModal(item) {
            var ingredientsCheckboxes = item.removableIngredients.map(ingredient => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${ingredient}" id="${ingredient}" checked>
                    <label class="form-check-label" for="${ingredient}">
                        ${ingredient}
                    </label>
                </div>
            `).join('');
        
            var customizeModalContent = `
                <div class="modal fade" id="customizeModal" tabindex="-1" role="dialog" aria-labelledby="customizeModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="customizeModalLabel">Customize ${item.name}</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p><strong>Ingredients:</strong></p>
                                ${ingredientsCheckboxes}
                                <div class="form-group">
                                    <label for="customSpecialRequests">Special Requests:</label>
                                    <textarea class="form-control" id="customSpecialRequests" rows="3"></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveCustomizations">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', customizeModalContent);
            $('#customizeModal').modal('show');
        
            // Adjust padding-right when modal is shown
            document.body.style.paddingRight = '0px';
        
            $('#customizeModal').on('hidden.bs.modal', function () {
                document.getElementById('customizeModal').remove();
                // Reset padding-right when modal is hidden
                document.body.style.paddingRight = '';
            });
        
            document.getElementById('saveCustomizations').addEventListener('click', function () {
                // Get unchecked ingredients
                var uncheckedIngredients = Array.from(document.querySelectorAll('.form-check-input:not(:checked)')).map(input => input.value);
                var specialRequests = document.getElementById('customSpecialRequests').value;
        
                // Logic to save customizations
                alert('Customizations saved: ' + JSON.stringify({
                    name: item.name,
                    uncheckedIngredients: uncheckedIngredients,
                    specialRequests: specialRequests
                }));
        
                $('#customizeModal').modal('hide'); // Close the modal
            });
        }
    }
});