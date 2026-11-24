const workshop = window.workshop;

document.querySelectorAll("[data-copy]").forEach((element) => {
  const key = element.dataset.copy;
  element.textContent = workshop[key] || "יעודכן בהמשך";
});

const contactLinks = {
  website: `https://${workshop.website}`,
  whatsapp: `https://wa.me/${workshop.internationalPhone}`,
  whatsappRegistration: `https://wa.me/${workshop.internationalPhone}?text=${encodeURIComponent("היי נטלי, אשמח להירשם לסדנת ההכנה להנקה.")}`,
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

const formId = workshop.tallyFormId.trim();
if (/^[A-Za-z0-9]+$/.test(formId)) {
  const form = document.querySelector("#registration-form");
  const frame = form.querySelector("iframe");
  frame.src = `https://tally.so/embed/${formId}?hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  document.querySelector("#registration-link").href = `https://tally.so/r/${formId}`;
  document.querySelector("#registration-whatsapp").hidden = true;
  document.querySelector("#whatsapp-intro").hidden = true;
  document.querySelector("#registration-intro").hidden = false;
  form.hidden = false;

  const embedScript = document.createElement("script");
  embedScript.src = "https://tally.so/widgets/embed.js";
  embedScript.async = true;
  document.body.append(embedScript);
}
