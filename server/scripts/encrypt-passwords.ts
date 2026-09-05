import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getPool } from "../src/lib/db.js";
import { encrypt, isEncrypted } from "../src/services/crypto.service.ts";

interface CliOptions {
  type: "all" | "vps" | "proxy";
  ip?: string;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    type: "all",
    dryRun: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg.startsWith("--type=") || arg.startsWith("-t=")) {
      const val = arg.split("=")[1].toLowerCase();
      if (val === "vps" || val === "proxy" || val === "all") {
        options.type = val;
      } else {
        console.error(
          `❌ Invalid type: "${val}". Must be "all", "vps", or "proxy".`,
        );
        process.exit(1);
      }
    } else if (arg === "--type" || arg === "-t") {
      const nextArg = args[args.indexOf(arg) + 1];
      if (nextArg && ["all", "vps", "proxy"].includes(nextArg.toLowerCase())) {
        options.type = nextArg.toLowerCase() as "all" | "vps" | "proxy";
      }
    } else if (arg.startsWith("--ip=") || arg.startsWith("-i=")) {
      options.ip = arg.split("=")[1].trim();
    } else if (arg === "--ip" || arg === "-i") {
      const nextArg = args[args.indexOf(arg) + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        options.ip = nextArg.trim();
      }
    }
  }

  return options;
}

async function promptOptions(): Promise<CliOptions | null> {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("\n=============================================================================");
    console.log("  🔐 Database user_pass Encryption Wizard");
    console.log("=============================================================================\n");

    // 1. Target table
    console.log("1. Select target table(s):");
    console.log("   [1] Both Proxy and VPS (All - Recommended)");
    console.log("   [2] Proxy only");
    console.log("   [3] VPS only");
    const typeAnswer = (await rl.question("   👉 Your choice [1-3] (default: 1): ")).trim();

    let targetType: "all" | "proxy" | "vps" = "all";
    if (typeAnswer === "2") {
      targetType = "proxy";
    } else if (typeAnswer === "3") {
      targetType = "vps";
    }

    // 2. Execution mode
    console.log("\n2. Select execution mode:");
    console.log("   [1] Live Run (Encrypt & update database)");
    console.log("   [2] Dry Run (Simulation preview, no changes saved)");
    const modeAnswer = (await rl.question("   👉 Your choice [1-2] (default: 1): ")).trim();
    const dryRun = modeAnswer === "2";

    // 3. IP Filter
    console.log("\n3. Target IP filter (optional):");
    const ipAnswer = (await rl.question("   👉 Enter IP address to filter (press Enter to process ALL): ")).trim();
    const ip = ipAnswer || undefined;

    // 4. Confirmation
    console.log("\n-------------------------------------------------------------");
    console.log("📋 Configuration Review:");
    console.log(`   • Target:    ${targetType.toUpperCase()}`);
    console.log(`   • Mode:      ${dryRun ? "DRY-RUN (Preview only)" : "LIVE UPDATE (Encrypt database)"}`);
    console.log(`   • IP Filter: ${ip || "All records"}`);
    console.log("-------------------------------------------------------------");

    const confirmAnswer = (await rl.question("👉 Proceed with these settings? [Y/n]: ")).trim().toLowerCase();
    if (confirmAnswer === "n" || confirmAnswer === "no") {
      console.log("\n❌ Operation cancelled. Exiting.\n");
      return null;
    }

    return {
      type: targetType,
      ip,
      dryRun,
      help: false,
    };
  } finally {
    rl.close();
  }
}

function showHelp() {
  console.log(`
=============================================================================
  🔐 Database user_pass Encryption Script
=============================================================================

Usage:
  node --env-file=.env --import tsx/esm scripts/encrypt-passwords.ts [options]
  npm run encrypt-passwords -- [options]

Options:
  --type, -t   Target product: "all" | "proxy" | "vps" (default: "all")
  --ip, -i     Filter by specific IP address (e.g. 157.66.196.155)
  --dry-run, -d Preview what will be encrypted without modifying database
  --help, -h   Show this help message

Examples:
  1. Encrypt all plaintext user_pass in both Proxy and Vps:
     npm run encrypt-passwords

  2. Preview encryption for all proxies:
     npm run encrypt-passwords -- --type=proxy --dry-run

  3. Encrypt specific proxy with IP 157.66.196.155:
     npm run encrypt-passwords -- --type=proxy --ip=157.66.196.155

  4. Encrypt specific VPS with IP 103.228.127.10:
     npm run encrypt-passwords -- --type=vps --ip=103.228.127.10
=============================================================================
`);
}

interface TableStats {
  tableName: string;
  totalFound: number;
  alreadyEncrypted: number;
  newlyEncrypted: number;
  failed: number;
}

async function processTable(
  tableName: "Proxy" | "Vps",
  ipFilter?: string,
  dryRun: boolean = false,
): Promise<TableStats> {
  const pool = await getPool();
  const stats: TableStats = {
    tableName,
    totalFound: 0,
    alreadyEncrypted: 0,
    newlyEncrypted: 0,
    failed: 0,
  };

  const request = pool.request();
  let query = `
    SELECT id, user_id, sid, ip_port, user_pass
    FROM ${tableName}
    WHERE user_pass IS NOT NULL AND LTRIM(RTRIM(user_pass)) <> ''
  `;

  if (ipFilter) {
    request.input("ip", ipFilter);
    request.input("ipPrefix", `${ipFilter}:%`);
    request.input("ipPattern", `%${ipFilter}%`);
    query += ` AND (ip_port = @ip OR ip_port LIKE @ipPrefix OR ip_port LIKE @ipPattern)`;
  }

  const result = await request.query(query);
  const rows = result.recordset || [];
  stats.totalFound = rows.length;

  console.log(
    `\n📋 Processing table [${tableName}]: Found ${stats.totalFound} candidate row(s)...`,
  );

  for (const row of rows) {
    const rawPass = row.user_pass;

    if (isEncrypted(rawPass)) {
      stats.alreadyEncrypted++;
      continue;
    }

    try {
      const cipherText = encrypt(rawPass);

      if (!dryRun && cipherText) {
        await pool
          .request()
          .input("id", row.id)
          .input("userPass", cipherText)
          .query(
            `UPDATE ${tableName} SET user_pass = @userPass WHERE id = @id`,
          );
      }

      stats.newlyEncrypted++;
      console.log(
        `  ${dryRun ? "[DRY-RUN] Would encrypt" : "✅ Encrypted"} row id=${row.id}, sid=${row.sid}, ip=${row.ip_port || "N/A"}`,
      );
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
  let options: CliOptions;

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  // Pre-connect database so connection log doesn't interleave with prompt inputs
  await getPool();

  // If no specific CLI flags are passed, prompt interactively
  const hasCliFlags = args.some((arg) => arg.startsWith("-") || arg.startsWith("--"));

  if (!hasCliFlags) {
    const prompted = await promptOptions();
    if (!prompted) {
      process.exit(0);
    }
    options = prompted;
  } else {
    options = parseArgs();
  }

  console.log(
    "=============================================================================",
  );
  console.log("  🔐 STARTING DATABASE user_pass ENCRYPTION");
  console.log(`  - Target Type: ${options.type.toUpperCase()}`);
  console.log(`  - IP Filter:   ${options.ip || "None (all IPs)"}`);
  console.log(
    `  - Mode:        ${options.dryRun ? "DRY-RUN (Simulation only)" : "LIVE UPDATE"}`,
  );
  console.log(
    "=============================================================================",
  );

  const tablesToProcess: Array<"Proxy" | "Vps"> =
    options.type === "all"
      ? ["Proxy", "Vps"]
      : options.type === "proxy"
        ? ["Proxy"]
        : ["Vps"];

  const summaryStats: TableStats[] = [];

  for (const table of tablesToProcess) {
    const stat = await processTable(table, options.ip, options.dryRun);
    summaryStats.push(stat);
  }

  console.log(
    "\n=============================================================================",
  );
  console.log("📊 SUMMARY RESULT:");
  console.log(
    "=============================================================================",
  );
  for (const s of summaryStats) {
    console.log(`Table [${s.tableName}]:`);
    console.log(`  - Total matched:       ${s.totalFound}`);
    console.log(`  - Already encrypted:   ${s.alreadyEncrypted}`);
    console.log(
      `  - Newly encrypted:     ${s.newlyEncrypted} ${options.dryRun ? "(simulated)" : ""}`,
    );
    if (s.failed > 0) {
      console.log(`  - Failed:              ${s.failed}`);
    }
  }

  if (options.dryRun) {
    console.log(
      "\n⚠️ Note: Ran in DRY-RUN mode. No database records were modified.",
    );
    console.log("Run without --dry-run or -d to execute live updates.");
  } else {
    console.log("\n✨ All targeted records have been securely processed.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("💥 Fatal error during migration:", err);
  process.exit(1);
});
