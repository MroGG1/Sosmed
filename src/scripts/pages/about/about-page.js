export default class AboutPage {
  async render() {
    return `
      <section class="container about-container">
        <h1 style="text-align: center; margin-bottom: 30px;">Tentang Sosmed</h1>

        <article class="about-section">
          <h2>Apa itu Sosmed?</h2>
          <p>Sosmed adalah platform sederhana yang memungkinkan Anda berbagi momen dan cerita visual dengan mudah. Abadikan pengalaman Anda melalui foto, tambahkan deskripsi, dan tandai lokasi di peta untuk berbagi dengan komunitas.</p>
        </article>

        <article class="about-section">
          <h2>Fitur Utama</h2>
          <ul>
            <li>Unggah cerita dengan foto dan deskripsi.</li>
            <li>Tambahkan geotag (lokasi) pada cerita Anda.</li>
            <li>Lihat feed cerita dari pengguna lain.</li>
            <li>Visualisasikan lokasi cerita di peta interaktif.</li>
            <li>Autentikasi pengguna (Registrasi & Login).</li>
          </ul>
        </article>

        <article class="about-section">
          <h2>Dikembangkan Oleh</h2>
          <p>Aplikasi Sosmed ini dikembangkan oleh <strong>Saya sendiri</strong> sebagai Proyek Pembelajaran Web Intermediate.</p>
          </article>

        <article class="about-section">
          <h2>Teknologi & Sumber</h2>
          <p>Aplikasi ini memanfaatkan beberapa teknologi hebat:</p>
          <ul>
            <li>Vanilla JavaScript (ES6+)</li>
            <li>Webpack (Bundler)</li>
            <li>Leaflet & OpenStreetMap Contributors (Peta)</li>
            <li><a href="https://story-api.dicoding.dev/" target="_blank" rel="noopener noreferrer">Story API</a> (disediakan oleh Dicoding)</li>
            <li>SweetAlert2 (Notifikasi)</li>
            <li>HTML5 & CSS3</li>
          </ul>
        </article>
      </section>
    `;
  }

  async afterRender() {
    console.log("About page rendered");
  }
}
