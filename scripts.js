document.addEventListener('DOMContentLoaded', function () {
    var lightGreyBackground = document.getElementById('lightGreyBackground');
    const API_BASE_URL = 'http://localhost:7853/api';
    let currentUser = null;

    // Cookie management functions
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
    }

    function updateDebugInfo() {
        const debugElement = document.getElementById('debugInfo');
        if (debugElement) {
            const userId = getCookie('userId');
            const timestamp = new Date().toLocaleTimeString();
            debugElement.innerHTML = `
                User ID: ${userId || 'None'}<br>
                Last Updated: ${timestamp}
            `;
        }
    }
    

    // Initialize user session
    async function initializeUser() {
        try {
            const userId = getCookie('userId');
            if (userId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
                    if (response.ok) {
                        currentUser = await response.json();
                        updateDebugInfo(); // Update debug info after successful user fetch
                        return currentUser;
                    }
                } catch (error) {
                    console.log('Stored user not found, creating new user');
                    deleteCookie('userId');
                }
            }
    
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `Guest_${Date.now()}`,
                    email: `guest_${Date.now()}@example.com`,
                    phone: `temp_${Date.now()}`
                })
            });
    
            if (response.ok) {
                currentUser = await response.json();
                setCookie('userId', currentUser._id, 30);
                updateDebugInfo(); // Update debug info after creating new user
                return currentUser;
            } else {
                throw new Error('Failed to create user');
            }
        } catch (error) {
            console.error('Error initializing user:', error);
            updateDebugInfo(); // Update debug info even on error
            return null;
        }
    }

    // Menu population functions
    function populateMenu(data) {
        console.log('Starting populateMenu with data:', data);
        
        const categories = {
            "Appetizers": document.getElementById('appetizers-content'),
            "Sashimi": document.getElementById('sashimi-content'),
            "Rolls": document.getElementById('rolls-content'),
            "Desserts": document.getElementById('desserts-content'),
            "Drinks": document.getElementById('drinks-content')
        };
    
        console.log('Category elements:', categories);
    
        Object.keys(categories).forEach(category => {
            console.log(`Processing category: ${category}`);
            const categoryItems = data.filter(item => item.category === category);
            console.log(`Found ${categoryItems.length} items for ${category}`);
            
            let cardDeck = document.createElement('div');
            cardDeck.className = 'card-deck';
    
            categoryItems.forEach((item, index) => {
                console.log(`Creating card for item: ${item.name}`);
                if (index > 0 && index % 3 === 0 && categories[category]) {
                    categories[category].appendChild(cardDeck);
                    cardDeck = document.createElement('div');
                    cardDeck.className = 'card-deck';
                }
    
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cursor = 'pointer'; // Makes the cursor change to pointer on hover
                card.innerHTML = `
                    <img class="card-img-top" src="${item.image}" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="card-title mb-0">${item.name}</h5>
                        <p class="card-text mb-0">${item.price}</p>
                    </div>
                `;

                // Add click event listener to the card
                card.addEventListener('click', () => {
                    showModal(item, item.image);
                });

                cardDeck.appendChild(card);
            });
    
            if (categories[category]) {
                categories[category].appendChild(cardDeck);
            } else {
                console.error(`Category element not found for: ${category}`);
            }
        });
    }
    
    // Order management functions
    async function getCurrentCart() {
        try {
            if (!currentUser) return null;
            const response = await fetch(`${API_BASE_URL}/carts/current/${currentUser._id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching current cart:', error);
            return null;
        }
    }

    async function getAllOrders() {
        try {
            if (!currentUser) return { inProgress: [], past: [] };
            const response = await fetch(`${API_BASE_URL}/carts/${currentUser._id}/all`);
            const orders = await response.json();
            return {
                inProgress: orders.filter(order => order.status === 'in_progress'),
                past: orders.filter(order => order.status === 'past')
            };
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return { inProgress: [], past: [] };
        }
    }


    // Cart management functions
    async function addItemToCart(item, quantity, uncheckedIngredients, specialRequests) {
        try {
            // Ensure uncheckedIngredients is always an array
            const removedIngredients = Array.isArray(uncheckedIngredients) 
                ? uncheckedIngredients 
                : (uncheckedIngredients ? [uncheckedIngredients] : []);
    
            const response = await fetch(`${API_BASE_URL}/carts/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser._id,
                    itemId: item._id,
                    quantity: parseInt(quantity),
                    removedIngredients: removedIngredients,  // Send the array
                    specialInstructions: specialRequests
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
    
            const updatedCart = await response.json();
            return updatedCart;
        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        }
    }

    function resetCustomizations(item) {
        item.uncheckedIngredients = '';
        item.specialRequests = '';
    }

    // Scroll position management
    if (lightGreyBackground) {
        function resetScrollPosition() {
            lightGreyBackground.scrollTop = 0;
        }

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

        document.querySelectorAll('.tab-pane').forEach(function (pane) {
            observer.observe(pane, { attributes: true });
        });
    }

    // Modal functions
    function showModal(item, imgSrc) {
        var modalContent = `
            <div class="modal fade" id="itemModal" tabindex="-1" role="dialog" aria-labelledby="itemModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>

                        <div class="modal-content-grid">
                            <!-- Top row with two columns -->
                            <div class="top-section">
                                <div class="image-column">
                                    <img src="${imgSrc}" alt="${item.name}" class="item-image">
                                </div>
                                
                                <div class="info-column">
                                    <div class="header-row">
                                        <h5 class="modal-title">${item.name}</h5>
                                        <h5 class="item-price">${item.price}</h5>
                                    </div>
                                    <p class="item-description">${item.description}</p>
                                </div>
                            </div>

                            <!-- Ingredients row -->
                            <div class="ingredients-section">
                                <h6>Ingredients</h6>
                                <div class="ingredients-list">
                                    ${item.ingredients ? item.ingredients.map(ingredient => `
                                        <div class="ingredient-item">
                                            <span class="ingredient-bullet">•</span>
                                            <span class="ingredient-name">${ingredient}</span>
                                        </div>
                                    `).join('') : ''}
                                </div>
                            </div>

                            <!-- Quantity control row -->
                            <div class="quantity-section">
                                <span>Quantity</span>
                                <div class="quantity-control">
                                    <button type="button" class="quantity-button" id="decreaseQuantity">-</button>
                                    <input type="text" value="1" class="quantity-input" id="itemQuantity" readonly>
                                    <button type="button" class="quantity-button" id="increaseQuantity">+</button>
                                </div>
                            </div>

                            <!-- Buttons row -->
                            <div class="button-group">
                                <button type="button" class="button button-cancel" data-dismiss="modal">Cancel</button>
                                <button type="button" class="button button-modify" id="customizeItem">Modify</button>
                                <button type="button" class="button button-add" id="addItem">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalContent);
        $('#itemModal').modal('show');

        document.body.style.paddingRight = '0px';

        $('#itemModal').on('hidden.bs.modal', function () {
            document.getElementById('itemModal').remove();
            document.body.style.paddingRight = '';
            resetCustomizations(item);
        });
        


        document.getElementById('addItem').addEventListener('click', async function () {
            var quantity = document.getElementById('itemQuantity').value;
            try {
                // Handle uncheckedIngredients properly
                const removedIngredients = Array.isArray(item.uncheckedIngredients) 
                    ? item.uncheckedIngredients 
                    : (item.uncheckedIngredients ? [item.uncheckedIngredients] : []);
                    
                await addItemToCart(
                    item,
                    quantity,
                    removedIngredients,
                    item.specialRequests
                );
                resetCustomizations(item);
                $('#itemModal').modal('hide');
                
                // Remove any existing confirmation modal
                const existingConfirmation = document.getElementById('itemAddedConfirmation');
                if (existingConfirmation) {
                    existingConfirmation.remove();
                }
                
                // Create and show the confirmation modal
                const confirmationModal = `
                    <div class="modal fade" id="itemAddedConfirmation" tabindex="-1" role="dialog" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered" role="document">
                            <div class="modal-content">
                                <div class="modal-header border-0">
                                    <h5 class="modal-title confirm-modal">Successfully Added!</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div class="text-center">
                                        <i class="fa-solid fa-check" style="color: #28a745; font-size: 10rem; margin-bottom: 15px;"></i>
                                    </div>
                                </div>
                                <div class="modal-footer border-0">
                                    <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add the confirmation modal to the body
                document.body.insertAdjacentHTML('beforeend', confirmationModal);
                
                // Show the confirmation modal
                const $confirmationModal = $('#itemAddedConfirmation');
                $confirmationModal.modal('show');
                
                // Remove padding-right that Bootstrap adds
                document.body.style.paddingRight = '0px';
                
                // Clean up modal on close
                $confirmationModal.on('hidden.bs.modal', function () {
                    $(this).remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass('modal-open').css('padding-right', '');
                });
                
            } catch (error) {
                console.error('Error adding item:', error);
            }
        });

        // Single event listener for customizeItem button
        document.getElementById('customizeItem').addEventListener('click', function () {
            $('#itemModal').modal('hide');
            showCustomizeModal(item);
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

    function showCustomizeModal(item) {
        const customizeModalContent = `
            <div class="customize-modal" id="customizeModal" tabindex="-1" role="dialog">
                <div class="customize-modal-content">
                    <button type="button" class="customize-close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    
                    <div class="customize-content-grid">
                        <div class="left-column">
                            <div class="item-image-container">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                            </div>
                            <div class="other-requests">
                                <h2 class="requests-title">Special Requests</h2>
                                <textarea placeholder="Tap to begin typing any special requests, allergies, etc.">${item.specialRequests || ''}</textarea>
                            </div>
                        </div>
    
                        <div class="right-column">
                            <div class="customize-header">
                                <h2 class="customize-title">${item.name}</h2>
                            </div>
    
                            <div class="customize-ingredients">
                                ${item.removableIngredients ? item.removableIngredients.map(ingredient => `
                                    <div class="ingredient-row" data-ingredient="${ingredient}">
                                        <span class="ingredient-name">${ingredient}</span>
                                        <div class="quantity-control">
                                            <button class="quantity-btn decrease-btn">-</button>
                                            <span class="quantity-value">${!item.uncheckedIngredients || !item.uncheckedIngredients.includes(ingredient) ? '1' : '0'}</span>
                                            <button class="quantity-btn increase-btn">+</button>
                                        </div>
                                    </div>
                                `).join('') : ''}
                            </div>
    
                            <div class="modal-actions">
                                <button class="done-btn">Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        document.body.insertAdjacentHTML('beforeend', customizeModalContent);
        const modal = document.getElementById('customizeModal');
    
        // Handle quantity controls
        const ingredientRows = modal.querySelectorAll('.ingredient-row');
        ingredientRows.forEach(row => {
            const decreaseBtn = row.querySelector('.decrease-btn');
            const increaseBtn = row.querySelector('.increase-btn');
            const quantityValue = row.querySelector('.quantity-value');
    
            decreaseBtn.addEventListener('click', () => {
                let value = parseInt(quantityValue.textContent);
                if (value > 0) {
                    value--;
                    quantityValue.textContent = value;
                }
            });
    
            increaseBtn.addEventListener('click', () => {
                let value = parseInt(quantityValue.textContent);
                value++;
                quantityValue.textContent = value;
            });
        });
    
        // Handle close button
        const closeBtn = modal.querySelector('.customize-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            showModal(item, item.image);
        });
    
        // Handle done button
        const doneBtn = modal.querySelector('.done-btn');
        doneBtn.addEventListener('click', () => {
            // Collect unchecked ingredients (quantity = 0)
            const uncheckedIngredients = [];
            ingredientRows.forEach(row => {
                const quantity = parseInt(row.querySelector('.quantity-value').textContent);
                if (quantity === 0) {
                    uncheckedIngredients.push(row.dataset.ingredient);
                }
            });

            // Get special requests
            const specialRequests = modal.querySelector('textarea').value;

            // Create a new item object with the customizations
            const customizedItem = { ...item };
            customizedItem.uncheckedIngredients = uncheckedIngredients; // Store as array
            customizedItem.specialRequests = specialRequests;

            // Close customize modal and show main modal
            modal.remove();
            showModal(customizedItem, customizedItem.image);
        });
    
        document.body.style.paddingRight = '0px';
    }

    async function showCartModal() {
        try {
            // Fetch current cart and all orders
            const [currentCart, allOrders] = await Promise.all([
                getCurrentCart(currentUser._id),
                fetch(`${API_BASE_URL}/carts/${currentUser._id}/all`).then(res => res.json())
            ]);
    
            // Separate orders by status
            const inProgressOrders = allOrders.filter(order => order.status === 'in_progress');
            const pastOrders = allOrders.filter(order => order.status === 'past');
    
            const cartModalContent = `
                <div class="modal fade" id="cartModal" tabindex="-1" role="dialog" aria-labelledby="cartModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header border-0">
                                <h5 class="modal-title" id="cartModalLabel">Your Orders</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="cart-body">
                                <ul class="nav nav-tabs" id="cartTab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="current-cart-tab" data-toggle="tab" href="#current-cart" role="tab">Current Cart</a>
                                    </li>
                                    <li class="nav-item">  
                                        <a class="nav-link" id="in-progress-tab" data-toggle="tab" href="#in-progress" role="tab">In Progress</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="order-history-tab" data-toggle="tab" href="#order-history" role="tab">Order History</a>
                                    </li>
                                </ul>
                                <div class="tab-content mt-3" id="cartTabContent">
                                    <div class="tab-pane fade show active" id="current-cart" role="tabpanel">
                                        ${generateCartContent(currentCart)}
                                        <div id="cart-total" class="mt-3">
                                        </div>
                                        <div class="modal-footer border-0">
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                            ${currentCart && currentCart.items && currentCart.items.length > 0 ? 
                                                `<button type="button" class="btn btn-primary" id="place-order-btn">Place Order</button>` : 
                                            ''}
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="in-progress" role="tabpanel">
                                        <div class="orders">
                                            ${generateOrdersList(inProgressOrders)}
                                        </div>
                                        <div class="modal-footer border-0">
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="order-history" role="tabpanel">
                                        <div class="orders">
                                        ${generateOrdersList(pastOrders)}
                                        </div>
                                        <div class="modal-footer border-0">
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    
            // Remove any existing modal
            const existingModal = document.getElementById('cartModal');
            if (existingModal) {
                existingModal.remove();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open').css('padding-right', '');
            }
    
            // Add new modal to DOM
            document.body.insertAdjacentHTML('beforeend', cartModalContent);
    
            // Add event listener for place order button if cart has items
            if (currentCart?.items?.length > 0) {
                document.getElementById('place-order-btn').addEventListener('click', () => {
                    placeOrder(currentCart._id);
                });
            }
    
            // Initialize the modal
            $('#cartModal').modal({
                backdrop: true,
                keyboard: false
            });
    
            // Remove padding-right that Bootstrap adds
            document.body.style.paddingRight = '0px';
    
            // Clean up modal on close
            $('#cartModal').on('hidden.bs.modal', function () {
                $(this).remove();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open').css('padding-right', '');
            });
    
        } catch (error) {
            console.error('Error showing cart modal:', error);
        }
    }
    
    function generateOrdersList(orders) {
        if (!orders || orders.length === 0) {
            return '<p class="text-center my-3">No orders found</p>';
        }
    
        // Create a single receipt containing all orders
        return `
            <div class="receipt">
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th class="time-col">Time</th>
                            <th class="item-col">Item</th>
                            <th class="price-col">Price</th>
                            <th class="quantity-col">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.flatMap(order => 
                            order.items.map(item => `
                                <tr>
                                    <td>${formatOrderDate(order)}</td>
                                    <td>${item.name}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                </tr>
                                ${(item.removedIngredients && item.removedIngredients.length > 0) || item.specialInstructions ? `
                                <tr class="modification-row">
                                    <td colspan="4">
                                        ${item.removedIngredients && item.removedIngredients.length > 0 ? 
                                            `<div>No ${item.removedIngredients.join(', ')}</div>` : ''}
                                        ${item.specialInstructions ? 
                                            `<div>Special: ${item.specialInstructions}</div>` : ''}
                                    </td>
                                </tr>
                                ` : ''}
                            `).join('')
                        ).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    // Helper function to format order dates
    function formatOrderDate(order) {
        if (order.status === 'in_progress') {
            return `${new Date(order.orderPlacedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return `Delivered: ${new Date(order.deliveredAt).toLocaleDateString()}`;
        }
    }

    function generateCartContent(cart) {
        if (!cart || !cart.items || cart.items.length === 0) {
            return '<p>Your cart is empty</p>';
        }

        let content = 
        `<table class="receipt-table">
            <thead>
                <tr>
                    <th class="item-col">Item</th>
                    <th class="price-col">Price</th>
                    <th class="quantity-col">Quantity</th>
                </tr>
            </thead>
            <tbody class="cartItems">
                ${cart.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                         <td>
                            <div class="quantity-control">
                                <button class="quantity-button decrease-btn" data-item="${item.name}">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-button increase-btn" data-item="${item.name}">+</button>
                            </div>
                        </td>
                    </tr>
                    ${(item.removedIngredients && item.removedIngredients.length > 0) || item.specialInstructions ? `
                    <tr class="modification-row">
                        <td colspan="4">
                            ${item.removedIngredients && item.removedIngredients.length > 0 ? 
                                `<div>No ${item.removedIngredients.join(', ')}</div>` : ''}
                            ${item.specialInstructions ? 
                                `<div>Special: ${item.specialInstructions}</div>` : ''}
                        </td>
                    </tr>
                    ` : ''}
                    `).join('')}
            </tbody>
        </table>`;

        setTimeout(() => {
            document.getElementById("cart-total").insertAdjacentHTML('beforeend',  `<hr><div class="cartCost"><h5>Subtotal: $${cart.subtotal.toFixed(2)}</h5> <h5>Tax: $${cart.tax.toFixed(2)}</h5> <h4>Total: $${cart.total.toFixed(2)}</h4></div>`)
    
            document.querySelectorAll('.decrease-btn').forEach(button => {
                button.addEventListener('click', () => {
                    //stuff for decreasing quantity
                });
            });
    
            document.querySelectorAll('.increase-btn').forEach(button => {
                button.addEventListener('click', () => {
                    //stuff for increasing quantity
                });
            });
        }, 0);
    

        return content;
    }
    
    


    function showServiceModal() {
        // Remove any existing service modal
        const existingModal = document.getElementById('serviceConfirmationModal');
        if (existingModal) {
            existingModal.remove();
        }
    
        // First modal - confirmation
        const serviceConfirmationContent = `
            <div class="modal fade" id="serviceConfirmationModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div class="text-center">
                                <h2 class="font-weight-bold">Are you sure you want to call a server?</h2>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                            <button type="button" class="btn btn-primary" id="confirmServiceBtn">Yes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Add first modal to body
        document.body.insertAdjacentHTML('beforeend', serviceConfirmationContent);
    
        // Initialize the first modal
        const $serviceConfirmationModal = $('#serviceConfirmationModal');
        $serviceConfirmationModal.modal('show');
    
        // Remove padding-right that Bootstrap adds
        document.body.style.paddingRight = '0px';
    
        // Add event listener for the Yes button
        document.getElementById('confirmServiceBtn').addEventListener('click', function() {
            // Hide first modal
            $serviceConfirmationModal.modal('hide');
            
            // Show second modal
            showFinalServiceModal();
        });
    
        // Clean up modal on close
        $serviceConfirmationModal.on('hidden.bs.modal', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('padding-right', '');
        });
    }
    
    function showFinalServiceModal() {
        const finalServiceContent = `
            <div class="modal fade" id="finalServiceModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <h5 class="modal-title confirm-modal">A Server will be right with you</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <h2 class="font-weight-bold">Thank you!</h2>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Add second modal to body
        document.body.insertAdjacentHTML('beforeend', finalServiceContent);
    
        // Initialize the second modal
        const $finalServiceModal = $('#finalServiceModal');
        $finalServiceModal.modal('show');
    
        // Remove padding-right that Bootstrap adds
        document.body.style.paddingRight = '0px';
    
        // Clean up modal on close
        $finalServiceModal.on('hidden.bs.modal', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('padding-right', '');
        });
    }

    function showPayModal() {
        // Remove any existing pay modal
        const existingModal = document.getElementById('payConfirmationModal');
        if (existingModal) {
            existingModal.remove();
        }
    
        // First modal - confirmation
        const payConfirmationContent = `
            <div class="modal fade" id="payConfirmationModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <h5 class="modal-title confirm-modal">Confirm Payment</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <h2 class="font-weight-bold">Are you sure you are ready to pay?</h2>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                            <button type="button" class="btn btn-primary" id="confirmPayBtn">Yes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Add first modal to body
        document.body.insertAdjacentHTML('beforeend', payConfirmationContent);
    
        // Initialize the first modal
        const $payConfirmationModal = $('#payConfirmationModal');
        $payConfirmationModal.modal('show');
    
        // Remove padding-right that Bootstrap adds
        document.body.style.paddingRight = '0px';
    
        // Add event listener for the Yes button
        document.getElementById('confirmPayBtn').addEventListener('click', function() {
            // Hide first modal
            $payConfirmationModal.modal('hide');
            
            // Show second modal
            showFinalPayModal();
        });
    
        // Clean up modal on close
        $payConfirmationModal.on('hidden.bs.modal', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('padding-right', '');
        });
    }
    
    function showFinalPayModal() {
        const finalPayContent = `
            <div class="modal fade" id="finalPayModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <h5 class="modal-title confirm-modal">A Server will be right with you.</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <h2 class="font-weight-bold">Please prepare your preferred payment method.</h2>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Add second modal to body
        document.body.insertAdjacentHTML('beforeend', finalPayContent);
    
        // Initialize the second modal
        const $finalPayModal = $('#finalPayModal');
        $finalPayModal.modal('show');
    
        // Remove padding-right that Bootstrap adds
        document.body.style.paddingRight = '0px';
    
        // Clean up modal on close
        $finalPayModal.on('hidden.bs.modal', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('padding-right', '');
        });
    }

    async function placeOrder(cartId) {
        try {
            // Show loading state on the place order button
            const placeOrderBtn = document.getElementById('place-order-btn');
            const originalText = placeOrderBtn.innerHTML;
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Placing Order...';
    
            const response = await fetch(`${API_BASE_URL}/carts/place-order/${cartId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to place order');
            }
    
            const updatedCart = await response.json();
            
            // Hide the cart modal using Bootstrap's modal method
            $('#cartModal').modal('hide');
    
            // Wait for cart modal to finish hiding before showing confirmation
            $('#cartModal').on('hidden.bs.modal', function () {
                // Clean up the cart modal completely
                $(this).remove();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open').css('padding-right', '');
                
                // Show the order confirmation modal
                showOrderConfirmationModal(updatedCart);
            });
    
        } catch (error) {
            console.error('Error placing order:', error);
            
            // Reset the place order button
            const placeOrderBtn = document.getElementById('place-order-btn');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.innerHTML = 'Place Order';
            }
    
            // Show error message in the modal
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.role = 'alert';
            errorDiv.innerHTML = 'There was an error placing your order. Please try again.';
            
            const modalBody = document.querySelector('#cartModal .modal-body');
            if (modalBody) {
                // Remove any existing error messages
                const existingError = modalBody.querySelector('.alert-danger');
                if (existingError) {
                    existingError.remove();
                }
                modalBody.appendChild(errorDiv);
            }
        }
    }
    
    function showOrderConfirmationModal(order) {
        // Remove any existing confirmation modal
        const existingModal = document.getElementById('orderConfirmationModal');
        if (existingModal) {
            existingModal.remove();
        }
    
        const modalContent = `
            <div class="modal fade" id="orderConfirmationModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <h5 class="modal-title confirm-modal">Your Order Has Been Received!</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <i class="fa-solid fa-check" style="color: #28a745; font-size: 10rem; margin-bottom: 15px;"></i>
                                <p class="text-muted mb-0">You can track your order status in the "In Progress" tab of your orders.</p>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        // Add the confirmation modal to the body
        document.body.insertAdjacentHTML('beforeend', modalContent);
    
        // Initialize and show the confirmation modal
        const $confirmationModal = $('#orderConfirmationModal');
        
        $confirmationModal.modal({
            backdrop: true,
            keyboard: false
        });
    
        // Remove padding-right that Bootstrap adds
        document.body.style.paddingRight = '0px';
    
        // Handle modal cleanup on close
        $confirmationModal.on('hidden.bs.modal', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('padding-right', '');
        });
    }

    // Initialize application
    if (lightGreyBackground) {
        initializeUser().then(() => {
            Promise.all([
                fetch(`${API_BASE_URL}/items`),
                fetch(`${API_BASE_URL}/categories`)
            ])
            .then(([itemsResponse, categoriesResponse]) => 
                Promise.all([itemsResponse.json(), categoriesResponse.json()])
            )
            .then(([items, categories]) => {
                const menuItems = items.map(item => ({
                    category: item.category,
                    name: item.name,
                    price: `$${item.price}`,
                    description: item.description,
                    image: item.imageUrl,
                    _id: item._id,
                    ingredients: item.ingredients,
                    removableIngredients: item.removableIngredients,
                    allergens: item.allergens
                }));

                populateMenu(menuItems);
            })
            .catch(error => {
                console.error('Error loading menu:', error);
            });
        });

        setInterval(updateDebugInfo, 30000);

        // Add event listeners for navigation buttons
        document.querySelector('.btn[data-target="#cartModal"]')?.addEventListener('click', showCartModal);
        document.querySelector('.btn[data-target="#serviceModal"]')?.addEventListener('click', showServiceModal);
        document.querySelector('.btn[data-target="#payModal"]')?.addEventListener('click', showPayModal);
    }

    
});
