import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICES_DIR = path.join(__dirname, "../data/prices");

/**
 * Reads cached VPS plan array for a given region (or null if not found)
 */
export function getCachedVpsPlans(region) {
  try {
    const cachePath = path.join(PRICES_DIR, "vps-plans.json");
    if (fs.existsSync(cachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      return cacheData?.[region] || null;
    }
  } catch (err) {
    console.error("❌ Error reading VPS plan cache:", err.message);
  }
  return null;
}

/**
 * Reads cached Proxy price object for a given nation (or null if not found)
 */
export function getCachedProxyPrice(nation) {
  try {
    const cachePath = path.join(PRICES_DIR, "proxy-prices.json");
    if (fs.existsSync(cachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      return cacheData?.[nation] || null;
    }
  } catch (err) {
    console.error("❌ Error reading Proxy price cache:", err.message);
  }
  return null;
}
