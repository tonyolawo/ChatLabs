document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const navLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];
  const navbar = document.querySelector(".navbar");
  const contactForm = document.querySelector(".contact-form");
  const yearEl = document.getElementById("current-year");

  function closeMobileMenu() {
    if (navToggle) navToggle.classList.remove("active");
    if (mobileMenu) mobileMenu.classList.remove("open");
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      mobileMenu.classList.toggle("open");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", (e) => {
      if (
        mobileMenu.classList.contains("open") &&
        !mobileMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navbarHeight = navbar
        ? parseFloat(getComputedStyle(navbar).height) + 16
        : 0;
      const y =
        target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
      closeMobileMenu();
    });
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });
  }

  const sections = document.querySelectorAll("section[id]");
  const navLinkMap = {};
  document.querySelectorAll('.navbar a[href^="#"]').forEach((link) => {
    const hash = link.getAttribute("href");
    if (hash) navLinkMap[hash] = link;
  });

  if (sections.length && Object.keys(navLinkMap).length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Object.values(navLinkMap).forEach((l) =>
              l.classList.remove("active")
            );
            const id = "#" + entry.target.id;
            if (navLinkMap[id]) navLinkMap[id].classList.add("active");
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((section) => activeObserver.observe(section));
  }

  if (contactForm) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    let formStatus = document.querySelector(".form-status");

    function setStatus(message, type) {
      if (!formStatus) {
        formStatus = document.createElement("div");
        formStatus.className = "form-status";
        contactForm.appendChild(formStatus);
      }
      formStatus.textContent = message;
      formStatus.className = "form-status";
      if (type) formStatus.classList.add(type);
    }

    function clearStatus() {
      if (formStatus) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
      }
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      let valid = true;

      contactForm.querySelectorAll(".error-msg").forEach((el) => el.remove());
      contactForm
        .querySelectorAll(".error")
        .forEach((el) => el.classList.remove("error"));
      clearStatus();

      if (nameInput && !nameInput.value.trim()) {
        nameInput.classList.add("error");
        const msg = document.createElement("span");
        msg.className = "error-msg";
        msg.textContent = "Name is required.";
        nameInput.insertAdjacentElement("afterend", msg);
        valid = false;
      }

      if (emailInput && !emailInput.value.trim()) {
        emailInput.classList.add("error");
        const msg = document.createElement("span");
        msg.className = "error-msg";
        msg.textContent = "Email is required.";
        emailInput.insertAdjacentElement("afterend", msg);
        valid = false;
      } else if (emailInput && !emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add("error");
        const msg = document.createElement("span");
        msg.className = "error-msg";
        msg.textContent = "Please enter a valid email address.";
        emailInput.insertAdjacentElement("afterend", msg);
        valid = false;
      }

      if (!valid) return;

      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not send your message. Please try again."
          );
        }

        contactForm.style.display = "none";
        let successMsg = document.querySelector(".success-msg");
        if (!successMsg) {
          successMsg = document.createElement("div");
          successMsg.className = "success-msg";
          successMsg.textContent = "Thanks! We'll be in touch soon.";
          contactForm.insertAdjacentElement("afterend", successMsg);
        } else {
          successMsg.style.display = "";
        }
      } catch (error) {
        setStatus(
          error.message || "Could not send your message. Please try again.",
          "error"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });

    contactForm.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("error");
        const nextSibling = input.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains("error-msg")) {
          nextSibling.remove();
        }
      });
      input.addEventListener("focus", () => {
        input.classList.remove("error");
        const nextSibling = input.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains("error-msg")) {
          nextSibling.remove();
        }
      });
    });
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
