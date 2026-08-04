import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.argv[2];

if (!token) {
  console.error("❌ Error: Token is required as command line argument.");
  console.error("Usage: npm run sync-prices -- <token>");
  process.exit(1);
}

const baseUrl = process.env.BASE_URL;
if (!baseUrl) {
  console.error("❌ Error: BASE_URL is not set in environment.");
  process.exit(1);
}

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  authorization: `Bearer ${token}`,
};

const vpsRegions = [
  "VN",
  "US",
  "SG",
  "UK",
  "AU",
  "DE",
  "FR",
  "CA",
  "NL",
  "JP",
  "HK",
  "gpu",
  "EU",
];

const proxyNations = [
  "VNR",
  "VN",
  "SG",
  "US",
  "CA",
  "AU",
  "DE",
  "UK",
  "FR",
  "JP",
  "HK",
];

const vpsDataPath = path.join(
  __dirname,
  "../src/data/prices/vps-plans.json",
);
const proxyDataPath = path.join(
  __dirname,
  "../src/data/prices/proxy-prices.json",
);

async function syncVpsPlans() {
  console.log("🔄 Syncing VPS plans...");
  const vpsPlans = {};

  for (const region of vpsRegions) {
    try {
      const url =
        region === "gpu"
          ? `${baseUrl}/plan/gpu`
          : `${baseUrl}/plan/vps?region=${region}`;

      const res = await fetch(url, { method: "GET", headers: HEADERS });
      if (!res.ok) {
        console.warn(`⚠️ Failed VPS fetch for region ${region}: ${res.status}`);
        continue;
      }
      const data = await res.json();
      vpsPlans[region] = data;
      console.log(` ✅ VPS ${region}: ${Array.isArray(data) ? data.length : 0} items`);
    } catch (err) {
      console.error(`❌ Error fetching VPS ${region}:`, err.message);
    }
  }

  fs.mkdirSync(path.dirname(vpsDataPath), { recursive: true });
  fs.writeFileSync(vpsDataPath, JSON.stringify(vpsPlans, null, 2), "utf-8");
  console.log(`💾 Saved VPS plans to ${vpsDataPath}`);
}

async function syncProxyPrices() {
  console.log("🔄 Syncing Proxy prices...");
  const proxyPrices = {};

  for (const nation of proxyNations) {
    try {
      const url = `${baseUrl}/server/create/calculate`;
      const payload = {
        plan_id: 0,
        nation,
        quantity: 1,
        duration: 1,
        is_proxy: true,
        coupon: "",
      };

      const res = await fetch(url, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn(`⚠️ Failed Proxy fetch for nation ${nation}: ${res.status}`);
        continue;
      }
      const data = await res.json();
      proxyPrices[nation] = data;
      console.log(` ✅ Proxy ${nation}: ${data.original_price || "OK"}`);
    } catch (err) {
      console.error(`❌ Error fetching Proxy ${nation}:`, err.message);
    }
  }

  fs.mkdirSync(path.dirname(proxyDataPath), { recursive: true });
  fs.writeFileSync(proxyDataPath, JSON.stringify(proxyPrices, null, 2), "utf-8");
  console.log(`💾 Saved Proxy prices to ${proxyDataPath}`);
}

async function main() {
  await syncVpsPlans();
  await syncProxyPrices();
  console.log("✨ Price synchronization complete!");
}

main().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
