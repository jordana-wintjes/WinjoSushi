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
                // Populate the HTML with the JSON data
                populateMenu(data);
            });

        // Function to populate the menu with JSON data
        function populateMenu(data) {
            const categories = {
                "Appetizers": document.getElementById('appetizers-content'),
                "Sashimi": document.getElementById('sashimi-content'),
                "Rolls": document.getElementById('rolls-content'),
                "Desserts": document.getElementById('dessert-content'),
                "Drinks": document.getElementById('drinks-content')
            };

            Object.keys(categories).forEach(category => {
                const categoryItems = data.filter(item => item.category === category);
                let cardDeck = document.createElement('div');
                cardDeck.className = 'card-deck';

                categoryItems.forEach((item, index) => {
                    if (index > 0 && index % 3 === 0) {
                        categories[category].appendChild(cardDeck);
                        cardDeck = document.createElement('div');
                        cardDeck.className = 'card-deck';
                    }

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <img class="card-img-top" src="${item.image}" alt="${item.name}">
                        <div class="card-body">
                            <h5 class="card-title mb-0">${item.name}</h5>
                            <p class="card-text mb-0">${item.price}</p>
                        </div>
                    `;
                    card.addEventListener('click', function () {
                        showModal(item, item.image);
                    });
                    cardDeck.appendChild(card);
                });

                categories[category].appendChild(cardDeck);
            });
        }

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

        // Function to create and show the Cart modal
        function showCartModal() {
            var cartModalContent = `
                <div class="modal fade" id="cartModal" tabindex="-1" role="dialog" aria-labelledby="cartModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="cartModalLabel">Cart</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <!-- Tabs -->
                                <ul class="nav nav-tabs" id="cartTab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="current-cart-tab" data-toggle="tab" href="#current-cart" role="tab" aria-controls="current-cart" aria-selected="true">Current Cart</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="in-progress-tab" data-toggle="tab" href="#in-progress" role="tab" aria-controls="in-progress" aria-selected="false">In Progress</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="order-history-tab" data-toggle="tab" href="#order-history" role="tab" aria-controls="order-history" aria-selected="false">Order History</a>
                                    </li>
                                </ul>
                                <div class="tab-content" id="cartTabContent">
                                    <div class="tab-pane fade show active" id="current-cart" role="tabpanel" aria-labelledby="current-cart-tab">
                                        <!-- Current Cart content goes here -->
                                    </div>
                                    <div class="tab-pane fade" id="in-progress" role="tabpanel" aria-labelledby="in-progress-tab">
                                        <!-- In Progress content goes here -->
                                    </div>
                                    <div class="tab-pane fade" id="order-history" role="tabpanel" aria-labelledby="order-history-tab">
                                        <!-- Order History content goes here -->
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', cartModalContent);
            $('#cartModal').modal('show');

            // Adjust padding-right when modal is shown
            document.body.style.paddingRight = '0px';

            $('#cartModal').on('hidden.bs.modal', function () {
                document.getElementById('cartModal').remove();
                // Reset padding-right when modal is hidden
                document.body.style.paddingRight = '';
            });
        }

        // Function to create and show the Service modal
        function showServiceModal() {
            var serviceModalContent = `
                <div class="modal fade" id="serviceModal" tabindex="-1" role="dialog" aria-labelledby="serviceModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="serviceModalLabel">Service</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                Are you sure you want to call a server?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                                <button type="button" class="btn btn-primary" id="confirmService">Yes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', serviceModalContent);
            $('#serviceModal').modal('show');
        
            // Adjust padding-right when modal is shown
            document.body.style.paddingRight = '0px';
        
            $('#serviceModal').on('hidden.bs.modal', function () {
                document.getElementById('serviceModal').remove();
                // Reset padding-right when modal is hidden
                document.body.style.paddingRight = '';
            });
        
            document.getElementById('confirmService').addEventListener('click', function () {
                $('#serviceModal').modal('hide');
                showServerConfirmationModal();
            });
        }
        
        function showServerConfirmationModal() {
            var confirmationModalContent = `
                <div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmationModalLabel">Service</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                A server will be right with you. Thank you!
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', confirmationModalContent);
            $('#confirmationModal').modal('show');
        
            // Adjust padding-right when modal is shown
            document.body.style.paddingRight = '0px';
        
            $('#confirmationModal').on('hidden.bs.modal', function () {
                document.getElementById('confirmationModal').remove();
                // Reset padding-right when modal is hidden
                document.body.style.paddingRight = '';
            });
        }

        // Function to create and show the Pay modal
// Function to create and show the Pay modal
function showPayModal() {
    var payModalContent = `
        <div class="modal fade" id="payModal" tabindex="-1" role="dialog" aria-labelledby="payModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="payModalLabel">Pay</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        Are you sure you are ready to pay?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                        <button type="button" class="btn btn-primary" id="confirmPay">Yes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', payModalContent);
    $('#payModal').modal('show');

    // Adjust padding-right when modal is shown
    document.body.style.paddingRight = '0px';

    $('#payModal').on('hidden.bs.modal', function () {
        document.getElementById('payModal').remove();
        // Reset padding-right when modal is hidden
        document.body.style.paddingRight = '';
    });

    document.getElementById('confirmPay').addEventListener('click', function () {
        $('#payModal').modal('hide');
        showPayConfirmationModal();
    });
}

function showPayConfirmationModal() {
    var confirmationModalContent = `
        <div class="modal fade" id="payConfirmationModal" tabindex="-1" role="dialog" aria-labelledby="payConfirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="payConfirmationModalLabel">Pay</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        A server will be right with you. Please prepare your preferred payment method.
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', confirmationModalContent);
    $('#payConfirmationModal').modal('show');

    // Adjust padding-right when modal is shown
    document.body.style.paddingRight = '0px';

    $('#payConfirmationModal').on('hidden.bs.modal', function () {
        document.getElementById('payConfirmationModal').remove();
        // Reset padding-right when modal is hidden
        document.body.style.paddingRight = '';
    });
}

        // Add event listeners for the buttons
        document.querySelector('.btn[data-target="#cartModal"]').addEventListener('click', showCartModal);
        document.querySelector('.btn[data-target="#serviceModal"]').addEventListener('click', showServiceModal);
        document.querySelector('.btn[data-target="#payModal"]').addEventListener('click', showPayModal);
    }
});