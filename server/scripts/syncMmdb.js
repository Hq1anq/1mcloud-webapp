import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = "P3TERX/GeoLite.mmdb";
const ASSET_NAME = "GeoLite2-Country.mmdb";
const TARGET_PATH = path.join(__dirname, "../src/data/GeoLite2-Country.mmdb");

async function syncMmdb() {
  console.log(`Checking latest release for ${REPO}...`);

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
    );
    if (!res.ok)
      throw new Error(`Failed to fetch release info: ${res.statusText}`);

    const release = await res.json();
    const asset = release.assets.find((a) => a.name === ASSET_NAME);

    if (!asset) {
      throw new Error(`Asset ${ASSET_NAME} not found in latest release.`);
    }

    console.log(
      `Downloading ${ASSET_NAME} from ${asset.browser_download_url}...`,
    );

    const downloadRes = await fetch(asset.browser_download_url);
    if (!downloadRes.ok)
      throw new Error(`Failed to download asset: ${downloadRes.statusText}`);

    const fileStream = fs.createWriteStream(TARGET_PATH);
    await finished(Readable.fromWeb(downloadRes.body).pipe(fileStream));

    console.log(`Successfully synced ${ASSET_NAME} to ${TARGET_PATH}`);
  } catch (err) {
    console.error("Error syncing MMDB:", err.message);
    process.exit(1);
  }
}

syncMmdb();
