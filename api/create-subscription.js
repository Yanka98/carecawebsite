// At top of the handler:
const SITE_BASE = process.env.APP_BASE_URL || 'https://allcarerecruitment.co.za';
const GATEWAY_BASE = process.env.GATEWAY_BASE_URL || `https://${req.headers.host}`;

// When building the PayFast field set:
const fields = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  return_url: `${SITE_BASE}/ok`,
  cancel_url: `${SITE_BASE}/cancel`,
  notify_url: `${GATEWAY_BASE}/api/notify`,
  name_first,
  name_last,
  email_address,
  m_payment_id,
  amount: "60.00", // or your logic
  item_name: "All Care Caregiver Monthly Subscription", // or employer plan
  payment_method: "cc",
  subscription_type: "1",
  billing_date,             // your existing date logic
  recurring_amount: "60.00",// or employer price
  frequency: "3",           // monthly
  cycles: "0"
};
