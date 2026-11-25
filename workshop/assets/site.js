const workshop = window.workshop;
const [day, month, year] = workshop.date.split(".").map(Number);
const workshopDate = new Date(Date.UTC(year, month - 1, day));
const copy = { ...workshop };
if (!Number.isNaN(workshopDate.getTime())) {
  copy.dateShort = new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(workshopDate);
  copy.dateWeekday = new Intl.DateTimeFormat("he-IL", { weekday: "long", timeZone: "UTC" }).format(workshopDate);
}

document.querySelectorAll("[data-copy]").forEach((element) => {
  const key = element.dataset.copy;
  element.textContent = copy[key] || "יעודכן בהמשך";
});

const contactLinks = {
  website: `https://${workshop.website}`,
  whatsapp: `https://wa.me/${workshop.internationalPhone}`,
  instagram: `https://www.instagram.com/${workshop.instagram}/`
};

document.querySelectorAll("[data-contact]").forEach((link) => {
  link.href = contactLinks[link.dataset.contact];
});

for (const [title, description] of workshop.topics) {
  const item = document.createElement("li");
  const heading = document.createElement("h3");
  const paragraph = document.createElement("p");
  heading.textContent = title;
  paragraph.textContent = description;
  item.append(heading, paragraph);
  document.querySelector("#topics").append(item);
}

for (const [question, answer] of workshop.faq) {
  const item = document.createElement("details");
  const summary = document.createElement("summary");
  const paragraph = document.createElement("p");
  summary.textContent = question;
  paragraph.textContent = answer;
  item.append(summary, paragraph);
  document.querySelector("#faq-items").append(item);
}

const endpoint = workshop.registrationEndpoint.trim();
if (/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) {
  const form = document.querySelector("#registration-form");
  const submit = form.querySelector("button");
  const fullName = form.elements.full_name;
  const phone = form.elements.phone;
  form.action = endpoint;
  form.elements.submission_id.value = crypto.randomUUID();
  document.querySelector("#registration-unavailable").hidden = true;
  document.querySelector("#registration-intro").hidden = false;
  form.hidden = false;

  form.addEventListener("input", () => {
    fullName.setCustomValidity("");
    phone.setCustomValidity("");
  });
  form.addEventListener("submit", (event) => {
    const digits = phone.value.replace(/\D/g, "");
    fullName.setCustomValidity(fullName.value.trim() ? "" : "הזיני שם מלא.");
    phone.setCustomValidity(/^\+?[\d\s().-]+$/.test(phone.value.trim()) && digits.length >= 7 && digits.length <= 15 ? "" : "הזיני מספר טלפון תקין.");
    if (!form.reportValidity() || submit.disabled) {
      event.preventDefault();
      return;
    }
    submit.disabled = true;
    submit.textContent = "שולחת…";
  });
  window.addEventListener("pageshow", () => {
    submit.disabled = false;
    submit.textContent = "שליחת פרטי הרשמה";
  });
}
