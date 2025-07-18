import "leaflet/dist/leaflet.css";
import "sweetalert2/dist/sweetalert2.min.css";

import "../styles/base/global.css";
import "../styles/layout/header.css";
import "../styles/layout/navigation.css";

import "../styles/components/button.css";
import "../styles/components/auth-form.css";
import "../styles/components/story-item.css";
import "../styles/components/map.css";
import "../styles/components/loading.css";

import "../styles/pages/add-story.css";
import "../styles/pages/detail-story.css";
import "../styles/pages/about.css";

import "../styles/utils/responsive.css";

import L from "leaflet";
import Swal from "sweetalert2";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

import App from "./pages/app";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
