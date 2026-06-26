import { githubGetJson, githubPutJson, jsonResponse } from "./post-editor/_shared.js";

const CONTACT_FORM_PATH = "content/contact-form.json";
const CONTACT_SUBMISSIONS_PATH = "content/contact-submissions.json";

export async function onRequestPost({ request, env }) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid contact form payload" }, 400);
  }

  if (valueOf(formData, "website")) {
    return jsonResponse({ ok: true, status: "ignored" });
  }

  const required = ["name", "email", "enquiryType", "grade", "message"];
  const missing = required.filter((field) => !valueOf(formData, field));
  if (missing.length) {
    return jsonResponse({ ok: false, error: `Missing required fields: ${missing.join(", ")}` }, 400);
  }

  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return jsonResponse({ ok: false, error: "Missing GitHub submission storage settings" }, 500);
  }

  const config = await githubGetJson(CONTACT_FORM_PATH, env);
  const current = await githubGetJson(CONTACT_SUBMISSIONS_PATH, env).catch(() => ({ submissions: [] }));
  const notificationTo = config.notificationEmail || config.formRecipient || env.AJA_NOTIFICATION_TO || "";
  const phone = [valueOf(formData, "phoneCountryCode"), valueOf(formData, "phone")].filter(Boolean).join(" ");

  const record = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    notificationTo,
    notificationStatus: "pending",
    autoReplyStatus: "pending",
    name: valueOf(formData, "name"),
    company: valueOf(formData, "company"),
    country: valueOf(formData, "country"),
    email: valueOf(formData, "email"),
    phone,
    enquiryType: valueOf(formData, "enquiryType"),
    grade: valueOf(formData, "grade"),
    quantity: valueOf(formData, "quantity"),
    message: valueOf(formData, "message"),
    reviewStatus: "new",
    reviewedAt: ""
  };

  record.notificationStatus = await sendOfficeNotification(record, config, env);
  record.autoReplyStatus = await sendAutoReply(record, config, env);

  const next = {
    ...current,
    submissions: [record, ...(Array.isArray(current.submissions) ? current.submissions : [])]
  };
  await githubPutJson(CONTACT_SUBMISSIONS_PATH, next, "Add contact form submission", env);

  return jsonResponse({
    ok: true,
    recordId: record.id,
    notificationStatus: record.notificationStatus,
    autoReplyStatus: record.autoReplyStatus
  });
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

function valueOf(formData, key) {
  return String(formData.get(key) || "").trim();
}

async function sendOfficeNotification(record, config, env) {
  if (!record.notificationTo) return "not_configured";

  const subjectPrefix = config.formSubjectPrefix || "Aja Alloys enquiry";
  return sendEmail({
    to: record.notificationTo,
    replyTo: record.email,
    subject: `${subjectPrefix}: ${record.enquiryType}`,
    text: [
      "New website enquiry received.",
      "",
      `Name: ${record.name}`,
      `Company: ${record.company}`,
      `Country: ${record.country}`,
      `Email: ${record.email}`,
      `Phone: ${record.phone}`,
      `Enquiry type: ${record.enquiryType}`,
      `Product or grade: ${record.grade}`,
      `Quantity: ${record.quantity}`,
      "",
      record.message
    ].join("\n")
  }, env);
}

async function sendAutoReply(record, config, env) {
  if (!record.email.includes("@")) return "skipped";

  const replyTo = config.notificationEmail || config.formRecipient || env.AJA_NOTIFICATION_TO || "";
  return sendEmail({
    to: record.email,
    replyTo,
    subject: "We received your Aja Alloys enquiry",
    text: [
      `Dear ${record.name},`,
      "",
      "Thank you for contacting Aja Alloys. We have received your enquiry and our team will review it shortly.",
      "",
      "Your enquiry summary:",
      `Enquiry type: ${record.enquiryType}`,
      `Product or grade: ${record.grade}`,
      `Quantity: ${record.quantity}`,
      "",
      "Regards,",
      "Aja Alloys"
    ].join("\n")
  }, env);
}

async function sendEmail(message, env) {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN && env.AJA_EMAIL_FROM) {
    return sendGoogleWorkspaceEmail(message, env);
  }

  if (env.RESEND_API_KEY && env.AJA_EMAIL_FROM) {
    return sendResendEmail(message, env);
  }

  return "not_configured";
}

async function sendGoogleWorkspaceEmail(message, env) {
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token"
      })
    });

    if (!tokenResponse.ok) {
      return "failed";
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return "failed";
    }

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        raw: base64UrlEncode(buildMimeMessage(message, env.AJA_EMAIL_FROM))
      })
    });

    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

async function sendResendEmail(message, env) {
  if (!env.RESEND_API_KEY || !env.AJA_EMAIL_FROM) {
    return "not_configured";
  }

  const payload = {
    from: env.AJA_EMAIL_FROM,
    to: splitAddresses(message.to),
    subject: message.subject,
    text: message.text
  };

  if (message.replyTo) {
    payload.reply_to = splitAddresses(message.replyTo);
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

function buildMimeMessage(message, from) {
  const headers = [
    `From: ${cleanHeader(from)}`,
    `To: ${cleanHeader(message.to)}`,
    `Subject: ${cleanHeader(message.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8"
  ];

  if (message.replyTo) {
    headers.splice(2, 0, `Reply-To: ${cleanHeader(message.replyTo)}`);
  }

  return `${headers.join("\r\n")}\r\n\r\n${message.text || ""}`;
}

function base64UrlEncode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function cleanHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function splitAddresses(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
