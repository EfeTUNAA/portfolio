(() => {
    "use strict";
    let initialized = false;

    function showToast(type, title, message) {
        const toast = document.getElementById("toast");
        if (!toast) return;
        const titleElement = document.getElementById("toast-title");
        const messageElement = document.getElementById("toast-message");
        const iconElement = document.getElementById("toast-icon");
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (iconElement) iconElement.textContent = type === "success" ? "✓" : "!";
        toast.setAttribute("role", type === "success" ? "status" : "alert");
        toast.setAttribute("aria-live", type === "success" ? "polite" : "assertive");
        toast.classList.add("active");
        window.clearTimeout(toast._hideTimer);
        toast._hideTimer = window.setTimeout(() => toast.classList.remove("active"), 4000);
    }

    function initContactForm() {
        const form = document.getElementById("contact-form");
        const submitButton = document.getElementById("submit-btn");
        if (!form || !submitButton || form.dataset.ajaxInitialized === "true") return;
        form.dataset.ajaxInitialized = "true";
        const originalButtonHtml = submitButton.innerHTML;
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            submitButton.disabled = true;
            submitButton.setAttribute("aria-busy", "true");
            submitButton.innerHTML = '<span class="inline-flex items-center gap-3"><span aria-hidden="true" class="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span><span>Gönderiliyor...</span></span>';
            try {
                const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
                if (!response.ok) throw new Error(`Form gönderilemedi (${response.status})`);
                form.reset();
                const english = document.documentElement.lang === "en";
                showToast("success", english ? "Message sent" : "Mesaj gönderildi", english ? "I will get back to you as soon as possible." : "En kısa sürede sizinle iletişime geçeceğim.");
            } catch (error) {
                console.error("Contact form:", error);
                const english = document.documentElement.lang === "en";
                showToast("error", english ? "Could not send" : "Gönderilemedi", english ? "Please try again." : "Lütfen tekrar deneyin.");
            } finally {
                submitButton.disabled = false;
                submitButton.removeAttribute("aria-busy");
                submitButton.innerHTML = originalButtonHtml;
                window.TunaLanguage?.setLanguage(document.documentElement.lang);
            }
        });
    }

    function initSmoothScroll() {
        document.addEventListener("click", (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (!link) return;
            const href = link.getAttribute("href");
            if (!href || href === "#") return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        });
    }

    function initReveal() {
        const elements = [...document.querySelectorAll(".reveal, .glass-card")];
        if (!elements.length) return;
        if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            elements.forEach((element) => element.classList.add("active", "opacity-100", "translate-y-0"));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("active", "opacity-100", "translate-y-0");
                entry.target.classList.remove("opacity-0", "translate-y-10");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
        elements.forEach((element) => observer.observe(element));
    }

    function initLazyBackgrounds() {
        const elements = [...document.querySelectorAll("[data-bg-src]")];
        if (!elements.length) return;
        const load = (element) => {
            if (element.dataset.bgLoaded === "true") return;
            element.style.backgroundImage = `url("${element.dataset.bgSrc}")`;
            element.dataset.bgLoaded = "true";
        };
        if (!("IntersectionObserver" in window)) { elements.forEach(load); return; }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) { load(entry.target); observer.unobserve(entry.target); } });
        }, { rootMargin: "400px 0px" });
        elements.forEach((element) => observer.observe(element));
    }

    function initHeroGlow() {
        if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const glow = document.querySelector(".hero-glow");
        if (!glow) return;
        let frame = 0, x = 0, y = 0;
        document.addEventListener("pointermove", (event) => {
            x = (event.clientX - window.innerWidth / 2) / 25;
            y = (event.clientY - window.innerHeight / 2) / 25;
            if (frame) return;
            frame = requestAnimationFrame(() => { glow.style.transform = `translate3d(${x}px, ${y}px, 0)`; frame = 0; });
        }, { passive: true });
    }

    function init() {
        initContactForm();
        if (initialized) return;
        initialized = true;
        initSmoothScroll();
        initReveal();
        initLazyBackgrounds();
        initHeroGlow();
    }

    window.TunaMain = { init, showToast };
})();
