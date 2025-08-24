// api/create-subscription.js  (ESM on Vercel)
import crypto from "node:crypto";

const WEBSITE_FIELD_ORDER = [
  "merchant_id","merchant_key","return_url","cancel_url","notify_url",
  "name_first","name_last","email_address","m_payment_id","amount","item_name",
  "payment_method","subscription_type","billing_date","recurring_amount","frequency","cycles"
];

const ymd = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const enc = v => encodeURIComponent(String(v)).replace(/%20/g, "+");
const md5 = s => crypto.createHash("md5").update(s, "utf8").digest("hex");

function buildBase(fields, passphrase) {
  const parts = [];
  for (const k of WEBSITE_FIELD_ORDER) {
    const v = fields[k];
    if (v !== undefined && v !== null && String(v) !== "") {
      parts.push(`${k}=${enc(v)}`);
    }
  }
  if (passphrase) parts.push(`passphrase=${enc(passphrase)}`);
  return parts.join("&");
}

export default function handler(req, res) {
  try {
    const SITE_BASE    = process.env.APP_BASE_URL      || "https://allcarerecruitment.co.za";
    const GATEWAY_BASE = process.env.GATEWAY_BASE_URL  || `https://${req.headers.host}`;
    const MODE         = (process.env.PAYFAST_MODE || "live").toLowerCase();
    const PF_HOST      = MODE === "live" ? "www.payfast.co.za" : "sandbox.payfast.co.za";

    const q = req.method === "GET" ? (req.query || {}) : (req.body || {});
    const name_first = q.name_first || "Customer";
    const name_last  = q.name_last  || "User";
    const email_address = q.email_address || "test@example.com";
    const planType = (q.type || "").toLowerCase();

    const isEmployer = planType === "employer";
    const amount = isEmployer ? "650.00" : "60.00";
    const item_name = isEmployer
      ? "All Care Employer Monthly Subscription"
      : "All Care Caregiver Monthly Subscription";
    const recurring_amount = amount;

    const fields = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: `${SITE_BASE}/ok`,
      cancel_url: `${SITE_BASE}/cancel`,
      notify_url: `${GATEWAY_BASE}/api/notify`,
      name_first,
      name_last,
      email_address,
      m_payment_id: `pf_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      amount,
      item_name,
      payment_method: "cc",
      subscription_type: "1",
      billing_date: ymd(),
      recurring_amount,
      frequency: "3", // monthly
      cycles: "0"
    };

    // Hard fail fast if essential envs are missing
    for (const k of ["merchant_id", "merchant_key"]) {
      if (!fields[k]) {
        res.status(500).send(`Missing ${k} env`);
        return;
      }
    }

    const base = buildBase(fields, process.env.PAYFAST_PASSPHRASE || "");
    const signature = md5(base);

    const debug = q.debug === "1" || q.debug === 1;

    const inputs = Object.entries({ ...fields, signature })
      .map(([k,v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`)
      .join("\n");

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Redirecting to PayFast…</title></head>
<body>
${debug ? `<pre>PF_HOST=${PF_HOST}
BASE=${base}
SIG=${signature}</pre>` : ""}
<form id="pfForm" action="https://${PF_HOST}/eng/process" method="post">
${inputs}
</form>
${debug ? "" : '<script>document.getElementById("pfForm").submit();</script>'}
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    console.error("[create-subscription] error:", e);
    res.status(500).send("Error building PayFast form");
  }
}
