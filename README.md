# **Winjo Sushi**

A project for **CPSC 481** focusing on design aspects and HCI. Winjo Sushi is a ordering system focusing on providing the most seamless and easy to use system for ordering food.

You can view our project at this [link](https://jordana-wintjes.github.io/).


### Group Members
- Jordana Wintjes
- Ryan Wong
- Emily Williams
- Emmanuel Trinidad
- Favour Adah

# **Running the Application**

Please follow the steps below to run the application.

Before getting started, ensure you have followed the steps to install and run our **backend** client [here](https://github.com/ryanwoong/WinjoSushi-Backend).

## Change API Endpoint (optional)
- Since we are using a separate hosted backend, to use the locally hosted backend you will need to change 2 variables in two different files
- In the `scripts.js` file change `API_BASE_URL` found at the top of the file to `http://localhost:7853/api`
- In the `api.js`, repeat the above step

## Using Live Server (Visual Studio Code)
- Ensure the Live Preview extension is installed
- Navigate to the `index.html` file and in the top right corner click on the "Show Preview" button
- The application should now be available for viewing at the link shown. 
- *Default is `http://127.0.0.1:3000/index.html`*
- *ENSURE THE BACKEND CLIENT IS RUNNING* 

## Serving using Node (http-server)
- Install http-server with `npm install http-server -g`
- In the root directory of the project open a terminal and run `http-server`
- The project should now be available for viewing in the IPs & ports specified in the console
- *ENSURE THE BACKEND CLIENT IS RUNNING*

# **Walkthrough/Features**

Please read below as a walkthrough for our features

## Adding Items
- Click on any of the categories on the left of the screen, we reccomend `Appetizers`
- Click on any item, we reccomend `Dumplings`
- Click on the `Add` button
- Item will get added and a notification will appear next to the `Cart` button to display the number of items in your current cart

## Modifying Items
- Click on any of the categories on the left of the screen, we reccomend `Appetizers`
- Click on any item, we reccomend `Dumplings`
- Click on the `Modify` button
- As you can see you have 3 options
    - `Change what's included`: Change the amount of the certain ingredient, this ranges from `none`, `light` and `regular`
    - `Additions`: Add any other ingredient's or items for an extra charge. The extra charge will appear next to the increase/decrease buttons
    - `Special requests`: Any other requests can be typed here
- Change `Garlic` to `none`
- Add an extra dumpling
- As you can see there is a new box under the description of the item showing what you changed before you add the item to the cart.
![item](https://i.imgur.com/TQK67IT.png)
- Click the `Modify` button again, as you can see the changes we made are still saved
- Click `Add` button
- Item will get added and a notification will appear next to the `Cart` button to display the number of items in your current cart
- Click `Cart` button
![cart item](https://i.imgur.com/Bc7Aw1I.png)
- As you can see the item is added with the modifications you made, you can see your current cart before placing the order

## Removing Items
- Click the `Cart` button
- Click on the red trash can to delete
- A pop-up will show and ask you to confirm the deletion
- Click `Yes`
- `Cart` is prompted again and the item you removed is gone

## Placing Order
- Add any item with any modifications
- Click `Cart` button
- Click `Place Order` button
- Order is now placed, the item(s) are now moved to the `In Progress` tab as you can see as you are prompted to the `In Progress` tab

## Current Cart
- Click `Cart` button
- See all current item(s) you've added 

## In Progress Cart
- Click `Cart` button
- Click `In Progress` button
- See all item(s) that you've placed an order for, along with their modifications if any

## Past Orders/History
- Click `Cart` button
- Click `Order History` button
- See all item(s) that are now delivered to the table and are no longer in progress. For the purpose of this demonstration a time between 10 and 15 seconds is chosen and after that time, the order status will change and be moved into the Order History tab

## Calling a Server
- Click on the bell icon in the bottom left hand of the screen
- A confirmation will pop-up to ask if you want to call the server
- Click `Yes`
- A server is now called and the button says "A server will be with you shortly"

## Paying the Bill
- Click `Pay` button in the top right hand of the screen
- A confirmation will pop-up to ask if you want to pay
- Click `Yes`
- A server is now called to handle the payment
