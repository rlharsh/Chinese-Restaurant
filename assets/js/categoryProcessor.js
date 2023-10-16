const MAIN_LISTING = document.getElementById("main-listing");
const CATEGORY_HEADER = document.querySelector(
  ".category-listing-container__heading"
);
const MORE_RESTAURANTS = document.getElementById("more-restaurants-listing");
const SEARCH_ELEMENT = document.getElementsByName("search")[0];
const RATING_THRESHOLD = 3.6;
const DISTANCE_LIMIT = 220;

SEARCH_ELEMENT.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    const searchString = SEARCH_ELEMENT.value.toLowerCase();
    SEARCH_ELEMENT.value = "";
    selectNearbyRestaurants(searchString);
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

const createRestaurantCard = (restaurant, rating) => {
  const card = document.createElement("div");
  card.classList.add("restaurant-card");
  card.dataset.restaurantID = restaurant.id;

  const image = document.createElement("div");
  image.classList.add("restaurant-card__image");
  image.style.backgroundImage = `url(${restaurant.image})`;
  card.appendChild(image);

  const container = document.createElement("div");
  container.classList.add("restaurant-card__container");

  const nameContainer = document.createElement("div");
  nameContainer.classList.add("restaurant-card__name__container");

  const restaurantName = document.createElement("p");
  restaurantName.classList.add("restaurant-card__name");
  restaurantName.innerText = restaurant.name;
  nameContainer.appendChild(restaurantName);

  const ratingContainer = document.createElement("div");
  ratingContainer.classList.add("restaurant-card__rating__container");
  ratingContainer.textContent = `${rating.toFixed(1)} ⭐`;

  container.appendChild(nameContainer);
  container.appendChild(ratingContainer);
  card.appendChild(container);

  return card;
};

const processOtherRestaurants = (cards) => {
  for (const card of cards) {
    MORE_RESTAURANTS.appendChild(card);
  }
};

const createOtherCard = (restaurant, rating, distance = 0) => {
  let card = document.createElement("div");
  card.classList.add("other-card");
  const image = document.createElement("div");
  image.classList.add("other-card__image");
  image.style.backgroundImage = `url(${restaurant.image})`;
  card.appendChild(image);

  const info = document.createElement("div");
  info.classList.add("other-card__info");

  const name = document.createElement("p");
  name.classList.add("restaurant-card__name");
  name.innerText = restaurant.name;
  info.appendChild(name);

  const tag = document.createElement("p");
  tag.classList.add("restaurant-card__tag");
  tag.innerText = restaurant.type;
  info.appendChild(tag);

  const infoSub = document.createElement("div");
  infoSub.classList.add("other-card__info__info");

  const ratingContainer = document.createElement("div");
  ratingContainer.classList.add("restaurant-card__rating__sub");
  ratingContainer.textContent = `${rating.toFixed(1)} ⭐`;
  infoSub.appendChild(ratingContainer);

  const miles = document.createElement("div");
  miles.classList.add("distance");
  const milesIcon = document.createElement("i");
  milesIcon.classList.add("fa-solid");
  milesIcon.classList.add("fa-map-pin");
  milesIcon.classList.add("small-icon");
  miles.appendChild(milesIcon);

  const slugContainer = document.createElement("div");
  slugContainer.classList.add("slug-container");

  const typeTags = JSON.parse(restaurant.slugs);
  typeTags.forEach((type) => {
    const slug = document.createElement("p");
    slug.classList.add("slug");

    slug.innerText = type;
    slugContainer.appendChild(slug);
  });

  const milesText = document.createElement("p");
  milesText.textContent = `${distance.toFixed(1)}`;
  miles.appendChild(milesText);

  infoSub.appendChild(miles);

  info.appendChild(infoSub);
  info.appendChild(slugContainer);
  card.appendChild(info);
  return card;
};

export const selectNearbyRestaurants = async (searchString = "") => {
  let cards = [];
  let other_cards = [];

  CATEGORY_HEADER.innerText = "Nearby Stars";

  farRestaurantList.length = 0;
  otherRestaurantList.length = 0;

  const userLocation = {
    lat: lat,
    lon: long,
  };

  for (const restaurant of restaruantList) {
    const locale = await getCoordinates(
      restaurant.location.city,
      restaurant.location.state
    );
    const distance = Math.floor(Math.random() * (250 - 200 + 1) + 200); //await getDistance(userLocation, locale);

    const menuTags = restaurant.menu
      .map((menuItem) => menuItem.tags.map((tag) => tag.toLowerCase()))
      .flat();

    const percentageLikes =
      (restaurant.popularity.likes /
        (restaurant.popularity.likes + restaurant.popularity.dislikes)) *
      100;
    const rating = 1 + (percentageLikes / 100) * 4;

    if (distance <= DISTANCE_LIMIT) {
      if (
        rating >= RATING_THRESHOLD &&
        (searchString === "" ||
          menuTags.includes(searchString) ||
          restaurant.type.toLowerCase() === searchString)
      ) {
        const card = createRestaurantCard(restaurant, rating);
        cards.push(card);
      } else {
        const card = createOtherCard(restaurant, rating, distance);
        other_cards.push(card);
      }
    } else {
      const card = createOtherCard(restaurant, rating, distance);
      other_cards.push(card);
    }

    if (cards.length > 1 || other_cards.length > 1) {
      processCards(cards);
      processOtherRestaurants(other_cards);
    }
  }
};

const processCards = (cardArray) => {
  MAIN_LISTING.innerHTML = "";
  for (let card of cardArray) {
    card.addEventListener("click", () => {
      console.log(card.dataset.restaurantID);
    });
    MAIN_LISTING.appendChild(card);
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
