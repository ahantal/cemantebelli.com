// cemantebelli.com: mobile menu and contact form (English and Turkish)
document.addEventListener("DOMContentLoaded", () => {
  const tr = document.documentElement.lang === "tr";

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
  const text = tr
    ? {
        sending: "Gönderiliyor…",
        okTitle: "Teşekkürler, mesajınız gönderildi.",
        okBody: "Cem en kısa zamanda size e-posta ile dönüş yapacak.",
        errTitle: "Mesajınız gönderilemedi.",
        errBody: 'Lütfen biraz sonra tekrar deneyin ya da doğrudan <a href="mailto:antebellicem@gmail.com">antebellicem@gmail.com</a> adresine yazın.',
      }
    : {
        sending: "Sending…",
        okTitle: "Thank you, your message has been sent.",
        okBody: "Cem will reply to you by email as soon as he can.",
        errTitle: "Sorry, your message could not be sent.",
        errBody: 'Please try again in a moment, or email Cem directly at <a href="mailto:antebellicem@gmail.com">antebellicem@gmail.com</a>.',
      };

  function fieldValid(input) {
    const value = input.value.trim();
    if (input.required && !value) return false;
    if (input.type === "email" && value && !emailPattern.test(value)) return false;
    return true;
  }
  function showState(input) {
    const wrap = input.closest(".field");
    const bad = !fieldValid(input);
    wrap.classList.toggle("invalid", bad);
    input.setAttribute("aria-invalid", bad ? "true" : "false");
  }

  const checked = form.querySelectorAll("[required], input[type=email]");
  checked.forEach((input) => {
    input.addEventListener("blur", () => showState(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) showState(input);
    });
  });

  let sending = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return; // no duplicate submissions
    status.className = "form-status";
    status.innerHTML = "";

    let firstInvalid = null;
    checked.forEach((input) => {
      showState(input);
      if (!fieldValid(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    sending = true;
    const label = button.textContent;
    button.disabled = true;
    button.textContent = text.sending;
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
      status.innerHTML = "<p><strong>" + text.okTitle + "</strong></p><p>" + text.okBody + "</p>";
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = "<p><strong>" + text.errTitle + "</strong></p><p>" + text.errBody + "</p>";
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = label;
      status.focus();
    }
  });
});
