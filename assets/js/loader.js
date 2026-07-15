(() => {
    "use strict";

    const VERSION = "20260715-3";
    const COMPONENTS = {
        home: { navbar: "assets/components/navbar-home.html", footer: "assets/components/footer.html", home: "./index.html", logo: "assets/images/logo.webp" },
        project: { navbar: "../assets/components/navbar-project.html", footer: "../assets/components/footer.html", home: "../index.html", logo: "../assets/images/logo.webp" }
    };

    async function fetchComponent(path, name) {
        const url = new URL(path, document.baseURI);
        url.searchParams.set("v", VERSION);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${name} yüklenemedi (${response.status}): ${url.pathname}`);
        return response.text();
    }

    async function loadInto(container, path, name) {
        if (!container) return false;
        if (container.dataset.componentLoaded === "true") return true;
        container.dataset.componentStatus = "loading";
        container.innerHTML = await fetchComponent(path, name);
        container.dataset.componentLoaded = "true";
        container.dataset.componentStatus = "ready";
        return true;
    }

    function configureFooter(type) {
        const config = COMPONENTS[type];
        const footer = document.getElementById("footer-container");
        if (!footer) return;
        footer.querySelectorAll(".js-home-link").forEach((link) => link.href = config.home);
        footer.querySelectorAll(".js-home-section").forEach((link) => link.href = `${config.home}#${link.dataset.section}`);
        footer.querySelectorAll("[data-footer-logo]").forEach((image) => image.src = config.logo);
        footer.querySelectorAll("[data-current-year]").forEach((element) => element.textContent = String(new Date().getFullYear()));
    }

    async function loadNavbar(type) {
        const container = document.getElementById("navbar-container");
        if (!container) return false;
        try {
            await loadInto(container, COMPONENTS[type].navbar, "Navbar");
            window.TunaNavbar?.init();
            window.TunaLanguage?.init();
            return true;
        } catch (error) {
            console.error("Tuna navbar loader:", error);
            container.dataset.componentStatus = "error";
            if (!container.innerHTML.trim()) container.innerHTML = '<div role="alert" class="fixed top-0 left-0 right-0 z-50 bg-red-950/95 text-white px-4 py-3 text-center">Navigasyon yüklenemedi.</div>';
            return false;
        }
    }

    async function loadFooter(type) {
        const container = document.getElementById("footer-container");
        if (!container) return false;
        try {
            await loadInto(container, COMPONENTS[type].footer, "Footer");
            configureFooter(type);
            window.TunaLanguage?.init();
            return true;
        } catch (error) {
            console.error("Tuna footer loader:", error);
            container.dataset.componentStatus = "error";
            return false;
        }
    }

    async function initComponents() {
        const navbarContainer = document.getElementById("navbar-container");
        const type = navbarContainer?.dataset.navbar === "project" ? "project" : "home";
        window.TunaMain?.init();
        const [navbarLoaded, footerLoaded] = await Promise.all([loadNavbar(type), loadFooter(type)]);
        document.dispatchEvent(new CustomEvent("tuna:components-ready", { detail: { type, navbarLoaded, footerLoaded } }));
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initComponents, { once: true });
    else initComponents();
})();
