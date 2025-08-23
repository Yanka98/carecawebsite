import { itnSignature } from "./_pf.js";
import querystring from "querystring";

// Disable body parsing and read raw body (PayFast posts x-www-form-urlencoded)
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    let raw = "";
    await new Promise(resolve => {
      req.setEncoding("utf8");
      req.on("data", chunk => raw += chunk);
      req.on("end", resolve);
    });
    const parsed = querystring.parse(raw || "");
    const incoming = String(parsed.signature || "");
    const computed = itnSignature(parsed, process.env.PAYFAST_PASSPHRASE || "");

    console.log("[PF][ITN]", { ok: incoming.toLowerCase()===computed.toLowerCase(), incoming, computed, parsed });

    // ACK regardless (PayFast requires 200)
    res.status(200).send("OK");
  } catch (e) {
    console.error("[PF][ITN] error", e);
    res.status(200).send("OK");
  }
}
