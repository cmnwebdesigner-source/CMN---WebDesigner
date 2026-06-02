(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const el = {
    form: $("cmnForm"),
    fullName: $("fullName"),
    role: $("role"),
    company: $("company"),
    phone: $("phone"),
    email: $("email"),
    website: $("website"),
    social: $("social"),
    address: $("address"),
    slogan: $("slogan"),
    template: $("template"),
    primaryColor: $("primaryColor"),
    textColor: $("textColor"),
    cardBg: $("cardBg"),
    logoUpload: $("logoUpload"),
    businessCard: $("businessCard"),
    cardMono: $("cardMono"),
    cardLogoImg: $("cardLogoImg"),
    cardCompany: $("cardCompany"),
    cardSlogan: $("cardSlogan"),
    cardName: $("cardName"),
    cardRole: $("cardRole"),
    cardPhone: $("cardPhone"),
    cardEmail: $("cardEmail"),
    cardWebsite: $("cardWebsite"),
    cardSocial: $("cardSocial"),
    cardAddress: $("cardAddress"),
    downloadPng: $("downloadPng"),
    downloadPdf: $("downloadPdf"),
    resetBtn: $("resetBtn"),
    toast: $("toast"),
  };

  const fallback = {
    fullName: "Numele Tău",
    role: "Funcție / Profesie",
    company: "CMN WebDesigner",
    phone: "07xx xxx xxx",
    email: "contact@firma.ro",
    website: "www.firma.ro",
    social: "@brandul_tau",
    address: "Brașov, România",
    slogan: "Design premium pentru afaceri moderne",
    template: "blackGold",
    primaryColor: "#FFE600",
    textColor: "#FFFFFF",
    cardBg: "#050505",
  };

  const presets = {
    blackGold: { primary: "#FFE600", text: "#FFFFFF", bg: "#050505" },
    luxury: { primary: "#FFE600", text: "#FFFFFF", bg: "#080500" },
    midnight: { primary: "#FFE600", text: "#FFFFFF", bg: "#0A0A0A" },
    clean: { primary: "#111111", text: "#111111", bg: "#FFFFFF" },
    white: { primary: "#CCB800", text: "#111111", bg: "#F7F7F2" },
  };

  let uploadedLogo = "";
  let toastTimer = null;

  function value(input, backup) {
    const text = String(input?.value || "").trim();
    return text || backup;
  }

  function normalizeWebsite(text) {
    return String(text || "")
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "www.")
      .replace(/\/$/, "");
  }

  function makeInitials(name, company) {
    const raw = String(name || company || "CMN")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim();

    const parts = raw.split(/\s+/).filter(Boolean);
    if (!parts.length) return "CMN";
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  function clearTemplateClasses() {
    el.businessCard.classList.remove("template-luxury", "template-midnight", "template-clean", "template-white");
  }

  function applyTemplateClass(template) {
    clearTemplateClasses();
    if (template !== "blackGold") {
      el.businessCard.classList.add(`template-${template}`);
    }
  }

  function setCardColors(template) {
    const primary = el.primaryColor.value || fallback.primaryColor;
    const text = (template === "clean" || template === "white") ? "#111111" : (el.textColor.value || fallback.textColor);
    const bg = el.cardBg.value || fallback.cardBg;

    el.businessCard.style.setProperty("--card-primary", primary);
    el.businessCard.style.setProperty("--card-text", text);
    el.businessCard.style.setProperty("--card-bg", bg);
  }

  function updatePreview() {
    const fullName = value(el.fullName, fallback.fullName);
    const company = value(el.company, fallback.company);
    const template = el.template.value || fallback.template;

    applyTemplateClass(template);
    setCardColors(template);

    el.cardName.textContent = fullName;
    el.cardRole.textContent = value(el.role, fallback.role);
    el.cardCompany.textContent = company;
    el.cardSlogan.textContent = value(el.slogan, fallback.slogan);
    el.cardPhone.textContent = value(el.phone, fallback.phone);
    el.cardEmail.textContent = value(el.email, fallback.email);
    el.cardWebsite.textContent = normalizeWebsite(value(el.website, fallback.website));
    el.cardSocial.textContent = value(el.social, fallback.social);
    el.cardAddress.textContent = value(el.address, fallback.address);
    el.cardMono.textContent = makeInitials(fullName, company);

    if (uploadedLogo) {
      el.cardLogoImg.src = uploadedLogo;
      el.cardLogoImg.hidden = false;
      el.cardMono.hidden = true;
    } else {
      el.cardLogoImg.hidden = true;
      el.cardLogoImg.removeAttribute("src");
      el.cardMono.hidden = false;
    }
  }

  function applyPreset(template) {
    const preset = presets[template] || presets.blackGold;
    el.primaryColor.value = preset.primary;
    el.textColor.value = preset.text;
    el.cardBg.value = preset.bg;
    updatePreview();
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
  }

  function slug(text) {
    return String(text || "carte-vizita")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "carte-vizita";
  }

  async function waitForAssets() {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const images = Array.from(el.businessCard.querySelectorAll("img"));
    await Promise.all(images.map((img) => {
      if (!img.src || img.hidden || img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
  }

  async function captureCard() {
    updatePreview();

    if (!window.html2canvas) {
      showToast("Se încarcă exportul. Mai apasă o dată în 2 secunde.");
      return null;
    }

    await waitForAssets();

    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(4, Math.max(3, dpr * 2));

    return window.html2canvas(el.businessCard, {
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale,
      scrollX: 0,
      scrollY: -window.scrollY,
      removeContainer: true,
    });
  }

  async function downloadPng() {
    try {
      el.downloadPng.disabled = true;
      el.downloadPng.textContent = "Se generează...";

      const canvas = await captureCard();
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `${slug(value(el.fullName, "carte-vizita"))}-carte-vizita.png`;
      link.href = canvas.toDataURL("image/png", 1);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("PNG descărcat la calitate mare.");
    } catch (error) {
      console.error(error);
      showToast("Nu s-a putut descărca PNG-ul.");
    } finally {
      el.downloadPng.disabled = false;
      el.downloadPng.textContent = "Descarcă PNG";
    }
  }

  async function downloadPdf() {
    try {
      el.downloadPdf.disabled = true;
      el.downloadPdf.textContent = "Se generează...";

      const canvas = await captureCard();
      if (!canvas) return;

      if (!window.jspdf?.jsPDF) {
        showToast("Se încarcă PDF-ul. Mai apasă o dată în 2 secunde.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [90, 55],
        compress: true,
      });

      const image = canvas.toDataURL("image/png", 1);
      pdf.addImage(image, "PNG", 0, 0, 90, 55, undefined, "FAST");
      pdf.save(`${slug(value(el.fullName, "carte-vizita"))}-carte-vizita.pdf`);
      showToast("PDF descărcat.");
    } catch (error) {
      console.error(error);
      showToast("Nu s-a putut descărca PDF-ul.");
    } finally {
      el.downloadPdf.disabled = false;
      el.downloadPdf.textContent = "Descarcă PDF";
    }
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Încarcă o imagine validă.");
      el.logoUpload.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Logo-ul este prea mare. Max 5MB.");
      el.logoUpload.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      uploadedLogo = String(reader.result || "");
      updatePreview();
      showToast("Logo adăugat.");
    };
    reader.onerror = () => showToast("Nu s-a putut încărca logo-ul.");
    reader.readAsDataURL(file);
  }

  function resetAll() {
    el.form.reset();
    uploadedLogo = "";
    el.logoUpload.value = "";
    el.template.value = fallback.template;
    el.primaryColor.value = fallback.primaryColor;
    el.textColor.value = fallback.textColor;
    el.cardBg.value = fallback.cardBg;
    updatePreview();
    showToast("Resetat.");
  }

  [
    el.fullName,
    el.role,
    el.company,
    el.phone,
    el.email,
    el.website,
    el.social,
    el.address,
    el.slogan,
    el.primaryColor,
    el.textColor,
    el.cardBg,
  ].forEach((input) => input.addEventListener("input", updatePreview));

  el.template.addEventListener("change", () => applyPreset(el.template.value));
  el.logoUpload.addEventListener("change", handleLogoUpload);
  el.downloadPng.addEventListener("click", downloadPng);
  el.downloadPdf.addEventListener("click", downloadPdf);
  el.resetBtn.addEventListener("click", resetAll);

  updatePreview();
})();
