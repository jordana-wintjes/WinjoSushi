const API_BASE_URL = 'https://winjosushi-backend.onrender.com/api';

// Fetch menu items from the backend instead of menuItems.json
async function fetchMenuItems() {
    try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categories = await categoriesResponse.json();
        
        const itemsResponse = await fetch(`${API_BASE_URL}/items`);
        const items = await itemsResponse.json();
        
        // Transform the data to match your frontend format
        return items.map(item => ({
            category: categories.find(c => c._id === item.categoryId)?.name || '',
            name: item.name,
            price: `$${item.price.toFixed(2)}`,
            description: item.description,
            image: item.imageUrl,
            ingredients: item.ingredients,
            removableIngredients: item.removableIngredients,
            allergens: item.allergens
        }));
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
}

// Cart operations
async function addToCart(userId, itemData) {
    try {
        const response = await fetch(`${API_BASE_URL}/carts/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                itemId: itemData.itemId,
                quantity: itemData.quantity,
                removedIngredients: itemData.uncheckedIngredients,
                specialInstructions: itemData.specialRequests
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
}

async function getCurrentCart(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/carts/current/${userId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching current cart:', error);
        throw error;
    }
}

async function placeOrder(cartId) {
    try {
        const response = await fetch(`${API_BASE_URL}/carts/place-order/${cartId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
}
