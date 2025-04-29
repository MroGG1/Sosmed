import { login } from "../../data/api";
import Swal from "sweetalert2";

export default class LoginPage {
  async render() {
    return `
      <section class="container auth-page">
        <div class="auth-form-container">
          <div id="loginLoadingOverlay" class="loading-overlay">
            <div class="spinner"></div>
          </div>

          <div class="auth-header">
            <h2>Form Login</h2>
          </div>
          <div class="auth-body">
            <form id="loginFormPage">
              <div class="form-group">
                <label for="loginEmailPage" class="sr-only">Email:</label> 
                <input type="email" id="loginEmailPage" placeholder="Masukan Email" required aria-label="Email">
              </div>
              <div class="form-group">
                 <label for="loginPasswordPage" class="sr-only">Password:</label> 
                <input type="password" id="loginPasswordPage" placeholder="Masukan Password" required aria-label="Password">
              </div>
              <div class="form-options">
                 <div class="form-check">
                     <input type="checkbox" id="rememberMePage">
                     <label for="rememberMePage">Ingatkan saya</label>
                 </div>
                 <a href="#" class="forgot-password">Lupa password?</a>
              </div>
              <button type="submit" class="btn btn-gradient">Login</button>
              <p id="loginErrorPage" class="error-message"></p>
            </form>
          </div>
          <div class="auth-footer">
            <p>Belum menjadi anggota? <a href="#/register">Daftar Sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector("#loginFormPage");
    if (!loginForm) {
      console.error("Login form not found.");
      return;
    }

    const emailInput = loginForm.querySelector("#loginEmailPage");
    const passwordInput = loginForm.querySelector("#loginPasswordPage");
    const errorElement = loginForm.querySelector("#loginErrorPage");
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const loadingOverlay = document.querySelector("#loginLoadingOverlay");

    if (
      !emailInput ||
      !passwordInput ||
      !errorElement ||
      !submitButton ||
      !loadingOverlay
    ) {
      console.error(
        "One or more login form elements (including overlay) not found."
      );
      return;
    }

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;
      errorElement.textContent = "";

      submitButton.disabled = true;
      loadingOverlay.classList.add("visible");

      if (!email || !password) {
        errorElement.textContent = "Email dan Password tidak boleh kosong.";
        submitButton.disabled = false;
        loadingOverlay.classList.remove("visible");
        return;
      }

      try {
        const loginResult = await login({ email, password });

        localStorage.setItem("authToken", loginResult.token);
        localStorage.setItem("authName", loginResult.name);
        localStorage.setItem("authUserId", loginResult.userId);

        Swal.fire({
          title: "Login Berhasil!",
          text: `Selamat datang kembali, ${loginResult.name}!`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.hash = "#/";
        });
      } catch (error) {
        console.error("Login error:", error);
        Swal.fire({
          title: "Login Gagal",
          text: error.message || "Terjadi kesalahan saat login.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        submitButton.disabled = false;
        loadingOverlay.classList.remove("visible");
      }
    });
  }
}
