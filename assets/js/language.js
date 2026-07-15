(() => {
    "use strict";

    const fallbackTranslations = {
        tr: {
            "nav-work": "İşler",
            "nav-services": "Hizmetler",
            "nav-about": "Hakkımda",
            "nav-contact": "İletişim",
            "nav-cta": "Hadi Konuşalım",
            "footer-tagline": "Modern, hızlı ve dönüşüm odaklı web deneyimleri.",
            "footer-rights": "Tüm hakları saklıdır.",
            "skip-content": "Ana içeriğe geç"
        },
        en: {
            "nav-work": "Work",
            "nav-services": "Services",
            "nav-about": "About",
            "nav-contact": "Contact",
            "nav-cta": "Let's Talk",
            "footer-tagline": "Modern, fast, conversion-focused web experiences.",
            "footer-rights": "All rights reserved.",
            "skip-content": "Skip to main content"
        }
    };

    function getPageTranslations() {
        try {
            return typeof translations === "object" && translations ? translations : {};
        } catch {
            return {};
        }
    }

    function getDictionary(lang) {
        return {
            ...fallbackTranslations[lang],
            ...(getPageTranslations()[lang] || {})
        };
    }

    function updateI18n(lang) {
        const dictionary = getDictionary(lang);

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const value = dictionary[element.dataset.i18n];
            if (typeof value === "string") element.innerHTML = value;
        });

        const placeholders = dictionary.placeholders || {};
        document.querySelectorAll("[data-placeholder]").forEach((element) => {
            const value = placeholders[element.dataset.placeholder];
            if (typeof value === "string") element.placeholder = value;
        });
    }

    function updateLegacyContent(lang) {
        document.querySelectorAll(".lang-tr").forEach((element) => {
            element.hidden = lang !== "tr";
        });
        document.querySelectorAll(".lang-en").forEach((element) => {
            element.hidden = lang !== "en";
        });

        document.querySelectorAll("[data-lang]").forEach((element) => {
            const active = element.dataset.lang === lang;
            element.hidden = !active;
            element.classList.toggle("active-lang-content", active);
        });

        document.querySelectorAll("[data-lang-content]").forEach((element) => {
            element.hidden = element.dataset.langContent !== lang;
        });

        document.querySelectorAll(".lang-content[data-tr][data-en]").forEach((element) => {
            const value = element.dataset[lang];
            if (typeof value === "string") element.innerHTML = value;
        });

        document.querySelectorAll("[data-placeholder-tr][data-placeholder-en]").forEach((element) => {
            element.placeholder = element.dataset[`placeholder${lang === "tr" ? "Tr" : "En"}`] || "";
        });
    }

    function updateButtons(lang) {
        document.querySelectorAll("[data-language]").forEach((button) => {
            const active = button.dataset.language === lang;
            button.classList.toggle("bg-primary-container", active);
            button.classList.toggle("text-white", active);
            button.classList.toggle("text-on-surface-variant", !active);
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function safeStorageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Depolama kapalıysa dil sistemi yine de mevcut sayfada çalışır.
        }
    }

    function safeStorageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function setLanguage(lang) {
        const normalized = lang === "en" ? "en" : "tr";
        document.documentElement.lang = normalized;
        safeStorageSet("preferred-language", normalized);
        safeStorageSet("preferred-lang", normalized);
        safeStorageSet("pref_lang", normalized);
        safeStorageSet("precizion-lang", normalized);

        updateI18n(normalized);
        updateLegacyContent(normalized);
        updateButtons(normalized);

        document.dispatchEvent(new CustomEvent("tuna:language-change", {
            detail: { lang: normalized }
        }));
    }

    function getSavedLanguage() {
        return safeStorageGet("preferred-language")
            || safeStorageGet("preferred-lang")
            || safeStorageGet("pref_lang")
            || safeStorageGet("precizion-lang")
            || document.documentElement.lang
            || "tr";
    }

    function init() {
        document.querySelectorAll("[data-language]").forEach((button) => {
            if (button.dataset.languageInitialized === "true") return;
            button.dataset.languageInitialized = "true";
            button.addEventListener("click", () => setLanguage(button.dataset.language));
        });
        setLanguage(getSavedLanguage());
    }

    window.TunaLanguage = { init, setLanguage };
})();
