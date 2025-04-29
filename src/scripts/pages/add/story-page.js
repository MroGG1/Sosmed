import { addNewStory } from "../../data/api";
import L from "leaflet";
import Swal from "sweetalert2";

export default class AddStoryPage {
  #map = null;
  #locationMarker = null;
  #selectedCoords = null;
  #videoStream = null;
  #capturedBlob = null;

  #videoElement = null;
  #canvasElement = null;
  #captureButton = null;
  #imagePreview = null;
  #previewPlaceholder = null;
  #descriptionInput = null;
  #locationMapElement = null;
  #selectedCoordsElement = null;
  #addStoryForm = null;
  #submitButton = null;
  #errorMessageElement = null;
  #successMessageElement = null;

  async render() {
    return `
      <section class="container add-story-container">
        <h1>Add New Story</h1>
        <form id="addStoryForm" class="add-story-form">

          <div class="form-grid">

            <fieldset class="form-section camera-section">
              <legend>1. Take Picture</legend>
              <div class="camera-area">
                <video id="cameraVideo" autoplay playsinline></video>
                <canvas id="cameraCanvas" style="display:none;"></canvas>
                <button type="button" id="captureButton" class="btn btn-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-fill" viewBox="0 0 16 16"><path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"/></svg>
                  Capture Photo
                </button>
              </div>
              <div class="preview-area">
                <img id="imagePreview" src="#" alt="Captured Image Preview" style="display: none;"/>
                <p id="previewPlaceholder" style="display: block;">Image preview will appear here</p>
              </div>WW
            </fieldset>

            <div class="details-location-section">
              <fieldset class="form-section">
                <legend>2. Story Details</legend>
                <div class="form-group">
                  <label for="storyDescription">Description:</label>
                  <textarea id="storyDescription" name="description" rows="5" required placeholder="Write your story description..."></textarea>
                </div>
              </fieldset>

              <fieldset class="form-section location-section">
                <legend>3. Location (Optional)</legend>
                 <label>Select Location (Click on Map):</label>
                 <div id="locationMap"></div>
                 <p class="coords-display">Selected Coordinates: <span id="selectedCoords">None</span></p>
              </fieldset>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" id="submitStoryButton" class="btn btn-gradient">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cloud-upload-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.99 10.69 0 8 0m-.354 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.793V11.5a.5.5 0 0 0-1 0v3.293l-2.146-2.147a.5.5 0 0 0-.708.708z"/></svg>
                Upload Story
            </button>
            <p id="add-story-error" class="error-message"></p>
            <p id="add-story-success" class="success-message"></p>
          </div>

        </form>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to add a story.");
      window.location.hash = "#/login";
      return;
    }

    this.#videoElement = document.querySelector("#cameraVideo");
    this.#canvasElement = document.querySelector("#cameraCanvas");
    this.#captureButton = document.querySelector("#captureButton");
    this.#imagePreview = document.querySelector("#imagePreview");
    this.#previewPlaceholder = document.querySelector("#previewPlaceholder");
    this.#descriptionInput = document.querySelector("#storyDescription");
    this.#locationMapElement = document.querySelector("#locationMap");
    this.#selectedCoordsElement = document.querySelector("#selectedCoords");
    this.#addStoryForm = document.querySelector("#addStoryForm");
    this.#submitButton = document.querySelector("#submitStoryButton");
    this.#errorMessageElement = document.querySelector("#add-story-error");
    this.#successMessageElement = document.querySelector("#add-story-success");

    if (
      !this.#videoElement ||
      !this.#canvasElement ||
      !this.#captureButton ||
      !this.#imagePreview ||
      !this.#previewPlaceholder ||
      !this.#descriptionInput ||
      !this.#locationMapElement ||
      !this.#selectedCoordsElement ||
      !this.#addStoryForm ||
      !this.#submitButton ||
      !this.#errorMessageElement ||
      !this.#successMessageElement
    ) {
      console.error("One or more elements for AddStoryPage not found.");
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "src"
        ) {
          const currentSrc = this.#imagePreview.getAttribute("src");
          if (currentSrc && currentSrc !== "#") {
            this.#imagePreview.style.display = "block";
            this.#previewPlaceholder.style.display = "none";
          } else {
            this.#imagePreview.style.display = "none";
            this.#previewPlaceholder.style.display = "block";
          }
        }
      });
    });
    observer.observe(this.#imagePreview, {
      attributes: true,
      attributeFilter: ["src"],
    });

    const initialSrc = this.#imagePreview.getAttribute("src");
    if (initialSrc && initialSrc !== "#") {
      this.#imagePreview.style.display = "block";
      this.#previewPlaceholder.style.display = "none";
    } else {
      this.#imagePreview.style.display = "none";
      this.#previewPlaceholder.style.display = "block";
    }

    this._initCamera();
    this._initLocationMap();
    this._setupFormSubmit(token);
    window.addEventListener("hashchange", this._cleanupCameraOnNavigate, {
      once: true,
    });
  }

  async _initCamera() {
    if (
      !this.#videoElement ||
      !this.#captureButton ||
      !this.#imagePreview ||
      !this.#canvasElement ||
      !this.#errorMessageElement
    )
      return;

    this.#captureButton.disabled = true;
    try {
      this.#videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.#videoElement.srcObject = this.#videoStream;
      this.#videoElement.style.backgroundColor = "transparent";
      this.#captureButton.disabled = false;

      this.#captureButton.onclick = () => {
        if (!this.#videoElement.videoWidth || !this.#videoElement.videoHeight) {
          console.error("Video dimensions not available yet.");
          this.#errorMessageElement.textContent =
            "Kamera belum siap, coba sesaat lagi.";
          return;
        }
        this.#canvasElement.width = this.#videoElement.videoWidth;
        this.#canvasElement.height = this.#videoElement.videoHeight;
        const context = this.#canvasElement.getContext("2d");
        context.drawImage(
          this.#videoElement,
          0,
          0,
          this.#canvasElement.width,
          this.#canvasElement.height
        );

        this.#canvasElement.toBlob((blob) => {
          console.log("Blob created:", blob);
          if (blob) {
            this.#capturedBlob = blob;
            const objectURL = URL.createObjectURL(blob);
            console.log("Object URL created:", objectURL);
            this.#imagePreview.src = objectURL;
            console.log("Photo captured (blob exists)");
            this.#errorMessageElement.textContent = "";
          } else {
            console.error("Failed to create blob from canvas.");
            this.#errorMessageElement.textContent =
              "Gagal mengambil foto. Silakan coba lagi.";
          }
        }, "image/jpeg");
      };
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        `Error accessing camera: ${error.message}. Pastikan Anda memberikan izin dan menggunakan HTTPS.`
      );
      if (this.#videoElement) this.#videoElement.style.backgroundColor = "#ccc";
      if (this.#captureButton) this.#captureButton.disabled = true;
    }
  }

  _cleanupCamera() {
    if (this.#videoStream) {
      this.#videoStream.getTracks().forEach((track) => track.stop());
      this.#videoStream = null;
      console.log("Camera stream stopped.");
      if (this.#videoElement) this.#videoElement.srcObject = null;
      if (this.#imagePreview && this.#imagePreview.src.startsWith("blob:")) {
        URL.revokeObjectURL(this.#imagePreview.src);
        console.log("Revoked Object URL:", this.#imagePreview.src);
        this.#imagePreview.src = "#";
      }
      this.#capturedBlob = null;
    }
  }

  _cleanupCameraOnNavigate() {
    this._cleanupCamera();
    window.removeEventListener("hashchange", this._cleanupCameraOnNavigate);
    console.log("Hashchange listener for camera cleanup removed.");
  }

  _initLocationMap() {
    if (!this.#locationMapElement || !this.#selectedCoordsElement) return;

    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }

    const defaultCoords = [-6.2088, 106.8456];
    const defaultZoom = 11;

    this.#map = L.map(this.#locationMapElement, {}).setView(
      defaultCoords,
      defaultZoom
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", (e) => {
      this.#selectedCoords = e.latlng;
      const coordsText = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(
        6
      )}`;
      this.#selectedCoordsElement.textContent = coordsText;

      if (this.#locationMarker) {
        this.#map.removeLayer(this.#locationMarker);
      }
      this.#locationMarker = L.marker(e.latlng)
        .addTo(this.#map)
        .bindPopup(`Selected Location: ${coordsText}`)
        .openPopup();

      console.log("Location selected:", this.#selectedCoords);
    });

    setTimeout(() => {
      if (this.#map) {
        this.#map.invalidateSize();
      }
    }, 100);
  }
  _setupFormSubmit(token) {
    if (
      !this.#addStoryForm ||
      !this.#descriptionInput ||
      !this.#submitButton ||
      !this.#errorMessageElement ||
      !this.#successMessageElement ||
      !this.#selectedCoordsElement ||
      !this.#imagePreview
    )
      return;

    this.#addStoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.#errorMessageElement.textContent = "";
      this.#successMessageElement.textContent = "";
      this.#submitButton.disabled = true;
      this.#submitButton.textContent = "Uploading...";

      const description = this.#descriptionInput.value;
      const photo = this.#capturedBlob;
      const lat = this.#selectedCoords ? this.#selectedCoords.lat : undefined;
      const lon = this.#selectedCoords ? this.#selectedCoords.lng : undefined;

      if (!description || !photo) {
        Swal.fire({
          title: "Input Tidak Lengkap",
          text: "Deskripsi dan foto (hasil capture) tidak boleh kosong.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        this.#submitButton.disabled = false;
        this.#submitButton.textContent = "Upload Story";
        return;
      }

      const storyData = {
        description,
        photo,
        ...(lat !== undefined && { lat }),
        ...(lon !== undefined && { lon }),
      };

      try {
        console.log("Submitting story with data:", {
          description: storyData.description,
          photo: storyData.photo ? "[Blob]" : "null",
          lat: storyData.lat,
          lon: storyData.lon,
        });
        const result = await addNewStory(token, storyData);

        console.log("Add story successful:", result);
        Swal.fire({
          title: "Upload Berhasil!",
          text: "Cerita Anda telah berhasil diupload.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.hash = "#/";
        });

        this._resetFormState();
        this._cleanupCamera();
      } catch (error) {
        Swal.fire({
          title: "Upload Gagal",
          text: error.message || "Terjadi kesalahan saat mengupload cerita.",
          icon: "error",
          confirmButtonText: "OK",
        });
        this.#submitButton.disabled = false;
        this.#submitButton.textContent = "Upload Story";
      }
    });
  }

  _resetFormState() {
    if (this.#addStoryForm) this.#addStoryForm.reset();
    this.#capturedBlob = null;
    this.#selectedCoords = null;
    if (this.#selectedCoordsElement)
      this.#selectedCoordsElement.textContent = "None";
    if (this.#imagePreview && this.#imagePreview.src.startsWith("blob:")) {
      URL.revokeObjectURL(this.#imagePreview.src);
      this.#imagePreview.src = "#";
    } else if (this.#imagePreview) {
      this.#imagePreview.src = "#";
    }
    if (this.#map && this.#locationMarker) {
      this.#map.removeLayer(this.#locationMarker);
      this.#locationMarker = null;
    }
  }

  constructor() {
    this._cleanupCameraOnNavigate = this._cleanupCameraOnNavigate.bind(this);
  }
}
