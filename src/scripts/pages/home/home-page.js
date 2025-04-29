import { getAllStories } from "../../data/api";
import L from "leaflet";

export default class HomePage {
  #map = null;

  async render() {
    return `
      <section class="container">
        <h1>Maps</h1>
        <div id="map" style="height: 400px; width: 100%; margin-bottom: 20px;">
          </div>
        <h2>Story List</h2>
        <div id="stories-list" class="stories-list">
          </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesListElement = document.querySelector("#stories-list");
    storiesListElement.innerHTML = "<p>Loading stories...</p>";
    const token = localStorage.getItem("authToken");
    if (!token) {
      storiesListElement.innerHTML = `<p>Anda harus <a href="#/login">login</a> terlebih dahulu untuk melihat cerita.</p>`;
      const mapElement = document.querySelector("#map");
      if (mapElement) mapElement.style.display = "none";
      return;
    }

    this._initializeMap();

    try {
      const stories = await getAllStories(token);
      storiesListElement.innerHTML = "";

      if (stories && stories.length > 0) {
        stories.forEach((story) => {
          const storyItem = this._createStoryItemElement(story);
          storiesListElement.appendChild(storyItem);

          if (story.lat && story.lon) {
            this._addMarkerToMap(story);
            this._fetchAndDisplayLocationName(story.lat, story.lon, storyItem);
          }
        });
      } else {
        storiesListElement.innerHTML =
          "<p>Tidak ada cerita yang ditemukan.</p>";
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
      storiesListElement.innerHTML = `<p>Gagal memuat cerita: ${error.message}. Coba <a href="#/login">login</a> kembali.</p>`;
      if (this.#map) {
        this.#map.remove();
        this.#map = null;
        const mapElement = document.querySelector("#map");
        if (mapElement) mapElement.innerHTML = "<p>Gagal memuat peta.</p>";
      }
    }
  }

  _initializeMap() {
    const mapElement = document.querySelector("#map");

    if (!mapElement) {
      console.error("Map element not found in DOM for initialization.");
      return;
    }

    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }

    const defaultCoords = [-2.5489, 118.0149];
    const defaultZoom = 5;

    this.#map = L.map(mapElement, {
      scrollWheelZoom: false,
    }).setView(defaultCoords, defaultZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    setTimeout(() => {
      if (this.#map) {
        this.#map.invalidateSize();
      }
    }, 100);
  }
  _createStoryItemElement(story) {
    const storyItem = document.createElement("article");
    storyItem.classList.add("story-item");

    const createdAtDate = new Date(story.createdAt);
    const formattedDate = createdAtDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const locationText =
      story.lat && story.lon
        ? `<p class="story-location" data-lat="${story.lat}" data-lon="${story.lon}"><small> Mencari lokasi...</small></p>` // Placeholder
        : "";

    storyItem.innerHTML = `
    <a href="#/story/${story.id}" class="story-item-link-wrapper">
      <img src="${story.photoUrl}" alt="Foto oleh ${
      story.name
    }: ${story.description.substring(0, 50)}..." class="story-item-image">
    </a>
    <div class="story-content">
      <h3><a href="#/story/${story.id}">${story.name}</a></h3>
      <p class="story-date">${formattedDate}</p>
      <p>${story.description}</p>
      ${locationText}
    </div>
  `;
    if (story.lat && story.lon) {
      this._fetchAndDisplayLocationName(story.lat, story.lon, storyItem);
    }

    return storyItem;
  }

  async _fetchAndDisplayLocationName(lat, lon, storyItemElement) {
    const locationElement = storyItemElement.querySelector(".story-location");
    if (!locationElement) return;
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Nominatim API request failed: ${response.statusText}`);
      }
      const data = await response.json();
      let locationName =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state ||
        "Lokasi tidak dikenal";

      locationElement.innerHTML = `<small>Lokasi: ${locationName}</small>`;
    } catch (error) {
      console.error(`Failed to fetch location name for ${lat},${lon}:`, error);
      locationElement.innerHTML = `<small> Gagal memuat lokasi</small>`;
    }
  }

  _addMarkerToMap(story) {
    if (!this.#map) return;

    const marker = L.marker([story.lat, story.lon]).addTo(this.#map);

    const popupContent = `
      <div style="max-width: 200px;">
        <img src="${story.photoUrl}" alt="${
      story.name
    }" style="width:100%; height:auto; margin-bottom:5px;">
        <strong>${story.name}</strong>
        <p>${story.description.substring(0, 50)}...</p> </div>
    `;

    marker.bindPopup(popupContent);
  }
}
