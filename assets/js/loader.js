document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();
});

async function loadNavbar() {
    const container = document.getElementById("navbar-container");

    if (!container) return;

    // Sayfanın proje klasöründe olup olmadığını kontrol et
    const isProjectPage = window.location.pathname.includes("/projects/");

    // Doğru component ve asset yolu
    const navbarPath = isProjectPage
        ? "../assets/components/navbar-project.html"
        : "assets/components/navbar-home.html";

    try {
        const response = await fetch(navbarPath);

        if (!response.ok) {
            throw new Error(`Navbar yüklenemedi (${response.status})`);
        }

        container.innerHTML = await response.text();

        console.log("✅ Navbar yüklendi");

        // Sonraki adımda buraya initNavbar() ve initLanguage() gelecek.

    } catch (error) {
        console.error("❌", error);
    }
}