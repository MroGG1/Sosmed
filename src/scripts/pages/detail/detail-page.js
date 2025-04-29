import { getStoryDetail } from "../../data/api";
import { parseActivePathname } from "../../routes/url-parser";
import { showFormattedDate } from "../../utils";
import L from "leaflet";
import Swal from "sweetalert2";

export default class DetailPage {
  #storyDetailContainer = null;
  #map = null;
  #story = null;

  async render() {
    return `
      <section class="container detail-page-container">
        <h1>Detail Cerita</h1>
        <div id="storyDetailContainer" class="story-detail-content">
          <p>Memuat detail cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#storyDetailContainer = document.querySelector(
      "#storyDetailContainer"
    );
    if (!this.#storyDetailContainer) {
      console.error("Story detail container not found!");
      return;
    }

    const urlParams = parseActivePathname();
    const storyId = urlParams.id;
    const token = localStorage.getItem("authToken");

    if (!storyId) {
      this.#storyDetailContainer.innerHTML =
        '<p class="error-message">ID Cerita tidak ditemukan di URL.</p>';
      return;
    }

    if (!token) {
      this.#storyDetailContainer.innerHTML =
        '<p class="error-message">Anda harus login untuk melihat detail cerita.</p>';
      return;
    }

    try {
      this.#story = await getStoryDetail(token, storyId);
      this._renderStoryDetails();
    } catch (error) {
      console.error("Failed to fetch story detail:", error);
      Swal.fire({
        title: "Gagal Memuat Cerita",
        text: error.message || "Terjadi kesalahan saat mengambil data cerita.",
        icon: "error",
        confirmButtonText: "OK",
      });
      this.#storyDetailContainer.innerHTML = `<p class="error-message">Gagal memuat detail cerita: ${error.message}</p>`;
    }
  }

  _renderStoryDetails() {
    if (!this.#story || !this.#storyDetailContainer) return;

    const { name, description, photoUrl, createdAt, lat, lon } = this.#story;
    const formattedDate = showFormattedDate(createdAt, "id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    this.#storyDetailContainer.innerHTML = `
      <img src="${photoUrl}" alt="Foto oleh ${name}" class="story-detail-image">
      <div class="story-detail-info">
        <h2>${name}</h2>
        <p class="story-detail-date">Diupload pada: ${formattedDate}</p>
        <p class="story-detail-description">${description}</p>
        ${
          lat && lon
            ? '<div id="detailMap" class="story-detail-map"></div><p>Lokasi:</p>'
            : "<p>Tidak ada data lokasi.</p>"
        }
      </div>
    `;
    if (lat && lon) {
      setTimeout(() => {
        this._initDetailMap(lat, lon);
      }, 0);
    }
  }

  _initDetailMap(lat, lon) {
    const mapElement = document.querySelector("#detailMap");
    if (!mapElement) {
      console.error("Detail map element not found!");
      return;
    }
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }

    this.#map = L.map(mapElement, {
      scrollWheelZoom: false,
    }).setView([lat, lon], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    L.marker([lat, lon])
      .addTo(this.#map)
      .bindPopup(`Lokasi cerita oleh ${this.#story.name}`)
      .openPopup();
    setTimeout(() => {
      if (this.#map) {
        this.#map.invalidateSize();
      }
    }, 100);
  }
}
