// cemantebelli.com: mobile menu and contact form
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.primary");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Contact form: validate, then send to Web3Forms without leaving the page
  const form = document.querySelector("form.contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function fieldValid(input) {
    const value = input.value.trim();
    if (input.required && !value) return false;
    if (input.type === "email" && value && !emailPattern.test(value)) return false;
    return true;
  }

  function showState(input) {
    const wrap = input.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", !fieldValid(input));
  }

  const required = form.querySelectorAll("[required]");
  required.forEach((input) => {
    input.addEventListener("blur", () => showState(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) showState(input);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.innerHTML = "";

    let firstInvalid = null;
    required.forEach((input) => {
      showState(input);
      if (!fieldValid(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Sending…";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Send failed");
      form.reset();
      status.className = "form-status ok";
      status.innerHTML = "<p><strong>Thank you! Your message has been sent.</strong></p><p>I’ll get back to you as soon as I can.</p>";
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = '<p><strong>Sorry, your message could not be sent.</strong></p><p>Please try again in a moment, or email me directly at <a href="mailto:antebellicem@gmail.com">antebellicem@gmail.com</a>.</p>';
    } finally {
      button.disabled = false;
      button.textContent = label;
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});
