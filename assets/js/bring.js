// Simple bring-your-model form — builds WhatsApp message and opens link

function setupBringForm() {
  const form = document.getElementById('bringForm');
  if (!form) return;

  const waLink = document.getElementById('bWhatsAppLink');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('bFullName').value.trim();
    const phone = document.getElementById('bPhone').value.trim();
    const notes = document.getElementById('bNotes').value.trim();

    if (!fullName || !phone) {
      alert('Lütfen adınız ve telefon numaranızı girin.');
      return;
    }

    if (!validatePhone(phone)) {
      alert('Telefon formatı geçersiz. Lütfen başında +90 veya 0 olan veya doğrudan 10 haneli numara girin.');
      return;
    }

    const lines = [
      'Merhaba, modelimi teslim etmek istiyorum.',
      '',
      `Ad Soyad: ${fullName}`,
      `Telefon (WhatsApp): ${phone}`,
    ];

    if (notes) {
      lines.push('', `Not: ${notes}`);
    }

    lines.push('', 'Not: Model dosyasını randevu ile veya yerinde teslim edeceğim.');

    const msg = lines.join('\n');
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/?text=${encoded}`;
    if (waLink) waLink.href = url;
    // open in new tab/window
    window.open(url, '_blank');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupBringForm();
});
