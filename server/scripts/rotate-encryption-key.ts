import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getPool } from "../src/lib/db.js";
import {
  isEncrypted,
  getPrefix,
  verifyKey,
  decryptWithKey,
  encryptWithKey,
} from "../src/services/crypto.service.ts";

interface RotateOptions {
  type: "all" | "vps" | "proxy";
  oldKey: string;
  newKey: string;
  ip?: string;
  dryRun: boolean;
  help: boolean;
}

function maskKey(key: string): string {
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)} (${key.length} chars)`;
}

function parseArgs(): RotateOptions {
  const args = process.argv.slice(2);
  const options: RotateOptions = {
    type: "all",
    oldKey: "",
    newKey: "",
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg.startsWith("--type=") || arg.startsWith("-t=")) {
      const val = arg.split("=")[1].toLowerCase();
      if (val === "vps" || val === "proxy" || val === "all") {
        options.type = val;
      }
    } else if (arg === "--type" || arg === "-t") {
      const next = args[++i]?.toLowerCase();
      if (next === "vps" || next === "proxy" || next === "all") {
        options.type = next;
      }
    } else if (arg.startsWith("--old-key=")) {
      options.oldKey = arg.split("=")[1].trim();
    } else if (arg === "--old-key") {
      options.oldKey = args[++i]?.trim() || "";
    } else if (arg.startsWith("--new-key=")) {
      options.newKey = arg.split("=")[1].trim();
    } else if (arg === "--new-key") {
      options.newKey = args[++i]?.trim() || "";
    } else if (arg.startsWith("--ip=") || arg.startsWith("-i=")) {
      options.ip = arg.split("=")[1].trim();
    } else if (arg === "--ip" || arg === "-i") {
      options.ip = args[++i]?.trim();
    }
  }

  return options;
}

function showHelp() {
  console.log(`
=============================================================================
  🔄 Database user_pass Encryption Key Rotation Tool
=============================================================================

Usage:
  node --env-file=.env --import tsx/esm scripts/rotate-encryption-key.ts [options]
  npm run rotate-encryption-key

Options:
  --old-key       The previous encryption key (can be hex or passphrase)
  --new-key       The new encryption key to rotate to
  --type, -t      Target product: "all" | "proxy" | "vps" (default: "all")
  --ip, -i        Filter by specific IP address
  --dry-run, -d   Preview without updating database records
  --help, -h      Show this help message
=============================================================================
`);
}

async function promptOptions(): Promise<RotateOptions | null> {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("\n=============================================================================");
    console.log("  🔄 Database Encryption Key Rotation Wizard");
    console.log("=============================================================================\n");

    // 1. Target table
    console.log("1. Select target table(s):");
    console.log("   [1] Both Proxy and VPS (All - Recommended)");
    console.log("   [2] Proxy only");
    console.log("   [3] VPS only");
    const typeAnswer = (await rl.question("   👉 Your choice [1-3] (default: 1): ")).trim();

    let targetType: "all" | "proxy" | "vps" = "all";
    if (typeAnswer === "2") targetType = "proxy";
    else if (typeAnswer === "3") targetType = "vps";

    // 2. Old Key
    const envKey = process.env.ENCRYPTION_KEY || "";
    const envKeyHint = envKey ? ` [Press Enter to use current .env key: ${maskKey(envKey)}]` : "";
    let oldKey = "";
    while (!oldKey) {
      console.log(`\n2. Current / OLD Encryption Key:${envKeyHint}`);
      const ans = (await rl.question("   👉 Enter OLD key: ")).trim();
      oldKey = ans || envKey;
      if (!oldKey) {
        console.log("   ❌ OLD key cannot be empty. Please enter a valid key.");
      }
    }

    // 3. New Key
    let newKey = "";
    while (!newKey) {
      console.log("\n3. Target / NEW Encryption Key:");
      const ans = (await rl.question("   👉 Enter NEW key: ")).trim();
      if (!ans) {
        console.log("   ❌ NEW key cannot be empty. Please enter a new key.");
        continue;
      }
      if (ans === oldKey) {
        console.log("   ❌ NEW key must be different from OLD key.");
        continue;
      }
      newKey = ans;
    }

    // 4. Execution mode
    console.log("\n4. Select execution mode:");
    console.log("   [1] Live Run (Rotate and update database records)");
    console.log("   [2] Dry Run (Simulation preview, no changes saved)");
    const modeAnswer = (await rl.question("   👉 Your choice [1-2] (default: 1): ")).trim();
    const dryRun = modeAnswer === "2";

    // 5. Target IP filter
    console.log("\n5. Target IP filter (optional):");
    const ipAnswer = (await rl.question("   👉 Enter IP address to filter (press Enter to process ALL): ")).trim();
    const ip = ipAnswer || undefined;

    // 6. Confirmation
    console.log("\n-------------------------------------------------------------");
    console.log("📋 Configuration Review:");
    console.log(`   • Target:     ${targetType.toUpperCase()}`);
    console.log(`   • Mode:       ${dryRun ? "DRY-RUN (Preview only)" : "LIVE UPDATE (Re-encrypt database)"}`);
    console.log(`   • IP Filter:  ${ip || "All records"}`);
    console.log(`   • OLD Key:    ${maskKey(oldKey)}`);
    console.log(`   • NEW Key:    ${maskKey(newKey)}`);
    console.log("-------------------------------------------------------------");

    const confirmAnswer = (await rl.question("👉 Proceed with key rotation? [Y/n]: ")).trim().toLowerCase();
    if (confirmAnswer === "n" || confirmAnswer === "no") {
      console.log("\n❌ Operation cancelled by user. Exiting.\n");
      return null;
    }

    return {
      type: targetType,
      oldKey,
      newKey,
      ip,
      dryRun,
      help: false,
    };
  } finally {
    rl.close();
  }
}

interface TableStats {
  tableName: string;
  totalFound: number;
  rotated: number;
  newlyEncrypted: number;
  failed: number;
  skipped: number;
}

/**
 * Validates whether the old key can decrypt at least one currently encrypted row.
 */
async function testOldKeyAgainstDatabase(
  tableName: "Proxy" | "Vps",
  oldKey: string,
): Promise<{ checked: boolean; valid: boolean; sampleSid?: string | number }> {
  const pool = await getPool();
  const prefix = getPrefix();
  const result = await pool
    .request()
    .query(
      `SELECT TOP 5 id, sid, user_pass FROM ${tableName} WHERE user_pass LIKE '${prefix}%'`,
    );

  const rows = result.recordset || [];
  if (rows.length === 0) {
    return { checked: false, valid: true }; // No encrypted rows to test against
  }

  for (const row of rows) {
    if (verifyKey(oldKey, row.user_pass)) {
      return { checked: true, valid: true, sampleSid: row.sid };
    }
  }

  return { checked: true, valid: false, sampleSid: rows[0].sid };
}

async function processTableRotation(
  tableName: "Proxy" | "Vps",
  options: RotateOptions,
): Promise<TableStats> {
  const pool = await getPool();
  const stats: TableStats = {
    tableName,
    totalFound: 0,
    rotated: 0,
    newlyEncrypted: 0,
    failed: 0,
    skipped: 0,
  };

  const request = pool.request();
  let query = `
    SELECT id, user_id, sid, ip_port, user_pass
    FROM ${tableName}
    WHERE user_pass IS NOT NULL AND LTRIM(RTRIM(user_pass)) <> ''
  `;

  if (options.ip) {
    request.input("ip", options.ip);
    request.input("ipPrefix", `${options.ip}:%`);
    request.input("ipPattern", `%${options.ip}%`);
    query += ` AND (ip_port = @ip OR ip_port LIKE @ipPrefix OR ip_port LIKE @ipPattern)`;
  }

  const result = await request.query(query);
  const rows = result.recordset || [];
  stats.totalFound = rows.length;

  console.log(
    `\n📋 Processing table [${tableName}]: Found ${stats.totalFound} candidate row(s)...`,
  );

  for (const row of rows) {
    const rawVal = row.user_pass;

    try {
      let newCipherText: string | null = null;
      let isRotation = false;

      if (isEncrypted(rawVal)) {
        // Case 1: Already encrypted with old key -> Decrypt with old, encrypt with new
        isRotation = true;

        // Verify key authentication
        if (!verifyKey(options.oldKey, rawVal)) {
          // Check if it was already encrypted with the new key!
          if (verifyKey(options.newKey, rawVal)) {
            stats.skipped++;
            continue;
          }
          throw new Error(
            "Authentication tag mismatch: Record was NOT encrypted with provided OLD key.",
          );
        }

        const plainText = decryptWithKey(rawVal, options.oldKey);
        if (!plainText) {
          throw new Error("Decryption returned empty plaintext.");
        }

        newCipherText = encryptWithKey(plainText, options.newKey);
      } else {
        // Case 2: Plaintext (not yet encrypted) -> Encrypt directly with new key
        newCipherText = encryptWithKey(rawVal, options.newKey);
      }

      if (!newCipherText) {
        throw new Error("Failed to produce new ciphertext.");
      }

      if (!options.dryRun) {
        await pool
          .request()
          .input("id", row.id)
          .input("userPass", newCipherText)
          .query(`UPDATE ${tableName} SET user_pass = @userPass WHERE id = @id`);
      }

      if (isRotation) {
        stats.rotated++;
        console.log(
          `  ${options.dryRun ? "[DRY-RUN] Would rotate" : "🔄 Rotated key"} row id=${row.id}, sid=${row.sid}, ip=${row.ip_port || "N/A"}`,
        );
      } else {
        stats.newlyEncrypted++;
        console.log(
          `  ${options.dryRun ? "[DRY-RUN] Would encrypt plaintext" : "✅ Encrypted plaintext"} row id=${row.id}, sid=${row.sid}, ip=${row.ip_port || "N/A"}`,
        );
      }
    } catch (err) {
      stats.failed++;
      console.error(
        `  ❌ Failed row id=${row.id}, sid=${row.sid}:`,
        (err as Error).message,
      );
    }
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  let options: RotateOptions;

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  // Pre-connect database so connection log doesn't interleave with prompt inputs
  await getPool();

  const hasCliFlags = args.some(
    (arg) => arg.startsWith("-") || arg.startsWith("--"),
  );

  if (!hasCliFlags) {
    const prompted = await promptOptions();
    if (!prompted) {
      process.exit(0);
    }
    options = prompted;
  } else {
    options = parseArgs();
    if (!options.oldKey || !options.newKey) {
      console.error(
        "❌ Both --old-key and --new-key are required when running with CLI flags.",
      );
      showHelp();
      process.exit(1);
    }
  }

  const tablesToProcess: Array<"Proxy" | "Vps"> =
    options.type === "all"
      ? ["Proxy", "Vps"]
      : options.type === "proxy"
        ? ["Proxy"]
        : ["Vps"];

  // Pre-flight check: Verify OLD key on sample encrypted rows
  console.log("\n🔍 Running pre-flight check on database records with OLD key...");
  for (const table of tablesToProcess) {
    const testResult = await testOldKeyAgainstDatabase(table, options.oldKey);
    if (testResult.checked) {
      if (!testResult.valid) {
        console.error(
          `\n❌ [SECURITY ABORT] Pre-flight verification failed on table [${table}]!`,
        );
        console.error(
          `The provided OLD key cannot decrypt existing encrypted records (tested sample sid=${testResult.sampleSid}).`,
        );
        console.error(
          "Aborting operation to protect database data integrity. Please verify your old key.\n",
        );
        process.exit(1);
      } else {
        console.log(
          `  ✅ Table [${table}]: Verified OLD key decrypts sample record (sid=${testResult.sampleSid}).`,
        );
      }
    } else {
      console.log(
        `  ℹ️ Table [${table}]: No encrypted records found to verify against. Proceeding.`,
      );
    }
  }

  console.log(
    "\n=============================================================================",
  );
  console.log("  🔐 STARTING DATABASE KEY ROTATION");
  console.log(`  - Target Type: ${options.type.toUpperCase()}`);
  console.log(`  - IP Filter:   ${options.ip || "None (all IPs)"}`);
  console.log(
    `  - Mode:        ${options.dryRun ? "DRY-RUN (Simulation only)" : "LIVE UPDATE"}`,
  );
  console.log(`  - OLD Key:     ${maskKey(options.oldKey)}`);
  console.log(`  - NEW Key:     ${maskKey(options.newKey)}`);
  console.log(
    "=============================================================================",
  );

  const summaryStats: TableStats[] = [];

  for (const table of tablesToProcess) {
    const stat = await processTableRotation(table, options);
    summaryStats.push(stat);
  }

  console.log(
    "\n=============================================================================",
  );
  console.log("📊 ROTATION SUMMARY:");
  console.log(
    "=============================================================================",
  );
  for (const s of summaryStats) {
    console.log(`Table [${s.tableName}]:`);
    console.log(`  - Total processed:       ${s.totalFound}`);
    console.log(`  - Rotated (old -> new):  ${s.rotated}`);
    console.log(`  - Plaintext encrypted:   ${s.newlyEncrypted}`);
    console.log(`  - Already on new key:    ${s.skipped}`);
    if (s.failed > 0) {
      console.log(`  - Failed:                ${s.failed}`);
    }
  }

  if (options.dryRun) {
    console.log(
      "\n⚠️ Note: Ran in DRY-RUN mode. No database records were modified.",
    );
  } else {
    console.log("\n✨ Key rotation completed successfully.");
    console.log("=============================================================================");
    console.log("⚠️ NEXT STEP REQUIRED:");
    console.log("Remember to update your .env file with the NEW encryption key:");
    console.log(`ENCRYPTION_KEY="${options.newKey}"`);
    console.log("Then restart your application server!");
    console.log("=============================================================================\n");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("💥 Fatal error during key rotation:", err);
  process.exit(1);
});
