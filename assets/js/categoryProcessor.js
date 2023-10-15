const mainListing = document.getElementById("main-listing");
const categoryHeader = document.querySelector(
  ".category-listing-container__heading"
);
const moreRestaurants = document.getElementById("more-restaurants-listing");
const searchElement = document.getElementsByName("search")[0];
let searchString = "";
searchElement.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchString = searchElement.value.toLowerCase();
    searchElement.value = "";
    selectNearbyRestaurants();
  }
});

import { lat, long } from "./index.js";

export const Category = {
  Nearby: "nearby",
  Favorite: "favorite",
  Deals: "deals",
  Other: "other",
};

export const restaruantList = [];
export const otherRestaurantList = [];
export const farRestaurantList = [];

export const processCategory = (category) => {
  switch (category) {
    case Category.Deals:
      console.log("Deals");
      break;
    case Category.Favorite:
      console.log("Favorite");
      break;
    case Category.Other:
      console.log("Other");
      break;
    case Category.Nearby:
      selectNearbyRestaurants();
      break;
    default:
      console.log("Default");
      break;
  }
};

const processOtherRestaurants = () => {
  for (const restaurant of otherRestaurantList) {
    let card = document.createElement("div");
    card.classList.add("other-card");
    card.innerText = restaurant.name;

    moreRestaurants.appendChild(card);
  }
};

let workCompleted = false;

export const selectNearbyRestaurants = async () => {
  const getNearbyRestaurantsPromise = async () => {
    let cards = [];
    categoryHeader.innerText = "Nearby Stars";

    farRestaurantList.length = 0;
    otherRestaurantList.length = 0;

    for (const restaurant of restaruantList) {
      const locale = await getCoordinates(
        restaurant.location.city,
        restaurant.location.state
      );

      const userLocation = {
        lat: lat,
        lon: long,
      };

      const distance = await getDistance(userLocation, locale);
      let menuTags = [];

      if (distance <= 250) {
        const likes = restaurant.popularity.likes;
        const dislikes = restaurant.popularity.dislikes;
        const percentageLikes = (likes / (likes + dislikes)) * 100;
        const rating = 1 + (percentageLikes / 100) * 4;

        if (rating >= 3.8) {
          restaurant.menu.forEach((menuItem) => {
            menuItem.tags.forEach((tag) => {
              menuTags.push(tag.toLowerCase());
            });
          });

          if (
            searchString === "" ||
            menuTags.includes(searchString) ||
            restaurant.type.toLowerCase() == searchString
          ) {
            let card = document.createElement("div");
            card.classList.add("restaurant-card");

            card.dataset.restaurantID = restaurant.id;

            let image = document.createElement("div");
            image.classList.add("restaurant-card__image");
            image.style.backgroundImage = `url(${restaurant.image})`;
            card.appendChild(image);

            let container = document.createElement("div");
            container.classList.add("restaurant-card__container");

            let nameContainer = document.createElement("div");
            nameContainer.classList.add("restaurant-card__name__container");

            let restaurantName = document.createElement("p");
            restaurantName.classList.add("restaurant-card__name");
            restaurantName.innerText = restaurant.name;
            nameContainer.appendChild(restaurantName);

            let ratingContainer = document.createElement("div");
            ratingContainer.classList.add("restaurant-card__rating__container");

            ratingContainer.textContent = `⭐ ${String(rating.toFixed(1))}`;

            container.appendChild(nameContainer);
            container.appendChild(ratingContainer);

            card.appendChild(container);
            cards.push(card);
          }
        } else {
          otherRestaurantList.push(restaurant);
        }
      } else {
        farRestaurantList.push(restaurant);
      }
      workCompleted = true;
    }
    return cards;
  };
  const cards = await getNearbyRestaurantsPromise();

  if (workCompleted) {
    processCards(cards);
    processOtherRestaurants();
  }
};

const processCards = (cardArray) => {
  console.log("Process Cards Called");
  mainListing.innerHTML = "";
  for (let card of cardArray) {
    card.addEventListener("click", () => {
      console.log(card.dataset.restaurantID);
    });
    mainListing.appendChild(card);
  }
};

async function getCoordinates(city, state) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&format=json`
  );
  const data = await response.json();
  if (data && data[0] && data[0].lat && data[0].lon) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  }
  throw new Error("Failed to get coordinates");
}

async function getDistance(origin, destination) {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`
  );
  const data = await response.json();
  if (data && data.routes && data.routes[0] && data.routes[0].distance) {
    const kilometers = data.routes[0].distance / 1000;
    const miles = kilometers * 0.621371;
    return miles;
  }
  throw new Error("Failed to get distance");
}
