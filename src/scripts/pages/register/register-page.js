import { register } from "../../data/api";
import Swal from "sweetalert2";

export default class RegisterPage {
  async render() {
    return `
      <section class="container auth-page">
        <div class="auth-form-container">
           <div class="auth-header">
             <h2>Form Registrasi</h2>
           </div>
           <div class="auth-body">
             <form id="registerFormPage">
               <div class="form-group">
                 
                 <label for="registerNamePage" class="sr-only">Name:</label>
                 <input type="text" id="registerNamePage" placeholder="Masukan Nama" required aria-label="Name">
               </div>
               <div class="form-group">
                 
                 <label for="registerEmailPage" class="sr-only">Email:</label>
                 <input type="email" id="registerEmailPage" placeholder="Masukan Email" required aria-label="Email">
               </div>
               <div class="form-group">
                
                 <label for="registerPasswordPage" class="sr-only">Password:</label>
                 <input type="password" id="registerPasswordPage" placeholder="Masukan Password (min. 8 karakter)" required minlength="8" aria-label="Password">
               </div>
               <button type="submit" class="btn btn-gradient">Register</button>
               <p id="registerErrorPage" class="error-message"></p>
             </form>
           </div>
           <div class="auth-footer">
              <p>Sudah punya akun? <a href="#/login">Login Sekarang</a></p>
           </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.querySelector("#registerFormPage");
    if (!registerForm) {
      console.error("Register form not found.");
      return;
    }
    const nameInput = registerForm.querySelector("#registerNamePage");
    const emailInput = registerForm.querySelector("#registerEmailPage");
    const passwordInput = registerForm.querySelector("#registerPasswordPage");
    const errorElement = registerForm.querySelector("#registerErrorPage");
    const submitButton = registerForm.querySelector('button[type="submit"]');

    if (
      !nameInput ||
      !emailInput ||
      !passwordInput ||
      !errorElement ||
      !submitButton
    ) {
      console.error(
        "One or more register form elements not found inside the form."
      );
      return;
    }

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      errorElement.textContent = "";

      submitButton.disabled = true;
      submitButton.textContent = "Registering...";

      if (!name || !email || !password) {
        errorElement.textContent =
          "Nama, Email, dan Password tidak boleh kosong.";
        submitButton.disabled = false;
        submitButton.textContent = "Register";
        return;
      }
      if (password.length < 8) {
        errorElement.textContent = "Password minimal harus 8 karakter.";
        submitButton.disabled = false;
        submitButton.textContent = "Register";
        return;
      }

      try {
        await register({ name, email, password });
        Swal.fire({
          title: "Registrasi Berhasil!",
          text: "Akun Anda telah dibuat. Silakan login.",
          icon: "success",
          confirmButtonText: "Menuju Login",
        }).then((result) => {
          if (
            result.isConfirmed ||
            result.dismiss === Swal.DismissReason.timer
          ) {
            window.location.hash = "#/login";
          }
        });
      } catch (error) {
        console.error("Register error:", error);
        Swal.fire({
          title: "Registrasi Gagal",
          text: error.message || "Terjadi kesalahan saat registrasi.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Register";
      }
    });
  }
}
