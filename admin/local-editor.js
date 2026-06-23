const form = document.querySelector("#content-form");
const saveButton = document.querySelector("#save-button");
const statusLine = document.querySelector("#status-line");
const title = document.querySelector("#section-title");
const kicker = document.querySelector("#section-kicker");
const sessionUser = document.querySelector("#session-user");
const logoutButton = document.querySelector("#logout-button");
const sectionButtons = [...document.querySelectorAll("[data-section]")];
const dashboardMode = document.body.dataset.dashboard || "admin";
const isPostEditorDashboard = dashboardMode === "post-editor";
const isLocalPreview = ["127.0.0.1", "localhost", ""].includes(window.location.hostname);
const apiBase = isPostEditorDashboard && !isLocalPreview ? "/api/post-editor" : "/__local-admin";

const sections = {
  information: {
    label: "Information section",
    group: "Website details",
    description: "Update the heading and intro for the website information area."
  },
  contact_form: {
    label: "Contact form",
    group: "Website details",
    description: "Control the public enquiry form, recipient email, subject prefix, and enquiry choices."
  },
  contact_cards: {
    label: "Contact details",
    group: "Website details",
    description: "Update office, factory, email, phone, and map details."
  },
  contact_submissions: {
    label: "Inquiry Submissions",
    group: "Website details",
    description: "View inquiry records submitted through the website contact form."
  },
  visitor_analytics: {
    label: "Visitor Geolocation",
    group: "Website details",
    description: "View consent-based visitor location counts from the public website."
  },
  users: {
    label: "Users",
    group: "Admin",
    description: "Create admin and post editor users for the local dashboard."
  },
  notices: {
    label: "Notice adverts",
    group: "Advert posts",
    description: "Create and publish public notice advert posts."
  },
  vacancies: {
    label: "Vacancy adverts",
    group: "Advert posts",
    description: "Create and publish job, internship, contract, and recruitment advert posts."
  },
  tenders: {
    label: "Tender adverts",
    group: "Advert posts",
    description: "Create and publish tender, supplier, and RFQ advert posts."
  }
};

const files = {
  information: "content/information.json",
  notices: "content/notices.json",
  vacancies: "content/vacancies.json",
  tenders: "content/tenders.json",
  contact_form: "content/contact-form.json",
  contact_cards: "content/contact-cards.json",
  contact_submissions: "content/contact-submissions.json",
  visitor_analytics: "content/visitor-analytics.json",
  users: "admin/users.local.json"
};

let content = {};
let currentUser = null;
const initialSection = window.location.hash.slice(1);
let activeSection = sections[initialSection] ? initialSection : sectionButtons[0]?.dataset.section || "information";

function field(label, name, value = "", options = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const labelElement = document.createElement("label");
  labelElement.textContent = label;
  labelElement.htmlFor = name;
  wrapper.append(labelElement);

  const input = options.type === "textarea"
    ? document.createElement("textarea")
    : document.createElement("input");

  if (options.type && options.type !== "textarea") {
    input.type = options.type;
  }

  input.id = name;
  input.name = name;
  input.value = value || "";
  input.dataset.path = options.path || name;
  wrapper.append(input);

  if (options.hint) {
    const hint = document.createElement("small");
    hint.textContent = options.hint;
    wrapper.append(hint);
  }

  return wrapper;
}

function selectField(label, name, value, choices) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const labelElement = document.createElement("label");
  labelElement.textContent = label;
  labelElement.htmlFor = name;
  wrapper.append(labelElement);

  const select = document.createElement("select");
  select.id = name;
  select.name = name;
  select.dataset.path = name;

  choices.forEach((choice) => {
    const choiceValue = typeof choice === "string" ? choice : choice.value;
    const choiceLabel = typeof choice === "string" ? choice : choice.label;
    const option = document.createElement("option");
    option.value = choiceValue;
    option.textContent = choiceLabel;
    option.selected = choiceValue === value;
    select.append(option);
  });

  wrapper.append(select);
  return wrapper;
}

function checkboxField(label, name, checked) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const labelElement = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = name;
  input.dataset.path = name;
  input.checked = Boolean(checked);
  labelElement.append(input, ` ${label}`);
  wrapper.append(labelElement);
  return wrapper;
}

function iconSvg(name) {
  const paths = {
    edit: [
      '<path d="M12 20h9"></path>',
      '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"></path>'
    ],
    view: [
      '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>',
      '<circle cx="12" cy="12" r="3"></circle>'
    ],
    reviewed: [
      '<path d="M20 6 9 17l-5-5"></path>'
    ],
    new: [
      '<path d="M12 5v14"></path>',
      '<path d="M5 12h14"></path>'
    ],
    delete: [
      '<path d="M3 6h18"></path>',
      '<path d="M8 6V4h8v2"></path>',
      '<path d="M19 6l-1 14H6L5 6"></path>',
      '<path d="M10 11v5"></path>',
      '<path d="M14 11v5"></path>'
    ]
  };
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = paths[name].join("");
  return svg;
}

function iconActionButton(icon, label, options = {}) {
  const button = document.createElement("button");
  button.className = `icon-button${options.danger ? " icon-button-danger" : ""}`;
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  button.append(iconSvg(icon));
  return button;
}

function setValue(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    cursor[part] = cursor[part] || {};
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
}

function todayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function confirmDelete(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const panel = document.createElement("div");
    panel.className = "confirm-modal-panel";

    const heading = document.createElement("h3");
    heading.textContent = "Confirm delete";

    const body = document.createElement("p");
    body.textContent = message;

    const helper = document.createElement("small");
    helper.textContent = "Save changes after deleting to publish this update.";

    const actions = document.createElement("div");
    actions.className = "form-actions";

    const cancel = document.createElement("button");
    cancel.className = "ghost-button";
    cancel.type = "button";
    cancel.textContent = "Cancel";

    const confirm = document.createElement("button");
    confirm.className = "danger-button";
    confirm.type = "button";
    confirm.textContent = "Delete";

    function close(result) {
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
      resolve(result);
    }

    function onKeydown(event) {
      if (event.key === "Escape") {
        close(false);
      }
    }

    cancel.addEventListener("click", () => close(false));
    confirm.addEventListener("click", () => close(true));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        close(false);
      }
    });
    document.addEventListener("keydown", onKeydown);

    actions.append(cancel, confirm);
    panel.append(heading, body, helper, actions);
    overlay.append(panel);
    document.body.append(overlay);
    cancel.focus();
  });
}

function showSaveSuccess(message) {
  statusLine.textContent = message;
  window.alert(`${message}\n\nThe save is complete. It is ok to close this page.`);
}

function postDateForSort(post = {}) {
  return post.postDate || post.date || post.closingDate || "";
}

function dateSortValue(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? Number(`${match[1]}${match[2]}${match[3]}`) : 0;
}

function comparePostsByLatest(first, second) {
  return dateSortValue(postDateForSort(second)) - dateSortValue(postDateForSort(first));
}

function sortPostsByLatest(items = []) {
  return [...items].sort(comparePostsByLatest);
}

function dateTimeSortValue(value) {
  const parsed = new Date(value || "");
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function sortSubmissionsByLatest(submissions = []) {
  return [...submissions].sort((first, second) => (
    dateTimeSortValue(second.submittedAt) - dateTimeSortValue(first.submittedAt)
  ));
}

function mediaTypeFromPost(post) {
  if (post.pdfUrl) return "pdf";
  if ((post.imageUrls || []).length) return "image";
  return "none";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function uploadAdvertFile(file) {
  const content = await fileToBase64(file);
  const response = await fetch(`${apiBase}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      section: activeSection,
      filename: file.name,
      contentType: file.type,
      content
    })
  });

  if (!response.ok) {
    throw new Error(`Upload failed for ${file.name}`);
  }

  return response.json();
}

function fileUploadField() {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const labelElement = document.createElement("label");
  labelElement.textContent = "Upload Image Or PDF";
  labelElement.htmlFor = "editPostUpload";

  const input = document.createElement("input");
  input.id = "editPostUpload";
  input.name = "editPostUpload";
  input.type = "file";
  input.accept = "image/*,application/pdf,.pdf";
  input.multiple = true;

  const hint = document.createElement("small");
  hint.textContent = "Upload image files for a carousel, or a PDF file for a PDF link.";

  wrapper.append(labelElement, input, hint);
  return wrapper;
}

function mediaSummaryField() {
  const wrapper = document.createElement("div");
  wrapper.className = "field media-summary-field";

  const labelElement = document.createElement("label");
  labelElement.textContent = "Uploaded File";

  const summary = document.createElement("div");
  summary.className = "media-summary";
  summary.dataset.mediaSummary = "";

  const clear = document.createElement("button");
  clear.className = "danger-button";
  clear.type = "button";
  clear.dataset.clearMedia = "";
  clear.textContent = "Clear uploaded file";

  wrapper.append(labelElement, summary, clear);
  return wrapper;
}

function readCommonCategory() {
  const data = { ...content[activeSection] };
  data.status = form.status?.value ?? data.status;
  data.title = form.title?.value ?? data.title;
  data.summary = form.summary?.value ?? data.summary;
  data.contactLabel = form.contactLabel?.value ?? data.contactLabel;
  data.contactEmail = form.contactEmail?.value ?? data.contactEmail;
  data.contactSubject = form.contactSubject?.value ?? data.contactSubject;
  data.hideIntro = form.hideIntro?.checked ?? data.hideIntro;
  data.items = sortPostsByLatest(
    [...form.querySelectorAll("[data-post-row]")].map((row) => ({
      type: row.querySelector("[name='postType']").value,
      title: row.querySelector("[name='postTitle']").value,
      summary: row.querySelector("[name='postSummary']").value,
      postDate: row.querySelector("[name='postDate']").value,
      closingDate: row.querySelector("[name='postClosingDate']").value,
      actionLabel: row.querySelector("[name='postActionLabel']").value,
      actionUrl: row.querySelector("[name='postActionUrl']").value,
      mediaType: row.querySelector("[name='postMediaType']").value,
      imageUrls: row.querySelector("[name='postImageUrls']").value
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      pdfUrl: row.querySelector("[name='postPdfUrl']").value,
      pdfLabel: row.querySelector("[name='postPdfLabel']").value
    }))
  );
  return data;
}

function renderSimple(fields) {
  const grid = document.createElement("div");
  grid.className = "form-grid";
  const data = content[activeSection] || {};
  fields.forEach((item) => {
    grid.append(field(item.label, item.name, data[item.name], item));
  });
  form.replaceChildren(grid);
}

function renderContactFormSettings() {
  const grid = document.createElement("div");
  grid.className = "form-grid";
  const data = content.contact_form || {};
  grid.append(
    field("Small Heading", "eyebrow", data.eyebrow),
    field("Contact Section Heading", "title", data.title),
    field("Form Heading", "formTitle", data.formTitle),
    field("Form Intro Text", "formIntro", data.formIntro, { type: "textarea" }),
    field("Default Recipient Email", "formRecipient", data.formRecipient),
    field("Notification Email", "notificationEmail", data.notificationEmail || "sales@aja.bt", {
      hint: "Server notification target. RESEND_API_KEY and AJA_EMAIL_FROM are required for live email delivery."
    }),
    field("Email Subject Prefix", "formSubjectPrefix", data.formSubjectPrefix),
    field("Form Endpoint", "formEndpoint", data.formEndpoint, {
      hint: "Use /api/contact-submit for live website enquiries."
    }),
    field(
      "Enquiry Types",
      "enquiryTypes",
      Array.isArray(data.enquiryTypes) ? data.enquiryTypes.join("\n") : "",
      { type: "textarea", hint: "Add one enquiry type per line. The first line is the default option." }
    )
  );
  form.replaceChildren(grid);
}

function renderUsers() {
  const users = Array.isArray(content.users) ? content.users : [];
  const wrapper = document.createElement("div");
  wrapper.className = "users-panel";

  const tableWrap = document.createElement("div");
  tableWrap.className = "post-table-wrap";
  const table = document.createElement("table");
  table.className = "post-table users-table";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Password</th><th>Action</th></tr>";
  const tbody = document.createElement("tbody");
  tbody.dataset.users = "";

  users.forEach((user) => tbody.append(renderUserRow(user)));
  table.append(thead, tbody);
  tableWrap.append(table);

  const add = document.createElement("button");
  add.className = "small-button";
  add.type = "button";
  add.textContent = "Add user";
  add.addEventListener("click", () => {
    tbody.append(renderUserRow({
      id: "",
      name: "",
      username: "",
      role: "editor",
      status: "active"
    }));
  });

  const note = document.createElement("p");
  note.className = "table-note";
  note.textContent = "Admin users can manage the full dashboard. Editor users can only manage notice, vacancy, and tender posts.";

  wrapper.append(tableWrap, add, note);
  form.replaceChildren(wrapper);
}

function renderUserRow(user) {
  const row = document.createElement("tr");
  row.dataset.userRow = "";
  row.dataset.userId = user.id || "";

  const nameCell = document.createElement("td");
  const nameInput = document.createElement("input");
  nameInput.name = "userName";
  nameInput.value = user.name || "";
  nameCell.append(nameInput);

  const usernameCell = document.createElement("td");
  const usernameInput = document.createElement("input");
  usernameInput.name = "userUsername";
  usernameInput.value = user.username || "";
  usernameInput.placeholder = "username";
  usernameCell.append(usernameInput);

  const roleCell = document.createElement("td");
  const roleSelect = document.createElement("select");
  roleSelect.name = "userRole";
  ["editor", "admin"].forEach((role) => {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role === "admin" ? "Admin" : "Post editor";
    option.selected = role === (user.role || "editor");
    roleSelect.append(option);
  });
  roleCell.append(roleSelect);

  const statusCell = document.createElement("td");
  const statusSelect = document.createElement("select");
  statusSelect.name = "userStatus";
  ["active", "inactive"].forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status === "active" ? "Active" : "Inactive";
    option.selected = status === (user.status || "active");
    statusSelect.append(option);
  });
  statusCell.append(statusSelect);

  const passwordCell = document.createElement("td");
  const passwordInput = document.createElement("input");
  passwordInput.name = "userPassword";
  passwordInput.type = "password";
  passwordInput.placeholder = user.id ? "Leave blank to keep password" : "Set password";
  passwordCell.append(passwordInput);

  const actionCell = document.createElement("td");
  actionCell.className = "post-actions";
  const remove = iconActionButton("delete", "Delete user", { danger: true });
  remove.addEventListener("click", async () => {
    if (await confirmDelete("Delete this user?")) {
      row.remove();
    }
  });
  actionCell.append(remove);

  row.append(nameCell, usernameCell, roleCell, statusCell, passwordCell, actionCell);
  return row;
}

function readUsers() {
  return [...form.querySelectorAll("[data-user-row]")].map((row) => ({
    id: row.dataset.userId,
    name: row.querySelector("[name='userName']").value,
    username: row.querySelector("[name='userUsername']").value,
    role: row.querySelector("[name='userRole']").value,
    status: row.querySelector("[name='userStatus']").value,
    password: row.querySelector("[name='userPassword']").value
  }));
}

function renderContactSubmissions() {
  const data = content.contact_submissions || {};
  const submissions = sortSubmissionsByLatest(Array.isArray(data.submissions) ? data.submissions : []);
  const wrapper = document.createElement("div");
  wrapper.className = "submissions-panel";

  const tableWrap = document.createElement("div");
  tableWrap.className = "post-table-wrap";
  const table = document.createElement("table");
  table.className = "post-table submissions-table";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>Date</th><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Type</th><th>Product</th><th>Message</th><th>Status</th><th>Notification</th><th>Auto Reply</th><th>Action</th></tr>";
  const tbody = document.createElement("tbody");
  const detail = document.createElement("div");
  detail.className = "submission-detail";
  detail.hidden = true;

  if (submissions.length) {
    submissions.forEach((submission) => {
      const row = document.createElement("tr");
      [
        formatSubmissionDate(submission.submittedAt),
        submission.name,
        submission.company,
        submission.email,
        submission.phone,
        submission.enquiryType,
        submission.grade,
        submission.message,
        submission.reviewStatus || "new",
        `${submission.notificationTo || ""} (${submission.notificationStatus || "pending"})`,
        submission.autoReplyStatus || "pending"
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value || "";
        row.append(cell);
      });
      row.append(renderSubmissionActions(submission, detail));
      tbody.append(row);
    });
  } else {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 12;
    cell.textContent = "No contact submissions yet.";
    row.append(cell);
    tbody.append(row);
  }

  table.append(thead, tbody);
  tableWrap.append(table);

  const note = document.createElement("p");
  note.className = "table-note";
  note.textContent = "Records are saved in content/contact-submissions.json. Email delivery needs SMTP settings on the server.";
  wrapper.append(tableWrap, detail, note);
  form.replaceChildren(wrapper);
}

function renderVisitorAnalytics() {
  const data = content.visitor_analytics || {};
  const countries = Array.isArray(data.countries) ? data.countries : [];
  const cities = Array.isArray(data.cities) ? data.cities : [];
  const pages = Array.isArray(data.pages) ? data.pages : [];
  const recentVisits = Array.isArray(data.recentVisits) ? data.recentVisits : [];

  const wrapper = document.createElement("div");
  wrapper.className = "analytics-panel";

  const summary = document.createElement("div");
  summary.className = "analytics-summary";
  summary.append(
    analyticsCard("Total visits", data.totalVisits || 0),
    analyticsCard("Countries", countries.filter((item) => item.key !== "Unknown").length),
    analyticsCard("Cities", cities.filter((item) => item.key !== "Unknown").length),
    analyticsCard("Last update", formatSubmissionDate(data.updatedAt) || "No visits yet")
  );

  wrapper.append(summary);
  wrapper.append(
    analyticsTable("Visitors by country", ["Country", "Visits", "Last seen"], countries.map((item) => [
      displayCountry(item.country || item.label),
      item.count || 0,
      formatSubmissionDate(item.lastSeenAt)
    ])),
    analyticsTable("Visitors by city", ["City", "Country", "Visits", "Last seen"], cities.map((item) => [
      item.city || item.label || "Unknown",
      displayCountry(item.country),
      item.count || 0,
      formatSubmissionDate(item.lastSeenAt)
    ])),
    analyticsTable("Visited pages", ["Page", "Visits", "Last seen"], pages.map((item) => [
      item.label || item.key || "/",
      item.count || 0,
      formatSubmissionDate(item.lastSeenAt)
    ])),
    analyticsTable("Recent consented visits", ["Date", "Page", "Country", "City", "Timezone"], recentVisits.map((visit) => [
      formatSubmissionDate(visit.visitedAt),
      visit.page || "/",
      displayCountry(visit.country),
      [visit.city, visit.region].filter(Boolean).join(", ") || "Unknown",
      visit.timezone || ""
    ]))
  );

  const note = document.createElement("p");
  note.className = "table-note";
  note.textContent = "Analytics are recorded only after cookie consent. IP addresses are not stored.";
  wrapper.append(note);

  form.replaceChildren(wrapper);
}

function analyticsCard(label, value) {
  const card = document.createElement("article");
  card.className = "analytics-card";
  const titleElement = document.createElement("span");
  titleElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = String(value || 0);
  card.append(titleElement, valueElement);
  return card;
}

function analyticsTable(titleText, headers, rows) {
  const section = document.createElement("section");
  section.className = "analytics-table-section";

  const heading = document.createElement("h3");
  heading.textContent = titleText;

  const tableWrap = document.createElement("div");
  tableWrap.className = "post-table-wrap";
  const table = document.createElement("table");
  table.className = "post-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headers.forEach((header) => {
    const cell = document.createElement("th");
    cell.textContent = header;
    headRow.append(cell);
  });
  thead.append(headRow);

  const tbody = document.createElement("tbody");
  if (rows.length) {
    rows.forEach((row) => {
      const tableRow = document.createElement("tr");
      row.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value || "";
        tableRow.append(cell);
      });
      tbody.append(tableRow);
    });
  } else {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = headers.length;
    emptyCell.textContent = "No visitor records yet.";
    emptyRow.append(emptyCell);
    tbody.append(emptyRow);
  }

  table.append(thead, tbody);
  tableWrap.append(table);
  section.append(heading, tableWrap);
  return section;
}

function renderSubmissionActions(submission, detail) {
  const cell = document.createElement("td");
  cell.className = "post-actions submission-actions";

  const view = iconActionButton("view", "View submission");
  view.addEventListener("click", () => renderSubmissionDetail(submission, detail));

  const edit = iconActionButton("edit", "Edit submission");
  edit.addEventListener("click", () => renderSubmissionEditor(submission, detail));

  const reviewedLabel = submission.reviewStatus === "reviewed" ? "Mark as new" : "Mark as reviewed";
  const reviewedIcon = submission.reviewStatus === "reviewed" ? "new" : "reviewed";
  const reviewed = iconActionButton(reviewedIcon, reviewedLabel);
  reviewed.addEventListener("click", () => {
    const nextStatus = submission.reviewStatus === "reviewed" ? "new" : "reviewed";
    updateSubmission(submission.id, {
      reviewStatus: nextStatus,
      reviewedAt: nextStatus === "reviewed" ? new Date().toISOString() : ""
    });
  });

  const remove = iconActionButton("delete", "Delete submission", { danger: true });
  remove.addEventListener("click", async () => {
    if (await confirmDelete("Delete this contact submission record?")) {
      deleteSubmission(submission.id);
    }
  });

  cell.append(view, edit, reviewed, remove);
  return cell;
}

function renderSubmissionDetail(submission, detail) {
  detail.hidden = false;
  detail.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = `${submission.name || "Contact submission"} details`;

  const meta = document.createElement("dl");
  meta.className = "submission-detail-list";
  [
    ["Submitted", formatSubmissionDate(submission.submittedAt)],
    ["Company", submission.company],
    ["Country", submission.country],
    ["Email", submission.email],
    ["Phone", submission.phone],
    ["Enquiry type", submission.enquiryType],
    ["Product or grade", submission.grade],
    ["Quantity", submission.quantity],
    ["Review status", submission.reviewStatus || "new"],
    ["Notification", `${submission.notificationTo || ""} (${submission.notificationStatus || "pending"})`],
    ["Auto reply", submission.autoReplyStatus || "pending"]
  ].forEach(([label, value]) => {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value || "";
    meta.append(term, description);
  });

  const message = document.createElement("p");
  message.textContent = submission.message || "";

  const reply = document.createElement("a");
  reply.className = "small-button submission-reply";
  reply.href = contactSubmissionReplyUrl(submission);
  reply.textContent = "Reply by email";

  detail.append(heading, meta, message, reply);
}

function renderSubmissionEditor(submission, detail) {
  detail.hidden = false;
  detail.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = `${submission.name || "Contact submission"} editor`;

  const grid = document.createElement("div");
  grid.className = "form-grid";
  grid.append(
    field("Name", "editSubmissionName", submission.name),
    field("Company", "editSubmissionCompany", submission.company),
    field("Country", "editSubmissionCountry", submission.country),
    field("Email", "editSubmissionEmail", submission.email, { type: "email" }),
    field("Phone", "editSubmissionPhone", submission.phone),
    field("Enquiry Type", "editSubmissionEnquiryType", submission.enquiryType),
    field("Product Or Grade", "editSubmissionGrade", submission.grade),
    field("Quantity", "editSubmissionQuantity", submission.quantity),
    selectField("Review Status", "editSubmissionReviewStatus", submission.reviewStatus || "new", ["new", "reviewed"]),
    field("Notification Email", "editSubmissionNotificationTo", submission.notificationTo),
    field("Notification Status", "editSubmissionNotificationStatus", submission.notificationStatus),
    field("Auto Reply Status", "editSubmissionAutoReplyStatus", submission.autoReplyStatus),
    field("Message", "editSubmissionMessage", submission.message, { type: "textarea" })
  );

  const actions = document.createElement("div");
  actions.className = "form-actions";

  const save = document.createElement("button");
  save.className = "small-button";
  save.type = "button";
  save.textContent = "Save inquiry";
  save.addEventListener("click", () => {
    const reviewStatus = detail.querySelector("[name='editSubmissionReviewStatus']").value;
    updateSubmission(
      submission.id,
      {
        name: detail.querySelector("[name='editSubmissionName']").value,
        company: detail.querySelector("[name='editSubmissionCompany']").value,
        country: detail.querySelector("[name='editSubmissionCountry']").value,
        email: detail.querySelector("[name='editSubmissionEmail']").value,
        phone: detail.querySelector("[name='editSubmissionPhone']").value,
        enquiryType: detail.querySelector("[name='editSubmissionEnquiryType']").value,
        grade: detail.querySelector("[name='editSubmissionGrade']").value,
        quantity: detail.querySelector("[name='editSubmissionQuantity']").value,
        message: detail.querySelector("[name='editSubmissionMessage']").value,
        reviewStatus,
        reviewedAt: reviewStatus === "reviewed" ? submission.reviewedAt || new Date().toISOString() : "",
        notificationTo: detail.querySelector("[name='editSubmissionNotificationTo']").value,
        notificationStatus: detail.querySelector("[name='editSubmissionNotificationStatus']").value,
        autoReplyStatus: detail.querySelector("[name='editSubmissionAutoReplyStatus']").value
      },
      { notify: true, successMessage: "Inquiry record saved." }
    );
  });

  const cancel = document.createElement("button");
  cancel.className = "ghost-button";
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => renderSubmissionDetail(submission, detail));

  actions.append(save, cancel);
  detail.append(heading, grid, actions);
}

function contactSubmissionReplyUrl(submission) {
  const subject = encodeURIComponent(`Re: ${submission.enquiryType || "Aja Alloys enquiry"}`);
  const body = encodeURIComponent(
    [
      `Dear ${submission.name || ""},`,
      "",
      "Thank you for contacting Aja Alloys.",
      "",
      "Regards,"
    ].join("\n")
  );
  return `mailto:${submission.email || ""}?subject=${subject}&body=${body}`;
}

async function persistContactSubmissions(options = {}) {
  const successMessage = options.successMessage || "Contact submission records updated.";
  const response = await fetch(`${apiBase}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "contact_submissions", data: content.contact_submissions || { submissions: [] } })
  });

  if (!response.ok) {
    statusLine.textContent = "Submission update failed. Please check the local server.";
    return false;
  }

  if (options.notify) {
    showSaveSuccess(successMessage);
  } else {
    statusLine.textContent = successMessage;
  }
  return true;
}

async function updateSubmission(id, updates, options = {}) {
  const submissions = content.contact_submissions?.submissions || [];
  content.contact_submissions.submissions = submissions.map((submission) => (
    submission.id === id ? { ...submission, ...updates } : submission
  ));
  if (await persistContactSubmissions(options)) {
    renderContactSubmissions();
  }
}

async function deleteSubmission(id) {
  const submissions = content.contact_submissions?.submissions || [];
  content.contact_submissions.submissions = submissions.filter((submission) => submission.id !== id);
  if (await persistContactSubmissions()) {
    renderContactSubmissions();
  }
}

function formatSubmissionDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function displayCountry(value) {
  const country = String(value || "").trim();
  if (!country || country === "Unknown") return "Unknown";
  if (country.length !== 2) return country;

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) || country;
  } catch {
    return country.toUpperCase();
  }
}

function dropdownSection(titleText, description, open = false) {
  const section = document.createElement("details");
  section.className = "editor-dropdown";
  section.open = open;

  const summary = document.createElement("summary");
  const titleElement = document.createElement("span");
  titleElement.textContent = titleText;
  summary.append(titleElement);

  if (description) {
    const helper = document.createElement("small");
    helper.textContent = description;
    summary.append(helper);
  }

  const body = document.createElement("div");
  body.className = "dropdown-body";
  section.append(summary, body);

  return { section, body };
}

function postData(item = {}, fallbackType = "Announcement") {
  const hasPostDate = Boolean(item.postDate);
  const post = {
    type: item.type || fallbackType,
    title: item.title || "",
    summary: item.summary || "",
    postDate: item.postDate || item.date || item.closingDate || todayDateValue(),
    closingDate: hasPostDate ? item.closingDate || "" : "",
    actionLabel: item.actionLabel || "",
    actionUrl: item.actionUrl || "",
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
    pdfUrl: item.pdfUrl || "",
    pdfLabel: item.pdfLabel || ""
  };
  post.mediaType = mediaTypeFromPost(post);
  return post;
}

function hiddenInput(name, value) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value || "";
  return input;
}

function getRowPost(row) {
  const post = {
    type: row.querySelector("[name='postType']").value,
    title: row.querySelector("[name='postTitle']").value,
    summary: row.querySelector("[name='postSummary']").value,
    postDate: row.querySelector("[name='postDate']").value,
    closingDate: row.querySelector("[name='postClosingDate']").value,
    actionLabel: row.querySelector("[name='postActionLabel']").value,
    actionUrl: row.querySelector("[name='postActionUrl']").value,
    mediaType: row.querySelector("[name='postMediaType']").value,
    imageUrls: row.querySelector("[name='postImageUrls']").value
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean),
    pdfUrl: row.querySelector("[name='postPdfUrl']").value,
    pdfLabel: row.querySelector("[name='postPdfLabel']").value
  };
  post.mediaType = mediaTypeFromPost(post);
  return post;
}

function setRowPost(row, post) {
  post.mediaType = mediaTypeFromPost(post);
  row.querySelector("[name='postType']").value = post.type;
  row.querySelector("[name='postTitle']").value = post.title;
  row.querySelector("[name='postSummary']").value = post.summary;
  row.querySelector("[name='postDate']").value = post.postDate;
  row.querySelector("[name='postClosingDate']").value = post.closingDate;
  row.querySelector("[name='postActionLabel']").value = post.actionLabel;
  row.querySelector("[name='postActionUrl']").value = post.actionUrl;
  row.querySelector("[name='postMediaType']").value = post.mediaType;
  row.querySelector("[name='postImageUrls']").value = (post.imageUrls || []).join("\n");
  row.querySelector("[name='postPdfUrl']").value = post.pdfUrl;
  row.querySelector("[name='postPdfLabel']").value = post.pdfLabel;
  row.querySelector("[data-post-type]").textContent = post.type || "Post";
  row.querySelector("[data-post-title]").textContent = post.title || "Untitled post";
  row.querySelector("[data-post-date]").textContent = post.postDate || "";
  if (row.querySelector("[data-post-closing-date]")) {
    row.querySelector("[data-post-closing-date]").textContent = post.closingDate || "";
  }
  row.querySelector("[data-post-media]").textContent = mediaLabel(post);
}

function mediaLabel(post) {
  const labels = [];
  if ((post.imageUrls || []).length) labels.push(`${post.imageUrls.length} image(s)`);
  if (post.pdfUrl) labels.push("PDF");
  if (labels.length) return labels.join(", ");
  return "None";
}

function syncPostNumbers(tbody) {
  [...tbody.querySelectorAll("[data-post-row]")].forEach((row, index) => {
    row.querySelector("[data-post-number]").textContent = String(index + 1);
  });
}

function sortPostRows(tbody) {
  const rows = [...tbody.querySelectorAll("[data-post-row]")];
  rows.sort((first, second) => comparePostsByLatest(getRowPost(first), getRowPost(second)));
  rows.forEach((row) => tbody.append(row));
  syncPostNumbers(tbody);
}

function renderPostManager(items, itemTypes, includeClosingDate = false) {
  const manager = document.createElement("div");
  manager.className = "post-manager";

  const tableWrap = document.createElement("div");
  tableWrap.className = "post-table-wrap";
  const table = document.createElement("table");
  table.className = "post-table";
  const thead = document.createElement("thead");
  thead.innerHTML = includeClosingDate
    ? "<tr><th>No.</th><th>Type</th><th>Title</th><th>Date</th><th>Closing Date</th><th>Media</th><th>Action</th></tr>"
    : "<tr><th>No.</th><th>Type</th><th>Title</th><th>Date</th><th>Media</th><th>Action</th></tr>";
  const tbody = document.createElement("tbody");
  const editorHost = document.createElement("div");
  editorHost.className = "post-editor-host";

  sortPostsByLatest(items || []).forEach((item) => {
    tbody.append(renderPostRow(postData(item, itemTypes[0]), itemTypes, tbody, editorHost, includeClosingDate));
  });

  table.append(thead, tbody);
  tableWrap.append(table);

  const add = document.createElement("button");
  add.className = "small-button";
  add.type = "button";
  add.textContent = "Add advert post";
  add.addEventListener("click", () => {
    const row = renderPostRow(postData({ type: itemTypes[0] }, itemTypes[0]), itemTypes, tbody, editorHost, includeClosingDate);
    tbody.append(row);
    sortPostRows(tbody);
    openPostEditor(row, itemTypes, editorHost, tbody, includeClosingDate);
  });

  manager.append(add, editorHost, tableWrap);
  syncPostNumbers(tbody);
  return manager;
}

function renderPostRow(post, itemTypes, tbody, editorHost, includeClosingDate = false) {
  const row = document.createElement("tr");
  row.dataset.postRow = "";

  const numberCell = document.createElement("td");
  const numberLabel = document.createElement("span");
  numberLabel.dataset.postNumber = "";
  numberCell.append(
    numberLabel,
    hiddenInput("postType", post.type),
    hiddenInput("postTitle", post.title),
    hiddenInput("postSummary", post.summary),
    hiddenInput("postDate", post.postDate),
    hiddenInput("postClosingDate", post.closingDate),
    hiddenInput("postActionLabel", post.actionLabel),
    hiddenInput("postActionUrl", post.actionUrl),
    hiddenInput("postMediaType", post.mediaType),
    hiddenInput("postImageUrls", post.imageUrls.join("\n")),
    hiddenInput("postPdfUrl", post.pdfUrl),
    hiddenInput("postPdfLabel", post.pdfLabel)
  );

  const typeCell = document.createElement("td");
  typeCell.dataset.postType = "";
  const titleCell = document.createElement("td");
  titleCell.dataset.postTitle = "";
  const dateCell = document.createElement("td");
  dateCell.dataset.postDate = "";
  const closingDateCell = document.createElement("td");
  closingDateCell.dataset.postClosingDate = "";
  const mediaCell = document.createElement("td");
  mediaCell.dataset.postMedia = "";
  const actionCell = document.createElement("td");
  actionCell.className = "post-actions";

  const edit = iconActionButton("edit", "Edit advert post");
  edit.addEventListener("click", () => openPostEditor(row, itemTypes, editorHost, tbody, includeClosingDate));

  const remove = iconActionButton("delete", "Delete advert post", { danger: true });
  remove.addEventListener("click", async () => {
    const postTitle = row.querySelector("[data-post-title]").textContent || "this advert post";
    if (!(await confirmDelete(`Delete "${postTitle}"?`))) return;

    const wasEditing = row.classList.contains("is-editing");
    row.remove();
    syncPostNumbers(tbody);
    if (wasEditing) {
      editorHost.replaceChildren();
    }
  });

  actionCell.append(edit, remove);
  row.append(numberCell, typeCell, titleCell, dateCell);
  if (includeClosingDate) {
    row.append(closingDateCell);
  }
  row.append(mediaCell, actionCell);
  setRowPost(row, post);
  return row;
}

function openPostEditor(row, itemTypes, editorHost, tbody, includeClosingDate = false) {
  tbody.querySelectorAll("[data-post-row]").forEach((item) => item.classList.remove("is-editing"));
  row.classList.add("is-editing");

  const post = getRowPost(row);
  const editor = document.createElement("div");
  editor.className = "post-editor";
  const heading = document.createElement("h3");
  heading.textContent = post.title ? `Edit: ${post.title}` : "Edit advert post";

  const editorFields = [
    selectField("Advert Type", "editPostType", post.type, itemTypes),
    field("Advert Title", "editPostTitle", post.title),
    field("Advert Details", "editPostSummary", post.summary, { type: "textarea" }),
    field("Date", "editPostDate", post.postDate || todayDateValue(), { type: "date" }),
    field("Action Button Text", "editPostActionLabel", post.actionLabel),
    field("Action Link", "editPostActionUrl", post.actionUrl, { hint: "Optional. Use a full URL, a file path, or a mailto link." }),
    fileUploadField(),
    mediaSummaryField(),
    field("PDF Button Text", "editPostPdfLabel", post.pdfLabel || "View PDF")
  ];

  if (includeClosingDate) {
    editorFields.splice(4, 0, field("Closing Date", "editPostClosingDate", post.closingDate || "", { type: "date" }));
  }

  const pdfLabelField = editorFields.find((fieldElement) => fieldElement.querySelector("[name='editPostPdfLabel']"));

  function syncMediaFields() {
    const latestPost = getRowPost(row);
    const summary = editor.querySelector("[data-media-summary]");
    const clear = editor.querySelector("[data-clear-media]");

    summary.replaceChildren();
    if ((latestPost.imageUrls || []).length) {
      const list = document.createElement("ul");
      latestPost.imageUrls.forEach((url) => {
        const item = document.createElement("li");
        item.textContent = url;
        list.append(item);
      });
      summary.append("Image carousel:", list);
    }

    if (latestPost.pdfUrl) {
      const link = document.createElement("p");
      link.textContent = `PDF link: ${latestPost.pdfUrl}`;
      summary.append(link);
    }

    if (!latestPost.imageUrls.length && !latestPost.pdfUrl) {
      const empty = document.createElement("p");
      empty.textContent = "No file uploaded.";
      summary.append(empty);
    }

    clear.hidden = !latestPost.imageUrls.length && !latestPost.pdfUrl;
    pdfLabelField.hidden = !latestPost.pdfUrl;
  }

  function syncFromEditor() {
    setRowPost(row, {
      type: editor.querySelector("[name='editPostType']").value,
      title: editor.querySelector("[name='editPostTitle']").value,
      summary: editor.querySelector("[name='editPostSummary']").value,
      postDate: editor.querySelector("[name='editPostDate']").value,
      closingDate: includeClosingDate ? editor.querySelector("[name='editPostClosingDate']").value : "",
      actionLabel: editor.querySelector("[name='editPostActionLabel']").value,
      actionUrl: editor.querySelector("[name='editPostActionUrl']").value,
      imageUrls: getRowPost(row).imageUrls,
      pdfUrl: getRowPost(row).pdfUrl,
      pdfLabel: editor.querySelector("[name='editPostPdfLabel']").value
    });
    const latestTitle = row.querySelector("[name='postTitle']").value;
    heading.textContent = latestTitle ? `Edit: ${latestTitle}` : "Edit advert post";
    sortPostRows(tbody);
    syncMediaFields();
  }

  async function uploadFromEditor(event) {
    const files = [...event.target.files];
    if (!files.length) return;

    statusLine.textContent = "Uploading advert file...";
    try {
      const uploaded = await Promise.all(files.map(uploadAdvertFile));
      const latestPost = getRowPost(row);
      const imageUploads = uploaded.filter((item) => item.kind === "image").map((item) => item.path);
      const pdfUpload = uploaded.find((item) => item.kind === "pdf");

      setRowPost(row, {
        ...latestPost,
        imageUrls: [...latestPost.imageUrls, ...imageUploads],
        pdfUrl: pdfUpload ? pdfUpload.path : latestPost.pdfUrl,
        pdfLabel: editor.querySelector("[name='editPostPdfLabel']").value || "View PDF"
      });
      statusLine.textContent = "File uploaded. Save changes to publish the post update.";
      syncMediaFields();
    } catch {
      statusLine.textContent = "Upload failed. Please use image files or PDF files only.";
    } finally {
      event.target.value = "";
    }
  }

  function clearMedia() {
    const latestPost = getRowPost(row);
    setRowPost(row, {
      ...latestPost,
      imageUrls: [],
      pdfUrl: "",
      pdfLabel: editor.querySelector("[name='editPostPdfLabel']").value || "View PDF"
    });
    syncMediaFields();
    statusLine.textContent = "Uploaded file removed from this post. Save changes to publish the update.";
  }

  editorFields.forEach((fieldElement) => {
    const control = fieldElement.querySelector("input, select, textarea");
    if (!control) return;
    if (control.name === "editPostUpload") {
      control.addEventListener("change", uploadFromEditor);
      return;
    }
    control.addEventListener("input", syncFromEditor);
    control.addEventListener("change", syncFromEditor);
  });

  editor.append(heading, ...editorFields);
  editor.querySelector("[data-clear-media]").addEventListener("click", clearMedia);
  editorHost.replaceChildren(editor);
  syncMediaFields();
}

function renderCategory(itemTypes) {
  const data = content[activeSection] || {};
  const grid = document.createElement("div");
  grid.className = "form-grid";

  const panelSettings = dropdownSection(
    "Admin panel settings",
    "Admin only. Open this when changing the website tab heading, intro, or enquiry email."
  );
  panelSettings.section.classList.add("admin-settings-dropdown");
  panelSettings.body.append(
    checkboxField("Hide panel heading on the website", "hideIntro", data.hideIntro),
    field("Status Label", "status", data.status),
    field("Panel Heading", "title", data.title),
    field("Panel Intro Text", "summary", data.summary, { type: "textarea" }),
    field("Button Text", "contactLabel", data.contactLabel),
    field("Enquiry Email", "contactEmail", data.contactEmail),
    field("Email Subject", "contactSubject", data.contactSubject)
  );

  const postSection = dropdownSection(
    "Post section",
    "Add, remove, and edit the advert posts shown on the website.",
    true
  );
  postSection.body.append(renderPostManager(data.items || [], itemTypes, activeSection === "tenders"));
  if (isPostEditorDashboard) {
    grid.append(postSection.section);
  } else {
    grid.append(postSection.section, panelSettings.section);
  }
  form.replaceChildren(grid);
}

function renderContactCards() {
  const grid = document.createElement("div");
  grid.className = "form-grid";
  const list = document.createElement("div");
  list.className = "form-grid";
  list.dataset.cards = "";
  (content.contact_cards.cards || []).forEach((card, index) => list.append(renderContactCard(card, index + 1)));

  const add = document.createElement("button");
  add.className = "small-button";
  add.type = "button";
  add.textContent = "Add contact card";
  add.addEventListener("click", () => list.append(renderContactCard({ title: "", lines: [] }, list.children.length + 1)));

  grid.append(list, add);
  form.replaceChildren(grid);
}

function renderContactCard(card, number) {
  const wrapper = document.createElement("div");
  wrapper.className = "card";
  wrapper.dataset.card = "";

  const head = document.createElement("div");
  head.className = "item-head";
  const heading = document.createElement("h3");
  heading.textContent = `Contact card ${number}`;
  const remove = document.createElement("button");
  remove.className = "danger-button";
  remove.type = "button";
  remove.textContent = "Remove";
  remove.addEventListener("click", async () => {
    if (await confirmDelete(`Remove contact card ${number}?`)) {
      wrapper.remove();
    }
  });
  head.append(heading, remove);

  const lines = document.createElement("div");
  lines.className = "form-grid";
  lines.dataset.lines = "";
  (card.lines || []).forEach((line, index) => lines.append(renderContactLine(line, index + 1)));

  const addLine = document.createElement("button");
  addLine.className = "small-button";
  addLine.type = "button";
  addLine.textContent = "Add contact line";
  addLine.addEventListener("click", () => lines.append(renderContactLine({ type: "text", label: "", value: "", muted: false }, lines.children.length + 1)));

  wrapper.append(
    head,
    field("Card Title", "cardTitle", card.title),
    lines,
    addLine,
    field("Map Button Text", "map.label", card.map?.label || "Directions"),
    field("Map Search Query", "map.query", card.map?.query || ""),
    field("Map Embed URL", "map.embedUrl", card.map?.embedUrl || ""),
    field("Directions URL", "map.directionsUrl", card.map?.directionsUrl || ""),
    field("Directions Button Text", "map.directionsLabel", card.map?.directionsLabel || "Get directions")
  );
  return wrapper;
}

function renderContactLine(line, number) {
  const wrapper = document.createElement("div");
  wrapper.className = "item";
  wrapper.dataset.line = "";

  const head = document.createElement("div");
  head.className = "item-head";
  const heading = document.createElement("h3");
  heading.textContent = `Line ${number}`;
  const remove = document.createElement("button");
  remove.className = "danger-button";
  remove.type = "button";
  remove.textContent = "Remove";
  remove.addEventListener("click", async () => {
    if (await confirmDelete(`Remove contact line ${number}?`)) {
      wrapper.remove();
    }
  });
  head.append(heading, remove);

  wrapper.append(
    head,
    selectField("Line Type", "lineType", line.type || "text", ["text", "email", "phone"]),
    field("Display Text", "lineLabel", line.label),
    field("Email Or Phone Value", "lineValue", line.value || ""),
    checkboxField("Show as muted note", "lineMuted", line.muted)
  );
  return wrapper;
}

function updateSection(section) {
  if (!sections[section]) return;

  activeSection = section;
  sectionButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.section === section));
  title.textContent = sections[section].label;
  kicker.textContent = `${sections[section].group} | ${files[section]}`;
  statusLine.textContent = sections[section].description;
  saveButton.hidden = ["contact_submissions", "visitor_analytics"].includes(section);

  if (section === "information") {
    renderSimple([
      { label: "Small Heading", name: "eyebrow" },
      { label: "Main Heading", name: "title" },
      { label: "Short Intro Text", name: "summary", type: "textarea" }
    ]);
  } else if (section === "contact_form") {
    renderContactFormSettings();
  } else if (section === "contact_cards") {
    renderContactCards();
  } else if (section === "contact_submissions") {
    renderContactSubmissions();
  } else if (section === "visitor_analytics") {
    renderVisitorAnalytics();
  } else if (section === "users") {
    renderUsers();
  } else if (section === "vacancies") {
    renderCategory(["Vacancy announcement", "Internship", "Contract role", "Recruitment notice"]);
  } else if (section === "tenders") {
    renderCategory(["Tender notice", "Supplier notice", "Request for quotation", "Tender addendum"]);
  } else {
    renderCategory(["Announcement", "Public information", "Company update", "Documentation"]);
  }
}

function readSimple() {
  const data = { ...content[activeSection] };
  [...form.querySelectorAll("[data-path]")].forEach((input) => {
    setValue(data, input.dataset.path, input.value);
  });
  return data;
}

function readContactFormSettings() {
  const data = readSimple();
  data.enquiryTypes = form.enquiryTypes.value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return data;
}

function readContactCards() {
  return {
    cards: [...form.querySelectorAll("[data-card]")].map((card) => {
      const data = {
        title: card.querySelector("[name='cardTitle']").value,
        lines: [...card.querySelectorAll("[data-line]")].map((line) => ({
          type: line.querySelector("[name='lineType']").value,
          label: line.querySelector("[name='lineLabel']").value,
          value: line.querySelector("[name='lineValue']").value,
          muted: line.querySelector("[name='lineMuted']").checked
        }))
      };

      const map = {};
      [...card.querySelectorAll("[data-path^='map.']")].forEach((input) => {
        const key = input.dataset.path.replace("map.", "");
        if (input.value) map[key] = input.value;
      });
      if (Object.keys(map).length) data.map = map;
      return data;
    })
  };
}

function readCurrentSection() {
  if (activeSection === "contact_submissions") {
    return content.contact_submissions || { submissions: [] };
  }
  if (activeSection === "visitor_analytics") {
    return content.visitor_analytics || {};
  }
  if (activeSection === "users") {
    return readUsers();
  }
  if (["notices", "vacancies", "tenders"].includes(activeSection)) {
    return readCommonCategory();
  }
  if (activeSection === "contact_cards") {
    return readContactCards();
  }
  if (activeSection === "contact_form") {
    return readContactFormSettings();
  }
  return readSimple();
}

async function saveCurrentSection() {
  if (["contact_submissions", "visitor_analytics"].includes(activeSection)) return;

  const data = readCurrentSection();
  if (activeSection === "users") {
    const response = await fetch(`${apiBase}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: data })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      statusLine.textContent = result.error || "User save failed. Check that one active admin remains.";
      return;
    }

    content.users = result.users || [];
    showSaveSuccess("Users saved.");
    renderUsers();
    return;
  }

  const response = await fetch(`${apiBase}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: activeSection, data })
  });

  if (!response.ok) {
    statusLine.textContent = "Save failed. Please check the local server.";
    return;
  }

  content[activeSection] = data;
  showSaveSuccess(`Saved ${files[activeSection]}. Refresh the website preview to see the change.`);
}

async function loadContent() {
  const filesResponse = await fetch(`${apiBase}/files`);
  if (!filesResponse.ok) {
    window.location.href = "/admin/post-editor-login.html";
    return;
  }

  content = await filesResponse.json();
  if (!isPostEditorDashboard && currentUser?.role === "admin") {
    const usersResponse = await fetch(`${apiBase}/users`);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      content.users = usersData.users || [];
    }
  }
  updateSection(activeSection);
}

async function loadSession() {
  const response = await fetch(`${apiBase}/session`);
  const session = await response.json().catch(() => ({}));
  if (!session.authenticated) {
    window.location.href = "/admin/post-editor-login.html";
    return false;
  }

  currentUser = session.user;
  if (sessionUser) {
    sessionUser.textContent = `${currentUser.name || currentUser.username} (${currentUser.role})`;
  }
  return true;
}

async function logout() {
  await fetch(`${apiBase}/logout`, { method: "POST" });
  window.location.href = "/admin/post-editor-login.html";
}

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.history.replaceState(null, "", `#${button.dataset.section}`);
    updateSection(button.dataset.section);
  });
});

saveButton.addEventListener("click", saveCurrentSection);
logoutButton?.addEventListener("click", logout);

(async () => {
  if (await loadSession()) {
    loadContent();
  }
})();
