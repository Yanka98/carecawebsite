import { buildWebsiteBaseString, md5, htmlForm } from "./_pf.js";

export default async function handler(req, res) {
  const mode = (process.env.PAYFAST_MODE || "sandbox").toLowerCase();
  const host =
    mode === "live"
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process";

  const body = req.method === "POST" ? req.body || {} : {};
  const today = new Date().toISOString().slice(0, 10);

  const fields = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${process.env.APP_BASE_URL}/ok`,
    cancel_url: `${process.env.APP_BASE_URL}/cancel`,
    notify_url: `${process.env.GATEWAY_BASE_URL}/api/notify`,

    name_first: body.name_first || "Test",
    name_last: body.name_last || "User",
    email_address: body.email_address || "test@example.com",

    m_payment_id: `pf_${Date.now()}`,
    amount: body.amount || "60.00",
    item_name: body.item_name || "Subscription",

    payment_method: "cc",
    subscription_type: "1",
    billing_date: body.billing_date || today,
    recurring_amount: body.recurring_amount || body.amount || "60.00",
    frequency: String(body.frequency || "3"),
    cycles: String(body.cycles || "0"),
  };

  const base = buildWebsiteBaseString(
    fields,
    process.env.PAYFAST_PASSPHRASE || "",
  );
  const signature = md5(base);
  const posted = { ...fields, signature };

  res.setHeader("x-pf-route", "vercel");
  res.setHeader("content-type", "text/html; charset=utf-8");

  // add ?debug=1 to pause auto-submit so you can read the form
  const auto = req.query?.debug !== "1";
  res.status(200).send(htmlForm(host, posted, { auto }));
}
