(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    form: $("businessCardForm"),
    fullName: $("fullName"),
    role: $("role"),
    company: $("company"),
    phone: $("phone"),
    email: $("email"),
    website: $("website"),
    social: $("social"),
    address: $("address"),
    slogan: $("slogan"),
    templateStyle: $("templateStyle"),
    primaryColor: $("primaryColor"),
    textColor: $("textColor"),
    cardBg: $("cardBg"),
    logoUpload: $("logoUpload"),
    businessCard: $("businessCard"),
    cardMonogram: $("cardMonogram"),
    cardLogoImg: $("cardLogoImg"),
    cardName: $("cardName"),
    cardRole: $("cardRole"),
    cardCompany: $("cardCompany"),
    cardSlogan: $("cardSlogan"),
    cardPhone: $("cardPhone"),
    cardEmail: $("cardEmail"),
    cardWebsite: $("cardWebsite"),
    cardSocial: $("cardSocial"),
    cardAddress: $("cardAddress"),
    downloadPng: $("downloadPng"),
    downloadPdf: $("downloadPdf"),
    resetForm: $("resetForm"),
  };

  const defaults = {
    fullName: "Numele Tău",
    role: "Funcție / Profesie",
    company: "CMN WebDesigner",
    phone: "07xx xxx xxx",
    email: "contact@firma.ro",
    website: "www.firma.ro",
    social: "@brandul_tau",
    address: "București, România",
    slogan: "Design premium pentru afaceri moderne",
    templateStyle: "blackGold",
    primaryColor: "#FFE600",
    textColor: "#FFFFFF",
    cardBg: "#050505",
  };

  let uploadedLogo = "";

  function safeValue(input, fallback) {
    const value = (input?.value || "").trim();
    return value || fallback;
  }

  function initialsFrom(name, company) {
    const raw = (name || company || "CMN")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .trim();

    const words = raw.split(/\s+/).filter(Boolean);

    if (!words.length) return "CMN";
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function normalizeWebsite(value) {
    return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  function setCardClass(template) {
    els.businessCard.classList.remove(
      "template-minimalWhite",
      "template-modernDark",
      "template-luxuryGold",
      "template-cleanBusiness"
    );

    if (template !== "blackGold") {
      els.businessCard.classList.add(`template-${template}`);
    }
  }

  function updatePreview() {
    const fullName = safeValue(els.fullName, defaults.fullName);
    const company = safeValue(els.company, defaults.company);

    els.cardName.textContent = fullName;
    els.cardRole.textContent = safeValue(els.role, defaults.role);
    els.cardCompany.textContent = company;
    els.cardSlogan.textContent = safeValue(els.slogan, defaults.slogan);
    els.cardPhone.textContent = safeValue(els.phone, defaults.phone);
    els.cardEmail.textContent = safeValue(els.email, defaults.email);
    els.cardWebsite.textContent = normalizeWebsite(safeValue(els.website, defaults.website));
    els.cardSocial.textContent = safeValue(els.social, defaults.social);
    els.cardAddress.textContent = safeValue(els.address, defaults.address);

    els.cardMonogram.textContent = initialsFrom(fullName, company);

    const template = els.templateStyle.value;
    setCardClass(template);

    const primary = els.primaryColor.value || defaults.primaryColor;
    const text = els.textColor.value || defaults.textColor;
    const bg = els.cardBg.value || defaults.cardBg;

    els.businessCard.style.setProperty("--card-primary", primary);
    els.businessCard.style.setProperty("--card-text", text);
    els.businessCard.style.setProperty("--card-bg", bg);

    if (uploadedLogo) {
      els.cardLogoImg.src = uploadedLogo;
      els.cardLogoImg.hidden = false;
      els.cardMonogram.hidden = true;
    } else {
      els.cardLogoImg.hidden = true;
      els.cardLogoImg.removeAttribute("src");
      els.cardMonogram.hidden = false;
    }
  }

  function applyTemplateDefaults(template) {
    const presets = {
      blackGold: {
        primary: "#FFE600",
        text: "#FFFFFF",
        bg: "#050505",
      },
      minimalWhite: {
        primary: "#CCB800",
        text: "#101010",
        bg: "#F7F7F2",
      },
      modernDark: {
        primary: "#FFE600",
        text: "#FFFFFF",
        bg: "#0A0A0A",
      },
      luxuryGold: {
        primary: "#FFE600",
        text: "#FFFFFF",
        bg: "#090700",
      },
      cleanBusiness: {
        primary: "#111111",
        text: "#111111",
        bg: "#FFFFFF",
      },
    };

    const preset = presets[template] || presets.blackGold;
    els.primaryColor.value = preset.primary;
    els.textColor.value = preset.text;
    els.cardBg.value = preset.bg;
    updatePreview();
  }

  function showToast(message) {
    let toast = document.querySelector(".cmn-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cmn-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2300);
  }

  async function captureCard() {
    if (!window.html2canvas) {
      showToast("Se încarcă librăria PNG. Încearcă din nou.");
      return null;
    }

    await document.fonts?.ready;

    return window.html2canvas(els.businessCard, {
      scale: Math.min(4, window.devicePixelRatio * 2),
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
  }

  function fileNameBase() {
    const raw = safeValue(els.fullName, "carte-vizita")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return raw || "carte-vizita";
  }

  async function downloadPng() {
    const canvas = await captureCard();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${fileNameBase()}-carte-vizita.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showToast("PNG descărcat.");
  }

  async function downloadPdf() {
    const canvas = await captureCard();
    if (!canvas) return;

    if (!window.jspdf?.jsPDF) {
      showToast("Se încarcă librăria PDF. Încearcă din nou.");
      return;
    }

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85, 55],
      compress: true,
    });

    pdf.addImage(imgData, "PNG", 0, 0, 85, 55);
    pdf.save(`${fileNameBase()}-carte-vizita.pdf`);

    showToast("PDF descărcat.");
  }

  function resetForm() {
    els.form.reset();

    els.fullName.value = "";
    els.role.value = "";
    els.company.value = "";
    els.phone.value = "";
    els.email.value = "";
    els.website.value = "";
    els.social.value = "";
    els.address.value = "";
    els.slogan.value = "";

    els.templateStyle.value = defaults.templateStyle;
    els.primaryColor.value = defaults.primaryColor;
    els.textColor.value = defaults.textColor;
    els.cardBg.value = defaults.cardBg;

    uploadedLogo = "";
    updatePreview();
    showToast("Generator resetat.");
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      uploadedLogo = "";
      updatePreview();
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Încarcă doar o imagine.");
      event.target.value = "";
      return;
    }

    const maxMb = 4;
    if (file.size > maxMb * 1024 * 1024) {
      showToast(`Logo-ul trebuie să fie sub ${maxMb}MB.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      uploadedLogo = String(reader.result || "");
      updatePreview();
      showToast("Logo încărcat.");
    };
    reader.readAsDataURL(file);
  }

  const liveFields = [
    "fullName",
    "role",
    "company",
    "phone",
    "email",
    "website",
    "social",
    "address",
    "slogan",
    "primaryColor",
    "textColor",
    "cardBg",
  ];

  liveFields.forEach((key) => {
    els[key].addEventListener("input", updatePreview);
  });

  els.templateStyle.addEventListener("change", (event) => {
    applyTemplateDefaults(event.target.value);
  });

  els.logoUpload.addEventListener("change", handleLogoUpload);
  els.downloadPng.addEventListener("click", downloadPng);
  els.downloadPdf.addEventListener("click", downloadPdf);
  els.resetForm.addEventListener("click", resetForm);

  updatePreview();
})();
