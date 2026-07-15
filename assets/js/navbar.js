(() => {
    "use strict";

    let activeController = null;
    let restoreScroll = null;

    function lockPageScroll() {
        if (restoreScroll) return;

        const scrollY = window.scrollY;
        const previous = {
            htmlOverflow: document.documentElement.style.overflow,
            bodyOverflow: document.body.style.overflow,
            bodyPosition: document.body.style.position,
            bodyTop: document.body.style.top,
            bodyWidth: document.body.style.width
        };

        document.documentElement.classList.add("tuna-menu-open");
        document.body.classList.add("tuna-menu-open");
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        restoreScroll = () => {
            document.documentElement.classList.remove("tuna-menu-open");
            document.body.classList.remove("tuna-menu-open");
            document.documentElement.style.overflow = previous.htmlOverflow;
            document.body.style.overflow = previous.bodyOverflow;
            document.body.style.position = previous.bodyPosition;
            document.body.style.top = previous.bodyTop;
            document.body.style.width = previous.bodyWidth;
            window.scrollTo(0, scrollY);
            restoreScroll = null;
        };
    }

    function unlockPageScroll() {
        restoreScroll?.();
    }

    function init() {
        activeController?.abort();
        activeController = new AbortController();

        const { signal } = activeController;
        const button = document.getElementById("mobile-menu-btn");
        const menu = document.getElementById("mobile-menu");
        const openIcon = document.getElementById("menu-open-icon");
        const closeIcon = document.getElementById("menu-close-icon");

        if (!button || !menu || !openIcon || !closeIcon) {
            unlockPageScroll();
            return;
        }

        let open = false;
        const mobileQuery = window.matchMedia("(max-width: 1023px)");

        function setOpen(nextOpen, options = {}) {
            const shouldOpen = Boolean(nextOpen) && mobileQuery.matches;
            open = shouldOpen;

            menu.classList.toggle("is-open", shouldOpen);
            menu.dataset.state = shouldOpen ? "open" : "closed";
            menu.setAttribute("aria-hidden", String(!shouldOpen));
            menu.inert = !shouldOpen;

            button.setAttribute("aria-expanded", String(shouldOpen));
            button.setAttribute("aria-label", shouldOpen ? "Menüyü kapat" : "Menüyü aç");

            openIcon.hidden = shouldOpen;
            closeIcon.hidden = !shouldOpen;

            if (shouldOpen) {
                lockPageScroll();
                if (options.focusFirst) {
                    window.requestAnimationFrame(() => {
                        menu.querySelector(".mobile-link")?.focus({ preventScroll: true });
                    });
                }
            } else {
                unlockPageScroll();
                if (options.returnFocus) {
                    button.focus({ preventScroll: true });
                }
            }
        }

        button.dataset.navbarInitialized = "true";

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(!open);
        }, { signal });

        menu.querySelectorAll(".mobile-link").forEach((link) => {
            link.addEventListener("click", () => setOpen(false), { signal });
        });

        document.addEventListener("pointerdown", (event) => {
            if (!open) return;
            if (menu.contains(event.target) || button.contains(event.target)) return;
            setOpen(false);
        }, { signal, passive: true });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && open) {
                event.preventDefault();
                setOpen(false, { returnFocus: true });
            }
        }, { signal });

        const handleViewportChange = () => {
            if (!mobileQuery.matches && open) setOpen(false);
        };

        if (typeof mobileQuery.addEventListener === "function") {
            mobileQuery.addEventListener("change", handleViewportChange, { signal });
        } else {
            window.addEventListener("resize", handleViewportChange, { signal, passive: true });
        }

        window.addEventListener("orientationchange", handleViewportChange, { signal, passive: true });
        window.addEventListener("pagehide", unlockPageScroll, { signal, once: true });

        setOpen(false);
    }

    function close() {
        const button = document.getElementById("mobile-menu-btn");
        const menu = document.getElementById("mobile-menu");
        const openIcon = document.getElementById("menu-open-icon");
        const closeIcon = document.getElementById("menu-close-icon");

        menu?.classList.remove("is-open");
        if (menu) {
            menu.dataset.state = "closed";
            menu.setAttribute("aria-hidden", "true");
            menu.inert = true;
        }
        button?.setAttribute("aria-expanded", "false");
        button?.setAttribute("aria-label", "Menüyü aç");
        if (openIcon) openIcon.hidden = false;
        if (closeIcon) closeIcon.hidden = true;
        unlockPageScroll();
    }

    window.TunaNavbar = { init, close };
})();
