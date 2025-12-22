// Upload / custom model quote page logic

function buildUploadMessage({
  fullName,
  email,
  phone,
  modelDescription,
  material,
  color,
  deadline,
  extraNotes,
}) {
  const lines = [
    "Merhaba, özel 3D baskı modelim için fiyat teklifi almak istiyorum.",
    "",
    `Ad Soyad: ${fullName}`,
    `E-posta: ${email}`,
    `Telefon (WhatsApp): ${phone}`,
    "",
    `Model Açıklaması: ${modelDescription}`,
  ];

  if (material) lines.push(`Tercih Edilen Filament Türü: ${material}`);
  if (color) lines.push(`Renk Tercihi: ${color}`);
  if (deadline) lines.push(`İstenen Teslim Tarihi: ${deadline}`);
  if (extraNotes) {
    lines.push("");
    lines.push(`Ek Notlar: ${extraNotes}`);
  }

  lines.push("");
  lines.push(
    "Not: STL / 3D model dosyamı bu mesajla birlikte ayrı dosya olarak ileteceğim."
  );

  return lines.join("\n");
}

function setupUploadForm() {
  const form = document.getElementById("uploadRequestForm");
  if (!form) return;

  const generatedSection = document.getElementById("generatedMessageSection");
  const generatedTextarea = document.getElementById("generatedMessage");
  const copyBtn = document.getElementById("copyMessageBtn");
  const waLink = document.getElementById("whatsAppLink");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const modelDescription =
      document.getElementById("modelDescription").value.trim();
    const material = document.getElementById("material").value;
    const color = document.getElementById("color").value.trim();
    const deadline = document.getElementById("deadline").value;
    const extraNotes = document.getElementById("extraNotes").value.trim();

    if (!fullName || !email || !phone || !modelDescription) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }

    if (!validatePhone(phone)) {
      alert("Telefon formatı geçersiz. Lütfen başında '+90' veya '0' veya doğrudan numara olacak şekilde 10-13 haneli bir numara girin.");
      return;
    }

    const msg = buildUploadMessage({
      fullName,
      email,
      phone,
      modelDescription,
      material,
      color,
      deadline,
      extraNotes,
    });

    if (generatedTextarea) generatedTextarea.value = msg;
    if (generatedSection) generatedSection.classList.remove("hidden");

    if (waLink) {
      const encoded = encodeURIComponent(msg);
      waLink.href = `https://wa.me/${APP_CONFIG.WHATSAPP_BUSINESS_NUMBER}?text=${encoded}`;

    }
  });

  copyBtn?.addEventListener("click", async () => {
    if (!generatedTextarea) return;
    try {
      await navigator.clipboard.writeText(generatedTextarea.value);
      copyBtn.textContent = "Kopyalandı";
      setTimeout(() => {
        copyBtn.textContent = "Metni Kopyala";
      }, 1500);
    } catch (err) {
      console.error("clipboard error", err);
      alert("Kopyalama sırasında bir hata oluştu, metni elle kopyalayabilirsiniz.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.getAttribute("data-page") === "upload") {
    setupUploadForm();
  }
});


