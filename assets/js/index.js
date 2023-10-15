import { processCategory, Category } from "./categoryProcessor.js";
import { initilizeApplication } from "./firestore.js";

// Category Buttons
const navButtonNearby = document.getElementById("nav-nearby");
const navButtonFavorite = document.getElementById("nav-favorite");
const navButtonDeals = document.getElementById("nav-deals");
const navButtonOther = document.getElementById("nav-other");

// GEOLOCATION
export let lat, long;

const categoryLising = document.getElementById("main-listing");

const carousel = document.querySelector(".main-listing");

let isDragging = false;
let startX, startY, startScrollLeft, startScrollTop;

carousel.addEventListener("mousedown", (event) => {
  // Get the initial mouse position and initial scroll position.
  startX = event.clientX;
  startY = event.clientY;
  startScrollLeft = carousel.scrollLeft;
  startScrollTop = carousel.scrollTop;

  // Set the cursor to `grabbing`.
  carousel.style.cursor = "grabbing";

  isDragging = true;

  // Start listening for the mousemove event.
  document.addEventListener("mousemove", handleMouseMove);
});

const handleMouseMove = (event) => {
  if (!isDragging) return;

  // Calculate the difference between the current mouse position and the initial mouse position.
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;

  // Scroll the carousel by the difference.
  carousel.scrollLeft = startScrollLeft - deltaX; // Note: It should be -= instead of += for a natural drag effect
  carousel.scrollTop = startScrollTop - deltaY;
};

// Stop listening for the mousemove event when the mouse is released.
document.addEventListener("mouseup", () => {
  if (!isDragging) return;

  isDragging = false;

  document.removeEventListener("mousemove", handleMouseMove);
  carousel.style.cursor = "grab";
});

navButtonNearby.addEventListener("click", (event) => {
  event.preventDefault();

  processCategory(Category.Nearby);
});

// GEOLOCATION
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      lat = position.coords.latitude;
      long = position.coords.longitude;
    },
    function (error) {
      console.error("Error occurred: " + error.message);
    },
    {
      enableHighAccuracy: true, // This will attempt to get a more accurate location
      timeout: 5000, // Maximum time to wait for a location result (in milliseconds)
      maximumAge: 0, // Accept the last-known cached position up to this age (in milliseconds)
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// Initialization
processCategory(Category.Nearby);
initilizeApplication();
