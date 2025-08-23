import crypto from "crypto";

export const WEBSITE_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "m_payment_id",
  "amount",
  "item_name",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
];

const enc = (v) => encodeURIComponent(String(v)).replace(/%20/g, "+");

export function buildWebsiteBaseString(fields, passphrase) {
  const clean = {};
  for (const k of WEBSITE_FIELD_ORDER) {
    if (k === "signature") continue;
    const v = fields[k];
    if (v !== undefined && v !== null && String(v) !== "") clean[k] = String(v);
  }
  let base = "";
  for (const k of WEBSITE_FIELD_ORDER) {
    if (clean[k] === undefined) continue;
    base += `${k}=${enc(clean[k])}&`;
  }
  if (passphrase) base += `passphrase=${enc(passphrase)}&`;
  if (base.endsWith("&")) base = base.slice(0, -1);
  return base;
}

export const md5 = (s) =>
  crypto.createHash("md5").update(s, "utf8").digest("hex");

export function htmlForm(host, fields, { auto = true } = {}) {
  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v)}">`)
    .join("\n");
  const autoJs = auto
    ? `<script>document.getElementById('pfForm').submit();</script>`
    : "";
  return `<!doctype html><html><body>
  <form id="pfForm" action="${host}" method="post">${inputs}</form>
  ${autoJs}
  </body></html>`;
}

// ITN signature (alphabetical keys, urlencoded with + for space)
export function itnSignature(params, passphrase) {
  const data = {};
  for (const [k, v] of Object.entries(params || {})) {
    if (k === "signature") continue;
    if (v !== undefined && v !== null && String(v) !== "") data[k] = String(v);
  }
  const keys = Object.keys(data).sort();
  let base = "";
  for (const k of keys) base += `${k}=${enc(data[k])}&`;
  if (passphrase) base += `passphrase=${enc(passphrase)}&`;
  if (base.endsWith("&")) base = base.slice(0, -1);
  return md5(base);
}
