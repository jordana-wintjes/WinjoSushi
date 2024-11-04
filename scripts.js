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

        // Function to show the modal with item details
        function showModal(item, imgSrc) {
            var ingredientsList = item.ingredients.map(ingredient => {
                if (item.removableIngredients.includes(ingredient)) {
                    return `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${ingredient}" id="${ingredient}" checked>
                            <label class="form-check-label" for="${ingredient}">
                                ${ingredient}
                            </label>
                        </div>
                    `;
                } else {
                    return `<li>${ingredient}</li>`;
                }
            }).join('');

            var modalContent = `
                <div class="modal fade" id="itemModal" tabindex="-1" role="dialog" aria-labelledby="itemModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="itemModalLabel">${item.name}</h5>
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
                                            <p><strong></strong> ${item.description}</p>
                                            <p><strong>Ingredients:</strong></p>
                                            <ul>${ingredientsList}</ul>
                                            <div class="form-group">
                                                <label for="specialRequests">Special Requests:</label>
                                                <textarea class="form-control" id="specialRequests" rows="3"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" id="removeItem">Remove Item</button>
                                <button type="button" class="btn btn-primary" id="addItem">Add Item</button>
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
            document.getElementById('removeItem').addEventListener('click', function () {
                // Logic to remove the item
                alert('Item removed');
            });

            document.getElementById('addItem').addEventListener('click', function () {
                // Get unchecked ingredients
                var uncheckedIngredients = Array.from(document.querySelectorAll('.form-check-input:not(:checked)')).map(input => input.value);
                var specialRequests = document.getElementById('specialRequests').value;

                // Logic to add the item with modifications
                alert('Item added with modifications: ' + JSON.stringify({
                    name: item.name,
                    price: item.price,
                    uncheckedIngredients: uncheckedIngredients,
                    specialRequests: specialRequests
                }));
            });
        }
    }
});