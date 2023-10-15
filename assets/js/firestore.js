import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

// Arrays
import {
  restaruantList,
  selectNearbyRestaurants,
} from "./categoryProcessor.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://chinese-restaurant-4e3f5-default-rtdb.firebaseio.com/",
};

let app, db, restaurantsRef;

export const initilizeApplication = () => {
  app = initializeApp(appSettings);
  db = getDatabase(app);
  restaurantsRef = ref(db, "restaurants");

  onValue(restaurantsRef, (snapshot) => {
    restaruantList.length = 0;

    if (snapshot.exists()) {
      let restaurantArray = snapshot.val();
      restaurantArray.forEach((restaurant) => {
        setRestaurantListing(restaurant);
      });

      selectNearbyRestaurants();
    }
  });
};

const setRestaurantListing = (resaurant) => {
  if (resaurant) {
    restaruantList.push(resaurant);
  }
};
