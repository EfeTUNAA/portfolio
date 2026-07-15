(() => {
    "use strict";

    function showToast(type, title, message) {
        const toast = document.getElementById("toast");
        if (!toast) return;

        const titleElement = document.getElementById("toast-title");
        const messageElement = document.getElementById("toast-message");
        const iconElement = document.getElementById("toast-icon");

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (iconElement) iconElement.textContent = type === "success" ? "✓" : "!";

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
            submitButton.innerHTML = '<span class="inline-flex items-center gap-3"><span class="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span><span>Gönderiliyor...</span></span>';

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" }
                });

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
                submitButton.innerHTML = originalButtonHtml;
                window.TunaLanguage?.setLanguage(document.documentElement.lang);
            }
        });
    }

    function initReveal() {
        if (!("IntersectionObserver" in window)) return;
        const elements = document.querySelectorAll(".reveal");
        if (!elements.length) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            elements.forEach((element) => element.classList.add("active"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        elements.forEach((element) => observer.observe(element));
    }

    function init() {
        initContactForm();
        initReveal();
    }

    window.TunaMain = { init, showToast };
})();
